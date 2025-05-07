package com.carsharing.backend.controller;

import com.carsharing.backend.service.DocumentService; // We'll create this next

import com.carsharing.backend.dto.DocumentInfoDTO; // We'll create this DTO
import com.carsharing.backend.model.DocumentStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import java.util.List; // For listing documents later

@RestController
@RequestMapping("/api/documents") // Or /api/documents
public class DocumentController { // Or DocumentController

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private DocumentService documentService; // This service will coordinate FileStorageService and DocumentInfoRepository

    // Endpoint for a user to upload one of their documents
    @PostMapping("/me")
    @PreAuthorize("isAuthenticated()") // Any authenticated user can upload their own docs, or refine to hasRole('DRIVER')
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) { // e.g., "DRIVING_LICENSE"
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName(); // Assuming email is the principal

            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File cannot be empty.");
            }

            // Basic validation for documentType could be added here or in service
            if (documentType == null || documentType.trim().isEmpty()) {
                 return ResponseEntity.badRequest().body("Document type must be provided.");
            }

            log.info("User '{}' attempting to upload document of type: {}", userEmail, documentType);

            DocumentInfoDTO documentInfoDTO = documentService.storeDocument(file, documentType, userEmail);

            log.info("Document uploaded successfully for user '{}', file path: {}", userEmail, documentInfoDTO.getFilePath());
            return new ResponseEntity<>(documentInfoDTO, HttpStatus.CREATED);

        } catch (IllegalArgumentException e) {
            log.warn("Document upload failed for user {}: {}", SecurityContextHolder.getContext().getAuthentication().getName(), e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        catch (RuntimeException e) { // Catch broader runtime exceptions from FileStorageService
            log.error("Document upload failed for user {}: {}", SecurityContextHolder.getContext().getAuthentication().getName(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload document: " + e.getMessage());
        }
    }

    // Placeholder for user to get their own uploaded documents' metadata
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DocumentInfoDTO>> getMyDocuments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        List<DocumentInfoDTO> documents = documentService.getUserDocuments(userEmail);
        return ResponseEntity.ok(documents);
    }

    // Placeholder for user to delete one of their documents (if PENDING_VERIFICATION)
    @DeleteMapping("/me/documents/{documentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMyDocument(@PathVariable String documentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        documentService.deleteUserDocument(documentId, userEmail);
        return ResponseEntity.noContent().build();
    }


    /// --- ADMIN DOCUMENT MANAGEMENT ENDPOINTS ---

    /**
     * ADMIN: Get all documents, optionally filtered by status.
     */
    @GetMapping("/admin/all") // Consider a more descriptive path like /admin/documents
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DocumentInfoDTO>> getAllDocuments(
            @RequestParam(required = false) DocumentStatus status) {
        log.info("Admin request to get all documents, filtered by status: {}", status);
        List<DocumentInfoDTO> documents = documentService.getAllDocuments(status);
        return ResponseEntity.ok(documents);
    }

    /**
     * ADMIN: Get a specific document's metadata by its ID.
     */
    @GetMapping("/admin/{documentId}/metadata")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentInfoDTO> getDocumentMetadataById(@PathVariable String documentId) {
        log.info("Admin request for metadata of document ID: {}", documentId);
        DocumentInfoDTO documentInfoDTO = documentService.getDocumentMetadataById(documentId);
        return ResponseEntity.ok(documentInfoDTO);
    }

    /**
     * ADMIN: Securely download/view a specific document file.
     */
    @GetMapping("/admin/{documentId}/file")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.core.io.Resource> downloadDocumentFile(@PathVariable String documentId) {
        log.info("Admin request to download file for document ID: {}", documentId);
        // The service will prepare the resource and determine content type
        org.springframework.core.io.Resource fileResource = documentService.loadDocumentFileAsResource(documentId);
        DocumentInfoDTO metadata = documentService.getDocumentMetadataById(documentId); // Get metadata for content type & filename

        if (fileResource == null) {
            return ResponseEntity.notFound().build();
        }

        String contentType = metadata.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream"; // Default if unknown
        }

        return ResponseEntity.ok()
        // .contentType(MediaType.valueOf(contentType))  
         .contentType(MediaType.parseMediaType(contentType))
      
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFilename() + "\"") // Prompts download
                // Use "inline" instead of "attachment" if you want browser to try and display it directly
                // .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + metadata.getOriginalFilename() + "\"")
                .body(fileResource);
    }
    /**
     * ADMIN: Update the status of a document.
     */
    @PutMapping("/admin/{documentId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentInfoDTO> updateDocumentStatus(
            @PathVariable String documentId,
            @RequestParam DocumentStatus newStatus,
            @RequestParam(required = false) String rejectionReason) { // Optional rejection reason
        log.info("Admin request to update status of document ID: {} to {}. Reason: {}", documentId, newStatus, rejectionReason);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = authentication.getName(); // Or get admin user ID

        DocumentInfoDTO updatedDocument = documentService.updateDocumentStatus(documentId, newStatus, rejectionReason, adminEmail);
        return ResponseEntity.ok(updatedDocument);
    }

    
}