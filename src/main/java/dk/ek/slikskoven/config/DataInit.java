package dk.ek.slikskoven.config;

import dk.ek.slikskoven.model.GelatineType;
import dk.ek.slikskoven.model.Product;
import dk.ek.slikskoven.model.ProductCategory;
import dk.ek.slikskoven.repository.ProductRepo;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DataInit {

    private final ProductRepo productRepo;

    public DataInit(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() {
        // Only add products if the database is empty
        if (productRepo.count() == 0) {
            addSampleProducts();
        }
    }

    private void addSampleProducts() {
        // Product 1: Gummi Bears
        Product p1 = new Product();
        p1.setName("Gummi Bears");
        p1.setDescription("Farverige og sødefulde gummibamser i mange forskellige smage");
        p1.setPrice(45.00);
        p1.setCategory(ProductCategory.CANDY);
        p1.setGelatineType(GelatineType.WITH_GELATINE);
        p1.setStockQuantity(100);
        p1.setIsAvailable(true);
        productRepo.save(p1);

        // Product 2: Sour Straws
        Product p2 = new Product();
        p2.setName("Sour Straws");
        p2.setDescription("Syrlige sugerør med intens syrlig smag");
        p2.setPrice(35.00);
        p2.setCategory(ProductCategory.CANDY);
        p2.setGelatineType(GelatineType.WITHOUT_GELATINE);
        p2.setStockQuantity(80);
        p2.setIsAvailable(true);
        productRepo.save(p2);

        // Product 3: Chocolate Truffles
        Product p3 = new Product();
        p3.setName("Chocolate Truffles");
        p3.setDescription("Luksuslige chokoladetryffler fyldt med cremede ganache");
        p3.setPrice(55.00);
        p3.setCategory(ProductCategory.CANDY);
        p3.setGelatineType(GelatineType.WITH_GELATINE);
        p3.setStockQuantity(50);
        p3.setIsAvailable(true);
        productRepo.save(p3);

        // Product 4: Vanilla Ice Cream
        Product p4 = new Product();
        p4.setName("Vanilla Ice Cream");
        p4.setDescription("Klassisk vaniljeis med autentisk smag");
        p4.setPrice(65.00);
        p4.setCategory(ProductCategory.ICE_CREAM);
        p4.setGelatineType(GelatineType.WITHOUT_GELATINE);
        p4.setStockQuantity(120);
        p4.setIsAvailable(true);
        productRepo.save(p4);

        // Product 5: Strawberry Licorice
        Product p5 = new Product();
        p5.setName("Strawberry Licorice");
        p5.setDescription("Sødt jordbærlakrids fra de nordiske kilder");
        p5.setPrice(40.00);
        p5.setCategory(ProductCategory.CANDY);
        p5.setGelatineType(GelatineType.WITH_GELATINE);
        p5.setStockQuantity(90);
        p5.setIsAvailable(true);
        productRepo.save(p5);

        // Product 6: Espresso Ice Cream
        Product p6 = new Product();
        p6.setName("Espresso Ice Cream");
        p6.setDescription("Kraftfuld is med rigt espresso-aroma");
        p6.setPrice(70.00);
        p6.setCategory(ProductCategory.ICE_CREAM);
        p6.setGelatineType(GelatineType.WITHOUT_GELATINE);
        p6.setStockQuantity(75);
        p6.setIsAvailable(true);
        productRepo.save(p6);

        // Product 7: Blue Raspberry Lollipops
        Product p7 = new Product();
        p7.setName("Blue Raspberry Lollipops");
        p7.setDescription("Farverige slikkepinde med blå brinebær-smag");
        p7.setPrice(30.00);
        p7.setCategory(ProductCategory.CANDY);
        p7.setGelatineType(GelatineType.WITHOUT_GELATINE);
        p7.setStockQuantity(150);
        p7.setIsAvailable(true);
        productRepo.save(p7);

        // Product 8: Soft Ice Vanilla
        Product p8 = new Product();
        p8.setName("Soft Ice Vanilla");
        p8.setDescription("Friskbagt soft ice med vaniljesmag");
        p8.setPrice(55.00);
        p8.setCategory(ProductCategory.SOFT_ICE);
        p8.setGelatineType(GelatineType.WITHOUT_GELATINE);
        p8.setStockQuantity(200);
        p8.setIsAvailable(true);
        productRepo.save(p8);

        // Product 9: Mixed Berries Slush
        Product p9 = new Product();
        p9.setName("Mixed Berries Slush");
        p9.setDescription("Frisk slush med blandede bær-smage");
        p9.setPrice(50.00);
        p9.setCategory(ProductCategory.SLUSH_ICE);
        p9.setGelatineType(GelatineType.WITHOUT_GELATINE);
        p9.setStockQuantity(110);
        p9.setIsAvailable(true);
        productRepo.save(p9);

        // Product 10: Salted Caramel Toffee
        Product p10 = new Product();
        p10.setName("Salted Caramel Toffee");
        p10.setDescription("Delikat toffee med salt karamel og buttersukker");
        p10.setPrice(60.00);
        p10.setCategory(ProductCategory.CANDY);
        p10.setGelatineType(GelatineType.WITH_GELATINE);
        p10.setStockQuantity(85);
        p10.setIsAvailable(true);
        productRepo.save(p10);
    }
}
