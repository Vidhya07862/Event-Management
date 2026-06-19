package com.eventmgmt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageSearchController {

    private final HttpClient httpClient = HttpClient.newBuilder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<String>> searchImages(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        try {
            String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            String url = "https://api.openverse.org/v1/images/?q=" + encodedQuery + "&page_size=30";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "EventManagementSystem/1.0 (contact: admin@eventmgmt.com)")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return ResponseEntity.ok(getDefaultImages(query));
            }

            String body = response.body();
            List<String> imageUrls = new ArrayList<>();
            JsonNode rootNode = objectMapper.readTree(body);
            JsonNode resultsNode = rootNode.get("results");
            
            if (resultsNode != null && resultsNode.isArray()) {
                for (JsonNode node : resultsNode) {
                    JsonNode urlNode = node.get("url");
                    if (urlNode != null) {
                        String imageUrl = urlNode.asText();
                        // Filter for common image extensions or clean flickr/unsplash static image patterns
                        String lowerUrl = imageUrl.toLowerCase();
                        if (lowerUrl.matches(".*\\.(jpg|jpeg|png|webp|gif).*") || imageUrl.contains("staticflickr.com") || imageUrl.contains("unsplash.com")) {
                            imageUrls.add(imageUrl);
                        }
                    }
                }
            }

            if (imageUrls.isEmpty()) {
                return ResponseEntity.ok(getDefaultImages(query));
            }
            return ResponseEntity.ok(imageUrls);

        } catch (Exception e) {
            return ResponseEntity.ok(getDefaultImages(query));
        }
    }

    private List<String> getDefaultImages(String query) {
        return List.of(
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80"
        );
    }
}
