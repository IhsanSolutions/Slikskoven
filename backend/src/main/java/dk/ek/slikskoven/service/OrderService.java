package dk.ek.slikskoven.service;

import dk.ek.slikskoven.model.*;
import dk.ek.slikskoven.repository.CustomerRepo;
import dk.ek.slikskoven.repository.OrderRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final CustomerRepo customerRepo;

    public OrderService(OrderRepo orderRepo, CustomerRepo customerRepo) {
        this.orderRepo = orderRepo;
        this.customerRepo = customerRepo;
    }

    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order createOrder(Order order) {
        boolean hasComment = order.getComment() != null && !order.getComment().isBlank();
        boolean hasOrderLines = order.getOrderLines() != null && !order.getOrderLines().isEmpty();

        if (!hasComment && !hasOrderLines) {
            throw new IllegalArgumentException("Bestillingen skal have mindst én ordrelinje eller en kommentar");
        }

        customerRepo.save(order.getCustomer());

        order.setStatus(OrderStatus.MODTAGET);
        order.setCreatedAt(LocalDateTime.now());

        if (hasOrderLines) {
            double total = 0;
            for (OrderLine line : order.getOrderLines()) {
                double linePrice = (line.getQuantityGrams() / 100.0) * line.getProduct().getPrice();
                line.setLinePrice(linePrice);
                line.setOrder(order);
                total += linePrice;
            }
            order.setTotalPrice(total);
        }

        return orderRepo.save(order);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        orderRepo.delete(order);
    }

    public Order updateStatus(Long id, OrderStatus status) {
        Order order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepo.save(order);
    }
}