package pl.atelierbypt.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.NewsPostRequest;
import pl.atelierbypt.backend.dto.NewsPostResponse;
import pl.atelierbypt.backend.service.NewsPostManagementService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/news-posts")
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class NewsPostController {

    private final NewsPostManagementService newsPostManagementService;

    @GetMapping
    public ResponseEntity<List<NewsPostResponse>> getNewsPosts() {
        return ResponseEntity.ok(newsPostManagementService.getNewsPosts());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NewsPostResponse> createNewsPost(
            @Valid @ModelAttribute NewsPostRequest request,
            @RequestParam(required = false) MultipartFile image
    ) {
        NewsPostResponse response = newsPostManagementService.createNewsPost(
                request,
                image
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
