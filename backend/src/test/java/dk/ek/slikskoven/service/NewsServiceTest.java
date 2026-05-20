package dk.ek.slikskoven.service;

import dk.ek.slikskoven.model.News;
import dk.ek.slikskoven.repository.NewsRepo;
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
public class NewsServiceTest {

    @Mock
    private NewsRepo newsRepo;

    @InjectMocks
    private NewsService newsService;

    private News testNews;
    private News testNews2;

    @BeforeEach
    void setUp() {
        testNews = new News();
        testNews.setNewsId(1L);
        testNews.setTitle("Ny sommer menu");
        testNews.setContent("Vi har fået nye is på menuen til sommeren!");
        testNews.setPublishDate(LocalDateTime.now());
        testNews.setImageUrl("https://example.com/sommer.jpg");

        testNews2 = new News();
        testNews2.setNewsId(2L);
        testNews2.setTitle("Lukket mandag");
        testNews2.setContent("Vi holder lukket mandag d. 1. maj.");
        testNews2.setPublishDate(LocalDateTime.now());
    }

    @Test
    void testGetAllNews() {
        // Arrange
        List<News> newsList = new ArrayList<>();
        newsList.add(testNews);
        newsList.add(testNews2);
        when(newsRepo.findAll()).thenReturn(newsList);

        // Act
        List<News> result = newsService.getAllNews();

        // Assert
        assertEquals(2, result.size());
        assertEquals("Ny sommer menu", result.get(0).getTitle());
        assertEquals("Lukket mandag", result.get(1).getTitle());
        verify(newsRepo, times(1)).findAll();
    }

    @Test
    void testGetAllNews_Empty() {
        // Arrange
        when(newsRepo.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<News> result = newsService.getAllNews();

        // Assert
        assertTrue(result.isEmpty());
        verify(newsRepo, times(1)).findAll();
    }

    @Test
    void testGetNewsById_Success() {
        // Arrange
        when(newsRepo.findById(1L)).thenReturn(Optional.of(testNews));

        // Act
        News result = newsService.getNewsById(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getNewsId());
        assertEquals("Ny sommer menu", result.getTitle());
        verify(newsRepo, times(1)).findById(1L);
    }

    @Test
    void testGetNewsById_NotFound() {
        // Arrange
        when(newsRepo.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> newsService.getNewsById(999L));
        verify(newsRepo, times(1)).findById(999L);
    }

    @Test
    void testCreateNews() {
        // Arrange
        News newNews = new News();
        newNews.setTitle("Efterårsmenu er klar");
        newNews.setContent("Kom og smag vores nye efterårsprodukter!");
        newNews.setPublishDate(LocalDateTime.now());

        when(newsRepo.save(any(News.class))).thenReturn(testNews);

        // Act
        News result = newsService.createNews(newNews);

        // Assert
        assertNotNull(result);
        assertEquals("Ny sommer menu", result.getTitle());
        verify(newsRepo, times(1)).save(any(News.class));
    }

    @Test
    void testDeleteNews() {
        // Arrange
        doNothing().when(newsRepo).deleteById(1L);

        // Act
        newsService.deleteNews(1L);

        // Assert
        verify(newsRepo, times(1)).deleteById(1L);
    }
}
