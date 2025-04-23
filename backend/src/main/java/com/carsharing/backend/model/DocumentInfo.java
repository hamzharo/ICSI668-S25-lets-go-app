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
}