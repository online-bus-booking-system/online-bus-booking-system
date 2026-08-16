package com.buslink.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.buslink.custom_exceptions.ResourceNotFoundException;
import com.buslink.dtos.RouteDto;
import com.buslink.entities.BusOperator;
import com.buslink.entities.Route;
import com.buslink.entities.RouteStop;
import com.buslink.entities.Stop;
import com.buslink.repository.BusOperatorRepository;
import com.buslink.repository.RouteRepository;
import com.buslink.repository.RouteStopRepository;
import com.buslink.repository.StopRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService {

	private final RouteRepository routeRepository;
	private final BusOperatorRepository busOperatorRepository;
	private final RouteStopRepository routeStopRepository;
	private final StopRepository stopRepository;

	@Override
	public RouteDto createRoute(RouteDto routeDto, Long operatorId) {
		Long opId = operatorId != null ? operatorId : routeDto.getOperatorId();
		BusOperator operator = null;
		if (opId != null) {
			operator = busOperatorRepository.findById(opId).orElse(null);
		}

		Route route;
		if (operator != null) {
			final BusOperator op = operator;
			route = routeRepository.findByOperatorIdAndSourceCityIgnoreCaseAndDestinationCityIgnoreCase(
					op.getId(), routeDto.getSourceCity(), routeDto.getDestinationCity())
					.orElseGet(() -> {
						Route newRoute = new Route();
						newRoute.setOperator(op);
						newRoute.setSourceCity(routeDto.getSourceCity());
						newRoute.setDestinationCity(routeDto.getDestinationCity());
						newRoute.setDistanceKm(routeDto.getDistanceKm() != null ? routeDto.getDistanceKm() : 180);
						newRoute.setDuration(routeDto.getDuration() != null ? routeDto.getDuration() : "4 hrs 30 mins");
						return routeRepository.save(newRoute);
					});
		} else {
			route = routeRepository.findBySourceCityIgnoreCaseAndDestinationCityIgnoreCase(
					routeDto.getSourceCity(), routeDto.getDestinationCity())
					.orElseGet(() -> {
						Route newRoute = new Route();
						newRoute.setSourceCity(routeDto.getSourceCity());
						newRoute.setDestinationCity(routeDto.getDestinationCity());
						newRoute.setDistanceKm(routeDto.getDistanceKm() != null ? routeDto.getDistanceKm() : 180);
						newRoute.setDuration(routeDto.getDuration() != null ? routeDto.getDuration() : "4 hrs 30 mins");
						return routeRepository.save(newRoute);
					});
		}

		// Save dynamic Boarding points
		if (routeDto.getBoardingPoints() != null) {
			for (RouteDto.StopDto stopDto : routeDto.getBoardingPoints()) {
				Stop stop = new Stop();
				stop.setLocationName(stopDto.getLocation());
				stop.setCity(routeDto.getSourceCity());
				stop.setLandmark(stopDto.getLandmark());
				Stop savedStop = stopRepository.save(stop);

				RouteStop routeStop = new RouteStop();
				routeStop.setRoute(route);
				routeStop.setStop(savedStop);
				routeStop.setLocationName(stopDto.getLocation());
				routeStop.setLandmark(stopDto.getLandmark());
				routeStop.setScheduledTime(stopDto.getTime());
				routeStop.setStopType("BOARDING");
				routeStopRepository.save(routeStop);
			}
		}

		// Save dynamic Dropping points
		if (routeDto.getDroppingPoints() != null) {
			for (RouteDto.StopDto stopDto : routeDto.getDroppingPoints()) {
				Stop stop = new Stop();
				stop.setLocationName(stopDto.getLocation());
				stop.setCity(routeDto.getDestinationCity());
				stop.setLandmark(stopDto.getLandmark());
				Stop savedStop = stopRepository.save(stop);

				RouteStop routeStop = new RouteStop();
				routeStop.setRoute(route);
				routeStop.setStop(savedStop);
				routeStop.setLocationName(stopDto.getLocation());
				routeStop.setLandmark(stopDto.getLandmark());
				routeStop.setScheduledTime(stopDto.getTime());
				routeStop.setStopType("DROPPING");
				routeStopRepository.save(routeStop);
			}
		}

		return mapRouteToDto(route);
	}

	@Override
	public List<RouteDto> getRoutesByOperator(Long operatorId) {
		return routeRepository.findByOperatorId(operatorId).stream()
				.map(this::mapRouteToDto)
				.collect(Collectors.toList());
	}

	@Override
	public List<RouteDto> getAllRoutes() {
		return routeRepository.findAll().stream()
				.map(this::mapRouteToDto)
				.collect(Collectors.toList());
	}

	@Override
	public RouteDto getRouteById(Long routeId) {
		Route route = routeRepository.findById(routeId)
				.orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + routeId));
		return mapRouteToDto(route);
	}

	private RouteDto mapRouteToDto(Route route) {
		RouteDto dto = new RouteDto();
		dto.setId(route.getId());
		dto.setOperatorId(route.getOperator() != null ? route.getOperator().getId() : null);
		dto.setSourceCity(route.getSourceCity());
		dto.setDestinationCity(route.getDestinationCity());
		dto.setDistanceKm(route.getDistanceKm());
		dto.setDuration(route.getDuration());

		List<RouteStop> boardingStops = routeStopRepository.findByRouteIdAndStopType(route.getId(), "BOARDING");
		dto.setBoardingPoints(boardingStops.stream().map(s -> new RouteDto.StopDto(
				s.getStop() != null ? s.getStop().getLocationName() : s.getLocationName(),
				s.getStop() != null ? s.getStop().getLandmark() : s.getLandmark(),
				s.getScheduledTime()
		)).collect(Collectors.toList()));

		List<RouteStop> droppingStops = routeStopRepository.findByRouteIdAndStopType(route.getId(), "DROPPING");
		dto.setDroppingPoints(droppingStops.stream().map(s -> new RouteDto.StopDto(
				s.getStop() != null ? s.getStop().getLocationName() : s.getLocationName(),
				s.getStop() != null ? s.getStop().getLandmark() : s.getLandmark(),
				s.getScheduledTime()
		)).collect(Collectors.toList()));

		return dto;
	}
}
