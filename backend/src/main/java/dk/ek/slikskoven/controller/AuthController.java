package dk.ek.slikskoven.controller;

import dk.ek.slikskoven.dto.request.RegisterRequest;
import dk.ek.slikskoven.dto.response.AuthResponseDTO;
import dk.ek.slikskoven.dto.response.UserResponseDTO;
import dk.ek.slikskoven.service.AppUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserService appUserService;

    public AuthController(AppUserService appUserService) {
        this.appUserService = appUserService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponseDTO register(@Valid @RequestBody RegisterRequest request) {
        return appUserService.register(request);
    }

    @GetMapping("/me")
    public AuthResponseDTO me(Authentication authentication) {
        return appUserService.getAuthenticationInfo(authentication);
    }

    @GetMapping("/csrf")
    public CsrfToken csrf(CsrfToken csrfToken) {
        return csrfToken;
    }
}