package pl.atelierbypt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.AdminQualificationResponse;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.List;

@Service
public class QualificationManagementService {

    private final QualificationSectionRepository qualificationSectionRepository;
    private final QualificationRepository qualificationRepository;

    public QualificationManagementService(
            QualificationSectionRepository qualificationSectionRepository,
            QualificationRepository qualificationRepository
    ) {
        this.qualificationSectionRepository = qualificationSectionRepository;
        this.qualificationRepository = qualificationRepository;
    }

    @Transactional(readOnly = true)
    public AdminQualificationSectionResponse getQualificationSection() {
        return mapSection(
                findSection(),
                qualificationRepository
                        .findAllByOrderBySortOrderAscCreatedAtAsc()
        );
    }

    @Transactional
    public AdminQualificationSectionResponse updateQualificationSection(
            QualificationSectionRequest request
    ) {
        QualificationSection section = findSection();
        section.setEyebrow(request.eyebrow().strip());
        section.setTitle(request.title().strip());
        section.setDescription(request.description().strip());
        QualificationSection savedSection = qualificationSectionRepository
                .save(section);

        return mapSection(
                savedSection,
                qualificationRepository
                        .findAllByOrderBySortOrderAscCreatedAtAsc()
        );
    }

    private QualificationSection findSection() {
        return qualificationSectionRepository
                .findById(QualificationSection.SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono treści sekcji kwalifikacji."
                ));
    }

    private AdminQualificationSectionResponse mapSection(
            QualificationSection section,
            List<Qualification> qualifications
    ) {
        return new AdminQualificationSectionResponse(
                section.getEyebrow(),
                section.getTitle(),
                section.getDescription(),
                qualifications.stream()
                        .map(this::mapQualification)
                        .toList()
        );
    }

    private AdminQualificationResponse mapQualification(
            Qualification qualification
    ) {
        return new AdminQualificationResponse(
                qualification.getId(),
                qualification.getTitle(),
                qualification.getDescription(),
                qualification.getSortOrder(),
                qualification.isActive()
        );
    }
}
