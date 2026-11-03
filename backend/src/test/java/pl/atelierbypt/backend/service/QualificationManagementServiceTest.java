package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QualificationManagementServiceTest {

    @Mock
    private QualificationSectionRepository qualificationSectionRepository;

    @Mock
    private QualificationRepository qualificationRepository;

    private QualificationManagementService qualificationManagementService;

    @BeforeEach
    void setUp() {
        qualificationManagementService = new QualificationManagementService(
                qualificationSectionRepository,
                qualificationRepository
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
}
