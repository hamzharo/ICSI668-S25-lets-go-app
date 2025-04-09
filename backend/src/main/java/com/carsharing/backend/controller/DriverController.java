package com.carsharing.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')") // restrict all methods to DRIVER role
public class DriverController {

    @GetMapping("/my-rides")
    public ResponseEntity<String> getMyRides() {
        return ResponseEntity.ok("List of rides offered by this driver.");
    }

    @PostMapping("/offer-ride")
    public ResponseEntity<String> createRide() {
        return ResponseEntity.ok("Ride successfully created.");
    }

    @PutMapping("/update-ride/{id}")
    public ResponseEntity<String> updateRide(@PathVariable String id) {
        return ResponseEntity.ok("Ride with ID " + id + " updated.");
    }

    @DeleteMapping("/delete-ride/{id}")
    public ResponseEntity<String> deleteRide(@PathVariable String id) {
        return ResponseEntity.ok("Ride with ID " + id + " deleted.");
    }

    @GetMapping("/ride-requests")
    public ResponseEntity<String> viewRequests() {
        return ResponseEntity.ok("List of ride requests to accept/deny.");
    }
}
