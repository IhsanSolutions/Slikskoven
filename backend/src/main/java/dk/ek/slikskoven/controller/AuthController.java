package dk.ek.slikskoven.controller;

import dk.ek.slikskoven.dto.response.AuthResponseDTO;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/api/auth/me")
    public AuthResponseDTO me(Authentication authentication) {
        boolean loggedIn = authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName());

        boolean admin = loggedIn && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return new AuthResponseDTO(
                loggedIn,
                loggedIn ? authentication.getName() : "",
                admin
        );
    }
}
