package pl.atelierbypt.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import pl.atelierbypt.backend.dto.PublicNewsPostResponse;
import pl.atelierbypt.backend.entity.NewsPost;
import pl.atelierbypt.backend.repository.NewsPostRepository;

import java.util.List;

@Service
public class NewsPostService {

    private final NewsPostRepository newsPostRepository;
    private final String publicBaseUrl;

    public NewsPostService(
            NewsPostRepository newsPostRepository,
            @Value("${app.r2.public-base-url}") String publicBaseUrl
    ) {
        this.newsPostRepository = newsPostRepository;
        this.publicBaseUrl = publicBaseUrl.replaceAll("/+$", "");
    }

    public List<PublicNewsPostResponse> getPublicNewsPosts() {
        return newsPostRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToPublicNewsPostResponse)
                .toList();
    }

    private PublicNewsPostResponse mapToPublicNewsPostResponse(NewsPost newsPost) {
        String imageUrl = newsPost.getImageObjectKey() == null
                ? null
                : publicBaseUrl + "/" + newsPost.getImageObjectKey();

        return new PublicNewsPostResponse(
                newsPost.getId(),
                newsPost.getTitle(),
                newsPost.getContent(),
                newsPost.getCategory(),
                imageUrl,
                newsPost.getImageAltText(),
                newsPost.getCreatedAt()
        );
    }
}
