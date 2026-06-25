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

    private static final List<String> UNSAFE_KEYWORDS = List.of(
        // Sexual, suggestive, posing, and revealing content
        "nude", "naked", "porn", "sexy", "erotic", "sexual", "nsfw", "hentai", "underwear", "bikini",
        "sensual", "vulgar", "xxx", "adult", "lingerie", "swimsuit", "swimwear", "cleavage", "bra",
        "panties", "model", "posing", "pose", "skin", "bare", "undressed", "sensuous", "flirting",
        "seductive", "alluring", "legs", "breast", "chest", "butt", "belly", "torso", "body",
        "hot girl", "hot woman", "sexy girl", "sexy woman", "sensual dance", "clubbing", "clubber",
        "nightclub", "rave", "provocative", "romantic", "intimate",

        // Human, gender, and people filters to strictly prevent photos of revealing models
        "girl", "girls", "woman", "women", "lady", "ladies", "female", "females",
        "man", "men", "male", "males", "boy", "boys", "guy", "guys",
        "person", "people", "human", "humans", "face", "faces", "portrait", "portraits",
        "beauty", "glamour", "fashion", "dress", "clothing", "attire",
        
        // Violent content
        "blood", "gore", "kill", "murder", "weapon", "gun", "knife", "dead", "death", "suicide",
        "violence", "violent", "shoot", "assault", "stab", "weaponry"
    );

    private boolean isUnsafe(String text) {
        if (text == null) return false;
        String lower = text.toLowerCase();
        for (String keyword : UNSAFE_KEYWORDS) {
            if (lower.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<String>> searchImages(@RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        
        // Safety check on query keywords
        if (isUnsafe(query)) {
            return ResponseEntity.ok(getDefaultImages("safe"));
        }

        try {
            String encodedQuery = URLEncoder.encode(query.trim(), StandardCharsets.UTF_8);
            // Query Openverse with mature=false to filter out mature content
            String url = "https://api.openverse.org/v1/images/?q=" + encodedQuery + "&page_size=20&mature=false";

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
                        
                        // 1. Safety check on returned image URL keywords
                        if (isUnsafe(imageUrl)) {
                            continue;
                        }

                        // 2. Safety check on returned image title
                        JsonNode titleNode = node.get("title");
                        if (titleNode != null && isUnsafe(titleNode.asText())) {
                            continue;
                        }

                        // 3. Safety check on returned image tags
                        JsonNode tagsNode = node.get("tags");
                        boolean hasUnsafeTag = false;
                        if (tagsNode != null && tagsNode.isArray()) {
                            for (JsonNode tag : tagsNode) {
                                JsonNode tagNameNode = tag.get("name");
                                if (tagNameNode != null && isUnsafe(tagNameNode.asText())) {
                                    hasUnsafeTag = true;
                                    break;
                                }
                            }
                        }
                        if (hasUnsafeTag) {
                            continue;
                        }

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
