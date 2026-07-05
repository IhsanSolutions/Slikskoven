package dk.ek.slikskoven.service;

import dk.ek.slikskoven.dto.request.CreateProductRequest;
import dk.ek.slikskoven.dto.response.ProductResponseDTO;
import dk.ek.slikskoven.dto.request.UpdateProductRequest;
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

    private ProductResponseDTO mapToDTO(Product product) {

        return new ProductResponseDTO(
                product.getProductId(),
                product.getName(),
                product.getPrice(),
                product.getDescription(),
                product.getCategory(),
                product.getGelatineType(),
                product.getImageUrl(),
                product.getStockQuantity(),
                product.getIsAvailable()
        );
    }

    public ProductResponseDTO createProduct(CreateProductRequest request) {
        Product newProduct = new Product();

        newProduct.setName(request.name());
        newProduct.setDescription(request.description());
        newProduct.setPrice(request.price());
        newProduct.setStockQuantity(request.stockQuantity());
        newProduct.setImageUrl(request.imageUrl());
        newProduct.setGelatineType(request.gelatineType());
        newProduct.setCategory(request.category());

        newProduct.setIsAvailable(true);
        newProduct.setIsOnOffer(false);
        newProduct.setOfferPrice(null);

        Product saved = productRepo.save(newProduct);

        return mapToDTO(saved);
    }

    public ProductResponseDTO updateProduct(Long id, UpdateProductRequest request) {

        Product existing = productRepo.findById(id).orElseThrow(() -> new RuntimeException("product not found"));

        existing.setName(request.name());
        existing.setDescription(request.description());
        existing.setPrice(request.price());
        existing.setStockQuantity(request.stockQuantity());
        existing.setImageUrl(request.imageUrl());
        existing.setGelatineType(request.gelatineType());
        existing.setCategory(request.category());
        existing.setIsAvailable(request.isAvailable());

        Product saved = productRepo.save(existing);

        return mapToDTO(saved);
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
