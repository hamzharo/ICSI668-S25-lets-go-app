package com.carsharing.backend.dto; // Make sure this package exists or adjust as needed

import java.util.List;

public class UserDTO {

    private String id;
    private String name;
    private String email;
    private List<String> roles;
    private String driverStatus;
    
    public UserDTO(String id, String name, String email, List<String> roles, String driverStatus) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.driverStatus = driverStatus;
    }

    public UserDTO() {
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }

    public String getDriverStatus() {
        return driverStatus;
    }


    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public void setDriverStatus(String driverStatus) {
        this.driverStatus = driverStatus;
    }


    @Override
    public String toString() {
        return "UserDTO{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", roles=" + roles +
                ", driverStatus='" + driverStatus + '\'' +
                '}';
    }


}