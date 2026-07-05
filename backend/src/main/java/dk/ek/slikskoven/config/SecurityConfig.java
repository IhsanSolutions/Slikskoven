package dk.ek.slikskoven.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                /*
                 * CSRF er aktivt.
                 * Frontenden bliver opdateret i næste del til at sende tokenet.
                 */
                .csrf(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth

                        // Offentlig authentication
                        .requestMatchers(
                                "/api/auth/csrf",
                                "/api/auth/me",
                                "/api/auth/register",
                                "/login",
                                "/logout",
                                "/error"
                        ).permitAll()

                        // Offentlig læsning
                        .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/news/**").permitAll()

                        // Gæster og brugere kan oprette ordrer
                        .requestMatchers(HttpMethod.POST, "/api/orders").permitAll()

                        // Kun ADMIN må ændre produkter
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Kun ADMIN må ændre nyheder
                        .requestMatchers(HttpMethod.POST, "/api/news/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/news/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/news/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/news/**").hasRole("ADMIN")

                        // Kun ADMIN må se og administrere ordrer
                        .requestMatchers(HttpMethod.GET, "/api/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole("ADMIN")

                        /*
                         * Nye endpoints bliver ikke automatisk offentlige.
                         * De skal bevidst tilføjes ovenfor.
                         */
                        .anyRequest().denyAll()
                )

                .formLogin(form -> form
                        .loginProcessingUrl("/login")
                        .usernameParameter("username")
                        .passwordParameter("password")

                        .successHandler(
                                (request, response, authentication) -> {
                                    boolean admin =
                                            authentication
                                                    .getAuthorities()
                                                    .stream()
                                                    .anyMatch(authority ->
                                                            authority
                                                                    .getAuthority()
                                                                    .equals("ROLE_ADMIN")
                                                    );

                                    if (admin) {
                                        response.sendRedirect("/admin/adminDashboard.html");
                                    } else {
                                        response.sendRedirect("/forside.html");
                                    }
                                }
                        )

                        .failureUrl("/login.html?error=true")
                        .permitAll()
                )

                .logout(logout -> logout
                        .logoutUrl("/logout")

                        .logoutSuccessHandler(
                                (request, response, authentication) ->
                                        response.setStatus(HttpServletResponse.SC_NO_CONTENT)
                        )

                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                )

                .sessionManagement(session ->
                        session.sessionFixation(
                                sessionFixation -> sessionFixation.migrateSession()
                        )
                )

                .exceptionHandling(exception -> exception

                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    response.getWriter().write("{\"message\":\"Du skal være logget ind.\"}");
                                }
                        )

                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                                    response.getWriter().write("{\"message\":\"Du har ikke adgang.\"}");
                                }
                        )
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}