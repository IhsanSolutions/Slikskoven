package dk.ek.slikskoven.dto.response;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.ProductCategory;

public record ProductResponseDTO(
        Long productId,
        String name,
        Double price,
        String description,
        ProductCategory category,
        GelatineType gelatineType,
        String imageUrl,
        Integer stockQuantity,
        Boolean isAvailable
) {}
