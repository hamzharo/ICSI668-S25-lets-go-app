<<<<<<< HEAD
package com.carsharing.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data // Using Lombok for getters/setters/etc.
@NoArgsConstructor
@AllArgsConstructor
public class DocumentInfo {

    private String documentType; // e.g., "LICENSE", "INSURANCE", "VEHICLE_REGISTRATION"
    private String originalFilename;
    private String storedFilename; // Unique name used for storage
    private String filePath; // Path relative to the base upload dir, or full path depending on storage strategy
    private String verificationStatus; // e.g., "PENDING_REVIEW", "VERIFIED", "REJECTED"
    private LocalDateTime uploadTimestamp;
    // Add admin reviewer ID, review timestamp, rejection reason later if needed
=======
// Potentially in com.carsharing.backend.model.DocumentInfo.java
// Or, if it's simple metadata directly on the User, we might adjust.

// Let's assume a separate DocumentInfo entity makes sense
// to allow multiple documents per user (e.g., license, registration, insurance)

package com.carsharing.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_info")
public class DocumentInfo {

    @Id
    private String id;
    private String userId; // ID of the User this document belongs to
    private String documentType; // e.g., "DRIVING_LICENSE", "VEHICLE_REGISTRATION", "INSURANCE_POLICY"
    private String originalFilename; // The original name of the uploaded file
    private String contentType; // MIME type of the file (e.g., "image/jpeg", "application/pdf")
    private long size; // Size of the file in bytes
    private String filePath; // Path where the file is stored (e.g., on the local filesystem or cloud URL)
    private LocalDateTime uploadedAt;
    private DocumentStatus status; // e.g., PENDING_VERIFICATION, VERIFIED, REJECTED

    
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
}