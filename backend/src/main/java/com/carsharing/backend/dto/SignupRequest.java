package com.carsharing.backend.dto;

import java.util.List;

public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private List<String> roles;

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
    public List<String> getRoles() {
        return roles;
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
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
