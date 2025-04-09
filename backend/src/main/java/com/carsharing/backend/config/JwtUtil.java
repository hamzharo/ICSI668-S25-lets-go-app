package com.carsharing.backend.config;

import java.nio.charset.StandardCharsets; // Updated import
import java.util.Date;
import java.util.List;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.slf4j.Logger; // New import for Keys
import org.slf4j.LoggerFactory; // Updated import
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts; // New import for SecretKey
import io.jsonwebtoken.MalformedJwtException; // New import for charset
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

@Component
public class JwtUtil {

    // Keep your secret - ensure it's strong and ideally externalized
    private final String SECRET_STRING = "secret-key-needs-to-be-much-longer-and-more-secure-than-this";
    // Create a secure key from the secret string
    private final SecretKey SECRET_KEY = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    public String generateToken(String email, List<String> roles) {
        try {
            log.debug("Generating token for email: {}", email);
            String token = Jwts.builder()
                    .setSubject(email)
                    .claim("roles", roles)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400_000)) // 1 day (underscore for readability)
                    .signWith(SECRET_KEY) // Use the SecretKey object
                    .compact();
            log.debug("Token generated successfully.");
            return token;
        } catch (Exception e) {
            log.error("Error generating token for email {}: {}", email, e.getMessage(), e);
            throw new RuntimeException("Token generation failed", e);
        }
    }

    // Helper function to extract claims
    private Claims extractAllClaims(String token) {
        // Use the SecretKey for parsing
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Helper function to extract a specific claim
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked") // Suppress warning for casting Object to List<String>
    public List<String> extractRoles(String token) {
        // claims.get("roles", List.class) is often preferred if types are guaranteed
        return extractClaim(token, claims -> (List<String>) claims.get("roles"));
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token) { // Simplified validation
        try {
            // Parsing the claims automatically validates signature and expiration
            extractAllClaims(token);
            return true; // If parsing succeeds without exception, it's valid
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token is malformed: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("JWT signature validation failed: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty or invalid: {}", e.getMessage());
        } catch (Exception e) { // Catch any other potential parsing errors
             log.error("JWT token validation failed unexpectedly: {}", e.getMessage());
        }
        return false;
    }
}