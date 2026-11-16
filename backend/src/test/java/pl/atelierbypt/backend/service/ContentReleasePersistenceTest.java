package pl.atelierbypt.backend.service;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.transaction.TestTransaction;
import pl.atelierbypt.backend.config.TimeConfig;
import pl.atelierbypt.backend.entity.Appointment;
import pl.atelierbypt.backend.entity.Client;
import pl.atelierbypt.backend.entity.OfferItem;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.enums.AppointmentStatus;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.enums.OfferItemCategory;
import pl.atelierbypt.backend.repository.AppointmentRepository;
import pl.atelierbypt.backend.repository.QualificationRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Only a deliberately named, disposable database can enable these tests.
@EnabledIfEnvironmentVariable(named = "ATELIER_INTEGRATION_DB_URL",
        matches = "jdbc:postgresql://[^/]+/atelier_release_test")
@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=validate", "spring.jpa.show-sql=false"}, showSql = false)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({ClientService.class, QualificationManagementService.class, TimeConfig.class})
class ContentReleasePersistenceTest {

    private final String previousKey = "certificates/" + UUID.randomUUID() + ".jpg";

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> System.getenv("ATELIER_INTEGRATION_DB_URL"));
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> System.getenv("ATELIER_INTEGRATION_DB_PASSWORD"));
        registry.add("app.r2.public-base-url", () -> "https://example.r2.dev");
    }

    @Autowired private EntityManager entityManager;
    @Autowired private ClientService clientService;
    @Autowired private QualificationManagementService qualifications;
    @Autowired private QualificationRepository qualificationRepository;
    @Autowired private AppointmentRepository appointmentRepository;
    @MockitoBean private R2StorageService storage;

    @Test
    void shouldPageAllStatusesWithoutMixingClientsOrLosingArchivedVisits() {
        Client first = client();
        Client second = client();
        OfferItem offer = offer();
        for (int index = 0; index < 22; index++) {
            Appointment appointment = appointment(first, offer, LocalDate.of(2030, 1, 1).plusDays(index));
            appointment.setStatus(index == 0 ? AppointmentStatus.NO_SHOW
                    : index == 1 ? AppointmentStatus.CANCELLED : AppointmentStatus.SCHEDULED);
            if (index == 2) appointment.setActive(false);
        }
        appointment(second, offer, LocalDate.of(2040, 1, 1));
        offer.setActive(false);
        entityManager.flush();
        entityManager.clear();

        var page = clientService.getAppointmentHistory(first.getId(), 0);
        var next = clientService.getAppointmentHistory(first.getId(), 1);

        assertThat(page.appointments()).hasSize(20);
        assertThat(page.hasMore()).isTrue();
        assertThat(next.appointments()).hasSize(2);
        assertThat(next.hasMore()).isFalse();
        assertThat(page.appointments().getFirst().appointmentDate()).isEqualTo(LocalDate.of(2030, 1, 22));
        assertThat(page.appointments().getLast().active()).isFalse();
        assertThat(next.appointments()).extracting("status")
                .containsExactly(AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW);
        Long archivedId = page.appointments().getLast().id();
        assertThat(appointmentRepository.findById(archivedId)).isPresent();
        assertThat(appointmentRepository.findByIdAndIsActiveTrue(archivedId)).isEmpty();
        assertThat(appointmentRepository.findScheduledActiveByDate(LocalDate.of(2030, 1, 3))).isEmpty();
        assertThat(clientService.getAppointmentHistory(second.getId(), 0).appointments()).hasSize(1);
    }

    @Test
    void shouldUseIdAsStableTieBreakerForIdenticalDatesAndTimes() {
        Client client = client();
        OfferItem offer = offer();
        Appointment first = appointment(client, offer, LocalDate.of(2030, 2, 1));
        first.setStatus(AppointmentStatus.CANCELLED);
        Appointment second = appointment(client, offer, LocalDate.of(2030, 2, 1));
        entityManager.flush();
        entityManager.clear();
        assertThat(clientService.getAppointmentHistory(client.getId(), 0).appointments())
                .extracting("id").containsExactly(second.getId(), first.getId());
    }

    @Test
    void shouldCommitNewCertificateBeforeDeletingPreviousObject() {
        Qualification qualification = qualification();
        MockMultipartFile image = image();
        when(storage.upload(image, ImageStorageFolder.CERTIFICATES)).thenReturn("certificates/new.jpg");

        qualifications.replaceCertificate(qualification.getId(), image);
        verify(storage, never()).delete(anyString());
        TestTransaction.flagForCommit();
        TestTransaction.end();

        verify(storage).delete(previousKey);
        assertThat(qualificationRepository.findById(qualification.getId()).orElseThrow().getCertificateObjectKey())
                .isEqualTo("certificates/new.jpg");
    }

    @Test
    void shouldRollBackCertificateReferenceAndOnlyCleanNewObject() {
        Qualification qualification = qualification();
        TestTransaction.flagForCommit();
        TestTransaction.end();
        TestTransaction.start();
        MockMultipartFile image = image();
        when(storage.upload(image, ImageStorageFolder.CERTIFICATES)).thenReturn("certificates/rolled-back.jpg");

        qualifications.replaceCertificate(qualification.getId(), image);
        TestTransaction.flagForRollback();
        TestTransaction.end();

        verify(storage).delete("certificates/rolled-back.jpg");
        verify(storage, never()).delete(previousKey);
        assertThat(qualificationRepository.findById(qualification.getId()).orElseThrow().getCertificateObjectKey())
                .isEqualTo(previousKey);
    }

    @Test
    void shouldRemoveAttachmentAfterCommitWithoutRemovingQualification() {
        Qualification qualification = qualification();
        qualifications.removeCertificate(qualification.getId());
        verify(storage, never()).delete(anyString());
        TestTransaction.flagForCommit();
        TestTransaction.end();

        verify(storage).delete(previousKey);
        assertThat(qualificationRepository.findById(qualification.getId()).orElseThrow().getCertificateObjectKey())
                .isNull();
    }

    private Qualification qualification() {
        // UUIDs keep committed fixtures independent across test methods.
        Qualification qualification = new Qualification();
        qualification.setTitle("Certificate test " + UUID.randomUUID());
        qualification.setDescription("Test only");
        qualification.setCertificateObjectKey(previousKey);
        entityManager.persist(qualification);
        entityManager.flush();
        return qualification;
    }

    private Client client() {
        Client client = new Client();
        client.setFirstName("Test");
        client.setLastName("Client");
        client.setPhoneNumber(UUID.randomUUID().toString().substring(0, 20));
        entityManager.persist(client);
        return client;
    }

    private OfferItem offer() {
        OfferItem offer = new OfferItem();
        offer.setName("Test service " + UUID.randomUUID());
        offer.setCategory(OfferItemCategory.LASHES);
        offer.setDurationMinutes(60);
        offer.setBasePrice(BigDecimal.valueOf(100));
        entityManager.persist(offer);
        return offer;
    }

    private Appointment appointment(Client client, OfferItem offer, LocalDate date) {
        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setOfferItem(offer);
        appointment.setAppointmentDate(date);
        appointment.setStartTime(LocalTime.of(10, 0));
        appointment.setDurationMinutes(60);
        appointment.setPrice(BigDecimal.valueOf(100));
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        entityManager.persist(appointment);
        return appointment;
    }

    private MockMultipartFile image() {
        return new MockMultipartFile("image", "certificate.jpg", "image/jpeg", new byte[]{1});
    }
}
