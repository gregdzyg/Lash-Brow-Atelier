package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.NewsPostRequest;
import pl.atelierbypt.backend.dto.NewsPostResponse;
import pl.atelierbypt.backend.enums.NewsPostCategory;
import pl.atelierbypt.backend.service.NewsPostManagementService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NewsPostControllerTest {

    private NewsPostManagementService newsPostManagementService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        newsPostManagementService = mock(NewsPostManagementService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new NewsPostController(newsPostManagementService)
        ).build();
    }

    @Test
    void shouldCreateNewsPostWithOptionalImage() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "promotion.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
        NewsPostRequest request = new NewsPostRequest(
                "Promocja listopadowa",
                "Treść wpisu",
                NewsPostCategory.PROMOTION,
                "Efekt zabiegu"
        );
        NewsPostResponse response = new NewsPostResponse(
                1L,
                request.title(),
                request.content(),
                request.category(),
                "https://example.r2.dev/news/promotion.jpg",
                request.imageAltText(),
                true,
                LocalDateTime.of(2026, 11, 1, 19, 0),
                LocalDateTime.of(2026, 11, 1, 19, 0)
        );
        when(newsPostManagementService.createNewsPost(request, image))
                .thenReturn(response);

        mockMvc.perform(multipart("/api/admin/news-posts")
                        .file(image)
                        .param("title", request.title())
                        .param("content", request.content())
                        .param("category", request.category().name())
                        .param("imageAltText", request.imageAltText()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title")
                        .value("Promocja listopadowa"))
                .andExpect(jsonPath("$.category").value("PROMOTION"))
                .andExpect(jsonPath("$.imageUrl").value(
                        "https://example.r2.dev/news/promotion.jpg"
                ));

        verify(newsPostManagementService).createNewsPost(request, image);
    }

    @Test
    void shouldReturnAllNewsPostsForAdmin() throws Exception {
        NewsPostResponse activePost = newsPostResponse(1L, true);
        NewsPostResponse inactivePost = newsPostResponse(2L, false);
        when(newsPostManagementService.getNewsPosts())
                .thenReturn(List.of(activePost, inactivePost));

        mockMvc.perform(get("/api/admin/news-posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].isActive").value(true))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].isActive").value(false));
    }

    private NewsPostResponse newsPostResponse(Long id, boolean isActive) {
        return new NewsPostResponse(
                id,
                "Aktualność " + id,
                "Treść wpisu",
                NewsPostCategory.NEWS,
                null,
                null,
                isActive,
                LocalDateTime.of(2026, 11, 1, 19, 0),
                LocalDateTime.of(2026, 11, 1, 19, 0)
        );
    }
}
