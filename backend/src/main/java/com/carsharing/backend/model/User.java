package com.carsharing.backend.model;

import java.util.List;
import java.util.ArrayList; // Import ArrayList

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field; // Import Field


import lombok.Data;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
<<<<<<< HEAD
    private List<String> roles; 
    private String driverStatus; // e.g., "NONE", "PENDING_APPROVAL", "APPROVED", "REJECTED"
=======
    private List<String> roles;
    private String driverStatus;  
>>>>>>> 916f811 (Completed user document upload and admin verification system with file storage, metadata handling, and user status update logic.)

    @Field("documents") // Optional, good practice
    private List<DocumentInfo> documents = new ArrayList<>(); // Initialize to avoid nulls

   
    public User() {
        this.driverStatus = "NONE";
        this.documents = new ArrayList<>(); 
    }


    public User(String id, String name, String email, String password, List<String> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.driverStatus = "NONE"; 
        this.documents = new ArrayList<>();
    }

    // === Getters and Setters ===

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getDriverStatus() { return driverStatus; }
    public void setDriverStatus(String driverStatus) { this.driverStatus = driverStatus; }

    // Getter and Setter for the new field
    public List<DocumentInfo> getDocuments() { return documents; }
    public void setDocuments(List<DocumentInfo> documents) { this.documents = documents; }
}

