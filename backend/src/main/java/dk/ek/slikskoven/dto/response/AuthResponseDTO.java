package dk.ek.slikskoven.dto.response;

public record AuthResponseDTO(
        boolean loggedIn,
        Long userId,
        String email,
        String name,
        String role,
        boolean admin
) {

    public static AuthResponseDTO anonymous() {
        return new AuthResponseDTO(
                false,
                null,
                "",
                "",
                "",
                false
        );
    }
}