package com.carsharing.backend.repository; // <-- FIX: Add correct package

import com.carsharing.backend.model.ChatMessage; // <-- FIX: Import ChatMessage model
import org.springframework.data.domain.Sort;       // <-- FIX: Import Sort
import org.springframework.data.mongodb.repository.MongoRepository; // <-- FIX: Import MongoRepository
import java.util.List;                             // <-- FIX: Import List

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // Ensure you uncommented or added one of these method signatures previously
    List<ChatMessage> findByRideId(String rideId, Sort sort);
    // List<ChatMessage> findByRideIdOrderByTimestampAsc(String rideId); // Alternatively

}