// frontend/types/index.ts

// --- Authentication & User Core Types ---
// ACTION: Verified against backend expectations.

/**
 * User roles defined in the system.
 * Backend Expectation: "ROLE_PASSENGER", "ROLE_DRIVER", "ROLE_ADMIN"
 */
export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

/**
 * Status of a user's driver application/profile.
 * Backend Expectation: String field on User, explicitly set to "APPROVED" by DocumentService. Defaults to "NONE".
 * Frontend might infer PENDING_VERIFICATION or REJECTED based on other data if needed.
 */
export type DriverStatus = 'NONE' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED'; // REJECTED might be set on User by backend eventually or inferred

/**
 * General account status for a user.
 * Backend Expectation: This field/logic likely doesn't exist yet on the backend.
 * Kept for future use. UI should default to 'ACTIVE' for logged-in users until supported.
 */
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_EMAIL_VERIFICATION' | 'DEACTIVATED';

/**
 * Data Transfer Object for user registration (sign-up).
 * Backend Expectation: Uses 'email'.
 */
export interface SignupRequestDTO {
  firstName: string;
  lastName: string;
  email: string; // Changed from emailId
  password: string;
}

/**
 * Data Transfer Object for user login.
 * Backend Expectation: Uses 'email'.
 */
export interface LoginRequestDTO {
  email: string; // Changed from emailId
  password: string;
}

/**
 * Response Data Transfer Object after successful authentication.
 * Backend Expectation: Likely returns only { "accessToken": "..." }.
 */
export interface AuthResponseDTO {
  token: string;
  // Other fields removed as per backend expectation
}

/**
 * Represents the claims decoded from the JWT (accessToken).
 * Backend Expectation: sub (as email), roles (as string[]), exp, iat.
 */
export interface DecodedJwt {
  sub: string; // Subject (this IS the user's email from backend)
  roles: string[]; // Backend sends roles claim as an array of UserRole compatible strings
  exp: string; // Expiration time (Unix timestamp)
  iat: string; // Issued at time (Unix timestamp)
  // Removed: emailId, firstName, lastName, role (singular), driverStatus
}

/**
 * Represents the detailed User object.
 * Backend Expectation (GET /api/users/me): id, name (or firstName/lastName), email, roles (plural, array), driverStatus.
 */
export interface User {
  id: string;
  // Assuming backend provides firstName and lastName separately. Adjust if it's a single 'name' field.
  firstName?: string;
  lastName?: string;
  email: string; // Changed from emailId
  roles: UserRole[]; // Changed from singular role to array of UserRole type
  driverStatus: DriverStatus | null; // Use updated DriverStatus type
  createdAt?: string; // Often provided by auditing; confirm with backend
  // Removed accountStatus, profileImageUrl, updatedAt as likely not provided by backend /me yet
  // Add other fields like 'phone' if your backend GET /api/users/me provides them.
}

// --- Document Management Types ---
export interface DocumentMetadata {
  id: string;
  fileName: string;
  documentType: keyof typeof DOCUMENT_TYPES;
  status: DocumentStatus;
  uploadDate: string;
  rejectionReason?: string | null;
}

export const DOCUMENT_TYPES = {
  DRIVING_LICENSE: 'Driving License',
  VEHICLE_REGISTRATION: 'Vehicle Registration',
  INSURANCE_POLICY: 'Insurance Policy',
} as const;

export interface AdminDocumentView extends DocumentMetadata {
  userId: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string; // This seems fine if it's how the specific admin view for documents returns it
}

export type DocumentStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface DocumentStatusUpdatePayload {
  newStatus: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}


// --- Ride & Booking Related Types (Verify field names & enums against backend) ---

export interface RideSearchResult {
    id: string;
    driverId: string;
    driverFirstName: string;
    driverLastName?: string;
    departureCity: string;
    destinationCity: string;
    departureTime: string;
    estimatedArrivalTime: string;
    availableSeats: number;
    pricePerSeat: number;
    vehicleDescription?: string;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface RideSearchFormValues {
    departureCity: string;
    destinationCity: string;
    earliestDepartureTime: string;
}

export interface RideDetail extends RideSearchResult {
  driverBio?: string;
  driverRating?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleYear?: number;
}

export interface BookingRequestPayload {
  numberOfSeats: number;
}

export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'REJECTED_BY_DRIVER' | 'CANCELLED_BY_PASSENGER' | 'CANCELLED_BY_DRIVER' | 'COMPLETED' | 'PENDING_PAYMENT';


export interface UserRideBookingStatus {
    bookingId?: string;
    status?: BookingStatus;
    seatsBooked?: number;
}

export interface PassengerBooking {
  bookingId: string;
  rideId: string;
  rideDetails: {
    departureCity: string;
    destinationCity: string;
    departureTime: string;
    pricePerSeat?: number;
  };
  seatsBooked: number;
  totalAmount?: number;
  status: BookingStatus;
  bookingDate: string;
}

export interface RideCreationFormValues {
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleDescription: string;
  rideNotes?: string;
}

export interface RideCreationDTO {
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleDescription: string;
  rideNotes?: string;
}


export interface BookingRequestSummary {
  bookingId: string;
  passengerId: string;
  passengerFirstName: string;
  passengerLastName?: string;
  seatsRequested: number;
  requestTime: string;
  status: 'REQUESTED';
}

export interface DriverOfferedRide {
  id: string;
  departureCity: string;
  destinationCity: string;
  departureTime: string;
  estimatedArrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  vehicleDescription?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER' | 'CANCELLED_SYSTEM';
  createdAt: string;
  updatedAt?: string;
  bookingRequests?: BookingRequestSummary[];
  confirmedBookingsCount?: number;
}

export interface RideUpdateFormValues {
  departureCity?: string;
  destinationCity?: string;
  departureTime?: string;
  estimatedArrivalTime?: string;
  availableSeats?: number;
  pricePerSeat?: number;
  vehicleDescription?: string;
  rideNotes?: string;
}

export interface RideUpdateDTO {
  departureCity?: string;
  destinationCity?: string;
  departureTime?: string;
  estimatedArrivalTime?: string;
  availableSeats?: number;
  pricePerSeat?: number;
  vehicleDescription?: string;
  rideNotes?: string;
}

// --- Earnings Related Types ---
export interface EarningsSummary {
  totalEarned: number;
  pendingPayout: number;
  lastPayoutAmount?: number;
  lastPayoutDate?: string;
  ridesCompletedCount: number;
}

export interface EarningTransaction {
  transactionId: string;
  rideId: string;
  rideDepartureCity: string;
  rideDestinationCity: string;
  rideCompletionDate: string;
  numberOfPassengers?: number;
  amountEarned: number;
  platformFee?: number;
  payoutStatus: 'PENDING' | 'PAID_OUT' | 'PROCESSING' | 'FAILED';
  payoutDate?: string;
}

// --- Chat Related Types ---
export interface ChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  senderFirstName: string;
  content: string;
  timestamp: string;
  isOwnMessage?: boolean;
}

export interface ChatMessageSendPayload {
  rideId: string;
  content: string;
}

// --- Admin User Management Types ---
export interface AdminUserView {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // Changed from emailId to email for consistency
  role: UserRole; // Uses updated UserRole type
  driverStatus?: DriverStatus | null; // Uses updated DriverStatus type
  accountStatus?: AccountStatus; // Uses AccountStatus type (mainly for future use)
  createdAt: string;
}

export interface UserFilterValues {
  role: 'ALL' | UserRole; // Uses updated UserRole type
  status: 'ALL' | AccountStatus | DriverStatus | 'DRIVER_PENDING' | 'DRIVER_APPROVED' | 'DRIVER_REJECTED';
  searchTerm: string;
}