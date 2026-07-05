package dk.ek.slikskoven.config;

import dk.ek.slikskoven.model.AppUser;
import dk.ek.slikskoven.model.UserRole;
import dk.ek.slikskoven.repository.AppUserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
@Profile("!test")
public class AdminUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.name:Slikskoven Admin}")
    private String adminName;

    public AdminUserInitializer(AppUserRepo appUserRepo, PasswordEncoder passwordEncoder) {
        this.appUserRepo = appUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            log.warn("Admin blev ikke oprettet, fordi ADMIN_EMAIL eller ADMIN_PASSWORD mangler.");
            return;
        }

        if (adminPassword.length() < 8) {
            throw new IllegalStateException("ADMIN_PASSWORD skal være mindst 8 tegn.");
        }

        String normalizedEmail = adminEmail
                .trim()
                .toLowerCase(Locale.ROOT);

        var existingUser = appUserRepo.findByEmailIgnoreCase(normalizedEmail);

        if (existingUser.isPresent()) {
            if (existingUser.get().getRole() != UserRole.ADMIN) {
                throw new IllegalStateException(
                        "ADMIN_EMAIL tilhører allerede en almindelig bruger."
                );
            }

            log.info("Admin-brugeren findes allerede.");
            return;
        }

        AppUser admin = new AppUser();

        admin.setName(adminName.trim());
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);

        appUserRepo.save(admin);

        log.info("Admin-brugeren blev oprettet.");
    }
}