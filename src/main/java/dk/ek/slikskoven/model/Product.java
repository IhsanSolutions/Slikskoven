package dk.ek.slikskoven.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @NotBlank(message = "Name cannot be empty")
    @Column(nullable = false)
    private String name;

    private String description;

    @Min(value = 0, message = "Price must be 0 or higher")
    @Column(nullable = false)
    private Double price;

    private Integer stockQuantity;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private GelatineType gelatineType;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    private Boolean isAvailable;

    private Boolean isOnOffer;

    private Double offerPrice;

}
