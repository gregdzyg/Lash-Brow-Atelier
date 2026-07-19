package pl.atelierbypt.backend.bootstrap;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.atelierbypt.backend.entity.AppUser;
import pl.atelierbypt.backend.enums.UserRole;
import pl.atelierbypt.backend.repository.AppUserRepository;

@Log4j2
@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.bootstrap-enabled}")
    private boolean bootstrapEnabled;

    @Value("${app.admin.username}")
    private String username;

    @Value("${app.admin.password}")
    private String password;

    @Override
    public void run(String... args) {

        if (!bootstrapEnabled) {
            return;
        }
        // hasText() == string is not null, not empty and contains non-whitespace characters
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            throw new IllegalStateException("Admin bootstrap requires ADMIN_USERNAME and ADMIN_PASSWORD environment variables.");
        }

        if(appUserRepository.findByUsername(username).isPresent()) {
            log.info("Administrator account already exists. Skipping bootstrap.");
            return;
        }
        log.info("Creating initial administrator account...");
        AppUser admin = new AppUser();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);

        appUserRepository.save(admin);
        log.info("Administrator account created successfully.");
    }
}
