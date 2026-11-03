package pl.atelierbypt.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pl.atelierbypt.backend.dto.ReviewImageDetailsRequest;
import pl.atelierbypt.backend.dto.ReviewImageMoveRequest;
import pl.atelierbypt.backend.dto.ReviewImageResponse;
import pl.atelierbypt.backend.dto.ReviewImageVisibilityRequest;
import pl.atelierbypt.backend.enums.ReviewImageMoveDirection;
import pl.atelierbypt.backend.service.ReviewImageManagementService;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ReviewImageControllerTest {

    private ReviewImageManagementService reviewImageManagementService;
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        reviewImageManagementService = mock(
                ReviewImageManagementService.class
        );
        mockMvc = MockMvcBuilders.standaloneSetup(
                new ReviewImageController(reviewImageManagementService)
        ).build();
    }

    @Test
    void shouldReturnAndCreateReviewImages() throws Exception {
        ReviewImageResponse response = response(true);
        when(reviewImageManagementService.getReviewImages())
                .thenReturn(List.of(response));
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "review.png",
                "image/png",
                new byte[]{1, 2, 3}
        );
        when(reviewImageManagementService.createReviewImage(
                file,
                "Opinia klientki"
        )).thenReturn(response);

        mockMvc.perform(get("/api/admin/review-images"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));

        mockMvc.perform(multipart("/api/admin/review-images")
                        .file(file)
                        .param("altText", "Opinia klientki"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.imageUrl").value(
                        "https://example.r2.dev/reviews/review.png"
                ));
    }

    @Test
    void shouldUpdateDetailsAndVisibility() throws Exception {
        ReviewImageDetailsRequest detailsRequest =
                new ReviewImageDetailsRequest("Nowy opis");
        ReviewImageVisibilityRequest visibilityRequest =
                new ReviewImageVisibilityRequest(false);
        when(reviewImageManagementService.updateReviewImageDetails(
                1L,
                "Nowy opis"
        )).thenReturn(response(true));
        when(reviewImageManagementService.setReviewImageVisibility(
                1L,
                false
        )).thenReturn(response(false));

        mockMvc.perform(patch("/api/admin/review-images/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                detailsRequest
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.altText").value("Opinia klientki"));

        mockMvc.perform(patch(
                        "/api/admin/review-images/1/visibility"
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                visibilityRequest
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    @Test
    void shouldMoveAndDeleteReviewImage() throws Exception {
        ReviewImageMoveRequest moveRequest = new ReviewImageMoveRequest(
                ReviewImageMoveDirection.UP
        );
        when(reviewImageManagementService.moveReviewImage(
                1L,
                ReviewImageMoveDirection.UP
        )).thenReturn(List.of(response(true)));

        mockMvc.perform(patch(
                        "/api/admin/review-images/1/position"
                )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(moveRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));

        mockMvc.perform(delete("/api/admin/review-images/1"))
                .andExpect(status().isNoContent());
        verify(reviewImageManagementService).deleteReviewImage(1L);
    }

    private ReviewImageResponse response(boolean active) {
        return new ReviewImageResponse(
                1L,
                "https://example.r2.dev/reviews/review.png",
                "Opinia klientki",
                0,
                active
        );
    }
}
