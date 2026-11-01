package pl.atelierbypt.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.atelierbypt.backend.dto.PublicNewsPostResponse;
import pl.atelierbypt.backend.service.NewsPostService;

import java.util.List;

@RestController
@RequestMapping("/api/public/news-posts")
@RequiredArgsConstructor
public class PublicNewsPostController {

    private final NewsPostService newsPostService;

    @GetMapping
    public ResponseEntity<List<PublicNewsPostResponse>> getNewsPosts() {
        return ResponseEntity.ok(newsPostService.getPublicNewsPosts());
    }
}
