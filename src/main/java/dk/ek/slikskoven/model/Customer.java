package dk.ek.slikskoven.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @NotBlank(message = "Navn skal være udfyldt")
    private String name;

    @NotBlank(message = "Telefon skal være udfyldt")
    private String phone;
}