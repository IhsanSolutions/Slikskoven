package dk.ek.slikskoven.dto;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.ProductCategory;

public record ProductRespondsDTO(
        Long productId,
        String name,
        Double price,
        String description,
        ProductCategory category,
        GelatineType gelatineType
) {}
