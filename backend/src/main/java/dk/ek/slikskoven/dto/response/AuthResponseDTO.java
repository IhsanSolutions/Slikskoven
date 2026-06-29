package dk.ek.slikskoven.dto.response;

public record AuthResponseDTO(
        boolean loggedIn,
        String username,
        boolean admin
) {
}