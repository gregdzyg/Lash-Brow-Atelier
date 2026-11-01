package pl.atelierbypt.backend.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import pl.atelierbypt.backend.dto.OptimizedImage;
import pl.atelierbypt.backend.exception.BadRequestException;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImageOptimizationServiceTest {

    private final ImageOptimizationService imageOptimizationService =
            new ImageOptimizationService();

    @Test
    void shouldResizeLargeImageAndEncodeItAsJpeg() throws IOException {
        MockMultipartFile file = imageFile(
                "large.png",
                "image/png",
                2400,
                1200,
                BufferedImage.TYPE_INT_ARGB,
                "png"
        );

        OptimizedImage optimizedImage = imageOptimizationService
                .optimize(file);
        BufferedImage result = ImageIO.read(new ByteArrayInputStream(
                optimizedImage.content()
        ));

        assertThat(optimizedImage.contentType()).isEqualTo("image/jpeg");
        assertThat(optimizedImage.fileExtension()).isEqualTo("jpg");
        assertThat(result.getWidth()).isEqualTo(1920);
        assertThat(result.getHeight()).isEqualTo(960);
    }

    @Test
    void shouldNotEnlargeSmallImage() throws IOException {
        MockMultipartFile file = imageFile(
                "small.jpg",
                "image/jpeg",
                400,
                300,
                BufferedImage.TYPE_INT_RGB,
                "jpg"
        );

        OptimizedImage optimizedImage = imageOptimizationService
                .optimize(file);
        BufferedImage result = ImageIO.read(new ByteArrayInputStream(
                optimizedImage.content()
        ));

        assertThat(result.getWidth()).isEqualTo(400);
        assertThat(result.getHeight()).isEqualTo(300);
    }

    @Test
    void shouldRejectContentThatIsNotAnImage() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "fake.jpg",
                "image/jpeg",
                "not-an-image".getBytes()
        );

        assertThatThrownBy(() -> imageOptimizationService.optimize(file))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Dozwolone formaty zdjęć to JPEG i PNG.");
    }

    @Test
    void shouldReplacePngTransparencyWithWhiteBackground() throws IOException {
        BufferedImage source = new BufferedImage(
                100,
                100,
                BufferedImage.TYPE_INT_ARGB
        );
        source.setRGB(50, 50, Color.RED.getRGB());
        MockMultipartFile file = imageFile(
                "transparent.png",
                "image/png",
                source,
                "png"
        );

        OptimizedImage optimizedImage = imageOptimizationService
                .optimize(file);
        BufferedImage result = ImageIO.read(new ByteArrayInputStream(
                optimizedImage.content()
        ));
        Color transparentAreaAfterOptimization = new Color(
                result.getRGB(0, 0)
        );

        assertThat(transparentAreaAfterOptimization.getRed())
                .isGreaterThan(245);
        assertThat(transparentAreaAfterOptimization.getGreen())
                .isGreaterThan(245);
        assertThat(transparentAreaAfterOptimization.getBlue())
                .isGreaterThan(245);
    }

    private MockMultipartFile imageFile(
            String filename,
            String contentType,
            int width,
            int height,
            int imageType,
            String format
    ) throws IOException {
        BufferedImage image = new BufferedImage(width, height, imageType);
        return imageFile(filename, contentType, image, format);
    }

    private MockMultipartFile imageFile(
            String filename,
            String contentType,
            BufferedImage image,
            String format
    ) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, format, output);
        return new MockMultipartFile(
                "file",
                filename,
                contentType,
                output.toByteArray()
        );
    }
}
