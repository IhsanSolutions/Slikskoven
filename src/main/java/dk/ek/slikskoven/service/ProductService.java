package dk.ek.slikskoven.service;

import dk.ek.slikskoven.dto.CreateProductRequest;
import dk.ek.slikskoven.dto.ProductRespondsDTO;
import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.Product;
import dk.ek.slikskoven.model.ProductCategory;
import dk.ek.slikskoven.repository.ProductRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findByIsAvailableTrue();
    }

    public Product getProductById(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new RuntimeException("product not found"));
    }

    public List <Product> getProductByName(String name) {
        List<Product> products = productRepo.findByNameContainingIgnoreCase(name);

        if (products.isEmpty()) {
            throw new RuntimeException("product not found");
        }
        return products;
    }

    private ProductRespondsDTO mapToDTO(Product product) {

        return new ProductRespondsDTO(
                product.getProductId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getCategory(),
                product.getGelatineType()
        );
    }

    public ProductRespondsDTO createProduct(CreateProductRequest request) {
        Product newProduct = new Product();

        newProduct.setName(request.name());
        newProduct.setDescription(request.description());
        newProduct.setPrice(request.price());
        newProduct.setStockQuantity(request.stockQuantity());
        newProduct.setGelatineType(request.gelatineType());
        newProduct.setCategory(request.category());

        newProduct.setIsAvailable(true);

        Product saved = productRepo.save(newProduct);

        return mapToDTO(saved);

    }


    public Product updateProduct(Long id, Product product) {

        Product existing = productRepo.findById(id).orElseThrow(() -> new RuntimeException("product not found"));

        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setPrice(product.getPrice());
        existing.setStockQuantity(product.getStockQuantity());

        existing.setGelatineType(product.getGelatineType());
        existing.setCategory(product.getCategory());
        existing.setIsAvailable(product.getIsAvailable());

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
