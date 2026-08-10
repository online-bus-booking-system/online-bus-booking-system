package com.buslink.security;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtils {

	@Value("${jwt.secret}")
	private String jwtSecret;

	@Value("${jwt.expiration}")
	private int jwtExpirationMs;

	private Key key;

	@PostConstruct
	public void init() {
		key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
	}

	public String generateJwtToken(Authentication authentication) {
		CustomUserDetailsImpl userPrincipal = (CustomUserDetailsImpl) authentication.getPrincipal();
		List<String> roles = userPrincipal.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toList());

		return Jwts.builder()
				.subject(userPrincipal.getUsername())
				.claim("id", userPrincipal.getUser().getId())
				.claim("fullName", userPrincipal.getUser().getFullName())
				.claim("roles", roles)
				.issuedAt(new Date())
				.expiration(new Date((new Date()).getTime() + jwtExpirationMs))
				.signWith(key)
				.compact();
	}

	public String getUserNameFromJwtToken(String token) {
		return Jwts.parser()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody()
				.getSubject();
	}

	public Claims getClaimsFromJwtToken(String token) {
		return Jwts.parser()
				.setSigningKey(key)
				.build()
				.parseClaimsJws(token)
				.getBody();
	}

	public boolean validateJwtToken(String authToken) {
		try {
			Jwts.parser().setSigningKey(key).build().parseClaimsJws(authToken);
			return true;
		} catch (Exception e) {
			System.err.println("Invalid JWT Token: " + e.getMessage());
		}
		return false;
	}
}
