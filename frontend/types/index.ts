// frontend/types/index.ts

// ... (User, DocumentMetadata, DecodedJwt, DOCUMENT_TYPES from previous responses) ...

// Represents the data for a single ride as returned by the search endpoint
// This might be similar or identical to a general 'Ride' type if you have one.
export interface RideSearchResult {
    id: string; // Or number
    driverId: string; // Or number
    driverFirstName: string; // Or full driver name / object
    driverLastName?: string;
    // driverProfilePictureUrl?: string; // Optional
    departureCity: string;
    destinationCity: string;
    departureTime: string; // ISO date string
    estimatedArrivalTime: string; // ISO date string
    availableSeats: number;
    pricePerSeat: number; // Assuming a numeric value
    vehicleDescription?: string; // e.g., "Toyota Camry, White"
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // Based on backend ride statuses
    // Add any other relevant fields from your backend's Ride DTO/entity
    // For example, intermediate stops if your system supports them.
  }
  
  // Represents the values from the ride search form
  export interface RideSearchFormValues {
    departureCity: string;
    destinationCity: string;
    earliestDepartureTime: string; // Will likely be a date-time string
    // You might add other filters like latestDepartureTime, numberOfSeats, etc.
  }

  // Let's assume RideSearchResult is detailed enough for now, or we can create a RideDetail type:
export interface RideDetail extends RideSearchResult { // Extends if it shares fields
  // Additional fields specific to the ride detail view:
  driverBio?: string;
  driverRating?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleYear?: number;
  // bookedSeats?: number; // If different from (totalSeats - availableSeats)
  // passengerList?: Array<{ userId: string; name: string; status: BookingStatus }>; // If passengers can see other confirmed passengers
  // rideRules?: string[]; // e.g., "No smoking", "Pets allowed"
  // intermediateStops?: Array<{ city: string; time: string }>;
}

// For booking requests
export interface BookingRequestPayload {
  numberOfSeats: number; // Or this might be implicit (e.g., always 1) or handled by backend
  // pickupNotes?: string; // Optional notes from passenger
}

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED_BY_DRIVER' | 'CANCELLED_BY_PASSENGER' | 'CANCELLED_BY_DRIVER' | 'COMPLETED';

// To represent the passenger's own booking status for THIS ride
export interface UserRideBookingStatus {
    bookingId?: string; // If a booking exists
    status?: BookingStatus;
    seatsBooked?: number;
}

// ... (User, DocumentMetadata, RideSearchResult, RideDetail, BookingStatus, etc. from previous responses) ...

// Represents a booking from the passenger's perspective
export interface PassengerBooking {
  bookingId: string; // Or number
  rideId: string;    // Or number
  rideDetails: { // Nested or flattened ride info
    departureCity: string;
    destinationCity: string;
    departureTime: string; // ISO date string
    // driverFirstName: string; // Could be useful
    // driverLastName?: string;
    pricePerSeat?: number; // If showing total cost
  };
  seatsBooked: number;
  totalAmount?: number; // seatsBooked * pricePerSeat
  status: BookingStatus; // 'REQUESTED', 'CONFIRMED', 'REJECTED_BY_DRIVER', etc.
  bookingDate: string; // ISO date string when the booking/request was made
  // Add other relevant fields like payment status, cancellation reason if applicable
}

export interface RideCreationFormValues {
  departureCity: string;
  destinationCity: string;
  departureTime: string; // Expecting datetime-local input format initially (YYYY-MM-DDTHH:MM)
  estimatedArrivalTime: string; // Expecting datetime-local input format
  availableSeats: number;
  pricePerSeat: number;
  vehicleDescription: string; // Simplified for now; could be a selection from registered vehicles
  // Optional fields from a typical RideCreationDTO:
  // vehicleMake?: string;
  // vehicleModel?: string;
  // vehicleColor?: string;
  // vehicleLicensePlate?: string;
  rideNotes?: string;
  // intermediateStops?: Array<{ city: string; estimatedTime: string }>; // More complex
}

// This would be the DTO sent to the backend, possibly after transforming form values
export interface RideCreationDTO {
  departureCity: string;
  destinationCity: string;
  departureTime: string; // ISO 8601 string
  estimatedArrivalTime: string; // ISO 8601 string
  availableSeats: number;
  pricePerSeat: number;
  vehicleDescription: string;
  // vehicleMake?: string;
  // vehicleModel?: string;
  // vehicleColor?: string;
  // vehicleLicensePlate?: string;
  rideNotes?: string;
}


export interface BookingRequestSummary {
  bookingId: string;
  passengerId: string;
  passengerFirstName: string;
  passengerLastName?: string;
  // passengerProfilePictureUrl?: string;
  seatsRequested: number;
  requestTime: string; // ISO date string
  status: 'REQUESTED'; // This component likely only deals with 'REQUESTED' status initially
}

// Represents a ride offered by a driver, including booking requests for it
export interface DriverOfferedRide {
  id: string; // Or number
  departureCity: string;
  destinationCity: string;
  departureTime: string; // ISO date string
  estimatedArrivalTime: string; // ISO date string
  availableSeats: number; // Current available seats
  totalSeats: number; // Original total seats offered
  pricePerSeat: number;
  vehicleDescription?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER' | 'CANCELLED_SYSTEM'; // System cancellation might be different
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  bookingRequests?: BookingRequestSummary[]; // List of pending booking requests for this ride
  confirmedBookingsCount?: number; // Count of confirmed passengers
  // intermediateStops?: Array<{ city: string; time: string }>;
  // rideNotes?: string;
}

// For updating a ride
export interface RideUpdateFormValues { // Form values might be slightly different from DTO
  departureCity?: string;
  destinationCity?: string;
  departureTime?: string; // datetime-local string
  estimatedArrivalTime?: string; // datetime-local string
  availableSeats?: number; // Driver might adjust this directly, or it's calculated
  pricePerSeat?: number;
  vehicleDescription?: string;
  rideNotes?: string;
}

export interface RideUpdateDTO { // Actual DTO sent to backend
  departureCity?: string;
  destinationCity?: string;
  departureTime?: string; // ISO 8601 string
  estimatedArrivalTime?: string; // ISO 8601 string
  availableSeats?: number;
  pricePerSeat?: number;
  vehicleDescription?: string;
  rideNotes?: string;
}

// DocumentMetadata can likely be reused if it contains all necessary info from GET /all?status=...
// If the admin view has more info (like user details associated with the document), extend it:
export interface AdminDocumentView extends DocumentMetadata { // DocumentMetadata already has id, fileName, documentType, status, rejectionReason, uploadDate
  userId: string; // Or number
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  // Any other user-specific info relevant to the admin when reviewing
}

export type DocumentStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'; // Already somewhat defined, ensure consistency

export interface DocumentStatusUpdatePayload {
  newStatus: 'VERIFIED' | 'REJECTED'; // Admin can only set these two from PENDING
  rejectionReason?: string; // Required if newStatus is 'REJECTED'
}


export interface EarningsSummary {
  totalEarned: number;
  pendingPayout: number;
  lastPayoutAmount?: number;
  lastPayoutDate?: string; // ISO date string
  ridesCompletedCount: number;
  // Potentially other summary stats like average earning per ride, etc.
}

export interface EarningTransaction { // Or call it CompletedRideEarning
  transactionId: string; // Or rideId if earnings are directly tied to rides
  rideId: string;
  rideDepartureCity: string;
  rideDestinationCity: string;
  rideCompletionDate: string; // ISO date string
  numberOfPassengers?: number; // Or number of seats booked that completed
  amountEarned: number;
  platformFee?: number; // If you show this deduction
  payoutStatus: 'PENDING' | 'PAID_OUT' | 'PROCESSING' | 'FAILED';
  payoutDate?: string; // ISO date string, if paid_out
}

export interface ChatMessage {
  id: string; // Or number, generated by backend
  rideId: string;
  senderId: string;
  senderFirstName: string; // Or full sender name
  // senderProfilePictureUrl?: string;
  content: string;
  timestamp: string; // ISO date string
  isOwnMessage?: boolean; // To be determined on the client-side
}

export interface ChatMessageSendPayload {
  rideId: string; // Not strictly needed if sent to /app/ride/{rideId}/...
  content: string;
  // Backend will determine senderId from authenticated principal
}

// Could also be a more generic UserListItem or UserView
export interface AdminUserView {
  id: string; // Or number
  firstName: string;
  lastName: string;
  emailId: string; // Or 'email'
  role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
  driverStatus?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'APPROVED' | null; // Relevant if role is DRIVER
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'PENDING_EMAIL_VERIFICATION'; // General account status
  createdAt: string; // ISO date string
  // lastLogin?: string; // ISO date string - Optional
}

// For UserFilters component
export interface UserFilterValues {
  role: 'ALL' | 'PASSENGER' | 'DRIVER' | 'ADMIN';
  status: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'PENDING_EMAIL_VERIFICATION' | 'DRIVER_PENDING' | 'DRIVER_APPROVED' | 'DRIVER_REJECTED'; // Example combined statuses
  searchTerm: string; // Search by name, email, or ID
}
