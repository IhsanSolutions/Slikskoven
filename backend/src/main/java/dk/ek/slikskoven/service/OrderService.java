package dk.ek.slikskoven.service;

import dk.ek.slikskoven.model.Customer;
import dk.ek.slikskoven.model.Order;
import dk.ek.slikskoven.model.OrderLine;
import dk.ek.slikskoven.model.OrderStatus;
import dk.ek.slikskoven.model.Product;
import dk.ek.slikskoven.repository.CustomerRepo;
import dk.ek.slikskoven.repository.OrderRepo;
import dk.ek.slikskoven.repository.ProductRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final CustomerRepo customerRepo;
    private final ProductRepo productRepo;

    public OrderService(OrderRepo orderRepo, CustomerRepo customerRepo, ProductRepo productRepo) {
        this.orderRepo = orderRepo;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepo
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order createOrder(Order order) {
        validateCustomer(order.getCustomer());

        boolean hasComment = order.getComment() != null && !order.getComment().isBlank();

        boolean hasOrderLines = order.getOrderLines() != null && !order.getOrderLines().isEmpty();

        if (!hasComment && !hasOrderLines) {
            throw new IllegalArgumentException(
                    "Bestillingen skal have mindst én ordrelinje eller en kommentar."
            );
        }

        customerRepo.save(order.getCustomer());

        order.setStatus(OrderStatus.MODTAGET);
        order.setCreatedAt(LocalDateTime.now());

        if (hasOrderLines) {
            calculateAndAttachOrderLines(order);
        } else {
            order.setTotalPrice(0.0);
        }

        return orderRepo.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepo
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        orderRepo.delete(order);
    }

    public Order updateStatus(Long id, OrderStatus status) {
        Order order = orderRepo
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        return orderRepo.save(order);
    }

    private void validateCustomer(Customer customer) {
        if (customer == null) {
            throw new IllegalArgumentException("Kundeoplysninger mangler.");
        }

        if (customer.getName() == null || customer.getName().isBlank()) {
            throw new IllegalArgumentException("Navn skal være udfyldt.");
        }

        if (customer.getPhone() == null || customer.getPhone().isBlank()) {
            throw new IllegalArgumentException("Telefonnummer skal være udfyldt.");
        }
    }

    private void calculateAndAttachOrderLines(Order order) {
        double total = 0.0;

        for (OrderLine line : order.getOrderLines()) {
            validateOrderLine(line);

            Long productId = line
                    .getProduct()
                    .getProductId();

            Product product = productRepo
                    .findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            double linePrice =
                    (line.getQuantityGrams() / 100.0) *
                            product.getPrice();

            line.setProduct(product);
            line.setLinePrice(linePrice);
            line.setOrder(order);

            total += linePrice;
        }

        order.setTotalPrice(total);
    }

    private void validateOrderLine(OrderLine line) {
        if (line == null) {
            throw new IllegalArgumentException("Ordrelinje mangler.");
        }

        if (line.getProduct() == null || line.getProduct().getProductId() == null) {
            throw new IllegalArgumentException("Produkt mangler på ordrelinjen.");
        }

        if (line.getQuantityGrams() == null || line.getQuantityGrams() < 1) {
            throw new IllegalArgumentException("Mængde i gram skal være mindst 1.");
        }
    }
}