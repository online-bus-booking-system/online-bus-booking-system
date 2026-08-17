package com.buslink.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OperatorAuditDetailsDto {
    private Long operatorId;
    private String companyName;
    private String fullName;
    private String email;
    private String phone;
    private String city;
    private Double rating;
    private String approvalStatus;
    private Boolean isActive;
    private String deactivationStatus;
    private String deactivationReason;

    // Fleet Details (No Revenue)
    private List<BusAuditDto> buses;

    // Route Details
    private List<RouteAuditDto> routes;

    // Trip Counts (No Revenue)
    private long totalTripsCount;
    private long completedTripsCount;
    private long scheduledTripsCount;

    // Customer Reviews
    private List<ReviewAuditDto> reviews;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusAuditDto {
        private Long id;
        private String busName;
        private String busNumber;
        private String busType;
        private Integer totalSeats;
        private String layoutType;
        private String amenities;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteAuditDto {
        private Long id;
        private String sourceCity;
        private String destinationCity;
        private Integer distanceKm;
        private String duration;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewAuditDto {
        private Long id;
        private String customerName;
        private Double rating;
        private String comment;
        private String reviewDate;
    }
}
