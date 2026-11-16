package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AdminQualificationResponse;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationRequest;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.enums.QualificationMoveDirection;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QualificationManagementServiceTest {

    @Mock
    private QualificationSectionRepository qualificationSectionRepository;

    @Mock
    private QualificationRepository qualificationRepository;

    @Mock
    private org.springframework.beans.factory.ObjectProvider<R2StorageService> storageProvider;

    private QualificationManagementService qualificationManagementService;

    @BeforeEach
    void setUp() {
        qualificationManagementService = new QualificationManagementService(
                qualificationSectionRepository,
                qualificationRepository,
                storageProvider,
                "https://example.r2.dev/"
        );
    }

    @Test
    void shouldReturnAllQualificationsForAdmin() {
        QualificationSection section = qualificationSection();
        Qualification qualification = qualification();
        qualification.setActive(false);
        when(qualificationSectionRepository.findById(
                QualificationSection.SINGLETON_ID
        )).thenReturn(Optional.of(section));
        when(qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of(qualification));

        AdminQualificationSectionResponse response =
                qualificationManagementService.getQualificationSection();

        assertThat(response.qualifications()).hasSize(1);
        assertThat(response.qualifications().getFirst().active()).isFalse();
    }

    @Test
    void shouldUpdateSectionText() {
        QualificationSection section = qualificationSection();
        QualificationSectionRequest request = new QualificationSectionRequest(
                "  Wiedza i praktyka  ",
                "  Certyfikaty i szkolenia  ",
                "  Aktualny opis sekcji.  "
        );
        when(qualificationSectionRepository.findById(
                QualificationSection.SINGLETON_ID
        )).thenReturn(Optional.of(section));
        when(qualificationSectionRepository.save(section))
                .thenReturn(section);
        when(qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of());

        AdminQualificationSectionResponse response =
                qualificationManagementService
                        .updateQualificationSection(request);

        assertThat(response.eyebrow()).isEqualTo("Wiedza i praktyka");
        assertThat(response.title()).isEqualTo("Certyfikaty i szkolenia");
        assertThat(response.description()).isEqualTo("Aktualny opis sekcji.");
        verify(qualificationSectionRepository).save(section);
    }

    @Test
    void shouldCreateQualificationAtTopOfList() {
        Qualification existingQualification = qualification();
        existingQualification.setSortOrder(4);
        QualificationRequest request = new QualificationRequest(
                "  Nowe szkolenie  ",
                "  Opis nowego szkolenia.  "
        );
        when(qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of(existingQualification));
        when(qualificationRepository.save(any(Qualification.class)))
                .thenAnswer(invocation -> {
                    Qualification saved = invocation.getArgument(0);
                    saved.setId(2L);
                    return saved;
                });

        AdminQualificationResponse response = qualificationManagementService
                .createQualification(request);

        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.title()).isEqualTo("Nowe szkolenie");
        assertThat(response.description())
                .isEqualTo("Opis nowego szkolenia.");
        assertThat(response.sortOrder()).isZero();
        assertThat(response.active()).isTrue();
        assertThat(existingQualification.getSortOrder()).isEqualTo(5);
        verify(qualificationRepository).saveAll(
                List.of(existingQualification)
        );
    }

    @Test
    void shouldUpdateQualificationWithoutChangingItsState() {
        Qualification qualification = qualification();
        qualification.setActive(false);
        QualificationRequest request = new QualificationRequest(
                "  Zmieniona nazwa  ",
                "  Zmieniony opis.  "
        );
        when(qualificationRepository.findById(1L))
                .thenReturn(Optional.of(qualification));
        when(qualificationRepository.save(qualification))
                .thenReturn(qualification);

        AdminQualificationResponse response = qualificationManagementService
                .updateQualification(1L, request);

        assertThat(response.title()).isEqualTo("Zmieniona nazwa");
        assertThat(response.description()).isEqualTo("Zmieniony opis.");
        assertThat(response.sortOrder()).isZero();
        assertThat(response.active()).isFalse();
    }

    @Test
    void shouldChangeQualificationVisibility() {
        Qualification qualification = qualification();
        qualification.setActive(true);
        when(qualificationRepository.findById(1L))
                .thenReturn(Optional.of(qualification));
        when(qualificationRepository.save(qualification))
                .thenReturn(qualification);

        AdminQualificationResponse response = qualificationManagementService
                .setQualificationVisibility(1L, false);

        assertThat(response.active()).isFalse();
        verify(qualificationRepository).save(qualification);
    }

    @Test
    void shouldDeleteQualificationAndNormalizeOrder() {
        Qualification first = qualification(1L, 0);
        Qualification removed = qualification(2L, 3);
        Qualification last = qualification(3L, 7);
        when(qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of(first, removed, last));

        qualificationManagementService.deleteQualification(2L);

        assertThat(first.getSortOrder()).isZero();
        assertThat(last.getSortOrder()).isEqualTo(1);
        verify(qualificationRepository).delete(removed);
        verify(qualificationRepository).saveAll(List.of(first, last));
    }

    @Test
    void shouldMoveQualificationDownAndNormalizeOrder() {
        Qualification first = qualification(1L, 4);
        Qualification second = qualification(2L, 8);
        Qualification third = qualification(3L, 12);
        when(qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(new java.util.ArrayList<>(
                        List.of(first, second, third)
                ));

        qualificationManagementService.moveQualification(
                1L,
                QualificationMoveDirection.DOWN
        );

        assertThat(second.getSortOrder()).isZero();
        assertThat(first.getSortOrder()).isEqualTo(1);
        assertThat(third.getSortOrder()).isEqualTo(2);
        verify(qualificationRepository).saveAll(
                List.of(second, first, third)
        );
    }

    @Test
    void shouldNotSaveWhenMovingFirstQualificationUp() {
        Qualification first = qualification(1L, 0);
        when(qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of(first));

        qualificationManagementService.moveQualification(
                1L,
                QualificationMoveDirection.UP
        );

        verify(qualificationRepository)
                .findAllByOrderBySortOrderAscCreatedAtAsc();
        verify(qualificationRepository, never()).saveAll(any());
    }

    private QualificationSection qualificationSection() {
        QualificationSection section = new QualificationSection();
        section.setEyebrow("Rozwój i doświadczenie");
        section.setTitle("Moje kwalifikacje");
        section.setDescription("Opis sekcji.");
        return section;
    }

    private Qualification qualification() {
        Qualification qualification = new Qualification();
        qualification.setId(1L);
        qualification.setTitle("Stylizacja rzęs 1:1");
        qualification.setDescription("Technika klasyczna.");
        qualification.setSortOrder(0);
        return qualification;
    }

    private Qualification qualification(Long id, int sortOrder) {
        Qualification qualification = qualification();
        qualification.setId(id);
        qualification.setSortOrder(sortOrder);
        return qualification;
    }
}
