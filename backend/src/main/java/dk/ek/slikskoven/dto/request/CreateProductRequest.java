package dk.ek.slikskoven.dto.request;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.ProductCategory;

public record CreateProductRequest(
        String name,
        String description,
        Double price,
        Integer stockQuantity,
        String imageUrl,
        GelatineType gelatineType,
        ProductCategory category
) {}
