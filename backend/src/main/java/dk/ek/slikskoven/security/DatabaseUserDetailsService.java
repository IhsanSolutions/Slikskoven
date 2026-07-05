package dk.ek.slikskoven.security;

import dk.ek.slikskoven.model.AppUser;
import dk.ek.slikskoven.repository.AppUserRepo;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {

    private final AppUserRepo appUserRepo;

    public DatabaseUserDetailsService(AppUserRepo appUserRepo) {
        this.appUserRepo = appUserRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        AppUser user = appUserRepo
                .findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Brugeren blev ikke fundet."));

        return User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!user.isEnabled())
                .build();
    }
}