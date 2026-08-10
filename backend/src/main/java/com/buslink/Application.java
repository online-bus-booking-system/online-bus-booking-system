package com.buslink;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.buslink.entities.User;
import com.buslink.entities.UserRole;
import com.buslink.repository.UserRepository;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	public CommandLineRunner dataInitializer(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			JdbcTemplate jdbcTemplate) {
		return args -> {
			// Ensure bookings.user_id column is NULLable for anonymous guest user bookings
			try {
				jdbcTemplate.execute("ALTER TABLE bookings MODIFY COLUMN user_id BIGINT NULL");
				System.out.println(">>> SUCCESS: Altered bookings.user_id column to NULLable for anonymous bookings");
			} catch (Exception e) {
				System.out.println(">>> Note on bookings.user_id column alter: " + e.getMessage());
			}

			// Always guarantee Admin account with valid BCrypt password 'admin123'
			User admin = userRepository.findByEmail("admin@gmail.com").orElseGet(() -> {
				User u = new User();
				u.setEmail("admin@gmail.com");
				return u;
			});
			admin.setFullName("System Admin");
			admin.setPassword(passwordEncoder.encode("admin123"));
			admin.setPhone("+91 98765 00000");
			admin.setGender("Male");
			admin.setRole(UserRole.ROLE_ADMIN);
			admin.setIsDeleted(false);
			admin.setDeactivationStatus("NONE");
			userRepository.save(admin);
			System.out.println(">>> GUARANTEED ADMIN ACCOUNT READY: admin@gmail.com / admin123");
		};
	}
}
