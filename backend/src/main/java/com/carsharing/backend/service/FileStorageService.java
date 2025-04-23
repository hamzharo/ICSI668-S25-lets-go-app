// package com.carsharing.backend.service;

// import java.beans.JavaBean;
// import java.io.IOException;
// import java.io.InputStream;
// import java.nio.file.Files;
// import java.nio.file.Path;
// import java.nio.file.StandardCopyOption;
// import java.util.UUID;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.stereotype.Service;
// import org.springframework.util.StringUtils; // Correct import

// import org.springframework.web.multipart.MultipartFile;

// import com.carsharing.backend.exception.FileStorageException;

// import lombok.Data;




// @JavaBean
// @Data
// @Service
// public class FileStorageService {

//     private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

//     private final Path fileStorageLocation;

// /**
//      * Stores the given file, generating a unique filename.
//      * @param file The file uploaded by the user.
//      * @return The uniquely generated filename (including extension) where the file was stored.
//      * @throws FileStorageException if the file cannot be stored.
//      */
//     public String storeFile(MultipartFile file) {
//         if (file.isEmpty()) {
//              throw new FileStorageException("Failed to store empty file.");
//         }

//        //Handle potential null filename
//     String originalFilenameNullable = file.getOriginalFilename();
//     if (originalFilenameNullable == null) {
//         throw new FileStorageException("Failed to store file with null filename.");
//     }
//     String originalFilename = StringUtils.cleanPath(originalFilenameNullable);

//     String fileExtension = "";
//         try {
//             // Basic validation
//             if (originalFilename.contains("..")) {
//                 throw new FileStorageException("Sorry! Filename contains invalid path sequence " + originalFilename);
//             }
//             // Get extension
//             // Get extension
            
//             int dotIndex = originalFilename.lastIndexOf('.');
//             if (dotIndex > 0) {
//                  fileExtension = originalFilename.substring(dotIndex);
//             }
//              // Add more robust validation (file type checking using content, size check if not handled by Spring)

//             // Generate unique filename (UUID + extension)
//             String storedFilename = UUID.randomUUID().toString() + fileExtension;

//             // Copy file to the target location (Replacing existing file with the same name)
//             Path targetLocation = this.fileStorageLocation.resolve(storedFilename);
//             try (InputStream inputStream = file.getInputStream()) {
//                 Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
//                 log.info("Stored file '{}' as '{}' at target location '{}'", originalFilename, storedFilename, targetLocation);
//             }

//             return storedFilename;

//         } catch (IOException ex) {
//              log.error("Could not store file {}. Please try again!", originalFilename, ex);
//             throw new FileStorageException("Could not store file " + originalFilename + ". Please try again!", ex);
//         }
//     }

//      // Optional: Method to load file as Resource (needed for viewing/downloading later)
//      // public Resource loadFileAsResource(String filename) { ... }

//      // Optional: Method to delete file (needed if user profile/docs are deleted)
//      // public void deleteFile(String filename) { ... }
// }


package com.carsharing.backend.service;

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
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

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
}