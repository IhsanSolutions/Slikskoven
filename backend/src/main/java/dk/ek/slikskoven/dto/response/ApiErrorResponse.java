package dk.ek.slikskoven.dto.response;

import java.util.Map;

public record ApiErrorResponse(
        String message,
        Map<String, String> fieldErrors
) {
}