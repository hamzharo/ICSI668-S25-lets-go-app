package com.carsharing.backend.repository;

import com.carsharing.backend.model.DocumentInfo;
import com.carsharing.backend.model.DocumentStatus;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentInfoRepository extends MongoRepository<DocumentInfo, String> {
    List<DocumentInfo> findByUserId(String userId);
    Optional<DocumentInfo> findByIdAndUserId(String id, String userId);
    List<DocumentInfo> findByStatus(DocumentStatus status);
}