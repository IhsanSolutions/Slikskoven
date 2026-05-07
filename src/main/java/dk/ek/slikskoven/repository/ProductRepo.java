package dk.ek.slikskoven.repository;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.Product;
import dk.ek.slikskoven.model.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    List<Product> findByIsAvailableTrue();

    List<Product> findByNameContainingIgnoreCase(String keyword);

    List<Product> findByIsAvailableTrueAndGelatineType(GelatineType gelatineType);

    List<Product> findByIsAvailableTrueAndCategory(ProductCategory category);

}
