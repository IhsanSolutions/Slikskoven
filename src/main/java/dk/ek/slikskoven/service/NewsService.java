package dk.ek.slikskoven.service;

import dk.ek.slikskoven.model.News;
import dk.ek.slikskoven.repository.NewsRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsService {

    private final NewsRepo newsRepo;

    public NewsService(NewsRepo newsRepo) {
        this.newsRepo = newsRepo;
    }

    public List<News> getAllNews() {
        return newsRepo.findAll();
    }

    public News getNewsById(Long id) {
        return newsRepo.findById(id).orElseThrow(() -> new RuntimeException("News not found"));
    }

    public News createNews(News news) {
        news.setPublishDate(LocalDateTime.now());
        return newsRepo.save(news);
    }

    public News updateNews(Long id, News updatedNews) {
        News existingNews = newsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("News not found"));

        existingNews.setTitle(updatedNews.getTitle());
        existingNews.setContent(updatedNews.getContent());
        existingNews.setImageUrl(updatedNews.getImageUrl());

        return newsRepo.save(existingNews);
    }

    public void deleteNews(Long id) {
        newsRepo.deleteById(id);
    }
}
