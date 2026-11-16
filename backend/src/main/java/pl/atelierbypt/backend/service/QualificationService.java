package pl.atelierbypt.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import pl.atelierbypt.backend.dto.QualificationResponse;
import pl.atelierbypt.backend.dto.QualificationSectionResponse;
import pl.atelierbypt.backend.entity.Qualification;
import pl.atelierbypt.backend.entity.QualificationSection;
import pl.atelierbypt.backend.exception.ResourceNotFoundException;
import pl.atelierbypt.backend.repository.QualificationRepository;
import pl.atelierbypt.backend.repository.QualificationSectionRepository;

import java.util.List;

@Service
public class QualificationService {

    private final QualificationSectionRepository qualificationSectionRepository;
    private final QualificationRepository qualificationRepository;
    private final String publicBaseUrl;

    public QualificationService(
            QualificationSectionRepository qualificationSectionRepository,
            QualificationRepository qualificationRepository,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.qualificationSectionRepository = qualificationSectionRepository;
        this.qualificationRepository = qualificationRepository;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional(readOnly = true)
    public QualificationSectionResponse getPublicQualificationSection() {
        QualificationSection section = qualificationSectionRepository
                .findById(QualificationSection.SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Nie znaleziono treści sekcji kwalifikacji."
                ));
        List<QualificationResponse> qualifications = qualificationRepository
                .findByIsActiveTrueOrderBySortOrderAscCreatedAtAsc()
                .stream()
                .map(this::mapQualification)
                .toList();

        return new QualificationSectionResponse(
                section.getEyebrow(),
                section.getTitle(),
                section.getDescription(),
                qualifications
        );
    }

    private QualificationResponse mapQualification(
            Qualification qualification
    ) {
        return new QualificationResponse(
                qualification.getId(),
                qualification.getTitle(),
                qualification.getDescription(),
                qualification.getCertificateObjectKey() == null ? null
                        : publicBaseUrl + "/" + qualification.getCertificateObjectKey()
        );
    }
}
