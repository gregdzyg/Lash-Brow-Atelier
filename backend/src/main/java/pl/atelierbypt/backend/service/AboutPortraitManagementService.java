package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.AboutPortraitResponse;
import pl.atelierbypt.backend.entity.AboutPortrait;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.repository.AboutPortraitRepository;

@Service
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class AboutPortraitManagementService {

    private final AboutPortraitRepository aboutPortraitRepository;
    private final R2StorageService r2StorageService;
    private final String publicBaseUrl;

    public AboutPortraitManagementService(
            AboutPortraitRepository aboutPortraitRepository,
            R2StorageService r2StorageService,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.aboutPortraitRepository = aboutPortraitRepository;
        this.r2StorageService = r2StorageService;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional
    public AboutPortraitResponse replaceAboutPortrait(MultipartFile image) {
        AboutPortrait aboutPortrait = aboutPortraitRepository
                .findById(AboutPortrait.SINGLETON_ID)
                .orElseGet(AboutPortrait::new);
        String previousObjectKey = aboutPortrait.getObjectKey();
        String newObjectKey = r2StorageService.upload(
                image,
                ImageStorageFolder.ABOUT
        );

        try {
            aboutPortrait.setObjectKey(newObjectKey);
            AboutPortrait savedPortrait = aboutPortraitRepository
                    .saveAndFlush(aboutPortrait);

            if (previousObjectKey != null) {
                r2StorageService.delete(previousObjectKey);
            }
            return new AboutPortraitResponse(
                    publicBaseUrl + "/" + savedPortrait.getObjectKey()
            );
        } catch (RuntimeException exception) {
            deleteUploadedObject(newObjectKey, exception);
            throw exception;
        }
    }

    private void deleteUploadedObject(
            String objectKey,
            RuntimeException originalException
    ) {
        try {
            r2StorageService.delete(objectKey);
        } catch (RuntimeException cleanupException) {
            originalException.addSuppressed(cleanupException);
        }
    }
}
