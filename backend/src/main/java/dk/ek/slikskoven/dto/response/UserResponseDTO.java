package dk.ek.slikskoven.dto.response;

public record UserResponseDTO(
        Long userId,
        String name,
        String email,
        String phone,
        String role
) {
}