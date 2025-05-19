// frontend/types/index.ts

export type UserRole = 'PASSENGER' | 'DRIVER' | 'ADMIN';

export type DriverStatus = 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'; 

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_EMAIL_VERIFICATION' | 'DEACTIVATED';

export type DocumentStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'| 'NONE';

export type RideStatus =
  | 'SCHEDULED'
  | 'ACTIVE' // Add ACTIVE here
  | 'IN_PROGRESS' // Keep IN_PROGRESS for now, or decide if ACTIVE fully replaces it
  | 'COMPLETED'
  | 'CANCELLED_BY_DRIVER'
  | 'CANCELLED_SYSTEM'
  | string; // for flexibility if backend sends something unexpected temporarily


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
  documentType: keyof typeof DOCUMENT_TYPES; 
  originalFilename: string; 
  contentType?: string;      
  // size: number;          // From DTO (optional on frontend if not used for display)
  // filePath: string;      // From DTO (internal path, maybe not needed directly in UI models)
  uploadedAt: string;       
  status: DocumentStatus;
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


export interface DocumentStatusUpdatePayload {
  newStatus: 'APPROVED' | 'REJECTED';
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

// export interface BookingRequestSummary {
//   bookingId: string; // This is likely the 'id' from BookingDTO
//   passengerId: string;
//   passengerName: string; // Or passengerUsername, etc.
//   requestedSeats: number;
//   status: BookingStatus | string; // Use BookingStatus union for better type safety
//   requestedAt: string; // ISO date string (corresponds to bookingTime or a similar field)
// }

export interface BookingDTO {
  id: string;
  rideId: string;
  passengerId: string;
  driverId: string;
  requestedSeats: number;
  status: BookingStatus | string; // Use the BookingStatus type here
  bookingTime: string;         // LocalDateTime becomes string (ISO 8601 format)
  confirmationTime?: string | null; // Optional and can be null
  cancellationTime?: string | null; // Optional and can be null

  // --- ADDED FIELDS ---
  departureCity?: string;       // Make optional if not always present
  destinationCity?: string;     // Make optional if not always present
  departureState?: string;
  destinationState?: string;
  driverName?: string;          // Make optional if not always present
}

export interface DriverOfferedRide {
  id: string;
  driverId: string;
  driverName: string;
  departureCity: string;
  destinationCity: string;
  departureState: string;
  destinationState: string;
  departureTime: string; // ISO date string
  estimatedArrivalTime: string; // ISO date string
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  status: RideStatus;
  vehicleDescription?: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  bookingRequests?: BookingRequestSummary[];
  confirmedBookingsCount?: number;
}

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
  passengerInfo: PassengerInfoSummary;
  status: 'REQUESTED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED_BY_PASSENGER'; 
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
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED_BY_DRIVER' | 'CANCELLED_SYSTEM';
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


export interface PassengerInfoSummary { // Info about the passenger who made the request
  id: string;
  firstName: string;
  lastName?: string;
  // Add profileImageUrl or other relevant passenger details if available
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

export interface DriverApplicationFormValues {
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string; // Kept as string for form input, backend can parse/validate as year
  vehicleColor: string;
  vehiclePlateNumber: string;
  // Optional: A field for the passenger to add any notes with their application
  // passengerNotes?: string;
}

export interface DriverApplicationDTO {
  id: string; // Unique ID for the application itself
  userId: string; // ID of the user who applied
  userFirstName?: string; // Optional: Denormalized for easier display if needed
  userLastName?: string;  // Optional: Denormalized
  licenseNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehiclePlateNumber: string;
  status: DriverStatus; // Re-using your existing DriverStatus: 'NONE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  applicationDate: string; // ISO 8601 date string when the application was submitted
  reviewDate?: string; // ISO 8601 date string when it was reviewed
  adminNotes?: string;


}

export interface ChatMessage { // This is what you'll receive and display
  id: string; // Your backend ChatMessage entity has an ID, but DTO from controller doesn't explicitly map it. Let's assume DTO should match this.
  rideId: string;
  senderId: string;
  senderFirstName: string; // Backend controller now maps this as senderName
  content: string;
  timestamp: string; // ISO string
  isOwnMessage?: boolean; // Client-side flag
  senderRole?: 'DRIVER' | 'PASSENGER' | string; // Backend is sending this
}

export interface ChatMessageSendPayload { // This is what you'll send
  // rideId: string; // Backend gets rideId from @DestinationVariable, so not strictly needed in payload if STOMP client sends to correct path.
                  // However, your ChatMessageDTO in backend constructor takes rideId.
                  // Let's assume for now that the backend will use the @DestinationVariable for rideId primarily.
  content: string;
}

export interface PassengerConversationPreview {
  rideId: string;
  driverId: string;
  driverFirstName: string;
  driverLastName?: string;
  driverProfilePictureUrl?: string; // If available
  rideDepartureCity: string;
  rideDestinationCity: string;
  rideDepartureTime: string; // ISO string
  lastMessageSnippet?: string; // Optional: last message content
  lastMessageTimestamp?: string; // Optional: timestamp of last message
  unreadCount?: number; // Optional: number of unread messages
}



export interface DriverNotificationSettings {
  newBookingRequest: boolean; // Email/Push for new booking requests
  bookingConfirmed: boolean;  // Email/Push when a booking is auto-confirmed or you confirm it
  bookingCancelledByPassenger: boolean; // Email/Push if a passenger cancels
  rideReminder: boolean;      // Reminder before a scheduled ride
  newMessageInChat: boolean;  // Notification for new chat messages
  platformUpdates: boolean;   // General updates from the platform
}

export interface DriverPayoutSettings {
  payoutMethod: 'BANK_ACCOUNT' | 'PAYPAL' | 'NONE_SET'; // Example methods
  bankAccountNumber?: string; // Masked, e.g., **** **** **** 1234
  bankRoutingNumber?: string; // Masked
  paypalEmail?: string;
  payoutFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

export interface DriverPreferences {
  acceptInstantBook: boolean; // Allow passengers to book instantly without approval
  allowPets: boolean;
  allowSmoking: boolean;
  maxLuggageSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'NONE';
  musicPreference: 'PASSENGER_CHOICE' | 'DRIVER_CHOICE' | 'QUIET_RIDE' | 'ANY';
}

// Consolidate all settings for a driver
export interface DriverSettingsData {
  userId: string; // To link to the user
  notifications: DriverNotificationSettings;
  payout: DriverPayoutSettings;
  preferences: DriverPreferences;
  // Add any other setting categories you can think of
  // e.g., twoFactorAuthEnabled: boolean;
}

// For the form (might be a subset or slightly different structure)
export type DriverSettingsFormValues = Omit<DriverSettingsData, 'userId'>;

export interface FAQItem {
  id: string;
  question: string;
  answer: string; // Can include HTML if you plan to render rich text
  category: 'General' | 'Rides' | 'Payments' | 'Account' | 'Technical'; // Example categories
}

export interface SupportTicketFormValues {
  subject: string;
  category: 'Billing' | 'Technical Issue' | 'Ride Dispute' | 'Account Question' | 'Feedback' | 'Other';
  message: string;
  // Potentially add:
  // rideId?: string; // If the issue is related to a specific ride
  // attachment?: File; // If you allow file uploads
}

export interface SupportTicketDTO extends SupportTicketFormValues {
  ticketId: string; // Generated by backend
  userId: string;
  userEmail: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string; // ISO string
}


export interface DriverProfile {
  id: string; // or linked to userId
  userId: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleLicensePlate?: string;
  vehicleColor?: string;
  // ... other vehicle details
  bankAccountName?: string;
  bankAccountNumber?: string; // Encrypt this at rest if storing
  bankRoutingNumber?: string;
  drivingLicenseNumber?: string;
  drivingLicenseExpiry?: string; // Date string
  drivingLicenseStatus?: 'MISSING' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  insurancePolicyNumber?: string;
  insuranceExpiry?: string; // Date string
  // ... other driver specific fields
}



export interface DriverProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string; // Usually not updatable via this form
  phoneNumber?: string;
  bio?: string;
  currentProfilePictureUrl?: string; // To track existing and help backend if picture is removed
  
}