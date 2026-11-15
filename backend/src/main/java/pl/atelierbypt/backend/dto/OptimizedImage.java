package pl.atelierbypt.backend.dto;

public record OptimizedImage(
        byte[] content,
        String contentType,
        String fileExtension
) {
    public OptimizedImage {
        content = content.clone();
    }

    @Override
    public byte[] content() {
        return content.clone();
    }
}
