package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.PublicNewsPostResponse;
import pl.atelierbypt.backend.enums.NewsPostCategory;
import pl.atelierbypt.backend.service.NewsPostService;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicNewsPostControllerTest {

    private NewsPostService newsPostService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        newsPostService = mock(NewsPostService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicNewsPostController(newsPostService)
        ).build();
    }

    @Test
    void shouldReturnPublicNewsPosts() throws Exception {
        PublicNewsPostResponse newsPost = new PublicNewsPostResponse(
                1L,
                "Promocja listopadowa",
                "Treść wpisu",
                NewsPostCategory.PROMOTION,
                "https://example.r2.dev/news/promotion.jpg",
                "Rzęsy po zabiegu",
                LocalDateTime.of(2026, 11, 1, 18, 0)
        );
        when(newsPostService.getPublicNewsPosts())
                .thenReturn(List.of(newsPost));

        mockMvc.perform(get("/api/public/news-posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title")
                        .value("Promocja listopadowa"))
                .andExpect(jsonPath("$[0].category").value("PROMOTION"))
                .andExpect(jsonPath("$[0].imageUrl").value(
                        "https://example.r2.dev/news/promotion.jpg"
                ))
                .andExpect(jsonPath("$[0].createdAt").exists());
    }
}
