package pl.atelierbypt.backend.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pl.atelierbypt.backend.dto.OptimizedImage;
import pl.atelierbypt.backend.exception.BadRequestException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;

@Service
public class ImageOptimizationService {

    private static final int MAX_DIMENSION = 1920;
    private static final long MAX_PIXEL_COUNT = 40_000_000;
    private static final double JPEG_QUALITY = 0.82;
    private static final String OUTPUT_CONTENT_TYPE = "image/jpeg";
    private static final String OUTPUT_FILE_EXTENSION = "jpg";
    private static final Set<String> SUPPORTED_FORMATS = Set.of(
            "jpeg",
            "jpg",
            "png"
    );

    public OptimizedImage optimize(MultipartFile file) {
        try {
            byte[] sourceContent = file.getBytes();
            ImageInfo imageInfo = readImageInfo(sourceContent);
            validateImageInfo(imageInfo);

            BufferedImage resizedImage = resizeImage(
                    sourceContent,
                    imageInfo
            );
            byte[] optimizedContent = encodeAsJpeg(resizedImage);

            return new OptimizedImage(
                    optimizedContent,
                    OUTPUT_CONTENT_TYPE,
                    OUTPUT_FILE_EXTENSION
            );
        } catch (IOException exception) {
            throw new BadRequestException(
                    "Nie udało się przetworzyć pliku jako zdjęcia."
            );
        }
    }

    private ImageInfo readImageInfo(byte[] sourceContent) throws IOException {
        try (ImageInputStream imageInput = ImageIO.createImageInputStream(
                new ByteArrayInputStream(sourceContent)
        )) {
            if (imageInput == null) {
                throw unsupportedImage();
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) {
                throw unsupportedImage();
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(imageInput);
                return new ImageInfo(
                        reader.getFormatName().toLowerCase(Locale.ROOT),
                        reader.getWidth(0),
                        reader.getHeight(0)
                );
            } finally {
                reader.dispose();
            }
        }
    }

    private void validateImageInfo(ImageInfo imageInfo) {
        if (!SUPPORTED_FORMATS.contains(imageInfo.format())) {
            throw unsupportedImage();
        }

        long pixelCount = (long) imageInfo.width() * imageInfo.height();
        if (pixelCount > MAX_PIXEL_COUNT) {
            throw new BadRequestException(
                    "Zdjęcie ma zbyt dużą rozdzielczość."
            );
        }
    }

    private BufferedImage resizeImage(
            byte[] sourceContent,
            ImageInfo imageInfo
    ) throws IOException {
        if (imageInfo.width() <= MAX_DIMENSION
                && imageInfo.height() <= MAX_DIMENSION) {
            return Thumbnails.of(new ByteArrayInputStream(sourceContent))
                    .scale(1.0)
                    .asBufferedImage();
        }

        return Thumbnails.of(new ByteArrayInputStream(sourceContent))
                .size(MAX_DIMENSION, MAX_DIMENSION)
                .asBufferedImage();
    }

    private byte[] encodeAsJpeg(BufferedImage image) throws IOException {
        BufferedImage rgbImage = new BufferedImage(
                image.getWidth(),
                image.getHeight(),
                BufferedImage.TYPE_INT_RGB
        );
        Graphics2D graphics = rgbImage.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, rgbImage.getWidth(), rgbImage.getHeight());
            graphics.drawImage(image, 0, 0, null);
        } finally {
            graphics.dispose();
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Thumbnails.of(rgbImage)
                .scale(1.0)
                .outputFormat(OUTPUT_FILE_EXTENSION)
                .outputQuality(JPEG_QUALITY)
                .toOutputStream(output);
        return output.toByteArray();
    }

    private BadRequestException unsupportedImage() {
        return new BadRequestException(
                "Dozwolone formaty zdjęć to JPEG i PNG."
        );
    }

    private record ImageInfo(String format, int width, int height) {
    }
}
