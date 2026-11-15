package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pl.atelierbypt.backend.dto.PublicNewsPostResponse;
import pl.atelierbypt.backend.entity.NewsPost;
import pl.atelierbypt.backend.enums.NewsPostCategory;
import pl.atelierbypt.backend.repository.NewsPostRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NewsPostServiceTest {

    @Mock
    private NewsPostRepository newsPostRepository;

    private NewsPostService newsPostService;

    @BeforeEach
    void setUp() {
        newsPostService = new NewsPostService(
                newsPostRepository,
                "https://news.example.com/"
        );
    }

    @Test
    void shouldReturnPublicNewsPostWithImageUrl() {
        NewsPost newsPost = newsPost("news/promotion.jpg");
        when(newsPostRepository.findByIsActiveTrueOrderByCreatedAtDesc())
                .thenReturn(List.of(newsPost));

        List<PublicNewsPostResponse> response = newsPostService.getPublicNewsPosts();

        assertThat(response).singleElement().satisfies(post -> {
            assertThat(post.id()).isEqualTo(1L);
            assertThat(post.title()).isEqualTo("Promocja listopadowa");
            assertThat(post.category()).isEqualTo(NewsPostCategory.PROMOTION);
            assertThat(post.imageUrl())
                    .isEqualTo("https://news.example.com/news/promotion.jpg");
            assertThat(post.imageAltText()).isEqualTo("Rzęsy po zabiegu");
        });
    }

    @Test
    void shouldReturnNullImageUrlWhenPostHasNoImage() {
        NewsPost newsPost = newsPost(null);
        when(newsPostRepository.findByIsActiveTrueOrderByCreatedAtDesc())
                .thenReturn(List.of(newsPost));

        PublicNewsPostResponse response = newsPostService.getPublicNewsPosts().getFirst();

        assertThat(response.imageUrl()).isNull();
    }

    private NewsPost newsPost(String imageObjectKey) {
        NewsPost newsPost = new NewsPost();
        newsPost.setId(1L);
        newsPost.setTitle("Promocja listopadowa");
        newsPost.setContent("Treść wpisu");
        newsPost.setCategory(NewsPostCategory.PROMOTION);
        newsPost.setImageObjectKey(imageObjectKey);
        newsPost.setImageAltText("Rzęsy po zabiegu");
        newsPost.setCreatedAt(LocalDateTime.of(2026, 11, 1, 18, 0));
        return newsPost;
    }
}
