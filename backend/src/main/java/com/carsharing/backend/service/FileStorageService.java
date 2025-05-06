package com.carsharing.backend.service;

<<<<<<< HEAD
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths; // Make sure Paths is imported
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value; // Make sure Value is imported
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils; // Correct import
import org.springframework.web.multipart.MultipartFile;

import com.carsharing.backend.exception.FileStorageException;

// REMOVED LOMBOK CLASS-LEVEL ANNOTATIONS
=======
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct; // For Spring Boot 3+
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

<<<<<<< HEAD
    private final Path fileStorageLocation; // Final field

    // --- THIS CONSTRUCTOR IS REQUIRED ---
    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        // Initialize the final field using the value from properties
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Create the directory if it doesn't exist
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Created/verified upload directory: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create the directory where the uploaded files will be stored.", ex);
            throw new FileStorageException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }
    // --- END OF REQUIRED CONSTRUCTOR ---


    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
             throw new FileStorageException("Failed to store empty file.");
        }

        String originalFilenameNullable = file.getOriginalFilename();
        if (originalFilenameNullable == null) {
            throw new FileStorageException("Failed to store file with null filename.");
        }
        String originalFilename = StringUtils.cleanPath(originalFilenameNullable);

        String fileExtension = "";
        try {
            if (originalFilename.contains("..")) {
                throw new FileStorageException("Sorry! Filename contains invalid path sequence " + originalFilename);
            }

            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                 fileExtension = originalFilename.substring(dotIndex);
            }

            String storedFilename = UUID.randomUUID().toString() + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(storedFilename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
                log.info("Stored file '{}' as '{}' at target location '{}'", originalFilename, storedFilename, targetLocation);
            }

            return storedFilename;

        } catch (IOException ex) {
             log.error("Could not store file {}. Please try again!", originalFilename, ex);
            throw new FileStorageException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

     // Optional: Methods for load/delete
=======
    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        log.info("File storage location initialized to: {}", this.fileStorageLocation.toString());
    }

    @PostConstruct // Ensures this runs after the bean is constructed and properties are injected
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Created directory for file uploads: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create the directory where the uploaded files will be stored.", ex);
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String userId, String documentType) {
        // Normalize file name
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        try {
            // Basic security check for filename
            if (originalFilename.contains("..")) {
                log.error("Invalid path sequence in filename: {}", originalFilename);
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFilename);
            }

            int i = originalFilename.lastIndexOf('.');
            if (i > 0) {
                fileExtension = originalFilename.substring(i); // .jpg, .pdf
            }

            // Generate a unique filename to prevent overwrites and for better organization
            // e.g., userId_documentType_uuid.extension
            String uniqueFileName = userId + "_" + documentType.replaceAll("\\s+", "_") + "_" + UUID.randomUUID().toString() + fileExtension;

            // Copy file to the target location (Replacing existing file with the same name if any)
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Stored file {} successfully at {}", uniqueFileName, targetLocation.toString());
            return uniqueFileName; // Return the generated unique filename (which is part of the path)
        } catch (IOException ex) {
            log.error("Could not store file {}. Please try again!", originalFilename, ex);
            throw new RuntimeException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                log.error("Could not read file or file does not exist: {}", fileName);
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            log.error("File not found (Malformed URL): {}", fileName, ex);
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("Successfully deleted file: {}", fileName);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", fileName, ex);
            // Decide if this should throw an exception or just log
        }
    }
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)
}