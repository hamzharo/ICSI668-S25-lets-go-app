package com.carsharing.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    // Search for rides - Accessible by both Passengers and Drivers
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('PASSENGER', 'DRIVER')")
    public ResponseEntity<String> searchRides() {
        // TODO: Implement actual search logic using RideRepository and query parameters
        return ResponseEntity.ok("Search results: matching rides (placeholder).");
    }

    // Request to join a specific ride - Only Passengers can request
    @PostMapping("/request/{rideId}")
    @PreAuthorize("hasRole('PASSENGER')")
    public ResponseEntity<String> requestRide(@PathVariable String rideId) {
        // TODO: Implement booking request logic (create Booking object)
        return ResponseEntity.ok("Requested to join ride: " + rideId + " (placeholder).");
    }

    // View ride history - Relevant for both Passengers and Drivers
    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('PASSENGER', 'DRIVER')")
    public ResponseEntity<String> rideHistory() {
        // TODO: Implement logic to fetch ride history based on authenticated user's ID
        return ResponseEntity.ok("Your ride history (both as rider or driver) (placeholder).");
    }
}