package com.carsharing.backend.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.carsharing.backend.model.Role;


public interface RoleRepository extends MongoRepository<Role, String> {
    Optional<Role> findByName(String name);
}
