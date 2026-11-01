package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.NewsPostRequest;
import pl.atelierbypt.backend.dto.NewsPostResponse;
import pl.atelierbypt.backend.entity.NewsPost;
import pl.atelierbypt.backend.enums.ImageStorageFolder;
import pl.atelierbypt.backend.enums.NewsPostCategory;
import pl.atelierbypt.backend.repository.NewsPostRepository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NewsPostManagementServiceTest {

    private static final String IMAGE_OBJECT_KEY = "news/image.jpg";

    @Mock
    private NewsPostRepository newsPostRepository;
    @Mock
    private R2StorageService r2StorageService;
    @Mock
    private MultipartFile image;

    private NewsPostManagementService newsPostManagementService;

    @BeforeEach
    void setUp() {
        newsPostManagementService = new NewsPostManagementService(
                newsPostRepository,
                r2StorageService,
                "https://atelier.example.com/"
        );
    }

    @Test
    void shouldCreateNewsPostWithImage() {
        when(r2StorageService.upload(image, ImageStorageFolder.NEWS))
                .thenReturn(IMAGE_OBJECT_KEY);
        when(newsPostRepository.saveAndFlush(any(NewsPost.class)))
                .thenAnswer(invocation -> {
                    NewsPost newsPost = invocation.getArgument(0);
                    newsPost.setId(1L);
                    newsPost.setActive(true);
                    return newsPost;
                });

        NewsPostResponse response = newsPostManagementService.createNewsPost(
                request(),
                image
        );

        ArgumentCaptor<NewsPost> postCaptor =
                ArgumentCaptor.forClass(NewsPost.class);
        verify(newsPostRepository).saveAndFlush(postCaptor.capture());
        NewsPost savedPost = postCaptor.getValue();

        assertThat(savedPost.getTitle()).isEqualTo("Promocja listopadowa");
        assertThat(savedPost.getContent()).isEqualTo("Treść wpisu");
        assertThat(savedPost.getImageObjectKey()).isEqualTo(IMAGE_OBJECT_KEY);
        assertThat(savedPost.getImageAltText()).isEqualTo("Efekt zabiegu");
        assertThat(response.imageUrl())
                .isEqualTo("https://atelier.example.com/news/image.jpg");
        assertThat(response.isActive()).isTrue();
    }

    @Test
    void shouldReturnActiveAndInactiveNewsPosts() {
        NewsPost activePost = newsPost(1L, true, IMAGE_OBJECT_KEY);
        NewsPost inactivePost = newsPost(2L, false, null);
        when(newsPostRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(List.of(activePost, inactivePost));

        List<NewsPostResponse> response =
                newsPostManagementService.getNewsPosts();

        assertThat(response).extracting(NewsPostResponse::id)
                .containsExactly(1L, 2L);
        assertThat(response).extracting(NewsPostResponse::isActive)
                .containsExactly(true, false);
        assertThat(response.getFirst().imageUrl())
                .isEqualTo("https://atelier.example.com/news/image.jpg");
        assertThat(response.get(1).imageUrl()).isNull();
    }

    @Test
    void shouldChangeNewsPostVisibility() {
        NewsPost newsPost = newsPost(1L, true, IMAGE_OBJECT_KEY);
        when(newsPostRepository.findById(1L)).thenReturn(Optional.of(newsPost));
        when(newsPostRepository.save(newsPost)).thenReturn(newsPost);

        NewsPostResponse response = newsPostManagementService
                .setNewsPostVisibility(1L, false);

        assertThat(newsPost.isActive()).isFalse();
        assertThat(response.isActive()).isFalse();
        verify(newsPostRepository).save(newsPost);
        verify(r2StorageService, never()).delete(any());
    }

    @Test
    void shouldCreateNewsPostWithoutImage() {
        when(newsPostRepository.saveAndFlush(any(NewsPost.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        NewsPostResponse response = newsPostManagementService.createNewsPost(
                request(),
                null
        );

        verify(r2StorageService, never()).upload(any(), any());
        assertThat(response.imageUrl()).isNull();
        assertThat(response.imageAltText()).isNull();
    }

    @Test
    void shouldDeleteUploadedImageWhenDatabaseSaveFails() {
        when(r2StorageService.upload(image, ImageStorageFolder.NEWS))
                .thenReturn(IMAGE_OBJECT_KEY);
        when(newsPostRepository.saveAndFlush(any(NewsPost.class)))
                .thenThrow(new DataIntegrityViolationException("DB error"));

        assertThatThrownBy(() -> newsPostManagementService.createNewsPost(
                request(),
                image
        )).isInstanceOf(DataIntegrityViolationException.class);

        verify(r2StorageService).delete(IMAGE_OBJECT_KEY);
    }

    private NewsPostRequest request() {
        return new NewsPostRequest(
                "  Promocja listopadowa  ",
                "  Treść wpisu  ",
                NewsPostCategory.PROMOTION,
                "  Efekt zabiegu  "
        );
    }

    private NewsPost newsPost(
            Long id,
            boolean isActive,
            String imageObjectKey
    ) {
        NewsPost newsPost = new NewsPost();
        newsPost.setId(id);
        newsPost.setTitle("Aktualność " + id);
        newsPost.setContent("Treść wpisu");
        newsPost.setCategory(NewsPostCategory.NEWS);
        newsPost.setImageObjectKey(imageObjectKey);
        newsPost.setActive(isActive);
        return newsPost;
    }
}
