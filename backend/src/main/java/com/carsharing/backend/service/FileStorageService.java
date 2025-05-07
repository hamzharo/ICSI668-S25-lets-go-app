package com.carsharing.backend.service;

import com.carsharing.backend.exception.FileStorageException; // Ensure this custom exception exists
import com.carsharing.backend.exception.ResourceNotFoundException;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);
    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("Created/verified upload directory: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            String errorMsg = "Could not create the directory where the uploaded files will be stored: " + this.fileStorageLocation;
            log.error(errorMsg, ex);
            throw new FileStorageException(errorMsg, ex);
        }
    }

    public String storeFile(MultipartFile file, String userId, String documentType) {
        if (file.isEmpty()) {
            throw new FileStorageException("Failed to store empty file.");
        }
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        if (originalFilename == null || originalFilename.isBlank()) {
             throw new FileStorageException("Failed to store file with invalid filename.");
        }

        try {
            if (originalFilename.contains("..")) {
                throw new FileStorageException("Filename contains invalid path sequence: " + originalFilename);
            }

            String fileExtension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0 && dotIndex < originalFilename.length() - 1) {
                fileExtension = originalFilename.substring(dotIndex);
            }

            String uniqueFileNameBase = userId + "_" + documentType.toUpperCase().replace(" ", "_") + "_" + UUID.randomUUID().toString();
            String storedFilename = uniqueFileNameBase + fileExtension;

            Path targetLocation = this.fileStorageLocation.resolve(storedFilename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Stored file '{}' as '{}' for user '{}', type '{}'", originalFilename, storedFilename, userId, documentType);
            return storedFilename; // Return only the filename, not the full path

        } catch (IOException ex) {
            log.error("Could not store file {} for user {}. Please try again!", originalFilename, userId, ex);
            throw new FileStorageException("Could not store file " + originalFilename + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                log.error("Could not read file or file does not exist: {}", filePath.toString());
                throw new ResourceNotFoundException("File not found: " + fileName); // More specific exception
            }
        } catch (MalformedURLException ex) {
            log.error("File not found (Malformed URL for filename): {}", fileName, ex);
            throw new ResourceNotFoundException("File not found: " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
            log.info("Successfully deleted file from storage: {}", fileName);
        } catch (IOException ex) {
            log.error("Could not delete file from storage: {}", fileName, ex);
            // Depending on policy, you might want to re-throw this as a custom exception
            // throw new FileStorageException("Could not delete file " + fileName + ". Please try again!", ex);
        }
    }
}