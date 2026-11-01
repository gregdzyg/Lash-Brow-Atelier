package pl.atelierbypt.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(prefix = "app.r2", name = "enabled", havingValue = "true")
public class R2StorageConfig {

    @Bean
    S3Client r2S3Client(
            @Value("${app.r2.endpoint}") String endpoint,
            @Value("${app.r2.access-key-id}") String accessKeyId,
            @Value("${app.r2.secret-access-key}") String secretAccessKey
    ) {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                accessKeyId,
                secretAccessKey
        );

        S3Configuration serviceConfiguration = S3Configuration.builder()
                .pathStyleAccessEnabled(true)
                .chunkedEncodingEnabled(false)
                .build();

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.of("auto"))
                .serviceConfiguration(serviceConfiguration)
                .build();
    }
}
