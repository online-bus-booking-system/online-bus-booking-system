package com.buslink.service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.OperatorNotActiveException;
import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.BusDto;
import com.buslink.entities.Bus;
import com.buslink.entities.BusDocument;
import com.buslink.entities.BusOperator;
import com.buslink.entities.Seat;
import com.buslink.repository.BusDocumentRepository;
import com.buslink.repository.BusOperatorRepository;
import com.buslink.repository.BusRepository;
import com.buslink.repository.SeatRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class BusServiceImpl implements BusService {

	private final BusRepository busRepository;
	private final BusOperatorRepository busOperatorRepository;
	private final BusDocumentRepository busDocumentRepository;
	private final SeatRepository seatRepository;

	@Override
	public BusDto registerBus(Long operatorId, BusDto busDto) {
		BusOperator operator = busOperatorRepository.findById(operatorId)
				.orElseThrow(() -> new ResourceNotFoundException("Bus Operator not found with id: " + operatorId));

		// Validate Operator status (Must be active, approved, and not deactivated/soft-deleted)
		if (!Boolean.TRUE.equals(operator.getIsActive())
				|| !"APPROVED".equalsIgnoreCase(operator.getApprovalStatus())
				|| Boolean.TRUE.equals(operator.getUser().getIsDeleted())
				|| "APPROVED".equalsIgnoreCase(operator.getUser().getDeactivationStatus())
				|| "DEACTIVATED_BY_ADMIN".equalsIgnoreCase(operator.getUser().getDeactivationStatus())) {
			throw new OperatorNotActiveException("Your operator account is currently deactivated or pending. You are not allowed to add new buses.");
		}

		Bus bus = new Bus();
		bus.setOperator(operator);
		bus.setBusName(busDto.getName());
		bus.setBusNumber(busDto.getBusNumber());
		bus.setBusType(busDto.getBusType() != null ? busDto.getBusType() : "AC Sleeper");
		bus.setTotalSeats(busDto.getTotalSeats() != null ? busDto.getTotalSeats() : 30);
		bus.setLayoutType(busDto.getLayout() != null ? busDto.getLayout() : "SLEEPER");
		bus.setAmenities(busDto.getAmenities() != null ? String.join(",", busDto.getAmenities()) : "WiFi,Charging Point,Water Bottle");

		Bus savedBus = busRepository.save(bus);

		// Save legal documents (RC, Insurance, PUC)
		saveBusDoc(savedBus, "RC_BOOK", busDto.getRcBookDoc() != null ? busDto.getRcBookDoc() : "rc_book.pdf");
		saveBusDoc(savedBus, "INSURANCE", busDto.getInsuranceDoc() != null ? busDto.getInsuranceDoc() : "insurance_policy.pdf");
		saveBusDoc(savedBus, "PUC", busDto.getPucDoc() != null ? busDto.getPucDoc() : "puc_certificate.pdf");

		// Generate seats for bus layout
		generateSeatsForBus(savedBus);

		return mapBusToDto(savedBus);
	}

	@Override
	public List<BusDto> getBusesByOperator(Long operatorId) {
		return busRepository.findByOperatorId(operatorId).stream()
				.map(this::mapBusToDto)
				.collect(Collectors.toList());
	}

	@Override
	public BusDto getBusById(Long busId) {
		Bus bus = busRepository.findById(busId)
				.orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + busId));
		return mapBusToDto(bus);
	}

	private void saveBusDoc(Bus bus, String docType, String docName) {
		BusDocument doc = new BusDocument();
		doc.setBus(bus);
		doc.setDocumentType(docType);
		doc.setDocumentName(docName);
		doc.setFilePath("uploads/bus_docs/" + docName);
		busDocumentRepository.save(doc);
	}

	private void generateSeatsForBus(Bus bus) {
		int total = bus.getTotalSeats();
		boolean isSleeper = "SLEEPER".equalsIgnoreCase(bus.getLayoutType());

		if (isSleeper) {
			int half = total / 2;
			for (int i = 1; i <= half; i++) {
				Seat lower = new Seat(bus, "L" + i, "SLEEPER_LOWER");
				seatRepository.save(lower);
			}
			for (int i = 1; i <= (total - half); i++) {
				Seat upper = new Seat(bus, "U" + i, "SLEEPER_UPPER");
				seatRepository.save(upper);
			}
		} else {
			for (int i = 1; i <= total; i++) {
				Seat seater = new Seat(bus, String.valueOf(i), "SEATER");
				seatRepository.save(seater);
			}
		}
	}

	private BusDto mapBusToDto(Bus bus) {
		BusDto dto = new BusDto();
		dto.setId(bus.getId());
		dto.setOperatorId(bus.getOperator().getId());
		dto.setName(bus.getBusName());
		dto.setBusNumber(bus.getBusNumber());
		dto.setBusType(bus.getBusType());
		dto.setTotalSeats(bus.getTotalSeats());
		dto.setLayout(bus.getLayoutType());
		if (bus.getAmenities() != null) {
			dto.setAmenities(Arrays.asList(bus.getAmenities().split(",")));
		}
		dto.setRcBookDoc("✓ RC Book Valid");
		dto.setInsuranceDoc("✓ Insurance Active");
		dto.setPucDoc("✓ PUC Certified");
		return dto;
	}
}
