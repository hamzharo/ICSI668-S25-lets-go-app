package com.carsharing;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.carsharing.backend.model.User;
import com.carsharing.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;


// @SpringBootApplication
// public class Application {


//     public static void main(String[] args) {
//         SpringApplication.run(Application.class, args);
//     }

//     @Bean
//     CommandLineRunner initDatabase(UserRepository userRepository) {

//         return args -> {
//             // Avoid duplicates
//             if (userRepository.findByEmail("test@pullcar.com").isEmpty()) {
//                 User user = new User();
//                 user.setEmail("test@pullcar.com");
//                 user.setPassword("123456"); // This should ideally be encoded
//                 user.setRoles(List.of("DRIVER"));

//                 userRepository.save(user);
//                 System.out.println("✅ Test user inserted into MongoDB");
//             } else {
//                 System.out.println("ℹ️ Test user already exists");
            
//             }
//             System.out.println("Mongo URI: " + System.getProperty("spring.data.mongodb.uri"));

//         };
//     }
// }

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   @Value("${spring.data.mongodb.uri}") String mongoUri) {
        return args -> {
            System.out.println("Mongo URI: " + mongoUri);

            if (userRepository.findByEmail("test@pullcar.com").isEmpty()) {
                User user = new User();
                user.setEmail("test@pullcar.com");
                user.setPassword("123456");
                user.setRoles(List.of("DRIVER"));
                userRepository.save(user);
                System.out.println("✅ Test user inserted into MongoDB");
            } else {
                System.out.println("ℹ️ Test user already exists");
            }
        };
    }
}

