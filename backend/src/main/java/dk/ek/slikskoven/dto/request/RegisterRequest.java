package dk.ek.slikskoven.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "Navn skal udfyldes")
        @Size(max = 100, message = "Navnet må højst være 100 tegn")
        String name,

        @NotBlank(message = "E-mail skal udfyldes")
        @Email(message = "Indtast en gyldig e-mail")
        @Size(max = 190, message = "E-mailen er for lang")
        String email,

        @Pattern(regexp = "^$|^[0-9+() .-]{6,30}$", message = "Indtast et gyldigt telefonnummer")
        String phone,

        @NotBlank(message = "Kodeord skal udfyldes")
        @Size(min = 8, max = 64, message = "Kodeord skal være mellem 8 og 64 tegn")
        String password
) {
}