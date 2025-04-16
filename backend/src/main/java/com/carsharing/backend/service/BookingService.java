package com.carsharing.backend.service;

import java.time.LocalDateTime;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Important here

import com.carsharing.backend.dto.BookingRequestDTO;
import com.carsharing.backend.exception.BookingException; // Create this custom exception
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.Booking;
import com.carsharing.backend.model.Ride;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
@Data
@Setter
@Getter
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional // Use transaction to ensure Ride update and Booking creation succeed or fail together
    public Booking requestBooking(String rideId, BookingRequestDTO bookingRequestDTO, String passengerEmail) {

        // 1. Find Passenger
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Passenger not found with email: " + passengerEmail));

        // 2. Find Ride
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));

        // 3. --- Validation ---
        // Check if passenger is trying to book their own ride
        if (Objects.equals(ride.getDriverId(), passenger.getId())) {
            throw new BookingException("Driver cannot book their own ride.");
        }
        // Check if ride is still scheduled
        if (!"SCHEDULED".equalsIgnoreCase(ride.getStatus())) { // Use Enum later
             throw new BookingException("Cannot book ride, status is not SCHEDULED (Status: " + ride.getStatus() + ")");
        }
         // Check if ride departure time is in the past
        if (ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new BookingException("Cannot book ride, departure time is in the past.");
        }
        // Check requested seats
        int requested = bookingRequestDTO.getRequestedSeats();
        if (requested <= 0) {
             throw new BookingException("Requested seats must be positive.");
        }
        // Check available seats
        if (ride.getAvailableSeats() < requested) {
            throw new BookingException(String.format(
                    "Not enough available seats. Requested: %d, Available: %d",
                    requested, ride.getAvailableSeats()));
        }
        // Check if passenger already booked this ride (prevent double booking)
        // TODO: Add a check here later if needed

        // 4. Update Ride: Decrement available seats
        ride.setAvailableSeats(ride.getAvailableSeats() - requested);
        // ride.setUpdatedAt(LocalDateTime.now()); // Let Auditing handle
        Ride updatedRide = rideRepository.save(ride); // Save the updated ride first

        // 5. Create Booking
        Booking newBooking = new Booking();
        newBooking.setRideId(rideId);
        newBooking.setPassengerId(passenger.getId());
        newBooking.setDriverId(ride.getDriverId()); // Store driver ID for convenience
        newBooking.setRequestedSeats(requested);
        newBooking.setStatus("REQUESTED"); // Initial status, Use Enum later
        // newBooking.setCreatedAt(LocalDateTime.now()); // Let Auditing handle
        // newBooking.setUpdatedAt(LocalDateTime.now()); // Let Auditing handle

        Booking savedBooking = bookingRepository.save(newBooking);

        log.info("Booking request successful for ride ID: {} by passenger: {}. Booking ID: {}",
                rideId, passengerEmail, savedBooking.getId());

        // TODO: Send notification to Driver later

        return savedBooking;
    }

    // --- Other Booking methods (confirm, reject, cancel) will go here later ---
}