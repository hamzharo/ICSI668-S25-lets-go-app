package com.carsharing.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Ensure this is imported
import org.springframework.security.config.Customizer; // Import for withDefaults
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List; // Import List

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays; // Import Arrays


@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Keep this
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
        // Apply CORS configuration FIRST
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless APIs
        .authorizeHttpRequests(authz -> authz
            // Allow access to root, health, and authentication endpoints
            .requestMatchers("/", "/api/auth/**", "/api/health", "api/driver/**").permitAll()
            // Secure all other requests
            .anyRequest().authenticated()
        )
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

    http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();

        // http.csrf(csrf -> csrf.disable()) // Disable CSRF for stateless APIs
        //     .authorizeHttpRequests(authz -> authz
        //         // Allow access to root and authentication endpoints
        //         .requestMatchers("/", "/api/auth/**", "/api/health").permitAll() // Added health check here too
        //         // Secure all other requests - specific authorization handled by @PreAuthorize
        //         .anyRequest().authenticated()
        //     )
        //     // Make session management stateless - essential for JWT
        //     .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // // Add the JWT filter before the standard UsernamePasswordAuthenticationFilter
        // http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        // return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // IMPORTANT: Set the allowed origin explicitly
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        // Allow common methods including OPTIONS
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Allow all headers (you might want to restrict this in production)
        configuration.setAllowedHeaders(List.of("*"));
        // IMPORTANT: Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        // How long the result of a preflight request can be cached
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
    // --- Add this CORS Configuration Bean ---
//     @Bean
//     CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();
//         // IMPORTANT: Allow the origin of your frontend development server
//         configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
//         // Allow common methods
//         configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
//         // Allow common headers, including Authorization for JWT
//         configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
//         // Allow credentials (important if you were using cookies/sessions, less critical for pure JWT but good practice)
//         // configuration.setAllowCredentials(true); // Uncomment if needed later

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/api/**", configuration); // Apply CORS to all /api paths
//         return source;
//     }
//     // --- End of CORS Configuration Bean ---
// }
