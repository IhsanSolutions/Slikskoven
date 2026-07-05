package dk.ek.slikskoven.service;

import dk.ek.slikskoven.dto.request.RegisterRequest;
import dk.ek.slikskoven.dto.response.AuthResponseDTO;
import dk.ek.slikskoven.dto.response.UserResponseDTO;
import dk.ek.slikskoven.exception.EmailAlreadyExistsException;
import dk.ek.slikskoven.model.AppUser;
import dk.ek.slikskoven.model.UserRole;
import dk.ek.slikskoven.repository.AppUserRepo;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class AppUserService {

    private final AppUserRepo appUserRepo;
    private final PasswordEncoder passwordEncoder;

    public AppUserService(AppUserRepo appUserRepo, PasswordEncoder passwordEncoder) {
        this.appUserRepo = appUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponseDTO register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        if (appUserRepo.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new EmailAlreadyExistsException("Der findes allerede en bruger med denne e-mail.");
        }

        AppUser user = new AppUser();

        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(normalizePhone(request.phone()));
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        user.setEnabled(true);

        AppUser savedUser = appUserRepo.save(user);

        return mapToUserResponse(savedUser);
    }

    public AuthResponseDTO getAuthenticationInfo(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {

            return AuthResponseDTO.anonymous();
        }

        return appUserRepo
                .findByEmailIgnoreCase(authentication.getName())
                .map(this::mapToAuthResponse)
                .orElseGet(AuthResponseDTO::anonymous);
    }

    private AuthResponseDTO mapToAuthResponse(AppUser user) {
        boolean admin = user.getRole() == UserRole.ADMIN;

        return new AuthResponseDTO(
                true,
                user.getUserId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                admin
        );
    }

    private UserResponseDTO mapToUserResponse(AppUser user) {
        return new UserResponseDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name()
        );
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
    }
}