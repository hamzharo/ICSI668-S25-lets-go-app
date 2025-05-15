package com.carsharing.backend.service;

import com.carsharing.backend.dto.RideCreationDTO;
import com.carsharing.backend.dto.RideDTO;
import com.carsharing.backend.dto.RideUpdateDTO;
import com.carsharing.backend.exception.IllegalRideStateException;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.exception.UnauthorizedOperationException;
import com.carsharing.backend.model.*; // Assuming User, Ride, RideStatus, BookingStatus are here
import com.carsharing.backend.repository.BookingRepository; // If used directly, or via BookingService
import com.carsharing.backend.repository.RideRepository;
import com.carsharing.backend.repository.UserRepository;
import com.carsharing.backend.util.AuthenticationUtil; // Assuming this utility class exists
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RideService {

    private static final Logger log = LoggerFactory.getLogger(RideService.class);

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService; // For cascading cancellations and passenger notifications
    private final NotificationService notificationService; // For ride status updates
    // private final AuthenticationUtil authenticationUtil; // For getting current user

    @Autowired
    public RideService(RideRepository rideRepository,
                       UserRepository userRepository,
                       BookingService bookingService,
                       NotificationService notificationService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
    }

    @Transactional
    public RideDTO createRide(RideCreationDTO rideCreationDTO, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User (driver) not found with email: " + driverEmail));

        if (rideCreationDTO.getTotalSeats() <= 0) {
            throw new IllegalArgumentException("Total seats must be positive.");
        }
        if (rideCreationDTO.getFarePerSeat() < 0) {
            throw new IllegalArgumentException("Fare per seat cannot be negative.");
        }
        if (rideCreationDTO.getDepartureTime() == null || rideCreationDTO.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Departure time must be set and be in the future.");
        }

        Ride newRide = new Ride();
        newRide.setDriverId(driver.getId());
        newRide.setDepartureCity(rideCreationDTO.getDepartureCity());
        newRide.setDestinationCity(rideCreationDTO.getDestinationCity());
        newRide.setDepartureState(rideCreationDTO.getDepartureState());
        newRide.setDestinationState(rideCreationDTO.getDestinationState());
        newRide.setDepartureAddress(rideCreationDTO.getDepartureAddress());
        newRide.setDestinationAddress(rideCreationDTO.getDestinationAddress());
        newRide.setDepartureTime(rideCreationDTO.getDepartureTime());
        // Estimated arrival time if provided in DTO
        if (rideCreationDTO.getEstimatedArrivalTime() != null) {
            newRide.setEstimatedArrivalTime(rideCreationDTO.getEstimatedArrivalTime());
        }
        newRide.setTotalSeats(rideCreationDTO.getTotalSeats());
        newRide.setAvailableSeats(rideCreationDTO.getTotalSeats());
        newRide.setFarePerSeat(rideCreationDTO.getFarePerSeat());
        newRide.setIntermediateStops(rideCreationDTO.getIntermediateStops() != null ? rideCreationDTO.getIntermediateStops() : Collections.emptyList());
        newRide.setLuggagePreference(rideCreationDTO.getLuggagePreference());
        newRide.setSmokingAllowed(rideCreationDTO.isSmokingAllowed());
        newRide.setPetsAllowed(rideCreationDTO.isPetsAllowed());
        newRide.setRideNotes(rideCreationDTO.getRideNotes());
        newRide.setStatus(RideStatus.SCHEDULED);

        Ride savedRide = rideRepository.save(newRide);
        log.info("Ride created successfully with ID: {} by driver: {}", savedRide.getId(), driverEmail);
        // Assuming Auditing will handle createdAt/updatedAt, if not, set them here
        // newRide.setCreatedAt(LocalDateTime.now());
        // newRide.setUpdatedAt(LocalDateTime.now());
        return convertToDto(savedRide);
    }

    public RideDTO getRideDetailsById(String rideId) {
        Optional<Ride> results = rideRepository.findById(rideId);
        return results.map(this::convertToDto).orElse(null);
    }

    public List<RideDTO> searchRides(String departureCity, String destinationCity, String departureState, String destinationState, LocalDateTime earliestDepartureTime) {
        LocalDateTime searchTime = (earliestDepartureTime != null) ? earliestDepartureTime : LocalDateTime.now();
        log.info("Searching for rides from '{}', '{}' to '{}', '{}' departing after '{}'", departureCity, departureState, destinationCity, destinationState, searchTime);

        List<Ride> results = rideRepository.findByDepartureCityAndDestinationCityAndDepartureStateAndDestinationStateAndStatusAndDepartureTimeAfterAndAvailableSeatsGreaterThan(
                departureCity,
                destinationCity,
                departureState,
                destinationState,

                RideStatus.SCHEDULED, // Only search for scheduled rides
                searchTime,
                0
        );

        log.info("Found {} rides matching search criteria.", results.size());
        return convertToDtoList(results);
    }

    public List<RideDTO> findRidesByDriverEmail(String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User (driver) not found with email: " + driverEmail));
        log.info("Fetching rides for driver ID: {}", driver.getId());
        List<Ride> rides = rideRepository.findByDriverId(driver.getId());
        return convertToDtoList(rides);
    }

    // --- RIDE LIFECYCLE METHODS ---
    @Transactional
    public RideDTO startRide(String rideId) {
        String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedOperationException("Authenticated user not found."));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!Objects.equals(ride.getDriverId(), driver.getId())) {
            throw new UnauthorizedOperationException("Only the driver can start this ride.");
        }
        if (ride.getStatus() != RideStatus.SCHEDULED) {
            throw new IllegalRideStateException("Ride cannot be started. Current status: " + ride.getStatus());
        }

        ride.setStatus(RideStatus.ACTIVE);
        Ride updatedRide = rideRepository.save(ride);
        log.info("Ride '{}' successfully started by driver '{}'", rideId, currentUserEmail);
        RideDTO updatedDto = convertToDto(updatedRide);
        notificationService.notifyRideStatusUpdate(updatedDto);
        return updatedDto;
    }

    @Transactional
    public RideDTO completeRide(String rideId) {
        String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedOperationException("Authenticated user not found."));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!Objects.equals(ride.getDriverId(), driver.getId())) {
            throw new UnauthorizedOperationException("Only the driver can complete this ride.");
        }
        if (ride.getStatus() != RideStatus.ACTIVE) {
            throw new IllegalRideStateException("Ride cannot be completed. Current status: " + ride.getStatus());
        }

        ride.setStatus(RideStatus.COMPLETED);
        // Potentially also update booking statuses to COMPLETED
        bookingService.updateBookingsStatusForRide(rideId, BookingStatus.COMPLETED);

        Ride updatedRide = rideRepository.save(ride);
        log.info("Ride '{}' successfully completed by driver '{}'", rideId, currentUserEmail);
        RideDTO updatedDto = convertToDto(updatedRide);
        notificationService.notifyRideStatusUpdate(updatedDto);
        return updatedDto;
    }

    @Transactional
    public void cancelRideByDriver(String rideId) { // Removed driverEmail param, auth is internal
        String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new UnauthorizedOperationException("Authenticated user not found."));

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!Objects.equals(ride.getDriverId(), driver.getId())) {
            throw new UnauthorizedOperationException("Only the driver can cancel this ride.");
        }

        if (ride.getStatus() == RideStatus.COMPLETED || ride.getStatus() == RideStatus.CANCELLED_BY_DRIVER) {
            log.warn("Attempted to cancel ride '{}' which is already {} by driver '{}'. No action taken.",
                    rideId, ride.getStatus(), currentUserEmail);
            // Optionally throw IllegalRideStateException or just return if idempotent behavior is desired
            if (ride.getStatus() == RideStatus.COMPLETED)
                 throw new IllegalRideStateException("Cannot cancel a completed ride.");
            return; // Already cancelled
        }

        ride.setStatus(RideStatus.CANCELLED_BY_DRIVER);
        Ride savedRide = rideRepository.save(ride); // Save first to get potentially updated timestamps
        log.info("Ride '{}' successfully cancelled by driver '{}'", rideId, currentUserEmail);

        notificationService.notifyRideStatusUpdate(convertToDto(savedRide));
        bookingService.cancelBookingsForRide(ride.getId(), BookingStatus.CANCELLED_BY_DRIVER);
    }


    // --- THIS IS THE NEW RIDE UPDATE METHOD ---
    @Transactional
    public RideDTO updateRide(String rideId, RideUpdateDTO rideUpdateDTO) {
        String currentUserEmail = AuthenticationUtil.getCurrentUserEmail();
        if (currentUserEmail == null) { // Should be caught by PreAuthorize, but defensive check
            throw new UnauthorizedOperationException("User must be authenticated to update a ride.");
        }

        User driver = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated driver not found: " + currentUserEmail));

        Ride ride = rideRepository.findById(rideId)
            .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!Objects.equals(ride.getDriverId(), driver.getId())) {
            throw new UnauthorizedOperationException("You are not authorized to update this ride.");
        }

        if (ride.getStatus() != RideStatus.SCHEDULED) {
            throw new IllegalRideStateException("Ride can only be updated if it is in SCHEDULED status. Current status: " + ride.getStatus());
        }

        // Validation for critical fields
        if (rideUpdateDTO.getDepartureTime() != null && rideUpdateDTO.getDepartureTime().isBefore(LocalDateTime.now().minusMinutes(1))) {
             throw new IllegalArgumentException("New departure time must be in the future.");
        }
        if (rideUpdateDTO.getTotalSeats() != null && rideUpdateDTO.getTotalSeats() <= 0) {
            throw new IllegalArgumentException("Total seats must be positive.");
        }
        // More robust seat validation
        int currentBookedSeats = ride.getTotalSeats() - ride.getAvailableSeats();
        if (rideUpdateDTO.getTotalSeats() != null && rideUpdateDTO.getTotalSeats() < currentBookedSeats) {
            throw new IllegalArgumentException("New total seats cannot be less than already booked seats (" + currentBookedSeats + ").");
        }
        if (rideUpdateDTO.getAvailableSeats() != null) {
            int newTotalSeats = rideUpdateDTO.getTotalSeats() != null ? rideUpdateDTO.getTotalSeats() : ride.getTotalSeats();
            if (rideUpdateDTO.getAvailableSeats() < currentBookedSeats) {
                 throw new IllegalArgumentException("New available seats cannot be less than already booked seats (" + currentBookedSeats + ").");
            }
            if(rideUpdateDTO.getAvailableSeats() > newTotalSeats) {
                throw new IllegalArgumentException("Available seats cannot exceed total seats ("+ newTotalSeats +").");
            }
        }


        boolean significantChange = false;

        if (rideUpdateDTO.getDepartureCity() != null && !Objects.equals(rideUpdateDTO.getDepartureCity(),ride.getDepartureCity())) {
            ride.setDepartureCity(rideUpdateDTO.getDepartureCity());
            significantChange = true;
        }
        if (rideUpdateDTO.getDestinationCity() != null && !Objects.equals(rideUpdateDTO.getDestinationCity(),ride.getDestinationCity())) {
            ride.setDestinationCity(rideUpdateDTO.getDestinationCity());
            significantChange = true;
        }
        if (rideUpdateDTO.getDepartureState() != null && !Objects.equals(rideUpdateDTO.getDepartureState(),ride.getDepartureState())) {
            ride.setDepartureState(rideUpdateDTO.getDepartureState());
            significantChange = true;
        }
        if (rideUpdateDTO.getDestinationState() != null && !Objects.equals(rideUpdateDTO.getDestinationState(),ride.getDestinationState())) {
            ride.setDestinationState(rideUpdateDTO.getDestinationState());
            significantChange = true;
        }
        if (rideUpdateDTO.getDepartureAddress() != null) {
            ride.setDepartureAddress(rideUpdateDTO.getDepartureAddress());
        }
        if (rideUpdateDTO.getDestinationAddress() != null) {
            ride.setDestinationAddress(rideUpdateDTO.getDestinationAddress());
        }
        if (rideUpdateDTO.getDepartureTime() != null && !Objects.equals(rideUpdateDTO.getDepartureTime(), ride.getDepartureTime())) {
            ride.setDepartureTime(rideUpdateDTO.getDepartureTime());
            significantChange = true;
        }

        // Seat update logic
        if (rideUpdateDTO.getTotalSeats() != null) {
            ride.setTotalSeats(rideUpdateDTO.getTotalSeats());
            // If availableSeats is not explicitly provided, recalculate it.
            if (rideUpdateDTO.getAvailableSeats() == null) {
                ride.setAvailableSeats(ride.getTotalSeats() - currentBookedSeats);
            }
            significantChange = true;
        }
        if (rideUpdateDTO.getAvailableSeats() != null) {
            // This has been validated above to be >= currentBookedSeats and <= newTotalSeats
            ride.setAvailableSeats(rideUpdateDTO.getAvailableSeats());
            significantChange = true;
        }


        if (rideUpdateDTO.getFarePerSeat() != null && rideUpdateDTO.getFarePerSeat().doubleValue() != ride.getFarePerSeat()) {
            ride.setFarePerSeat(rideUpdateDTO.getFarePerSeat());
            significantChange = true;
        }
        if (rideUpdateDTO.getIntermediateStops() != null) {
            ride.setIntermediateStops(rideUpdateDTO.getIntermediateStops());
        }
        if (rideUpdateDTO.getLuggagePreference() != null) {
            ride.setLuggagePreference(rideUpdateDTO.getLuggagePreference());
        }
        if (rideUpdateDTO.getSmokingAllowed() != null) {
            ride.setSmokingAllowed(rideUpdateDTO.getSmokingAllowed());
        }
        if (rideUpdateDTO.getPetsAllowed() != null) {
            ride.setPetsAllowed(rideUpdateDTO.getPetsAllowed());
        }
        if (rideUpdateDTO.getRideNotes() != null) {
            ride.setRideNotes(rideUpdateDTO.getRideNotes());
        }
        if (rideUpdateDTO.getEstimatedArrivalTime() != null) { // Added from RideDTO
            ride.setEstimatedArrivalTime(rideUpdateDTO.getEstimatedArrivalTime());
            significantChange = true;
        }


        Ride updatedRideEntity = rideRepository.save(ride);
        log.info("Ride '{}' updated in repository by driver '{}'. Significant change: {}", rideId, currentUserEmail, significantChange);

        RideDTO updatedRideDTO = convertToDto(updatedRideEntity);

        if (significantChange) {
            if (bookingService != null) {
                 bookingService.notifyPassengersOfRideUpdate(rideId, "Details for your booked ride (ID: " + rideId + ") have been updated by the driver. Please review the changes.");
            }
        }
        return updatedRideDTO;
    }

    // --- Helper Methods ---
    // Your existing helper methods (findUserByEmail, findRideById, validateRideOwnership, validateRideStatus)
    // seem okay but were using String constants for status. Let's ensure they use enums if Ride model uses enums.
    // The new updateRide and lifecycle methods above already use enums.
    // We also need convertToDto and convertToDtoList.

    private RideDTO convertToDto(Ride ride) {
        if (ride == null) return null;
        RideDTO dto = new RideDTO();
        dto.setId(ride.getId());
        dto.setDriverId(ride.getDriverId()); // Consider fetching driver details (name) for the DTO
        dto.setDepartureCity(ride.getDepartureCity());
        dto.setDestinationCity(ride.getDestinationCity());
        dto.setDepartureState(ride.getDepartureState());
        dto.setDestinationState(ride.getDestinationState());
        dto.setDepartureAddress(ride.getDepartureAddress());
        dto.setDestinationAddress(ride.getDestinationAddress());
        dto.setDepartureTime(ride.getDepartureTime());
        dto.setEstimatedArrivalTime(ride.getEstimatedArrivalTime());
        dto.setAvailableSeats(ride.getAvailableSeats());
        dto.setTotalSeats(ride.getTotalSeats());
        dto.setFarePerSeat(ride.getFarePerSeat());
        dto.setIntermediateStops(ride.getIntermediateStops());
        dto.setLuggagePreference(ride.getLuggagePreference());
        dto.setSmokingAllowed(ride.isSmokingAllowed());
        dto.setPetsAllowed(ride.isPetsAllowed());
        dto.setRideNotes(ride.getRideNotes());
        dto.setStatus(ride.getStatus());
        // Assuming Ride entity has createdAt and updatedAt from Auditing or manual setting
        dto.setCreatedAt(ride.getCreatedAt());
        dto.setUpdatedAt(ride.getUpdatedAt());
        return dto;
    }

    private List<RideDTO> convertToDtoList(List<Ride> rides) {
        if (rides == null || rides.isEmpty()) {
            return Collections.emptyList();
        }
        return rides.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}