package dk.ek.slikskoven.dto;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.ProductCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateProductRequest(

        String name,
        String description,
        Double price,
        Integer stockQuantity,
        String imageUrl,
        GelatineType gelatineType,
        ProductCategory category

) {}
