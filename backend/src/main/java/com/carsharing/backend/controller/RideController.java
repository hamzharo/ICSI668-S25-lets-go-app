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

    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> searchRides() {
        return ResponseEntity.ok("Search results: matching rides.");
    }

    @PostMapping("/request/{rideId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> requestRide(@PathVariable String rideId) {
        return ResponseEntity.ok("Requested to join ride: " + rideId);
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('USER', 'DRIVER')")
    public ResponseEntity<String> rideHistory() {
        return ResponseEntity.ok("Your ride history (both as rider or driver).");
    }
}
