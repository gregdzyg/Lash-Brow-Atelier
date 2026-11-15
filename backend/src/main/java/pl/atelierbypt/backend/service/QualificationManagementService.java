package pl.atelierbypt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.AdminQualificationResponse;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationRequest;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.enums.QualificationMoveDirection;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.ArrayList;
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

    @Transactional
    public AdminQualificationResponse createQualification(
            QualificationRequest request
    ) {
        List<Qualification> qualifications = new ArrayList<>(
                qualificationRepository
                        .findAllByOrderBySortOrderAscCreatedAtAsc()
        );
        qualifications.forEach(qualification -> qualification.setSortOrder(
                qualification.getSortOrder() + 1
        ));
        qualificationRepository.saveAll(qualifications);
        Qualification qualification = new Qualification();
        qualification.setTitle(request.title().strip());
        qualification.setDescription(request.description().strip());
        qualification.setSortOrder(0);
        qualification.setActive(true);

        return mapQualification(
                qualificationRepository.save(qualification)
        );
    }

    @Transactional
    public AdminQualificationResponse updateQualification(
            Long qualificationId,
            QualificationRequest request
    ) {
        Qualification qualification = findQualification(qualificationId);
        qualification.setTitle(request.title().strip());
        qualification.setDescription(request.description().strip());

        return mapQualification(
                qualificationRepository.save(qualification)
        );
    }

    @Transactional
    public AdminQualificationResponse setQualificationVisibility(
            Long qualificationId,
            boolean active
    ) {
        Qualification qualification = findQualification(qualificationId);
        qualification.setActive(active);

        return mapQualification(
                qualificationRepository.save(qualification)
        );
    }

    @Transactional
    public void deleteQualification(Long qualificationId) {
        List<Qualification> qualifications = qualificationRepository
                .findAllByOrderBySortOrderAscCreatedAtAsc();
        Qualification qualification = qualifications.stream()
                .filter(item -> item.getId().equals(qualificationId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono kwalifikacji o id: " + qualificationId
                ));
        List<Qualification> remainingQualifications = qualifications.stream()
                .filter(item -> !item.getId().equals(qualificationId))
                .toList();

        qualificationRepository.delete(qualification);
        normalizeSortOrder(remainingQualifications);
        qualificationRepository.saveAll(remainingQualifications);
    }

    @Transactional
    public void moveQualification(
            Long qualificationId,
            QualificationMoveDirection direction
    ) {
        List<Qualification> qualifications = new ArrayList<>(
                qualificationRepository
                        .findAllByOrderBySortOrderAscCreatedAtAsc()
        );
        int currentIndex = findQualificationIndex(
                qualifications,
                qualificationId
        );
        int targetIndex = direction == QualificationMoveDirection.UP
                ? currentIndex - 1
                : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= qualifications.size()) {
            return;
        }

        Qualification current = qualifications.get(currentIndex);
        qualifications.set(currentIndex, qualifications.get(targetIndex));
        qualifications.set(targetIndex, current);
        normalizeSortOrder(qualifications);
        qualificationRepository.saveAll(qualifications);
    }

    private QualificationSection findSection() {
        return qualificationSectionRepository
                .findById(QualificationSection.SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono treści sekcji kwalifikacji."
                ));
    }

    private Qualification findQualification(Long qualificationId) {
        return qualificationRepository.findById(qualificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono kwalifikacji o id: " + qualificationId
                ));
    }

    private int findQualificationIndex(
            List<Qualification> qualifications,
            Long qualificationId
    ) {
        for (int index = 0; index < qualifications.size(); index++) {
            if (qualifications.get(index).getId().equals(qualificationId)) {
                return index;
            }
        }

        throw new ResourceNotFoundException(
                "Nie znaleziono kwalifikacji o id: " + qualificationId
        );
    }

    private void normalizeSortOrder(List<Qualification> qualifications) {
        for (int index = 0; index < qualifications.size(); index++) {
            qualifications.get(index).setSortOrder(index);
        }
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
