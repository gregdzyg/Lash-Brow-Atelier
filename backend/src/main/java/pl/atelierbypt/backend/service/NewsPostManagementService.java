package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.NewsPostRequest;
import pl.atelierbypt.backend.dto.NewsPostResponse;
import pl.atelierbypt.backend.entity.NewsPost;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.repository.NewsPostRepository;

@Service
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class NewsPostManagementService {

    private final NewsPostRepository newsPostRepository;
    private final R2StorageService r2StorageService;
    private final String publicBaseUrl;

    public NewsPostManagementService(
            NewsPostRepository newsPostRepository,
            R2StorageService r2StorageService,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.newsPostRepository = newsPostRepository;
        this.r2StorageService = r2StorageService;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    @Transactional
    public NewsPostResponse createNewsPost(
            NewsPostRequest request,
            MultipartFile image
    ) {
        String imageObjectKey = image == null
                ? null
                : r2StorageService.upload(image, ImageStorageFolder.NEWS);

        try {
            NewsPost newsPost = new NewsPost();
            newsPost.setTitle(request.title().trim());
            newsPost.setContent(request.content().trim());
            newsPost.setCategory(request.category());
            newsPost.setImageObjectKey(imageObjectKey);
            newsPost.setImageAltText(imageObjectKey == null
                    ? null
                    : normalizeOptionalText(request.imageAltText()));

            NewsPost savedNewsPost = newsPostRepository.saveAndFlush(newsPost);
            return mapToNewsPostResponse(savedNewsPost);
        } catch (RuntimeException exception) {
            if (imageObjectKey != null) {
                deleteUploadedObject(imageObjectKey, exception);
            }
            throw exception;
        }
    }

    private NewsPostResponse mapToNewsPostResponse(NewsPost newsPost) {
        String imageUrl = newsPost.getImageObjectKey() == null
                ? null
                : publicBaseUrl + "/" + newsPost.getImageObjectKey();

        return new NewsPostResponse(
                newsPost.getId(),
                newsPost.getTitle(),
                newsPost.getContent(),
                newsPost.getCategory(),
                imageUrl,
                newsPost.getImageAltText(),
                newsPost.isActive(),
                newsPost.getCreatedAt(),
                newsPost.getUpdatedAt()
        );
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

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
