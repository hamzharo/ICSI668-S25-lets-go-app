package com.carsharing.backend.dto;

// No need to import List

public class SignupRequest {
    private String name; // Make sure frontend sends this
    private String email;
    private String password;
    // roles field removed

    // Getters
    public String getName() {
        return name;
    }
    public String getEmail() {
        return email;
    }
    public String getPassword() {
        return password;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    // roles setter removed
}