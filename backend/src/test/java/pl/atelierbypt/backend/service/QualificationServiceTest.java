package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.QualificationSectionResponse;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QualificationServiceTest {

    @Mock
    private QualificationSectionRepository qualificationSectionRepository;

    @Mock
    private QualificationRepository qualificationRepository;

    private QualificationService qualificationService;

    @BeforeEach
    void setUp() {
        qualificationService = new QualificationService(
                qualificationSectionRepository,
                qualificationRepository
        );
    }

    @Test
    void shouldReturnSectionWithVisibleQualifications() {
        QualificationSection section = qualificationSection();
        Qualification first = qualification(
                1L,
                "Stylizacja rzęs 1:1",
                "Technika klasyczna."
        );
        Qualification second = qualification(
                2L,
                "Laminacja brwi",
                "Modelowanie brwi."
        );
        when(qualificationSectionRepository.findById(
                QualificationSection.SINGLETON_ID
        )).thenReturn(Optional.of(section));
        when(qualificationRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc())
                .thenReturn(List.of(first, second));

        QualificationSectionResponse response = qualificationService
                .getPublicQualificationSection();

        assertThat(response.eyebrow()).isEqualTo("Rozwój i doświadczenie");
        assertThat(response.title()).isEqualTo("Moje kwalifikacje");
        assertThat(response.qualifications())
                .extracting("title")
                .containsExactly("Stylizacja rzęs 1:1", "Laminacja brwi");
    }

    @Test
    void shouldFailWhenSectionDoesNotExist() {
        when(qualificationSectionRepository.findById(
                QualificationSection.SINGLETON_ID
        )).thenReturn(Optional.empty());

        assertThatThrownBy(() -> qualificationService
                .getPublicQualificationSection())
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Nie znaleziono treści sekcji kwalifikacji.");
        verifyNoInteractions(qualificationRepository);
    }

    private QualificationSection qualificationSection() {
        QualificationSection section = new QualificationSection();
        section.setEyebrow("Rozwój i doświadczenie");
        section.setTitle("Moje kwalifikacje");
        section.setDescription("Opis sekcji.");
        return section;
    }

    private Qualification qualification(
            Long id,
            String title,
            String description
    ) {
        Qualification qualification = new Qualification();
        qualification.setId(id);
        qualification.setTitle(title);
        qualification.setDescription(description);
        return qualification;
    }
}
