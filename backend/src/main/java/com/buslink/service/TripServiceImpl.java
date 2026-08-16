package com.buslink.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.OperatorNotActiveException;
import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.BusDto;
import com.buslink.dtos.RouteDto;
import com.buslink.dtos.TripDto;
import com.buslink.entities.Bus;
import com.buslink.entities.BusOperator;
import com.buslink.entities.Route;
import com.buslink.entities.Seat;
import com.buslink.entities.Trip;
import com.buslink.entities.TripSeat;
import com.buslink.repository.BookingRepository;
import com.buslink.repository.BusRepository;
import com.buslink.repository.RouteRepository;
import com.buslink.repository.SeatRepository;
import com.buslink.repository.TripRepository;
import com.buslink.repository.TripSeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

	private final TripRepository tripRepository;
	private final BusRepository busRepository;
	private final RouteRepository routeRepository;
	private final SeatRepository seatRepository;
	private final TripSeatRepository tripSeatRepository;
	private final BookingRepository bookingRepository;

	@Override
	public TripDto createTrip(TripDto tripDto) {
		Bus bus = busRepository.findById(tripDto.getBusId())
				.orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + tripDto.getBusId()));

		BusOperator operator = bus.getOperator();
		if (!Boolean.TRUE.equals(operator.getIsActive())
				|| !"APPROVED".equalsIgnoreCase(operator.getApprovalStatus())
				|| Boolean.TRUE.equals(operator.getUser().getIsDeleted())
				|| "APPROVED".equalsIgnoreCase(operator.getUser().getDeactivationStatus())
				|| "DEACTIVATED_BY_ADMIN".equalsIgnoreCase(operator.getUser().getDeactivationStatus())) {
			throw new OperatorNotActiveException("Your operator account is currently deactivated by Admin. You are not allowed to schedule trips.");
		}

		Route route = routeRepository.findById(tripDto.getRouteId())
				.orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + tripDto.getRouteId()));

		Trip trip = new Trip();
		trip.setBus(bus);
		trip.setRoute(route);
		trip.setDepartureDate(tripDto.getDepartureDate() != null ? tripDto.getDepartureDate() : LocalDate.now());
		trip.setDepartureTime(tripDto.getDepartureTime() != null ? tripDto.getDepartureTime() : LocalTime.of(22, 30));
		trip.setArrivalTime(tripDto.getArrivalTime() != null ? tripDto.getArrivalTime() : LocalTime.of(6, 0));
		trip.setTicketPrice(tripDto.getPrice() != null ? tripDto.getPrice() : 850.0);
		trip.setStatus("SCHEDULED");

		Trip savedTrip = tripRepository.save(trip);

		// Initialize TripSeats for double booking prevention tracking
		List<Seat> busSeats = seatRepository.findByBusId(bus.getId());
		for (Seat seat : busSeats) {
			TripSeat tripSeat = new TripSeat();
			tripSeat.setTrip(savedTrip);
			tripSeat.setSeat(seat);
			tripSeat.setSeatNumber(seat.getSeatNumber());
			tripSeat.setSeatStatus("AVAILABLE");
			tripSeatRepository.save(tripSeat);
		}

		return mapTripToDto(savedTrip);
	}

	@Override
	public List<TripDto> searchActiveTrips(String source, String destination, LocalDate date) {
		LocalDate searchDate = date != null ? date : LocalDate.now();
		List<Trip> activeTrips = tripRepository.searchActiveTrips(source, destination, searchDate);

		return activeTrips.stream()
				.map(this::mapTripToDto)
				.collect(Collectors.toList());
	}

	@Override
	public TripDto getTripById(Long tripId) {
		Trip trip = tripRepository.findById(tripId)
				.orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
		return mapTripToDto(trip);
	}

	@Override
	public List<TripDto> getTripsByOperator(Long operatorId) {
		return tripRepository.findByBusOperatorId(operatorId).stream()
				.map(this::mapTripToDto)
				.collect(Collectors.toList());
	}

	@Override
	public void cancelTripByOperator(Long tripId, Long operatorId) {
		Trip trip = tripRepository.findById(tripId)
				.orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));

		if (!trip.getBus().getOperator().getId().equals(operatorId)) {
			throw new IllegalStateException("Unauthorized: Trip does not belong to this operator.");
		}

		if ("CANCELLED".equalsIgnoreCase(trip.getStatus())) {
			throw new IllegalStateException("Trip is already cancelled.");
		}

		// Count booked seats from TripSeats and Bookings
		List<TripSeat> tripSeats = tripSeatRepository.findByTripId(tripId);
		long bookedSeatsCount = tripSeats.stream()
				.filter(ts -> "BOOKED".equalsIgnoreCase(ts.getSeatStatus()) || "LOCKED".equalsIgnoreCase(ts.getSeatStatus()))
				.count();

		if (bookedSeatsCount > 0) {
			throw new IllegalStateException("Cannot cancel trip because " + bookedSeatsCount + " seat(s) have already been booked by passengers. Operator can only cancel trips with 0 bookings.");
		}

		trip.setStatus("CANCELLED");
		tripRepository.save(trip);
	}

	private TripDto mapTripToDto(Trip trip) {
		TripDto dto = new TripDto();
		dto.setId(trip.getId());
		dto.setBusId(trip.getBus().getId());
		dto.setRouteId(trip.getRoute().getId());
		dto.setDepartureDate(trip.getDepartureDate());
		dto.setDepartureTime(trip.getDepartureTime());
		dto.setArrivalTime(trip.getArrivalTime());
		dto.setPrice(trip.getTicketPrice());
		dto.setStatus(trip.getStatus());

		// Bus info
		Bus bus = trip.getBus();
		BusDto busDto = new BusDto();
		busDto.setId(bus.getId());
		busDto.setName(bus.getBusName());
		busDto.setBusNumber(bus.getBusNumber());
		busDto.setBusType(bus.getBusType());
		busDto.setTotalSeats(bus.getTotalSeats());
		busDto.setLayout(bus.getLayoutType());
		dto.setBus(busDto);

		// Route info
		Route route = trip.getRoute();
		RouteDto routeDto = new RouteDto();
		routeDto.setId(route.getId());
		routeDto.setSourceCity(route.getSourceCity());
		routeDto.setDestinationCity(route.getDestinationCity());
		routeDto.setDistanceKm(route.getDistanceKm());
		routeDto.setDuration(route.getDuration());
		dto.setRoute(routeDto);

		// Booked seats list
		List<TripSeat> tripSeats = tripSeatRepository.findByTripId(trip.getId());
		List<String> bookedSeats = tripSeats.stream()
				.filter(ts -> "BOOKED".equalsIgnoreCase(ts.getSeatStatus()) || "LOCKED".equalsIgnoreCase(ts.getSeatStatus()))
				.map(TripSeat::getSeatNumber)
				.collect(Collectors.toList());
		dto.setBookedSeats(bookedSeats);

		return dto;
	}
}
