package com.carsharing.backend.dto;

import com.carsharing.backend.model.DocumentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentInfoDTO {
    private String id;
    private String userId;
    private String documentType;
    private String originalFilename;
    private String contentType;
    private long size;
    private String filePath; // Or a download URL if you construct one
    private LocalDateTime uploadedAt;
    private DocumentStatus status;
}