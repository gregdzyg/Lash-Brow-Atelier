package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class QualificationCertificateTest {

    private final QualificationRepository repository = mock(QualificationRepository.class);
    private final R2StorageService storage = mock(R2StorageService.class);
    private final MockMultipartFile image = new MockMultipartFile("image", "certificate.png", "image/png", new byte[]{1});
    private QualificationManagementService service;
    private Qualification qualification;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        ObjectProvider<R2StorageService> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(storage);
        service = new QualificationManagementService(
                mock(QualificationSectionRepository.class), repository, provider, "https://example.r2.dev/"
        );
        qualification = new Qualification();
        qualification.setId(1L);
        qualification.setTitle("Szkolenie");
        qualification.setDescription("Opis");
        qualification.setCertificateObjectKey("certificates/previous.jpg");
        when(repository.findById(1L)).thenReturn(Optional.of(qualification));
        TransactionSynchronizationManager.initSynchronization();
    }

    @AfterEach
    void tearDown() {
        TransactionSynchronizationManager.clearSynchronization();
    }

    @Test
    void shouldReplaceCertificateAndDeletePreviousFileOnlyAfterCommit() {
        when(storage.upload(image, ImageStorageFolder.CERTIFICATES)).thenReturn("certificates/new.jpg");
        when(repository.saveAndFlush(qualification)).thenReturn(qualification);

        var response = service.replaceCertificate(1L, image);

        assertThat(response.certificateUrl()).isEqualTo("https://example.r2.dev/certificates/new.jpg");
        verify(storage, never()).delete(anyString());
        complete(TransactionSynchronization.STATUS_COMMITTED);
        verify(storage).delete("certificates/previous.jpg");
        verify(storage, never()).delete("certificates/new.jpg");
    }

    @Test
    void shouldCleanNewFileAndKeepPreviousFileWhenDatabaseWriteRollsBack() {
        when(storage.upload(image, ImageStorageFolder.CERTIFICATES)).thenReturn("certificates/new.jpg");
        when(repository.saveAndFlush(qualification)).thenThrow(new IllegalStateException("Database failure"));

        assertThatThrownBy(() -> service.replaceCertificate(1L, image)).isInstanceOf(IllegalStateException.class);
        complete(TransactionSynchronization.STATUS_ROLLED_BACK);

        verify(storage).delete("certificates/new.jpg");
        verify(storage, never()).delete("certificates/previous.jpg");
    }

    @Test
    void shouldRemoveCertificateWithoutRemovingQualification() {
        var response = service.removeCertificate(1L);

        assertThat(response.certificateUrl()).isNull();
        assertThat(qualification.getTitle()).isEqualTo("Szkolenie");
        verify(repository).saveAndFlush(qualification);
        verify(repository, never()).delete(any());
        verify(storage, never()).delete(anyString());
        complete(TransactionSynchronization.STATUS_COMMITTED);
        verify(storage).delete("certificates/previous.jpg");
    }

    @Test
    void shouldKeepCertificateFileWhenRemovalRollsBack() {
        service.removeCertificate(1L);
        complete(TransactionSynchronization.STATUS_ROLLED_BACK);
        verify(storage, never()).delete(anyString());
    }

    @Test
    void shouldDeleteAttachedCertificateAfterQualificationDeletionCommits() {
        when(repository.findAllByOrderBySortOrderAscCreatedAtAsc()).thenReturn(List.of(qualification));
        service.deleteQualification(1L);
        verify(repository).delete(qualification);
        verify(storage, never()).delete(anyString());
        complete(TransactionSynchronization.STATUS_COMMITTED);
        verify(storage).delete("certificates/previous.jpg");
    }

    @Test
    void shouldNotTurnCommittedCertificateIntoAnErrorWhenOldFileCleanupFails() {
        when(storage.upload(image, ImageStorageFolder.CERTIFICATES)).thenReturn("certificates/new.jpg");
        when(repository.saveAndFlush(qualification)).thenReturn(qualification);
        doThrow(new IllegalStateException("Storage unavailable"))
                .when(storage).delete("certificates/previous.jpg");

        service.replaceCertificate(1L, image);
        complete(TransactionSynchronization.STATUS_COMMITTED);

        assertThat(qualification.getCertificateObjectKey()).isEqualTo("certificates/new.jpg");
        verify(storage, never()).delete("certificates/new.jpg");
    }

    private void complete(int status) {
        for (var synchronization : TransactionSynchronizationManager.getSynchronizations()) {
            if (status == TransactionSynchronization.STATUS_COMMITTED) synchronization.afterCommit();
            synchronization.afterCompletion(status);
        }
    }
}
