// frontend/types/index.ts

export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export type DriverStatus = 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'; 

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_EMAIL_VERIFICATION' | 'DEACTIVATED';

export interface SignupRequestDTO {
  firstName: string;
  lastName: string;
  email: string; // Changed from emailId
  password: string;
}

export interface LoginRequestDTO {
  email: string; // Changed from emailId
  password: string;
}

export interface AuthResponseDTO {
  token: string;
}

export interface DecodedJwt {
  sub: string; // Subject (this IS the user's email from backend)
  roles: string[]; // Backend sends roles claim as an array of UserRole compatible strings
  exp: string; // Expiration time (Unix timestamp)
  iat: string; // Issued at time (Unix timestamp)
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string; // Changed from emailId
  roles: UserRole[]; // Changed from singular role to array of UserRole type
  driverStatus: DriverStatus | null; 
  createdAt?: string; 

  profilePictureUrl?: string; 
}

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
  userEmail: string; 
}

export type DocumentStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED'| 'NONE';

export interface DocumentStatusUpdatePayload {
  newStatus: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
}


export interface RideSearchResult {
    id: string;
    driverId: string;
    driverFirstName: string;
    driverLastName?: string;
    departureCity: string;
    destinationCity: string;
    departureState: string;
    destinationState: string;
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
    departureState: string;
    destinationState: string;
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
 
  bookingId: string;      // Assuming 'id' from BookingDTO maps to 'bookingId'
  rideId: string;
  passengerId: string;    // Typically present in BookingDTO
  driverId: string;       // Typically present in BookingDTO
  requestedSeats: number; // 'requestedSeats' is common in BookingDTOs
  status: BookingStatus;
  bookingTime: string;    // Likely 'createdAt' from BookingDTO
  confirmationTime?: string;
  cancellationTime?: string;
 
  rideDetails?: RideDetails; // <--- MADE OPTIONAL and uses the full RideDetails type
}

export interface RideCreationFormValues {
  departureCity: string;
  destinationCity: string;
  departureState: string;
  destinationState: string;
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
  departureState: string;
  destinationState: string;
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
  departureState: string;
  destinationState: string;
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
  rideNotes?: string | null;
}

export interface RideUpdateFormValues {
  departureCity?: string;
  destinationCity?: string;
  departureState: string;
  destinationState: string;
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
  departureState: string;
  destinationState: string;
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
  departureState: string;
  destinationState: string;
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


export interface RideDetails {
  id: string; 
  driverId: string;
  driverName?: string; 
  driverProfileImageUrl?: string; 
  departureCity: string;
  destinationCity: string;
  departureState: string;
  destinationState: string;
  departureAddress?: string; 
  destinationAddress?: string; 
  departureTime: string;
  estimatedArrivalTime?: string;
  availableSeats: number;
  totalSeats: number; // Add if your RideDTO has this (DriverOfferedRide has it)
  farePerSeat: number; // Renamed from pricePerSeat for consistency if backend DTO uses this
  vehicleDescription?: string;
  intermediateStops?: string[]; // Add if RideDTO has this
  luggagePreference?: string;   // Add if RideDTO has this
  smokingAllowed?: boolean;     // Add if RideDTO has this
  petsAllowed?: boolean;        // Add if RideDTO has this
  rideNotes?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED_BY_DRIVER' | 'CANCELLED_SYSTEM'; // Match RideDTO statuses
  createdAt?: string; // ISO String
  updatedAt?: string; // ISO String

}


