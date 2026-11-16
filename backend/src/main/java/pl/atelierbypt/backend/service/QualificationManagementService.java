package pl.atelierbypt.backend.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.AdminQualificationResponse;
import pl.atelierbypt.backend.dto.AdminQualificationSectionResponse;
import pl.atelierbypt.backend.dto.QualificationRequest;
import pl.atelierbypt.backend.dto.QualificationSectionRequest;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.enums.QualificationMoveDirection;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.exception.BadRequestException;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class QualificationManagementService {

    private final QualificationSectionRepository qualificationSectionRepository;
    private final QualificationRepository qualificationRepository;
    private final ObjectProvider<R2StorageService> storageProvider;
    private final String publicBaseUrl;

    public QualificationManagementService(
            QualificationSectionRepository qualificationSectionRepository,
            QualificationRepository qualificationRepository,
            ObjectProvider<R2StorageService> storageProvider,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.qualificationSectionRepository = qualificationSectionRepository;
        this.qualificationRepository = qualificationRepository;
        this.storageProvider = storageProvider;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
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

        if (qualification.getCertificateObjectKey() != null) {
            scheduleCertificateCleanup(storage(), null, qualification.getCertificateObjectKey());
        }
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

    @Transactional
    public AdminQualificationResponse replaceCertificate(Long qualificationId, MultipartFile image) {
        Qualification qualification = findQualification(qualificationId);
        R2StorageService storage = storage();
        String previousKey = qualification.getCertificateObjectKey();
        String newKey = storage.upload(image, ImageStorageFolder.CERTIFICATES);
        scheduleCertificateCleanup(storage, newKey, previousKey);
        qualification.setCertificateObjectKey(newKey);
        return mapQualification(qualificationRepository.saveAndFlush(qualification));
    }

    @Transactional
    public AdminQualificationResponse removeCertificate(Long qualificationId) {
        Qualification qualification = findQualification(qualificationId);
        if (qualification.getCertificateObjectKey() != null) {
            scheduleCertificateCleanup(storage(), null, qualification.getCertificateObjectKey());
            qualification.setCertificateObjectKey(null);
            qualificationRepository.saveAndFlush(qualification);
        }
        return mapQualification(qualification);
    }

    private R2StorageService storage() {
        R2StorageService storage = storageProvider.getIfAvailable();
        if (storage == null) {
            throw new BadRequestException("Przechowywanie zdjęć nie jest skonfigurowane.");
        }
        return storage;
    }

    private void scheduleCertificateCleanup(R2StorageService storage, String newKey, String previousKey) {
        // Keep the old file until the database commit succeeds. On rollback,
        // only the newly uploaded file is disposable.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteUnusedCertificate(storage, previousKey);
            }

            @Override
            public void afterCompletion(int status) {
                if (status == STATUS_ROLLED_BACK) {
                    deleteUnusedCertificate(storage, newKey);
                }
            }
        });
    }

    private void deleteUnusedCertificate(R2StorageService storage, String key) {
        if (key == null) {
            return;
        }
        try {
            storage.delete(key);
        } catch (RuntimeException exception) {
            log.warn("Could not remove unused qualification certificate objectKey={}", key, exception);
        }
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
                qualification.isActive(),
                qualification.getCertificateObjectKey() == null ? null
                        : publicBaseUrl + "/" + qualification.getCertificateObjectKey()
        );
    }
}
