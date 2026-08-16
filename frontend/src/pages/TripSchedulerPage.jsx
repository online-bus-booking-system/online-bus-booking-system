import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scheduleTripAction, setTripsAction, setBusesAction, setRoutesAction } from '../slices/busSlice';
import { Plus, Eye, AlertOctagon, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { createTrip, cancelTripByOperator, getTripsByOperator, getBusesByOperator, getRoutesByOperator, getAllRoutes } from '../services/busservice';

const formatTo24Hour = (timeStr) => {
  if (!timeStr) return '08:00';
  const clean = timeStr.trim();
  if (/^\d{2}:\d{2}$/.test(clean)) return clean;
  if (/^\d{2}:\d{2}:\d{2}$/.test(clean)) return clean.substring(0, 5);

  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return '08:00';
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const modifier = match[3];
  if (modifier) {
    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

function TripSchedulerPage() {
  const dispatch = useDispatch();
  const { trips, buses, routes } = useSelector((store) => store.bus);
  const { user } = useSelector((store) => store.auth);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTripForMap, setSelectedTripForMap] = useState(null);

  const [selectedBusId, setSelectedBusId] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [arrivalTime, setArrivalTime] = useState('11:30');
  const [price, setPrice] = useState(750);
  const [cancellingId, setCancellingId] = useState(null);

  const isAccountDeactivated = user?.isActive === false || user?.deactivationStatus === 'APPROVED' || user?.deactivationStatus === 'DEACTIVATED_BY_ADMIN';

  const fetchTripData = async () => {
    if (user?.id) {
      try {
        const liveBuses = await getBusesByOperator(user.id);
        if (liveBuses) dispatch(setBusesAction(liveBuses));

        let liveRoutes = await getRoutesByOperator(user.id);
        if (!liveRoutes || liveRoutes.length === 0) {
          liveRoutes = await getAllRoutes();
        }
        if (liveRoutes) dispatch(setRoutesAction(liveRoutes));

        const liveTrips = await getTripsByOperator(user.id);
        if (liveTrips) dispatch(setTripsAction(liveTrips));
      } catch (err) {
        console.warn('API error in TripSchedulerPage:', err);
      }
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [user, dispatch]);

  useEffect(() => {
    if (buses.length > 0 && !selectedBusId) setSelectedBusId(buses[0].id);
    if (routes.length > 0 && !selectedRouteId) setSelectedRouteId(routes[0].id);
  }, [buses, routes, selectedBusId, selectedRouteId]);

  const handleOpenSchedule = () => {
    if (isAccountDeactivated) {
      toast.error('Your operator account is deactivated by Admin. You are not allowed to schedule trips.');
      return;
    }
    setShowScheduleModal(true);
  };

  const handleCancelTrip = async (trip) => {
    const bookedCount = trip.bookedSeats?.length || 0;
    if (bookedCount > 0) {
      toast.error(`Cannot cancel trip because ${bookedCount} seat(s) have already been booked by passengers. Operator can only cancel trips with 0 bookings.`);
      return;
    }

    if (window.confirm(`Are you sure you want to cancel Trip #${trip.id}? Since 0 seats are booked, this trip will be cancelled.`)) {
      setCancellingId(trip.id);
      try {
        await cancelTripByOperator(trip.id, user.id);
        toast.success(`Trip #${trip.id} cancelled successfully!`);
        fetchTripData();
      } catch (err) {
        toast.error(err.message || 'Failed to cancel trip');
      } finally {
        setCancellingId(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAccountDeactivated) {
      toast.error('Your operator account is deactivated by Admin. You cannot schedule trips.');
      return;
    }

    if (!selectedBusId) {
      toast.error('Please select a bus fleet for the trip');
      return;
    }

    if (!selectedRouteId) {
      toast.error('Please select a route for the trip');
      return;
    }

    if (!price || price < 100) {
      toast.error('Ticket price must be at least ₹100');
      return;
    }

    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }

    try {
      const payload = {
        busId: selectedBusId,
        routeId: selectedRouteId,
        departureDate: departureDate,
        departureTime: formatTo24Hour(departureTime),
        arrivalTime: formatTo24Hour(arrivalTime),
        price: price
      };

      const savedTrip = await createTrip(payload);
      dispatch(scheduleTripAction(savedTrip || payload));
      toast.success('Trip scheduled & published successfully!');
      setShowScheduleModal(false);
      fetchTripData();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule trip');
    }
  };

  return (
    <div className="container py-4">
      {isAccountDeactivated && (
        <div className="alert alert-danger d-flex align-items-center gap-3 p-3 rounded-3 shadow-sm mb-4 border-2 border-danger">
          <AlertOctagon size={32} className="text-danger flex-shrink-0" />
          <div>
            <h5 className="fw-extrabold mb-1">Operator Account Deactivated</h5>
            <p className="mb-0 small">
              Your account status is set to <strong>INACTIVE</strong> by Admin. You are strictly not allowed to schedule new trips or publish departures.
            </p>
          </div>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h3 className="brand-font fw-extrabold mb-1">Trip Scheduling & Live Status</h3>
          <p className="text-muted small mb-0">Schedule new bus departures, set ticket fares, and manage active trips (cancellation allowed only for trips with 0 bookings).</p>
        </div>
        <button
          className="btn btn-buslink-primary fw-bold"
          onClick={handleOpenSchedule}
          disabled={isAccountDeactivated}
        >
          <Plus size={16} className="me-1" /> Schedule New Trip
        </button>
      </div>

      <div className="buslink-card p-4 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Trip ID</th>
                <th>Bus & Category</th>
                <th>Route</th>
                <th>Departure Date & Time</th>
                <th>Ticket Price</th>
                <th>Occupancy</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No trips scheduled yet. Click "Schedule New Trip" to publish bus departures.
                  </td>
                </tr>
              ) : (
                trips.map((t) => {
                  const bus = t.bus || buses.find((b) => b.id === t.busId);
                  const route = t.route || routes.find((r) => r.id === t.routeId);
                  const bookedCount = t.bookedSeats?.length || 0;
                  const isCancelled = t.status === 'CANCELLED';

                  return (
                    <tr key={t.id}>
                      <td className="fw-bold font-monospace">#{t.id}</td>
                      <td>
                        <strong className="d-block text-dark">{bus?.name}</strong>
                        <span className="small text-muted">{bus?.busType} ({bus?.busNumber})</span>
                      </td>
                      <td>
                        <strong className="d-block text-dark">{route?.sourceCity || route?.source} ➔ {route?.destinationCity || route?.destination}</strong>
                        <span className="small text-muted">{route?.distanceKm} km ({route?.duration})</span>
                      </td>
                      <td>
                        <span className="d-block fw-bold text-dark">{t.departureDate}</span>
                        <span className="small text-muted">{t.departureTime}</span>
                      </td>
                      <td className="fw-extrabold text-success fs-6">₹{t.price}</td>
                      <td>
                        <span className={`badge ${bookedCount > 0 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {bookedCount} / {bus?.totalSeats || 30} Seats
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isCancelled ? 'bg-danger' : 'bg-success-subtle text-success border border-success'} fw-bold`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-outline-dark btn-sm fw-semibold" onClick={() => setSelectedTripForMap(t)}>
                            <Eye size={14} className="me-1" /> Seat Grid
                          </button>
                          {!isCancelled && (
                            <button
                              className="btn btn-outline-danger btn-sm fw-bold d-inline-flex align-items-center gap-1"
                              onClick={() => handleCancelTrip(t)}
                              disabled={cancellingId === t.id}
                              title={bookedCount > 0 ? 'Cannot cancel trip with booked seats' : 'Cancel scheduled trip'}
                            >
                              <XCircle size={14} /> Cancel Trip
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showScheduleModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Schedule New Trip</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowScheduleModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Bus Fleet</label>
                    <select className="form-select" value={selectedBusId} onChange={(e) => setSelectedBusId(e.target.value)}>
                      {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.busNumber}) - {b.totalSeats} Seats
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Route</label>
                    <select className="form-select" value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)}>
                      {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.sourceCity || r.source} ➔ {r.destinationCity || r.destination} ({r.distanceKm} km)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Departure Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Ticket Price (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="200"
                        max="5000"
                        required
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Departure Time</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Arrival Time</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-buslink-primary w-100 fw-bold">
                    Schedule Trip
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTripForMap && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Live Seat Occupancy Map</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTripForMap(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="d-flex flex-wrap gap-2 justify-content-center p-3 bg-light rounded border">
                  {selectedTripForMap.bookedSeats?.length === 0 ? (
                    <span className="text-muted small">No seats booked yet for this trip.</span>
                  ) : (
                    selectedTripForMap.bookedSeats?.map((seat) => (
                      <span key={seat} className="badge bg-dark text-warning p-2 fs-6">
                        Seat {seat} (Booked)
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripSchedulerPage;
