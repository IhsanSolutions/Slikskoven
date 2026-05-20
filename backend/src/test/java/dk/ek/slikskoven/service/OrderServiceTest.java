package dk.ek.slikskoven.service;

import dk.ek.slikskoven.model.*;
import dk.ek.slikskoven.repository.CustomerRepo;
import dk.ek.slikskoven.repository.OrderRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepo orderRepo;

    @Mock
    private CustomerRepo customerRepo;

    @InjectMocks
    private OrderService orderService;

    private Order testOrder;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setCustomerId(1L);
        testCustomer.setName("Anders Jensen");
        testCustomer.setPhone("12345678");

        testOrder = new Order();
        testOrder.setOrderId(1L);
        testOrder.setCustomer(testCustomer);
        testOrder.setStatus(OrderStatus.MODTAGET);
        testOrder.setOrderMethod(OrderMethod.MANUAL);
        testOrder.setTotalPrice(50.0);
        testOrder.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllOrders() {
        List<Order> orders = new ArrayList<>();
        orders.add(testOrder);
        when(orderRepo.findAll()).thenReturn(orders);

        List<Order> result = orderService.getAllOrders();

        assertEquals(1, result.size());
        assertEquals("Anders Jensen", result.get(0).getCustomer().getName());
        verify(orderRepo, times(1)).findAll();
    }

    @Test
    void testGetOrderById_Success() {
        when(orderRepo.findById(1L)).thenReturn(Optional.of(testOrder));

        Order result = orderService.getOrderById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getOrderId());
        verify(orderRepo, times(1)).findById(1L);
    }

    @Test
    void testGetOrderById_NotFound() {
        when(orderRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.getOrderById(999L));
        verify(orderRepo, times(1)).findById(999L);
    }

    @Test
    void testCreateOrder_Manual() {
        Product product = new Product();
        product.setProductId(1L);
        product.setPrice(10.0);

        OrderLine orderLine = new OrderLine();
        orderLine.setProduct(product);
        orderLine.setQuantityGrams(200);

        Order newOrder = new Order();
        newOrder.setCustomer(testCustomer);
        newOrder.setOrderMethod(OrderMethod.MANUAL);
        newOrder.setOrderLines(List.of(orderLine));

        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);
        when(orderRepo.save(any(Order.class))).thenReturn(testOrder);

        Order result = orderService.createOrder(newOrder);

        assertNotNull(result);
        assertEquals(OrderStatus.MODTAGET, newOrder.getStatus());
        assertNotNull(newOrder.getCreatedAt());
        assertEquals(20.0, orderLine.getLinePrice());
        verify(customerRepo, times(1)).save(any(Customer.class));
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    @Test
    void testCreateOrder_Comment() {
        Order commentOrder = new Order();
        commentOrder.setCustomer(testCustomer);
        commentOrder.setOrderMethod(OrderMethod.COMMENT);
        commentOrder.setComment("Lidt surt og chokolade ca. 300g");
        commentOrder.setTotalPrice(30.0);

        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);
        when(orderRepo.save(any(Order.class))).thenReturn(commentOrder);

        Order result = orderService.createOrder(commentOrder);

        assertNotNull(result);
        assertEquals(OrderStatus.MODTAGET, commentOrder.getStatus());
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    @Test
    void testCreateOrder_CorrectPriceCalculation() {
        Product product1 = new Product();
        product1.setPrice(10.0);

        Product product2 = new Product();
        product2.setPrice(20.0);

        OrderLine line1 = new OrderLine();
        line1.setProduct(product1);
        line1.setQuantityGrams(200);

        OrderLine line2 = new OrderLine();
        line2.setProduct(product2);
        line2.setQuantityGrams(150);

        Order order = new Order();
        order.setCustomer(testCustomer);
        order.setOrderMethod(OrderMethod.MANUAL);
        order.setOrderLines(List.of(line1, line2));

        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);
        when(orderRepo.save(any(Order.class))).thenReturn(order);

        orderService.createOrder(order);

        assertEquals(20.0, line1.getLinePrice());
        assertEquals(30.0, line2.getLinePrice());
        assertEquals(50.0, order.getTotalPrice());
    }

    @Test
    void testCreateOrder_EmptyOrderLines_GivesZeroTotal() {
        Order order = new Order();
        order.setCustomer(testCustomer);
        order.setOrderMethod(OrderMethod.COMMENT);
        order.setComment("Test kommentar");
        order.setOrderLines(new ArrayList<>());

        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);
        when(orderRepo.save(any(Order.class))).thenReturn(order);

        orderService.createOrder(order);

        assertNull(order.getTotalPrice());
    }

    @Test
    void testCreateOrder_NoCommentAndNoOrderLines_ThrowsException() {
        Order order = new Order();
        order.setCustomer(testCustomer);
        order.setOrderMethod(OrderMethod.MANUAL);
        order.setOrderLines(null);
        order.setComment(null);

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(order));
        verify(orderRepo, never()).save(any(Order.class));
    }

    @Test
    void testCreateOrder_EmptyCommentAndEmptyOrderLines_ThrowsException() {
        Order order = new Order();
        order.setCustomer(testCustomer);
        order.setOrderMethod(OrderMethod.MANUAL);
        order.setOrderLines(new ArrayList<>());
        order.setComment("   ");

        assertThrows(IllegalArgumentException.class, () -> orderService.createOrder(order));
        verify(orderRepo, never()).save(any(Order.class));
    }

    @Test
    void testCreateOrder_WithCommentOnly_Success() {
        Order order = new Order();
        order.setCustomer(testCustomer);
        order.setOrderMethod(OrderMethod.COMMENT);
        order.setComment("Lidt surt og chokolade");
        order.setOrderLines(null);

        when(customerRepo.save(any(Customer.class))).thenReturn(testCustomer);
        when(orderRepo.save(any(Order.class))).thenReturn(order);

        Order result = orderService.createOrder(order);

        assertNotNull(result);
        assertEquals(OrderStatus.MODTAGET, order.getStatus());
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    @Test
    void testUpdateStatus() {
        when(orderRepo.findById(1L)).thenReturn(Optional.of(testOrder));
        when(orderRepo.save(any(Order.class))).thenReturn(testOrder);

        Order result = orderService.updateStatus(1L, OrderStatus.KLAR);

        assertNotNull(result);
        assertEquals(OrderStatus.KLAR, testOrder.getStatus());
        verify(orderRepo, times(1)).findById(1L);
        verify(orderRepo, times(1)).save(any(Order.class));
    }

    @Test
    void testUpdateStatus_NotFound() {
        when(orderRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> orderService.updateStatus(999L, OrderStatus.KLAR));
        verify(orderRepo, times(1)).findById(999L);
    }
}