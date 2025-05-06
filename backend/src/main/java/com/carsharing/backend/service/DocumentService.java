package com.carsharing.backend.service;

import com.carsharing.backend.dto.DocumentInfoDTO;
import com.carsharing.backend.exception.ResourceNotFoundException;
import com.carsharing.backend.model.DocumentInfo;
import com.carsharing.backend.model.DocumentStatus;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.DocumentInfoRepository;
import com.carsharing.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentInfoRepository documentInfoRepository;

    @Autowired
    private UserRepository userRepository; // To get User ID from email

    @Transactional
    public DocumentInfoDTO storeDocument(MultipartFile file, String documentType, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // Validate documentType (e.g., against a predefined list if necessary)
        // For now, we accept any string.
        if (!isValidDocumentType(documentType)) { // Implement isValidDocumentType if needed
            throw new IllegalArgumentException("Invalid document type: " + documentType);
        }

        // Store the physical file
        String fileName = fileStorageService.storeFile(file, user.getId(), documentType);

        // Create and save document metadata
        DocumentInfo docInfo = new DocumentInfo();
        docInfo.setUserId(user.getId());
        docInfo.setDocumentType(documentType.toUpperCase().replace(" ", "_")); // Normalize document type
        docInfo.setOriginalFilename(file.getOriginalFilename());
        docInfo.setContentType(file.getContentType());
        docInfo.setSize(file.getSize());
        docInfo.setFilePath(fileName); // Store the unique filename, not the full path for security/abstraction
        docInfo.setUploadedAt(LocalDateTime.now());
        docInfo.setStatus(DocumentStatus.PENDING_VERIFICATION);

        DocumentInfo savedDocInfo = documentInfoRepository.save(docInfo);
        log.info("Document metadata saved for user: {}, documentId: {}, file: {}", user.getId(), savedDocInfo.getId(), fileName);

        // Potentially update User entity if it tracks document status or has a list of doc IDs
        // user.getDocuments().add(savedDocInfo.getId());
        // userRepository.save(user);

        return convertToDto(savedDocInfo);
    }

    public List<DocumentInfoDTO> getUserDocuments(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return documentInfoRepository.findByUserId(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUserDocument(String documentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        DocumentInfo docInfo = documentInfoRepository.findByIdAndUserId(documentId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId + " for this user."));

        // Optional: Only allow deletion if PENDING_VERIFICATION
        if (docInfo.getStatus() != DocumentStatus.PENDING_VERIFICATION) {
            // throw new UnauthorizedOperationException("Cannot delete document that is not pending verification.");
             log.warn("User {} attempted to delete document {} with status {}", userEmail, documentId, docInfo.getStatus());
             // Depending on policy, either throw error or just do nothing. For now, let's allow it.
        }

        fileStorageService.deleteFile(docInfo.getFilePath()); // Delete physical file
        documentInfoRepository.delete(docInfo); // Delete metadata
        log.info("Document {} and its file {} deleted successfully for user {}", documentId, docInfo.getFilePath(), userEmail);
    }


 // --- ADMIN DOCUMENT MANAGEMENT SERVICE METHODS ---

 public List<DocumentInfoDTO> getAllDocuments(DocumentStatus statusFilter) {
    List<DocumentInfo> documents;
    if (statusFilter != null) {
        documents = documentInfoRepository.findByStatus(statusFilter); // Requires findByStatus in repository
    } else {
        documents = documentInfoRepository.findAll();
    }
    return documents.stream().map(this::convertToDto).collect(Collectors.toList());
}

public DocumentInfoDTO getDocumentMetadataById(String documentId) {
    DocumentInfo docInfo = documentInfoRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
    return convertToDto(docInfo);
}

public Resource loadDocumentFileAsResource(String documentId) {
    DocumentInfo docInfo = documentInfoRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document (metadata) not found with id: " + documentId));

    // The filePath in DocumentInfo is the unique filename generated by FileStorageService
    return fileStorageService.loadFileAsResource(docInfo.getFilePath());
}

@Transactional
public DocumentInfoDTO updateDocumentStatus(String documentId, DocumentStatus newStatus, String rejectionReason, String adminUserEmail) {
    // Optional: Find the admin User object if you need to store adminId
    // User admin = userRepository.findByEmail(adminUserEmail)...

    DocumentInfo docInfo = documentInfoRepository.findById(documentId)
            .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

    if (docInfo.getStatus() == newStatus) {
        log.info("Document {} already has status {}. No update performed by admin {}", documentId, newStatus, adminUserEmail);
        return convertToDto(docInfo); // Or throw an exception if this is considered an error
    }

    docInfo.setStatus(newStatus);
    if (newStatus == DocumentStatus.REJECTED && rejectionReason != null && !rejectionReason.isBlank()) {
        // You might want a specific field on DocumentInfo for rejectionReason
        // For now, we could log it or add it to a notes field if DocumentInfo had one.
        log.info("Document {} rejected by admin {} with reason: {}", documentId, adminUserEmail, rejectionReason);
        // docInfo.setRejectionReason(rejectionReason); // If you add this field to DocumentInfo model
    } else if (newStatus == DocumentStatus.VERIFIED) {
        // docInfo.setVerifiedAt(LocalDateTime.now()); // If you add this field
        // docInfo.setAdminVerifierId(admin.getId()); // If you add this field
        log.info("Document {} verified by admin {}", documentId, adminUserEmail);

        // IMPORTANT: If document verification makes a DRIVER active, update the User status here!
        User user = userRepository.findById(docInfo.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User associated with document not found: " + docInfo.getUserId()));

        // This is a simplified check. You might need more sophisticated logic:
        // e.g., check if ALL required documents for this user are VERIFIED.
        if ("DRIVING_LICENSE".equals(docInfo.getDocumentType())) { // Example: If verifying DL makes them a driver
             // Check if this is the final document needed to approve a driver
             boolean allRequiredDocsVerified = checkAllRequiredDocsVerified(user.getId());
             if (allRequiredDocsVerified) {
                user.setDriverStatus("APPROVED"); // Or some enum
                userRepository.save(user);
                log.info("User {} driver status set to APPROVED after document {} verification.", user.getEmail(), documentId);
                // Send notification to user about driver approval
             } else {
                log.info("Document {} for user {} verified, but not all required documents are verified yet.", documentId, user.getEmail());
             }
        }
    }

    DocumentInfo updatedDocInfo = documentInfoRepository.save(docInfo);
    // Send notification to user about document status change (verified, rejected)
    // notificationService.sendDocumentStatusUpdate(docInfo.getUserId(), updatedDocInfo.getDocumentType(), newStatus, rejectionReason);

    return convertToDto(updatedDocInfo);
}

 // Helper method - you'll need to implement this based on your business rules
 private boolean checkAllRequiredDocsVerified(String userId) {
    // Example logic:
    // 1. Define what document types are mandatory for a driver (e.g., "DRIVING_LICENSE", "VEHICLE_REGISTRATION")
    List<String> requiredTypes = List.of("DRIVING_LICENSE", "VEHICLE_REGISTRATION"); // Make this configurable
    List<DocumentInfo> userDocuments = documentInfoRepository.findByUserId(userId);

    for (String requiredType : requiredTypes) {
        boolean foundAndVerified = userDocuments.stream()
            .anyMatch(doc -> requiredType.equals(doc.getDocumentType()) && doc.getStatus() == DocumentStatus.VERIFIED);
        if (!foundAndVerified) {
            return false; // A required document is missing or not verified
        }
    }
    return true; // All required documents are present and verified
}


    private boolean isValidDocumentType(String documentType) {
        // Implement this if you have a fixed list of allowed document types
        // e.g., List.of("DRIVING_LICENSE", "VEHICLE_REGISTRATION", "INSURANCE_POLICY").contains(documentType.toUpperCase())
      
        return true; // For now, allow any

        
    }

    private DocumentInfoDTO convertToDto(DocumentInfo docInfo) {
        if (docInfo == null) return null;
        DocumentInfoDTO dto = new DocumentInfoDTO();
        dto.setId(docInfo.getId());
        dto.setUserId(docInfo.getUserId());
        dto.setDocumentType(docInfo.getDocumentType());
        dto.setOriginalFilename(docInfo.getOriginalFilename());
        dto.setContentType(docInfo.getContentType());
        dto.setSize(docInfo.getSize());
        dto.setFilePath(docInfo.getFilePath()); // For admin/internal use, or transform to a download URL
        dto.setUploadedAt(docInfo.getUploadedAt());
        dto.setStatus(docInfo.getStatus());
        return dto;
    }

    
}