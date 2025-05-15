// package com.carsharing.backend.service;

// import com.carsharing.backend.dto.BookingDTO; // Assuming you might want to return DTOs
// import com.carsharing.backend.dto.BookingRequestDTO;
// import com.carsharing.backend.exception.BookingException;
// import com.carsharing.backend.exception.ResourceNotFoundException;
// import com.carsharing.backend.exception.UnauthorizedOperationException; // For consistency
// import com.carsharing.backend.model.*; // User, Ride, Booking, RideStatus, BookingStatus
// import com.carsharing.backend.repository.BookingRepository;
// import com.carsharing.backend.repository.RideRepository;
// import com.carsharing.backend.repository.UserRepository;
// // import com.carsharing.backend.util.AuthenticationUtil; // If used for passenger identity

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;
// // import org.springframework.security.access.AccessDeniedException; // Replaced with UnauthorizedOperationException for consistency

// import java.time.LocalDateTime;
// import java.util.Collections;
// import java.util.List;
// import java.util.Objects;
// import java.util.Set;
// import java.util.stream.Collectors;

// @Service
// public class BookingService {

//     private static final Logger log = LoggerFactory.getLogger(BookingService.class);

//     // Define states from which a passenger can cancel
//     public static final Set<BookingStatus> CANCELLABLE_STATES_BY_PASSENGER = Set.of(
//             BookingStatus.REQUESTED, BookingStatus.CONFIRMED
//     );
//     // Define states considered 'active' or 'pending' for ride cancellation impact
//     public static final Set<BookingStatus> ACTIVE_BOOKING_STATES = Set.of(
//             BookingStatus.REQUESTED, BookingStatus.CONFIRMED
//     );

//     private final BookingRepository bookingRepository;
//     private final RideRepository rideRepository;
//     private final UserRepository userRepository;
//     private final NotificationService notificationService;
//     // private final AuthenticationUtil authenticationUtil; // If needed for current passenger

//     @Autowired
//     public BookingService(BookingRepository bookingRepository,
//                           RideRepository rideRepository,
//                           UserRepository userRepository,
//                           NotificationService notificationService
//                           ) {
//         this.bookingRepository = bookingRepository;
//         this.rideRepository = rideRepository;
//         this.userRepository = userRepository;
//         this.notificationService = notificationService;
//     }

//     @Transactional
//         public BookingDTO requestBooking(String rideId, BookingRequestDTO bookingRequestDTO, String passengerEmail) {
//         User passenger = findUserByEmail(passengerEmail);
//         Ride ride = findRideById(rideId);

//         if (Objects.equals(ride.getDriverId(), passenger.getId())) {
//             throw new BookingException("Driver cannot book their own ride.");
//         }
//         if (ride.getStatus() != RideStatus.SCHEDULED) {
//             throw new BookingException("Cannot book ride, status is not SCHEDULED (Status: " + ride.getStatus() + ")");
//         }
//         if (ride.getDepartureTime().isBefore(LocalDateTime.now())) {
//             throw new BookingException("Cannot book ride, departure time is in the past.");
//         }
//         int requestedSeats = bookingRequestDTO.getRequestedSeats();
//         if (requestedSeats <= 0) {
//             throw new BookingException("Requested seats must be positive.");
//         }
//         if (ride.getAvailableSeats() < requestedSeats) {
//             throw new BookingException(String.format(
//                     "Not enough available seats. Requested: %d, Available: %d",
//                     requestedSeats, ride.getAvailableSeats()));
//         }
//         // Prevent double booking by the same passenger for the same ride if not cancelled
//         // if (bookingRepository.existsByRideIdAndPassengerIdAndStatusIn(rideId, passenger.getId(),
//         //         List.of(BookingStatus.REQUESTED, BookingStatus.CONFIRMED))) {
//         //     throw new BookingException("You have already requested or confirmed a booking for this ride.");

//         if (bookingRepository.existsByRideIdAndPassengerIdAndStatusIn(rideId, passenger.getId(),
//         Set.of(BookingStatus.REQUESTED, BookingStatus.CONFIRMED))) { // Use Set.of()
//          throw new BookingException("You have already requested or confirmed a booking for this ride.");
//         }
        


//         ride.setAvailableSeats(ride.getAvailableSeats() - requestedSeats);
//         rideRepository.save(ride);

//         Booking newBooking = new Booking();
//         newBooking.setRideId(rideId);
//         newBooking.setPassengerId(passenger.getId());
//         newBooking.setDriverId(ride.getDriverId());
//         newBooking.setRequestedSeats(requestedSeats);
//         newBooking.setStatus(BookingStatus.REQUESTED); // Use Enum
//         // Let Auditing handle createdAt/updatedAt if configured, otherwise:
//         // newBooking.setCreatedAt(LocalDateTime.now());
//         // newBooking.setUpdatedAt(LocalDateTime.now());


//         Booking savedBooking = bookingRepository.save(newBooking);
//         log.info("Booking request successful for ride ID: {} by passenger: {}. Booking ID: {}",
//                 rideId, passengerEmail, savedBooking.getId());

//         // Send notification to Driver about new booking request
//         User driver = userRepository.findById(ride.getDriverId())
//                 .orElseThrow(() -> new ResourceNotFoundException("Driver for ride not found")); // Should not happen
//                 notificationService.sendBookingRequestNotification(driver.getEmail(), savedBooking.getId(), passenger.getName(), ride.getDepartureCity(), ride.getDestinationCity());

//         return convertToDto(savedBooking);
// }

//     @Transactional
//     public BookingDTO confirmBooking(String bookingId, String driverEmail) {
//         log.info("Driver '{}' attempting to confirm booking ID: {}", driverEmail, bookingId);
//         User driver = findUserByEmail(driverEmail);
//         Booking booking = findBookingById(bookingId);

//         validateDriverOwnership(booking, driver); // Checks if booking.getDriverId() matches driver.getId()
//         validateBookingStatus(booking, BookingStatus.REQUESTED, "confirm");

//         booking.setStatus(BookingStatus.CONFIRMED); // Use Enum
//         // booking.setConfirmationTime(LocalDateTime.now()); // If you have this field
//         // Let Auditing handle updatedAt

//         Booking updatedBooking = bookingRepository.save(booking);
//         log.info("Booking ID: {} confirmed successfully by driver '{}'", bookingId, driverEmail);

//         notificationService.sendBookingUpdateNotification(
//                 booking.getPassengerId(), // Assuming this is the user's principal (e.g., email or ID)
//                 updatedBooking.getId(),
//                 updatedBooking.getStatus(),
//                 "Your booking for ride " + updatedBooking.getRideId() + " has been confirmed by the driver."
//         );
//         return convertToDto(updatedBooking);
//     }

//     @Transactional
//     public BookingDTO rejectBooking(String bookingId, String driverEmail) {
//         log.info("Driver '{}' attempting to reject booking ID: {}", driverEmail, bookingId);
//         User driver = findUserByEmail(driverEmail);
//         Booking booking = findBookingById(bookingId);

//         validateDriverOwnership(booking, driver);
//         validateBookingStatus(booking, BookingStatus.REQUESTED, "reject");

//         booking.setStatus(BookingStatus.REJECTED_BY_DRIVER); // Use Enum
//         // booking.setCancellationTime(LocalDateTime.now()); // Or rejectionTime
//         // Let Auditing handle updatedAt

//         Booking updatedBooking = bookingRepository.save(booking);
//         log.info("Booking ID: {} rejected successfully by driver '{}'", bookingId, driverEmail);

//         incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());

//         notificationService.sendBookingUpdateNotification(
//                 booking.getPassengerId(),
//                 updatedBooking.getId(),
//                 updatedBooking.getStatus(),
//                 "Your booking for ride " + updatedBooking.getRideId() + " has been rejected by the driver."
//         );
//         return convertToDto(updatedBooking);
//     }

//     @Transactional
//     public BookingDTO cancelBookingByPassenger(String bookingId, String passengerEmail) {
//         log.info("Passenger '{}' attempting to cancel booking ID: {}", passengerEmail, bookingId);
//         User passenger = findUserByEmail(passengerEmail);
//         Booking booking = findBookingById(bookingId);

//         if (!Objects.equals(booking.getPassengerId(), passenger.getId())) {
//             throw new UnauthorizedOperationException("You are not authorized to cancel this booking.");
//         }

//         if (!CANCELLABLE_STATES_BY_PASSENGER.contains(booking.getStatus())) {
//             throw new BookingException(String.format(
//                     "Cannot cancel booking. Current status is '%s'. Cancellable states are: %s.",
//                     booking.getStatus(), CANCELLABLE_STATES_BY_PASSENGER
//             ));
//         }
//         // Optional time-based validation
//         Ride ride = findRideById(booking.getRideId());
//         // Example: Cannot cancel within 2 hours of departure
//         // if (LocalDateTime.now().isAfter(ride.getDepartureTime().minusHours(2))) {
//         //     throw new BookingException("Cannot cancel booking: too close to departure time.");
//         // }


//         boolean wasConfirmed = (booking.getStatus() == BookingStatus.CONFIRMED);

//         booking.setStatus(BookingStatus.CANCELLED_BY_PASSENGER); // Use Enum
//         // booking.setCancellationTime(LocalDateTime.now());
//         // Let Auditing handle updatedAt

//         Booking updatedBooking = bookingRepository.save(booking);
//         log.info("Booking ID: {} cancelled successfully by passenger '{}'", bookingId, passengerEmail);

//         if (wasConfirmed) {
//             incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());
//         }

//         // Notify driver
//         User driver = userRepository.findById(ride.getDriverId())
//                 .orElseThrow(() -> new ResourceNotFoundException("Driver for ride not found"));
//         notificationService.sendPassengerCancellationNotification(driver.getEmail(), bookingId, passenger.getName(), ride.getDepartureCity(), ride.getDestinationCity());

//         return convertToDto(updatedBooking);
//     }

//     public List<BookingDTO> findBookingsByPassengerEmail(String passengerEmail) {
//         User passenger = findUserByEmail(passengerEmail);
//         log.info("Fetching bookings for passenger ID: {}", passenger.getId());
//         List<Booking> bookings = bookingRepository.findByPassengerId(passenger.getId());
//         return convertToDtoList(bookings);
//     }

//     // --- METHOD REQUIRED BY RideService ---
//     @Transactional
//     public void cancelBookingsForRide(String rideId, BookingStatus newStatusForBookings) {
//         log.info("Cancelling bookings for ride ID: {} with status: {}", rideId, newStatusForBookings);
//         // List<Booking> bookingsToCancel = bookingRepository.findByRideIdAndStatusIn(rideId, ACTIVE_BOOKING_STATES);
//         List<Booking> bookingsToCancel = bookingRepository.findByRideIdAndStatusIn(rideId, ACTIVE_BOOKING_STATES);

//         Ride ride = findRideById(rideId); // To restore seats if bookings were confirmed

//         for (Booking booking : bookingsToCancel) {
//             boolean wasConfirmed = (booking.getStatus() == BookingStatus.CONFIRMED);
//             booking.setStatus(newStatusForBookings);
//             // booking.setCancellationTime(LocalDateTime.now());
//             bookingRepository.save(booking);

//             if (wasConfirmed) {
//                 // This logic is slightly different: we are restoring ALL seats for the ride,
//                 // assuming the ride itself is being cancelled.
//                 // The individual seat increment logic is more for when a single booking is rejected/cancelled.
//                 // For a full ride cancellation, seatsAvailable should go back to totalSeats if no other logic applies.
//                 // However, if RideService is managing the ride's seats directly upon its own cancellation,
//                 // this might be redundant or conflict. Let's assume for now RideService handles overall seat reset,
//                 // and this method primarily updates booking statuses and notifies.
//                 // If not, we need to increment here. For now, just notify.
//                 log.info("Booking ID {} for ride {} was confirmed, now cancelled due to ride cancellation.", booking.getId(), rideId);
//             }
//             // Notify passenger
//             notificationService.sendBookingUpdateNotification(
//                     booking.getPassengerId(),
//                     booking.getId(),
//                     newStatusForBookings,
//                     "Your booking has been cancelled because the ride (ID: " + rideId + ") was cancelled by the driver."
//             );
//         }
//         // After cancelling all bookings for a ride, the ride's available seats should typically be reset to total seats
//         // This logic might be better placed in RideService.cancelRideByDriver after this call.
//         // For now, let's ensure RideService handles that seat reset.
//         log.info("Finished processing booking cancellations for ride ID: {}", rideId);
//     }

//     // --- METHOD REQUIRED BY RideService (for completing ride) ---
//     @Transactional
//     public void updateBookingsStatusForRide(String rideId, BookingStatus newStatus) {
//         log.info("Updating status of bookings for ride ID: {} to {}", rideId, newStatus);
//         // Typically, you'd update CONFIRMED bookings to COMPLETED.
//         // If REQUESTED bookings should also be updated (e.g., to EXPIRED or CANCELLED), adjust this.
//         List<Booking> bookingsToUpdate = bookingRepository.findByRideIdAndStatusIn(rideId, Set.of(BookingStatus.CONFIRMED, BookingStatus.REQUESTED));

//         for (Booking booking : bookingsToUpdate) {
//              if (booking.getStatus() == BookingStatus.CONFIRMED && newStatus == BookingStatus.COMPLETED) {
//                 booking.setStatus(BookingStatus.COMPLETED);
//                 // booking.setCompletionTime(LocalDateTime.now()); // If you track this
//                 bookingRepository.save(booking);
//                 log.info("Booking ID {} for ride {} marked as COMPLETED.", booking.getId(), rideId);
//                 // Optionally notify passenger of ride completion
//             } else if (booking.getStatus() == BookingStatus.REQUESTED && newStatus == BookingStatus.COMPLETED) {
//                 // What to do with REQUESTED bookings when a ride is COMPLETED?
//                 // Option: Mark them as EXPIRED or REJECTED_BY_SYSTEM etc.
//                 // For now, let's assume we only care about confirmed bookings for completion.
//                 log.info("Booking ID {} for ride {} was REQUESTED. Ride completed, booking not actioned further.", booking.getId(), rideId);
//             }
//         }
//     }

    
//     // --- METHOD REQUIRED BY RideService (for notifying passengers of ride update) ---
//     public void notifyPassengersOfRideUpdate(String rideId, String message) {
//         List<Booking> confirmedBookings = bookingRepository.findByRideIdAndStatusIn(
//             rideId,
//             Set.of(BookingStatus.CONFIRMED) // <-- CORRECTED: Use Set.of() instead of Collections.singletonList()
//         );

//         if (confirmedBookings.isEmpty()) {
//             log.info("No confirmed passengers to notify for ride update: {} (Ride ID)", rideId);
//             return;
//         }

//         log.info("Notifying {} confirmed passengers about update to ride: {} (Ride ID)", confirmedBookings.size(), rideId);
//         for (Booking booking : confirmedBookings) {
//             String passengerUserId = booking.getPassengerId(); // Ensure passengerId on Booking is the user's principal
//             notificationService.sendBookingUpdateNotification(
//                 passengerUserId,
//                 booking.getId(),
//                 booking.getStatus(), // Status of booking hasn't changed, but custom message indicates ride update
//                 message
//             );
//         }
//     }

//     // --- Helper Methods (refactored to use Enums) ---
//     private User findUserByEmail(String email) {
//         return userRepository.findByEmail(email)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
//     }

//     private Booking findBookingById(String bookingId) {
//         return bookingRepository.findById(bookingId)
//                 .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
//     }

//     private Ride findRideById(String rideId) { // Added this helper
//         return rideRepository.findById(rideId)
//                 .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));
//     }

//     private void validateDriverOwnership(Booking booking, User driver) {
//         if (!Objects.equals(booking.getDriverId(), driver.getId())) {
//             throw new UnauthorizedOperationException("You are not authorized to manage this booking.");
//         }
//     }

//     private void validateBookingStatus(Booking booking, BookingStatus expectedStatus, String action) {
//         if (booking.getStatus() != expectedStatus) {
//             throw new BookingException(String.format(
//                     "Cannot %s booking. Current status is '%s', expected '%s'.",
//                     action, booking.getStatus(), expectedStatus
//             ));
//         }
//     }

//     private void incrementAvailableSeats(String rideId, int seatsToIncrement) {
//         Ride ride = findRideById(rideId);
//         int newSeatCount = Math.min(ride.getTotalSeats(), ride.getAvailableSeats() + seatsToIncrement);
//         ride.setAvailableSeats(newSeatCount);
//         rideRepository.save(ride);
//         log.info("Incremented available seats for ride ID: {} by {} (New count: {})", rideId, seatsToIncrement, newSeatCount);
//     }

//     // Helper for DTO conversion (assuming BookingDTO exists)
//     private BookingDTO convertToDto(Booking booking) {
//         if (booking == null) return null;
//         BookingDTO dto = new BookingDTO();
//         dto.setId(booking.getId());
//         dto.setRideId(booking.getRideId());
//         dto.setPassengerId(booking.getPassengerId());
//         dto.setDriverId(booking.getDriverId());
//         dto.setRequestedSeats(booking.getRequestedSeats());
//         dto.setStatus(booking.getStatus());
//         dto.setBookingTime(booking.getCreatedAt());  // Or createdAt if using that name
//         dto.setConfirmationTime(booking.getConfirmationTime());
//         dto.setCancellationTime(booking.getCancellationTime());
//         // Add other fields if your BookingDTO has them
//         return dto;
//     }
    

//     private List<BookingDTO> convertToDtoList(List<Booking> bookings) {
//         if (bookings == null || bookings.isEmpty()) {
//             return Collections.emptyList();
//         }
//         return bookings.stream().map(this::convertToDto).collect(Collectors.toList());
//     }
// }

package com.carsharing.backend.service;

import com.carsharing.backend.dto.BookingDTO;
import com.carsharing.backend.dto.BookingRequestDTO;
import com.carsharing.backend.exception.BookingException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.exception.UnauthorizedOperationException;
import com.carsharing.backend.model.*; // User, Ride, Booking, RideStatus, BookingStatus
import com.carsharing.backend.repository.BookingRepository;
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
// --- ADDED IMPORTS for efficient DTO conversion ---
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;


@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    public static final Set<BookingStatus> CANCELLABLE_STATES_BY_PASSENGER = Set.of(
            BookingStatus.REQUESTED, BookingStatus.CONFIRMED
    );
    public static final Set<BookingStatus> ACTIVE_BOOKING_STATES = Set.of(
            BookingStatus.REQUESTED, BookingStatus.CONFIRMED
    );

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository; // Already here, needed for new fields
    private final UserRepository userRepository; // Already here, needed for new fields
    private final NotificationService notificationService;

    @Autowired
    public BookingService(BookingRepository bookingRepository,
                          RideRepository rideRepository,
                          UserRepository userRepository,
                          NotificationService notificationService
                          ) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingDTO requestBooking(String rideId, BookingRequestDTO bookingRequestDTO, String passengerEmail) {
        User passenger = findUserByEmail(passengerEmail);
        Ride ride = findRideById(rideId);

        if (Objects.equals(ride.getDriverId(), passenger.getId())) {
            throw new BookingException("Driver cannot book their own ride.");
        }
        if (ride.getStatus() != RideStatus.SCHEDULED) {
            throw new BookingException("Cannot book ride, status is not SCHEDULED (Status: " + ride.getStatus() + ")");
        }
        if (ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new BookingException("Cannot book ride, departure time is in the past.");
        }
        int requestedSeats = bookingRequestDTO.getRequestedSeats();
        if (requestedSeats <= 0) {
            throw new BookingException("Requested seats must be positive.");
        }
        if (ride.getAvailableSeats() < requestedSeats) {
            throw new BookingException(String.format(
                    "Not enough available seats. Requested: %d, Available: %d",
                    requestedSeats, ride.getAvailableSeats()));
        }
        if (bookingRepository.existsByRideIdAndPassengerIdAndStatusIn(rideId, passenger.getId(),
            Set.of(BookingStatus.REQUESTED, BookingStatus.CONFIRMED))) {
             throw new BookingException("You have already requested or confirmed a booking for this ride.");
        }

        ride.setAvailableSeats(ride.getAvailableSeats() - requestedSeats);
        rideRepository.save(ride);

        Booking newBooking = new Booking();
        newBooking.setRideId(rideId);
        newBooking.setPassengerId(passenger.getId());
        newBooking.setDriverId(ride.getDriverId()); // Storing driverId in booking is good
        newBooking.setRequestedSeats(requestedSeats);
        newBooking.setStatus(BookingStatus.REQUESTED);

        Booking savedBooking = bookingRepository.save(newBooking);
        log.info("Booking request successful for ride ID: {} by passenger: {}. Booking ID: {}",
                rideId, passengerEmail, savedBooking.getId());

        User driver = userRepository.findById(ride.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver for ride not found"));
        notificationService.sendBookingRequestNotification(driver.getEmail(), savedBooking.getId(), passenger.getName(), ride.getDepartureCity(), ride.getDestinationCity());

        return convertToDto(savedBooking); // DTO conversion will now include new fields
    }

    @Transactional
    public BookingDTO confirmBooking(String bookingId, String driverEmail) {
        log.info("Driver '{}' attempting to confirm booking ID: {}", driverEmail, bookingId);
        User driver = findUserByEmail(driverEmail);
        Booking booking = findBookingById(bookingId);

        validateDriverOwnership(booking, driver);
        validateBookingStatus(booking, BookingStatus.REQUESTED, "confirm");

        booking.setStatus(BookingStatus.CONFIRMED);
        if (booking.getConfirmationTime() == null) { // Only set if not already set (though typically not needed for confirm again)
             booking.setConfirmationTime(LocalDateTime.now());
        }


        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} confirmed successfully by driver '{}'", bookingId, driverEmail);

        // Assuming passengerId is the identifier to find the passenger's user details for notification
        User passenger = userRepository.findById(booking.getPassengerId())
            .orElseThrow(() -> new ResourceNotFoundException("Passenger not found for notification with ID: " + booking.getPassengerId()));

        notificationService.sendBookingUpdateNotification(
                passenger.getEmail(), // Send to passenger's email
                updatedBooking.getId(),
                updatedBooking.getStatus(),
                "Your booking for ride " + updatedBooking.getRideId() + " has been confirmed by the driver."
        );
        return convertToDto(updatedBooking); // DTO conversion will now include new fields
    }

    @Transactional
    public BookingDTO rejectBooking(String bookingId, String driverEmail) {
        log.info("Driver '{}' attempting to reject booking ID: {}", driverEmail, bookingId);
        User driver = findUserByEmail(driverEmail);
        Booking booking = findBookingById(bookingId);

        validateDriverOwnership(booking, driver);
        validateBookingStatus(booking, BookingStatus.REQUESTED, "reject");

        booking.setStatus(BookingStatus.REJECTED_BY_DRIVER);
        if (booking.getCancellationTime() == null) { // Use cancellationTime for rejections too or add rejectionTime
            booking.setCancellationTime(LocalDateTime.now());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} rejected successfully by driver '{}'", bookingId, driverEmail);

        incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());

        User passenger = userRepository.findById(booking.getPassengerId())
            .orElseThrow(() -> new ResourceNotFoundException("Passenger not found for notification with ID: " + booking.getPassengerId()));

        notificationService.sendBookingUpdateNotification(
                passenger.getEmail(),
                updatedBooking.getId(),
                updatedBooking.getStatus(),
                "Your booking for ride " + updatedBooking.getRideId() + " has been rejected by the driver."
        );
        return convertToDto(updatedBooking); // DTO conversion will now include new fields
    }

    @Transactional
    public BookingDTO cancelBookingByPassenger(String bookingId, String passengerEmail) {
        log.info("Passenger '{}' attempting to cancel booking ID: {}", passengerEmail, bookingId);
        User passenger = findUserByEmail(passengerEmail);
        Booking booking = findBookingById(bookingId);

        if (!Objects.equals(booking.getPassengerId(), passenger.getId())) {
            throw new UnauthorizedOperationException("You are not authorized to cancel this booking.");
        }

        if (!CANCELLABLE_STATES_BY_PASSENGER.contains(booking.getStatus())) {
            throw new BookingException(String.format(
                    "Cannot cancel booking. Current status is '%s'. Cancellable states are: %s.",
                    booking.getStatus(), CANCELLABLE_STATES_BY_PASSENGER
            ));
        }
        Ride ride = findRideById(booking.getRideId());

        boolean wasConfirmedOrRequested = (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.REQUESTED);

        booking.setStatus(BookingStatus.CANCELLED_BY_PASSENGER);
        if (booking.getCancellationTime() == null) {
            booking.setCancellationTime(LocalDateTime.now());
        }


        Booking updatedBooking = bookingRepository.save(booking);
        log.info("Booking ID: {} cancelled successfully by passenger '{}'", bookingId, passengerEmail);

        if (wasConfirmedOrRequested) { // Seats should be returned if it was REQUESTED (driver hasn't acted) or CONFIRMED
            incrementAvailableSeats(booking.getRideId(), booking.getRequestedSeats());
        }

        User driverUser = userRepository.findById(ride.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver for ride not found"));
        notificationService.sendPassengerCancellationNotification(driverUser.getEmail(), bookingId, passenger.getName(), ride.getDepartureCity(), ride.getDestinationCity());

        return convertToDto(updatedBooking); // DTO conversion will now include new fields
    }

    public List<BookingDTO> findBookingsByPassengerEmail(String passengerEmail) {
        User passenger = findUserByEmail(passengerEmail);
        log.info("Fetching bookings for passenger ID: {}", passenger.getId());
        List<Booking> bookings = bookingRepository.findByPassengerId(passenger.getId());
        return convertToDtoList(bookings); // DTO conversion will now include new fields
    }

    @Transactional
    public void cancelBookingsForRide(String rideId, BookingStatus newStatusForBookings) {
        log.info("Cancelling bookings for ride ID: {} with status: {}", rideId, newStatusForBookings);
        List<Booking> bookingsToCancel = bookingRepository.findByRideIdAndStatusIn(rideId, ACTIVE_BOOKING_STATES);

        // Ride ride = findRideById(rideId); // Not strictly needed here if RideService handles seat reset

        for (Booking booking : bookingsToCancel) {
            // boolean wasConfirmed = (booking.getStatus() == BookingStatus.CONFIRMED); // Not used below, can remove if not needed for specific logic
            booking.setStatus(newStatusForBookings);
            if (booking.getCancellationTime() == null) { // Set cancellation time for these bookings
                booking.setCancellationTime(LocalDateTime.now());
            }
            bookingRepository.save(booking);

            // Notify passenger
            User passenger = userRepository.findById(booking.getPassengerId())
                .orElseGet(() -> {
                    log.warn("Passenger not found for notification during ride cancellation. Booking ID: {}, Passenger ID: {}", booking.getId(), booking.getPassengerId());
                    return null; // Or a dummy user if notification service requires non-null
                });
            if (passenger != null) {
                notificationService.sendBookingUpdateNotification(
                        passenger.getEmail(),
                        booking.getId(),
                        newStatusForBookings,
                        "Your booking has been cancelled because the ride (ID: " + rideId + ") was cancelled by the driver."
                );
            }
        }
        log.info("Finished processing booking cancellations for ride ID: {}", rideId);
    }

    @Transactional
    public void updateBookingsStatusForRide(String rideId, BookingStatus newStatus) {
        log.info("Updating status of bookings for ride ID: {} to {}", rideId, newStatus);
        List<Booking> bookingsToUpdate = bookingRepository.findByRideIdAndStatusIn(rideId, Set.of(BookingStatus.CONFIRMED, BookingStatus.REQUESTED));

        for (Booking booking : bookingsToUpdate) {
             if (booking.getStatus() == BookingStatus.CONFIRMED && newStatus == BookingStatus.COMPLETED) {
                booking.setStatus(BookingStatus.COMPLETED);
                // booking.setCompletionTime(LocalDateTime.now()); // If you track this
                bookingRepository.save(booking);
                log.info("Booking ID {} for ride {} marked as COMPLETED.", booking.getId(), rideId);
            } else if (booking.getStatus() == BookingStatus.REQUESTED && newStatus == BookingStatus.COMPLETED) {
                log.info("Booking ID {} for ride {} was REQUESTED. Ride completed, booking not actioned further (could be set to EXPIRED).", booking.getId(), rideId);
                // Optionally set to EXPIRED or another terminal status
                // booking.setStatus(BookingStatus.EXPIRED);
                // bookingRepository.save(booking);
            }
        }
    }

    public void notifyPassengersOfRideUpdate(String rideId, String message) {
        List<Booking> confirmedBookings = bookingRepository.findByRideIdAndStatusIn(
            rideId,
            Set.of(BookingStatus.CONFIRMED)
        );

        if (confirmedBookings.isEmpty()) {
            log.info("No confirmed passengers to notify for ride update: {} (Ride ID)", rideId);
            return;
        }

        log.info("Notifying {} confirmed passengers about update to ride: {} (Ride ID)", confirmedBookings.size(), rideId);
        for (Booking booking : confirmedBookings) {
            User passenger = userRepository.findById(booking.getPassengerId())
                .orElseGet(() -> {
                    log.warn("Passenger not found for ride update notification. Booking ID: {}, Passenger ID: {}", booking.getId(), booking.getPassengerId());
                    return null;
                });
            if (passenger != null) {
                notificationService.sendBookingUpdateNotification(
                    passenger.getEmail(),
                    booking.getId(),
                    booking.getStatus(),
                    message
                );
            }
        }
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    private Booking findBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
    }

    private Ride findRideById(String rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with ID: " + rideId));
    }

    private void validateDriverOwnership(Booking booking, User driver) {
        if (!Objects.equals(booking.getDriverId(), driver.getId())) {
            throw new UnauthorizedOperationException("You are not authorized to manage this booking.");
        }
    }

    private void validateBookingStatus(Booking booking, BookingStatus expectedStatus, String action) {
        if (booking.getStatus() != expectedStatus) {
            throw new BookingException(String.format(
                    "Cannot %s booking. Current status is '%s', expected '%s'.",
                    action, booking.getStatus(), expectedStatus
            ));
        }
    }

    private void incrementAvailableSeats(String rideId, int seatsToIncrement) {
        Ride ride = findRideById(rideId);
        int newSeatCount = Math.min(ride.getTotalSeats(), ride.getAvailableSeats() + seatsToIncrement);
        ride.setAvailableSeats(newSeatCount);
        rideRepository.save(ride);
        log.info("Incremented available seats for ride ID: {} by {} (New count: {})", rideId, seatsToIncrement, newSeatCount);
    }

    // --- UPDATED DTO CONVERSION METHOD (SINGLE) ---
    private BookingDTO convertToDto(Booking booking) {
        if (booking == null) return null;
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setRideId(booking.getRideId());
        dto.setPassengerId(booking.getPassengerId());
        dto.setDriverId(booking.getDriverId());
        dto.setRequestedSeats(booking.getRequestedSeats());
        dto.setStatus(booking.getStatus());
        dto.setBookingTime(booking.getCreatedAt());
        dto.setConfirmationTime(booking.getConfirmationTime());
        dto.setCancellationTime(booking.getCancellationTime());

        // --- Fetch and set Ride details ---
        Ride ride = rideRepository.findById(booking.getRideId()).orElse(null);
        if (ride != null) {
            dto.setDepartureCity(ride.getDepartureCity());
            dto.setDestinationCity(ride.getDestinationCity());
            dto.setDepartureState(ride.getDepartureState());
            dto.setDestinationState(ride.getDestinationState());
        } else {
            log.warn("Ride with ID {} not found for booking ID {}. Ride details for DTO will be incomplete.", booking.getRideId(), booking.getId());
            dto.setDepartureCity("N/A"); // Default or leave null
            dto.setDestinationCity("N/A");
            dto.setDepartureState("N/A");
            dto.setDestinationState("N/A");
        }

        // --- Fetch and set Driver Name ---
        // Assuming your User model has a 'name' field (e.g., private String name;)
        User driver = userRepository.findById(booking.getDriverId()).orElse(null);
        if (driver != null) {
            dto.setDriverName(driver.getName()); // Assuming User has a getName() method
        } else {
            log.warn("Driver with ID {} not found for booking ID {}. Driver name for DTO will be incomplete.", booking.getDriverId(), booking.getId());
            dto.setDriverName("Unknown Driver"); // Default or leave null
        }
        return dto;
    }

    // --- UPDATED DTO CONVERSION METHOD (LIST) ---
    private List<BookingDTO> convertToDtoList(List<Booking> bookings) {
        if (bookings == null || bookings.isEmpty()) {
            return Collections.emptyList();
        }

        // Collect all unique ride IDs and driver IDs from the list of bookings
        Set<String> rideIds = new HashSet<>();
        Set<String> driverIds = new HashSet<>();
        for (Booking booking : bookings) {
            rideIds.add(booking.getRideId());
            driverIds.add(booking.getDriverId());
        }

        // Fetch all necessary Rides in one go
        Map<String, Ride> ridesMap = new HashMap<>();
        if (!rideIds.isEmpty()) { // Avoid querying if no ride IDs
            rideRepository.findAllById(rideIds).forEach(ride -> ridesMap.put(ride.getId(), ride));
        }


        // Fetch all necessary Users (drivers) in one go
        Map<String, User> driversMap = new HashMap<>();
        if(!driverIds.isEmpty()){ // Avoid querying if no driver IDs
             userRepository.findAllById(driverIds).forEach(user -> driversMap.put(user.getId(), user));
        }


        // Now, iterate through each booking and populate its DTO using the pre-fetched maps
        return bookings.stream().map(booking -> {
            BookingDTO dto = new BookingDTO();
            dto.setId(booking.getId());
            dto.setRideId(booking.getRideId());
            dto.setPassengerId(booking.getPassengerId());
            dto.setDriverId(booking.getDriverId());
            dto.setRequestedSeats(booking.getRequestedSeats());
            dto.setStatus(booking.getStatus());
            dto.setBookingTime(booking.getCreatedAt());
            dto.setConfirmationTime(booking.getConfirmationTime());
            dto.setCancellationTime(booking.getCancellationTime());

            Ride ride = ridesMap.get(booking.getRideId());
            if (ride != null) {
                dto.setDepartureCity(ride.getDepartureCity());
                dto.setDestinationCity(ride.getDestinationCity());
                dto.setDepartureState(ride.getDepartureState());
                dto.setDestinationState(ride.getDestinationState());
            } else {
                log.warn("Ride with ID {} not found for booking ID {}. Ride details for DTO list item will be incomplete.", booking.getRideId(), booking.getId());
                dto.setDepartureCity("N/A");
                dto.setDestinationCity("N/A");
                dto.setDepartureState("N/A");
                dto.setDestinationState("N/A");
            }

            User driver = driversMap.get(booking.getDriverId());
            if (driver != null) {
                dto.setDriverName(driver.getName()); // Assuming User has getName()
            } else {
                log.warn("Driver with ID {} not found for booking ID {}. Driver name for DTO list item will be incomplete.", booking.getDriverId(), booking.getId());
                dto.setDriverName("Unknown Driver");
            }
            return dto;
        }).collect(Collectors.toList());
    }
}