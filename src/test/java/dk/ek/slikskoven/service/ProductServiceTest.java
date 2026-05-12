package dk.ek.slikskoven.service;

import dk.ek.slikskoven.dto.CreateProductRequest;
import dk.ek.slikskoven.dto.ProductRespondsDTO;
import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.Product;
import dk.ek.slikskoven.model.ProductCategory;
import dk.ek.slikskoven.repository.ProductRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepo productRepo;

    @InjectMocks
    private ProductService productService;

    private Product testProduct;
    private Product testProduct2;

    @BeforeEach
    void setUp() {
        // Initialize test products
        testProduct = new Product();
        testProduct.setProductId(1L);
        testProduct.setName("Vanilla Ice Cream");
        testProduct.setDescription("Delicious vanilla ice cream");
        testProduct.setPrice(5.99);
        testProduct.setStockQuantity(50);
        testProduct.setGelatineType(GelatineType.WITHOUT_GELATINE);
        testProduct.setCategory(ProductCategory.ICE_CREAM);
        testProduct.setIsAvailable(true);

        testProduct2 = new Product();
        testProduct2.setProductId(2L);
        testProduct2.setName("Chocolate Candy");
        testProduct2.setDescription("Sweet chocolate candy");
        testProduct2.setPrice(2.99);
        testProduct2.setStockQuantity(100);
        testProduct2.setGelatineType(GelatineType.WITH_GELATINE);
        testProduct2.setCategory(ProductCategory.CANDY);
        testProduct2.setIsAvailable(true);
    }

    @Test
    void testGetAllProducts() {
        // Arrange
        List<Product> products = new ArrayList<>();
        products.add(testProduct);
        products.add(testProduct2);
        when(productRepo.findByIsAvailableTrue()).thenReturn(products);

        // Act
        List<Product> result = productService.getAllProducts();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Vanilla Ice Cream", result.get(0).getName());
        assertEquals("Chocolate Candy", result.get(1).getName());
        verify(productRepo, times(1)).findByIsAvailableTrue();
    }

    @Test
    void testGetProductById_Success() {
        // Arrange
        when(productRepo.findById(1L)).thenReturn(Optional.of(testProduct));

        // Act
        Product result = productService.getProductById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getProductId());
        assertEquals("Vanilla Ice Cream", result.getName());
        verify(productRepo, times(1)).findById(1L);
    }

    @Test
    void testGetProductById_NotFound() {
        // Arrange
        when(productRepo.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> productService.getProductById(999L));
        verify(productRepo, times(1)).findById(999L);
    }

    @Test
    void testCreateProduct() {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "Strawberry Ice Cream",
                "Fresh strawberry ice cream",
                6.99,
                75,
                null, // imageUrl
                GelatineType.WITHOUT_GELATINE,
                ProductCategory.ICE_CREAM
        );

        Product savedProduct = new Product();
        savedProduct.setProductId(3L);
        savedProduct.setName("Strawberry Ice Cream");
        savedProduct.setDescription("Fresh strawberry ice cream");
        savedProduct.setPrice(6.99);
        savedProduct.setStockQuantity(75);
        savedProduct.setGelatineType(GelatineType.WITHOUT_GELATINE);
        savedProduct.setCategory(ProductCategory.ICE_CREAM);
        savedProduct.setIsAvailable(true);

        when(productRepo.save(any(Product.class))).thenReturn(savedProduct);

        // Act
        ProductRespondsDTO result = productService.createProduct(request);

        // Assert
        assertNotNull(result);
        assertEquals(3L, result.productId());
        assertEquals("Strawberry Ice Cream", result.name());
        assertEquals(6.99, result.price());
        assertEquals("Fresh strawberry ice cream", result.description());
        assertEquals(ProductCategory.ICE_CREAM, result.category());
        assertEquals(GelatineType.WITHOUT_GELATINE, result.gelatineType());
        verify(productRepo, times(1)).save(any(Product.class));
    }

    @Test
    void testUpdateProduct_Success() {
        // Arrange
        Product updateData = new Product();
        updateData.setName("Updated Vanilla Ice Cream");
        updateData.setDescription("Updated description");
        updateData.setPrice(7.99);
        updateData.setStockQuantity(60);
        updateData.setIsAvailable(true);
        updateData.setGelatineType(GelatineType.WITH_GELATINE);

        Product updatedProduct = new Product();
        updatedProduct.setProductId(1L);
        updatedProduct.setName("Updated Vanilla Ice Cream");
        updatedProduct.setDescription("Updated description");
        updatedProduct.setPrice(7.99);
        updatedProduct.setStockQuantity(60);
        updatedProduct.setGelatineType(GelatineType.WITH_GELATINE);
        updatedProduct.setIsAvailable(true);

        when(productRepo.findById(1L)).thenReturn(Optional.of(testProduct));
        when(productRepo.save(any(Product.class))).thenReturn(updatedProduct);

        // Act
        Product result = productService.updateProduct(1L, updateData);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Vanilla Ice Cream", result.getName());
        assertEquals(7.99, result.getPrice());
        assertEquals(60, result.getStockQuantity());
        verify(productRepo, times(1)).findById(1L);
        verify(productRepo, times(1)).save(any(Product.class));
    }

    @Test
    void testUpdateProduct_NotFound() {
        // Arrange
        when(productRepo.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> productService.updateProduct(999L, testProduct));
        verify(productRepo, times(1)).findById(999L);
    }

    @Test
    void testDeleteProduct() {
        // Arrange
        doNothing().when(productRepo).deleteById(1L);

        // Act
        productService.deleteProduct(1L);

        // Assert
        verify(productRepo, times(1)).deleteById(1L);
    }

    @Test
    void testGetGelatineFreeProducts() {
        // Arrange
        List<Product> gelatineFreeProducts = new ArrayList<>();
        gelatineFreeProducts.add(testProduct);
        when(productRepo.findByIsAvailableTrueAndGelatineType(GelatineType.WITHOUT_GELATINE))
                .thenReturn(gelatineFreeProducts);

        // Act
        List<Product> result = productService.getGelatineFreeProducts();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Vanilla Ice Cream", result.get(0).getName());
        assertEquals(GelatineType.WITHOUT_GELATINE, result.get(0).getGelatineType());
        verify(productRepo, times(1)).findByIsAvailableTrueAndGelatineType(GelatineType.WITHOUT_GELATINE);
    }

    @Test
    void testGetGelatineFreeProducts_Empty() {
        // Arrange
        when(productRepo.findByIsAvailableTrueAndGelatineType(GelatineType.WITHOUT_GELATINE))
                .thenReturn(new ArrayList<>());

        // Act
        List<Product> result = productService.getGelatineFreeProducts();

        // Assert
        assertTrue(result.isEmpty());
        verify(productRepo, times(1)).findByIsAvailableTrueAndGelatineType(GelatineType.WITHOUT_GELATINE);
    }

    @Test
    void testGetProductByCategory() {
        // Arrange
        List<Product> candyProducts = new ArrayList<>();
        candyProducts.add(testProduct2);
        when(productRepo.findByIsAvailableTrueAndCategory(ProductCategory.CANDY))
                .thenReturn(candyProducts);

        // Act
        List<Product> result = productService.getProductByCategory(ProductCategory.CANDY);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Chocolate Candy", result.get(0).getName());
        assertEquals(ProductCategory.CANDY, result.get(0).getCategory());
        verify(productRepo, times(1)).findByIsAvailableTrueAndCategory(ProductCategory.CANDY);
    }

    @Test
    void testGetProductByCategory_Empty() {
        // Arrange
        when(productRepo.findByIsAvailableTrueAndCategory(ProductCategory.COFFEE))
                .thenReturn(new ArrayList<>());

        // Act
        List<Product> result = productService.getProductByCategory(ProductCategory.COFFEE);

        // Assert
        assertTrue(result.isEmpty());
        verify(productRepo, times(1)).findByIsAvailableTrueAndCategory(ProductCategory.COFFEE);
    }
}
