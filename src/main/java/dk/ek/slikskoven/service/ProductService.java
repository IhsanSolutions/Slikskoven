package dk.ek.slikskoven.service;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.Product;
import dk.ek.slikskoven.model.ProductCategory;
import dk.ek.slikskoven.repository.ProductRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new RuntimeException("product not found"));
    }

    public Product createProduct(Product product) {
        Product newProduct = new Product();

        newProduct.setName(product.getName());
        newProduct.setDescription(product.getDescription());
        newProduct.setPrice(product.getPrice());
        newProduct.setStockQuantity(product.getStockQuantity());
        newProduct.setGelatineType(product.getGelatineType());
        newProduct.setCategory(product.getCategory());
        newProduct.setIsAvailable(true);

        return productRepo.save(newProduct);

    }

    public Product updateProduct(Long id, Product product) {
        Product existing = productRepo.findById(id).orElseThrow(() -> new RuntimeException("product not found"));

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setIsAvailable(product.getIsAvailable());
        existing.setGelatineType(product.getGelatineType());

        return productRepo.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public List<Product> getGelatineFreeProducts() {
        return productRepo.findByIsAvailableTrueAndGelatineType(GelatineType.WITHOUT_GELATINE);

    }


    public List<Product> getProductByCategory(ProductCategory category) {
        return productRepo.findByIsAvailableTrueAndCategory(category);
    }

}
