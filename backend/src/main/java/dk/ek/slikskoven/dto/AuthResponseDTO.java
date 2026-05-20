package dk.ek.slikskoven.dto;

public record AuthResponseDTO(
        boolean loggedIn,
        String username,
        boolean admin
) {
}