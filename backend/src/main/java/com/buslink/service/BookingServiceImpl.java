package com.buslink.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ApiException;
import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.BookingRequestDto;
import com.buslink.dtos.BookingResponseDto;
import com.buslink.dtos.CancelBookingDto;
import com.buslink.dtos.TripDto;
import com.buslink.entities.Booking;
import com.buslink.entities.BookingPassenger;
import com.buslink.entities.Cancellation;
import com.buslink.entities.GuestContact;
import com.buslink.entities.Payment;
import com.buslink.entities.Trip;
import com.buslink.entities.TripSeat;
import com.buslink.entities.User;
import com.buslink.repository.BookingPassengerRepository;
import com.buslink.repository.BookingRepository;
import com.buslink.repository.CancellationRepository;
import com.buslink.repository.GuestContactRepository;
import com.buslink.repository.PaymentRepository;
import com.buslink.repository.TripRepository;
import com.buslink.repository.TripSeatRepository;
import com.buslink.repository.UserRepository;
import com.buslink.utility.DoubleBookingValidator;
import com.buslink.utility.PnrGenerator;
import com.buslink.utility.QrCodeGenerator;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

	private final BookingRepository bookingRepository;
	private final BookingPassengerRepository bookingPassengerRepository;
	private final UserRepository userRepository;
	private final GuestContactRepository guestContactRepository;
	private final TripRepository tripRepository;
	private final TripSeatRepository tripSeatRepository;
	private final PaymentRepository paymentRepository;
	private final CancellationRepository cancellationRepository;

	// To follow Single Responsibility Principle (SRP), these separate utility classes are created and used in BookingService.
	private final PnrGenerator pnrGenerator;
	private final QrCodeGenerator qrCodeGenerator;
	private final DoubleBookingValidator doubleBookingValidator;

	@Override
	public BookingResponseDto createBooking(Long userId, BookingRequestDto bookingRequest) {
		User user = (userId != null && userId > 0) ? userRepository.findById(userId).orElse(null) : null;

		GuestContact guestContact = null;
		// For anonymous guest users only: store contact details in guest_contacts table
		if (user == null) {
			guestContact = new GuestContact();
			guestContact.setFullName(bookingRequest.getPassengerName() != null ? bookingRequest.getPassengerName() : "Guest Passenger");
			guestContact.setEmail(bookingRequest.getPassengerEmail() != null ? bookingRequest.getPassengerEmail() : "guest@buslink.com");
			guestContact.setPhone(bookingRequest.getPassengerPhone() != null ? bookingRequest.getPassengerPhone() : "+91 99999 00000");
			guestContact = guestContactRepository.save(guestContact);
		}

		Trip trip = tripRepository.findById(bookingRequest.getTripId())
				.orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + bookingRequest.getTripId()));

		// 1. Validate Seats Availability to Prevent Double Booking (SRP DoubleBookingValidator)
		List<TripSeat> tripSeats = tripSeatRepository.findByTripId(trip.getId());
		doubleBookingValidator.validateSeatsAvailability(tripSeats, bookingRequest.getSelectedSeats());

		// 2. Generate PNR Number (SRP PnrGenerator)
		String pnrNumber = pnrGenerator.generatePnr();

		// 3. Create & Save Booking (PNR stored in Bookings table as required)
		Booking booking = new Booking();
		booking.setPnrNumber(pnrNumber);
		booking.setUser(user); // Nullable for anonymous guest users
		booking.setGuestContact(guestContact); // Linked to guest_contacts table for anonymous users
		booking.setTrip(trip);
		booking.setBoardingPoint(bookingRequest.getBoardingPoint());
		booking.setDroppingPoint(bookingRequest.getDroppingPoint());
		booking.setTotalFare(bookingRequest.getTotalFare());
		booking.setBookingStatus("CONFIRMED");

		// Generate QR Payload (SRP QrCodeGenerator)
		String qrData = qrCodeGenerator.generateQrData(pnrNumber, bookingRequest.getPassengerName(), bookingRequest.getTotalFare(), trip.getBus().getBusNumber());
		booking.setQrCodeData(qrData);

		Booking savedBooking = bookingRepository.save(booking);

		// 4. Save Passengers & Lock Seats in TripSeat
		if (bookingRequest.getPassengers() != null) {
			for (BookingRequestDto.PassengerDetailDto passDto : bookingRequest.getPassengers()) {
				BookingPassenger passenger = new BookingPassenger();
				passenger.setBooking(savedBooking);
				passenger.setPassengerName(passDto.getName());
				passenger.setAge(passDto.getAge());
				passenger.setGender(passDto.getGender());
				passenger.setSeatNumber(passDto.getSeat());
				bookingPassengerRepository.save(passenger);

				// Update seat status in TripSeat to BOOKED
				tripSeatRepository.findByTripIdAndSeatNumberWithLock(trip.getId(), passDto.getSeat())
						.ifPresent(ts -> {
							ts.setSeatStatus("BOOKED");
							tripSeatRepository.save(ts);
						});
			}
		}

		// 5. Mock Payment Processing
		Payment payment = new Payment();
		payment.setBooking(savedBooking);
		payment.setTransactionId("TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
		payment.setPaymentMethod(bookingRequest.getPaymentMethod() != null ? bookingRequest.getPaymentMethod() : "UPI");
		payment.setAmount(bookingRequest.getTotalFare());
		payment.setDiscountAmount(0.0);
		payment.setPaymentStatus(Boolean.FALSE.equals(bookingRequest.getPaymentSuccess()) ? "FAILED" : "SUCCESS");
		paymentRepository.save(payment);

		if ("FAILED".equals(payment.getPaymentStatus())) {
			throw new ApiException("Payment transaction failed. Please retry payment.");
		}

		return mapBookingToDto(savedBooking);
	}

	@Override
	public List<BookingResponseDto> getCustomerBookings(Long userId) {
		return bookingRepository.findByUserIdOrderByBookingDateDesc(userId).stream()
				.map(this::mapBookingToDto)
				.collect(Collectors.toList());
	}

	@Override
	public BookingResponseDto getBookingByPnr(String pnrNumber) {
		Booking booking = bookingRepository.findByPnrNumber(pnrNumber)
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found with PNR: " + pnrNumber));
		return mapBookingToDto(booking);
	}

	@Override
	public BookingResponseDto getBookingByPnrAndPhone(String pnrNumber, String mobileNumber) {
		Booking booking = bookingRepository.findByPnrNumber(pnrNumber.trim())
				.orElseThrow(() -> new ResourceNotFoundException("No booking ticket found matching PNR: " + pnrNumber));

		if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
			String cleanTargetPhone = mobileNumber.replaceAll("\\D", "");
			
			String userPhone = booking.getUser() != null ? booking.getUser().getPhone() : null;
			String guestPhone = booking.getGuestContact() != null ? booking.getGuestContact().getPhone() : null;
			
			boolean matchUser = userPhone != null && userPhone.replaceAll("\\D", "").endsWith(cleanTargetPhone);
			boolean matchGuest = guestPhone != null && guestPhone.replaceAll("\\D", "").endsWith(cleanTargetPhone);

			if (!matchUser && !matchGuest) {
				throw new ResourceNotFoundException("Provided Mobile Number does not match the booking records for PNR: " + pnrNumber);
			}
		}

		return mapBookingToDto(booking);
	}

	@Override
	public List<BookingResponseDto> getOperatorBookings(Long operatorId) {
		return bookingRepository.findByTripBusOperatorIdOrderByBookingDateDesc(operatorId).stream()
				.map(this::mapBookingToDto)
				.collect(Collectors.toList());
	}

	@Override
	public void cancelBooking(Long userId, CancelBookingDto cancelDto) {
		Booking booking = bookingRepository.findById(cancelDto.getBookingId())
				.orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + cancelDto.getBookingId()));

		if ("CANCELLED".equalsIgnoreCase(booking.getBookingStatus())) {
			throw new ApiException("Booking is already cancelled.");
		}

		booking.setBookingStatus("CANCELLED");
		bookingRepository.save(booking);

		// Calculate refund (80% refund default)
		double refundAmount = cancelDto.getRefundAmount() != null ? cancelDto.getRefundAmount() : (booking.getTotalFare() * 0.8);
		double fee = booking.getTotalFare() - refundAmount;

		// Record in Cancellation table
		Cancellation cancellation = new Cancellation();
		cancellation.setBooking(booking);
		cancellation.setOperator(booking.getTrip().getBus().getOperator());
		cancellation.setRefundAmount(refundAmount);
		cancellation.setCancellationFee(fee);
		cancellation.setCancellationReason(cancelDto.getCancellationReason() != null ? cancelDto.getCancellationReason() : "Customer requested cancellation");
		cancellationRepository.save(cancellation);

		// Mark Payment status as REFUNDED
		paymentRepository.findByBookingId(booking.getId()).ifPresent(p -> {
			p.setPaymentStatus("REFUNDED");
			paymentRepository.save(p);
		});

		// Free up booked seats in TripSeat
		List<BookingPassenger> passengers = bookingPassengerRepository.findByBookingId(booking.getId());
		for (BookingPassenger p : passengers) {
			tripSeatRepository.findByTripIdAndSeatNumber(booking.getTrip().getId(), p.getSeatNumber())
					.ifPresent(ts -> {
						ts.setSeatStatus("AVAILABLE");
						tripSeatRepository.save(ts);
					});
		}
	}

	private BookingResponseDto mapBookingToDto(Booking booking) {
		BookingResponseDto dto = new BookingResponseDto();
		dto.setId(booking.getId());
		dto.setPnrNumber(booking.getPnrNumber());
		if (booking.getUser() != null) {
			dto.setPassengerName(booking.getUser().getFullName());
			dto.setPassengerEmail(booking.getUser().getEmail());
			dto.setPassengerPhone(booking.getUser().getPhone());
		} else if (booking.getGuestContact() != null) {
			dto.setPassengerName(booking.getGuestContact().getFullName());
			dto.setPassengerEmail(booking.getGuestContact().getEmail());
			dto.setPassengerPhone(booking.getGuestContact().getPhone());
		}
		dto.setTotalFare(booking.getTotalFare());
		dto.setBookingStatus(booking.getBookingStatus());
		dto.setQrCodeData(booking.getQrCodeData());
		dto.setBoardingPoint(booking.getBoardingPoint());
		dto.setDroppingPoint(booking.getDroppingPoint());
		dto.setBookingDate(booking.getBookingDate());

		// Payment status
		paymentRepository.findByBookingId(booking.getId()).ifPresent(p -> {
			dto.setPaymentMethod(p.getPaymentMethod());
			dto.setPaymentStatus(p.getPaymentStatus());
		});

		// Passengers
		List<BookingPassenger> passengers = bookingPassengerRepository.findByBookingId(booking.getId());
		dto.setPassengers(passengers.stream()
				.map(p -> new BookingRequestDto.PassengerDetailDto(p.getPassengerName(), p.getAge(), p.getGender(), p.getSeatNumber()))
				.collect(Collectors.toList()));

		// Trip info
		Trip trip = booking.getTrip();
		if (trip != null) {
			dto.setTravelDate(trip.getDepartureDate());
			dto.setDepartureTime(trip.getDepartureTime() != null ? trip.getDepartureTime().toString() : null);

			TripDto tripDto = new TripDto();
			tripDto.setId(trip.getId());
			tripDto.setDepartureDate(trip.getDepartureDate());
			tripDto.setDepartureTime(trip.getDepartureTime());
			tripDto.setArrivalTime(trip.getArrivalTime());
			tripDto.setPrice(trip.getTicketPrice());
			tripDto.setStatus(trip.getStatus());
			dto.setTrip(tripDto);
		}

		return dto;
	}
}
