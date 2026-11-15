package pl.atelierbypt.backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.PublicReviewImageResponse;
import pl.atelierbypt.backend.dto.PublicReviewImagesResponse;
import pl.atelierbypt.backend.service.ReviewImageService;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PublicReviewImageControllerTest {

    private ReviewImageService reviewImageService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        reviewImageService = mock(ReviewImageService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicReviewImageController(reviewImageService)
        ).build();
    }

    @Test
    void shouldReturnPublicReviewImages() throws Exception {
        when(reviewImageService.getPublicReviewImages()).thenReturn(
                new PublicReviewImagesResponse(
                        true,
                        List.of(new PublicReviewImageResponse(
                                1L,
                                "https://example.r2.dev/reviews/review.png",
                                "Opinia klientki"
                        ))
                )
        );

        mockMvc.perform(get("/api/public/review-images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.configured").value(true))
                .andExpect(jsonPath("$.images[0].id").value(1))
                .andExpect(jsonPath("$.images[0].imageUrl").value(
                        "https://example.r2.dev/reviews/review.png"
                ))
                .andExpect(jsonPath("$.images[0].altText")
                        .value("Opinia klientki"));
    }
}
