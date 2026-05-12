package dk.ek.slikskoven.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long newsId;

    private Long adminId;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime publishDate;

    private String imageUrl;
}
