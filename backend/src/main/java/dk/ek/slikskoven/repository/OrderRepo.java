package dk.ek.slikskoven.repository;

import dk.ek.slikskoven.model.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepo extends JpaRepository<Order, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "customer",
            "orderLines",
            "orderLines.product"
    })
    List<Order> findAll();

    @Override
    @EntityGraph(attributePaths = {
            "customer",
            "orderLines",
            "orderLines.product"
    })
    Optional<Order> findById(Long id);
}