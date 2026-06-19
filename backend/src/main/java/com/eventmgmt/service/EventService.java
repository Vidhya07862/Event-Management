package com.eventmgmt.service;

import com.eventmgmt.dto.EventRequest;
import com.eventmgmt.model.Event;
import com.eventmgmt.model.Role;
import com.eventmgmt.model.User;
import com.eventmgmt.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional
    public Event createEvent(EventRequest request, User organizer) {
        // If organizer is ADMIN, auto approve. Otherwise, requires approval.
        boolean autoApprove = organizer.getRole() == Role.ROLE_ADMIN;
        
        Event event = new Event(
                null,
                request.title(),
                request.description(),
                request.location(),
                request.date(),
                request.price(),
                request.imageUrl(),
                organizer,
                autoApprove
        );
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long eventId, EventRequest request, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        // Only the organizer who created it or an Admin can modify it
        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("You are not authorized to update this event");
        }

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setLocation(request.location());
        event.setDate(request.date());
        event.setPrice(request.price());
        event.setImageUrl(request.imageUrl());
        
        // When updated by an organizer, it might need to re-verify? 
        // For simplicity, we keep its approval status or reset it to false if edited by a non-admin.
        if (user.getRole() != Role.ROLE_ADMIN) {
            event.setApproved(false);
        }

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long eventId, User user) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        if (!event.getOrganizer().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new IllegalStateException("You are not authorized to delete this event");
        }

        eventRepository.delete(event);
    }

    @Transactional
    public Event approveEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        event.setApproved(true);
        return eventRepository.save(event);
    }

    public List<Event> getApprovedEvents() {
        return eventRepository.findByApprovedTrue();
    }

    public List<Event> getUnapprovedEvents() {
        return eventRepository.findByApprovedFalse();
    }

    public List<Event> getOrganizerEvents(Long organizerId) {
        return eventRepository.findByOrganizerId(organizerId);
    }

    public Event getEventById(Long eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + eventId));
    }

    public List<Event> searchEvents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getApprovedEvents();
        }
        return eventRepository.searchApprovedEvents(query);
    }
}
