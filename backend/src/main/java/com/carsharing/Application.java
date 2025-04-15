package com.carsharing;

import java.util.List;
import java.util.Optional;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;

// Import your Model and Repository classes
import com.carsharing.backend.model.Role;
import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.RoleRepository;
import com.carsharing.backend.repository.UserRepository;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   RoleRepository roleRepository,      // Inject RoleRepository
                                   PasswordEncoder passwordEncoder,   // Inject PasswordEncoder
                                   @Value("${spring.data.mongodb.uri}") String mongoUri) {
        return args -> {
            System.out.println("Mongo URI: " + mongoUri);

            // --- Initialize Required Roles ---
            // Ensure standard roles exist in the database before creating users
            initializeRoleIfNotFound(roleRepository, "DRIVER");
            initializeRoleIfNotFound(roleRepository, "PASSENGER"); // Base functional role
            initializeRoleIfNotFound(roleRepository, "ADMIN");

            // --- Initialize Test User ---
            String testUserEmail = "test@pullcar.com";
            if (userRepository.findByEmail(testUserEmail).isEmpty()) {
                User user = new User();
                user.setName("Test DriverPassenger"); // Give a descriptive name
                user.setEmail(testUserEmail);

                // --- Encode the Password ---
                user.setPassword(passwordEncoder.encode("123456")); // Encode password!

                // --- Assign Roles ---
                // Give the test user both roles for flexibility during testing
                user.setRoles(List.of("DRIVER", "PASSENGER"));

                userRepository.save(user);
                System.out.println("✅ Test user '" + testUserEmail + "' inserted into MongoDB with roles: " + user.getRoles());
            } else {
                System.out.println("ℹ️ Test user '" + testUserEmail + "' already exists.");
                // Optional: You might want to ensure the existing test user has the desired roles
                // during development for consistency after code changes.
                userRepository.findByEmail(testUserEmail).ifPresent(u -> {
                    if (!u.getRoles().containsAll(List.of("DRIVER", "PASSENGER"))) {
                         u.setRoles(List.of("DRIVER", "PASSENGER"));
                         userRepository.save(u);
                         System.out.println("ℹ️ Updated roles for test user '" + testUserEmail + "' to DRIVER, PASSENGER.");
                    }
                });
            }
        };
    }

    /**
     * Helper method to create a Role only if it doesn't already exist.
     *
     * @param roleRepository The repository to interact with the roles collection.
     * @param roleName       The name of the role to check/create (e.g., "DRIVER").
     */
    private void initializeRoleIfNotFound(RoleRepository roleRepository, String roleName) {
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (roleOpt.isEmpty()) {
            roleRepository.save(new Role(roleName));
            System.out.println("✅ Role '" + roleName + "' created.");
        } else {
             System.out.println("ℹ️ Role '" + roleName + "' already exists.");
        }
    }
}