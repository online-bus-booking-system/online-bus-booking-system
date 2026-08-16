import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchParamsAction, setSelectedTripAction, setTripsAction } from '../slices/busSlice';
import { MapPin, Calendar, ArrowRightLeft, Search, Filter, ArrowUpDown, ChevronRight, Bus } from 'lucide-react';
import { toast } from 'react-toastify';
import { searchTrips } from '../services/busservice';

const formatDisplayTime = (timeVal) => {
  if (!timeVal) return '08:00 AM';
  if (Array.isArray(timeVal)) {
    const h = timeVal[0];
    const m = timeVal[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  const str = String(timeVal).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
  }
  return str;
};

function BusSearch() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resultsRef = useRef(null);

  const { buses, trips, searchParams } = useSelector((store) => store.bus);

  const [source, setSource] = useState(searchParams.source || 'Pune');
  const [destination, setDestination] = useState(searchParams.destination || 'Mumbai');
  const [departureDate, setDepartureDate] = useState(searchParams.date || '');

  // Filters State
  const [selectedBusTypes, setSelectedBusTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState('departure');

  const CITIES = ['Pune', 'Mumbai', 'Goa', 'Delhi', 'Manali', 'Bangalore', 'Hyderabad', 'Nagpur'];

  useEffect(() => {
    const fetchLiveTrips = async () => {
      try {
        const liveTrips = await searchTrips(source, destination, departureDate);
        if (liveTrips && liveTrips.length > 0) {
          dispatch(setTripsAction(liveTrips));
        }
      } catch (err) {
        console.warn('API trip search error:', err);
      }
    };
    fetchLiveTrips();
  }, [source, destination, departureDate, dispatch]);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!source || !source.trim()) {
      toast.error('Please select a source city');
      return;
    }

    if (!destination || !destination.trim()) {
      toast.error('Please select a destination city');
      return;
    }

    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      toast.error('Source and Destination cities cannot be the same');
      return;
    }

    if (!departureDate) {
      toast.error('Please select a travel date');
      return;
    }

    dispatch(setSearchParamsAction({ source, destination, date: departureDate }));
    const liveTrips = await searchTrips(source, destination, departureDate);
    if (liveTrips) dispatch(setTripsAction(liveTrips));

    // Smooth scroll down to available buses section
    resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSeats = (tripData) => {
    dispatch(setSelectedTripAction(tripData));
    navigate('/seat-selection');
  };

  // Filter Matching
  const matchedTrips = trips.filter((t) => {
    if (t.status === 'DEPARTED' || t.status === 'COMPLETED') return false;
    if (t.price > maxPrice) return false;

    const busType = t.bus?.busType || t.busType;
    if (selectedBusTypes.length > 0 && busType && !selectedBusTypes.includes(busType)) return false;

    return true;
  });

  const sortedTrips = [...matchedTrips].sort((a, b) => {
    if (sortBy === 'price_low') return a.price - b.price;
    return String(a.departureTime || '').localeCompare(String(b.departureTime || ''));
  });

  const toggleBusType = (type) => {
    setSelectedBusTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="hero-banner text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 brand-font fw-extrabold mb-0" style={{ letterSpacing: '-1px' }}>
                Book Bus Tickets at <span style={{ color: 'var(--buslink-orange)' }}>Best Prices</span>
              </h1>
            </div>
          </div>

          {/* Search Card Container */}
          <div className="row justify-content-center hero-search-wrapper">
            <div className="col-lg-10">
              <div className="buslink-card bg-white text-dark p-4 shadow-lg border-0">
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                        <MapPin size={14} className="me-1 text-buslink-orange" /> From City
                      </label>
                      <select
                        className="form-select form-select-lg fs-6 fw-bold"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      >
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-1 text-center d-none d-md-block">
                      <button
                        type="button"
                        className="btn btn-light rounded-circle shadow-sm border p-2 text-primary"
                        onClick={handleSwap}
                        title="Swap Cities"
                      >
                        <ArrowRightLeft size={16} />
                      </button>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                        <MapPin size={14} className="me-1 text-buslink-orange" /> To City
                      </label>
                      <select
                        className="form-select form-select-lg fs-6 fw-bold"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      >
                        {CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-1">
                        <Calendar size={14} className="me-1 text-buslink-orange" /> Travel Date
                      </label>
                      <input
                        type="date"
                        className="form-control form-control-lg fs-6 fw-bold"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                      />
                    </div>

                    <div className="col-md-2">
                      <button type="submit" className="btn btn-buslink-primary w-100 py-3 fw-bold fs-6 shadow-sm">
                        <Search size={18} className="me-1" /> Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Results Content */}
      <section className="py-5 bg-light" ref={resultsRef} style={{ paddingTop: '110px' }}>
        <div className="container">
          <div className="row g-4">
            {/* Sidebar Filters */}
            <div className="col-lg-3">
              <div className="buslink-card p-4 bg-white border-0 shadow-sm sticky-top" style={{ top: '90px' }}>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h6 className="fw-bold mb-0 brand-font d-flex align-items-center gap-2">
                    <Filter size={16} /> Filter Results
                  </h6>
                  <button
                    className="btn btn-sm text-muted p-0 small text-decoration-underline"
                    onClick={() => {
                      setSelectedBusTypes([]);
                      setMaxPrice(2000);
                    }}
                  >
                    Reset
                  </button>
                </div>

                {/* Bus Type Filter */}
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted text-uppercase mb-2">Bus Type</label>
                  {['AC Sleeper', 'AC Seater', 'Non-AC Seater'].map((type) => (
                    <div key={type} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`filter-${type}`}
                        checked={selectedBusTypes.includes(type)}
                        onChange={() => toggleBusType(type)}
                      />
                      <label className="form-check-label small cursor-pointer" htmlFor={`filter-${type}`}>
                        {type}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Price Range Filter */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold text-muted text-uppercase mb-0">Max Ticket Price</label>
                    <span className="fw-bold text-buslink-orange">₹{maxPrice}</span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="400"
                    max="2000"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                  <div className="d-flex justify-content-between small text-muted">
                    <span>₹400</span>
                    <span>₹2000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="col-lg-9">
              {/* Header sorting bar */}
              <div className="buslink-card p-3 bg-white mb-4 border-0 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                  <h5 className="fw-bold mb-0 text-dark brand-font">
                    {source} ➔ {destination}
                  </h5>
                  <span className="small text-muted">
                    Showing <strong>{sortedTrips.length}</strong> available scheduled buses
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted fw-bold d-flex align-items-center gap-1">
                    <ArrowUpDown size={14} /> Sort By:
                  </span>
                  <select
                    className="form-select form-select-sm fw-bold border-0 bg-light"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="departure">Departure Time</option>
                    <option value="price_low">Price: Low to High</option>
                  </select>
                </div>
              </div>

              {/* Bus Cards List */}
              {sortedTrips.length === 0 ? (
                <div className="buslink-card p-5 text-center bg-white border-0 shadow-sm">
                  <Bus size={48} className="text-muted mb-3 opacity-50" />
                  <h4 className="fw-bold brand-font">No Active Buses Found</h4>
                  <p className="text-muted small mb-0">
                    No active trips match your selected route ({source} to {destination}).
                  </p>
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {sortedTrips.map((trip) => {
                    const bus = trip.bus || buses.find((b) => b.id === trip.busId) || {
                      name: 'Express Volvo Multi-Axle',
                      busNumber: 'MH-12-PQ-9088',
                      busType: 'AC Sleeper',
                      totalSeats: 30,
                      amenities: ['WiFi', 'Charging Point', 'Water Bottle', 'Blanket']
                    };

                    const route = trip.route || { duration: '5h 00m' };
                    const bookedCount = trip.bookedSeats?.length || 0;
                    const availableSeats = (bus.totalSeats || 30) - bookedCount;

                    return (
                      <div key={trip.id} className="buslink-card p-4 bg-white border-0 shadow-sm hover-lift">
                        <div className="row align-items-center g-3">
                          {/* Bus Info Column */}
                          <div className="col-md-4">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="badge bg-dark text-warning font-monospace">{bus.busNumber}</span>
                              <span className="badge bg-success-subtle text-success border border-success">
                                {bus.busType}
                              </span>
                            </div>
                            <h5 className="fw-bold text-dark mb-1 brand-font">{bus.name}</h5>

                            <div className="d-flex flex-wrap gap-1 mt-2">
                              {bus.amenities?.slice(0, 3).map((am) => (
                                <span key={am} className="badge bg-light text-muted border small fw-normal">
                                  {am}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Time & Duration Column */}
                          <div className="col-md-5 text-center px-2">
                            <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                              <div className="text-center">
                                <span className="fs-5 fw-extrabold text-dark brand-font d-block font-monospace">
                                  {formatDisplayTime(trip.departureTime)}
                                </span>
                                <span className="small text-muted fw-semibold">{source}</span>
                              </div>

                              <div className="d-flex flex-column align-items-center px-2">
                                <span className="badge bg-light text-dark border small fw-semibold mb-1" style={{ fontSize: '0.75rem' }}>
                                  {route.duration || '5h 00m'}
                                </span>
                                <div className="d-flex align-items-center" style={{ marginTop: '-4px' }}>
                                  <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--buslink-orange)' }}></div>
                                  <ChevronRight size={14} className="text-buslink-orange" style={{ marginLeft: '-4px' }} />
                                </div>
                              </div>

                              <div className="text-center">
                                <span className="fs-5 fw-extrabold text-dark brand-font d-block font-monospace">
                                  {formatDisplayTime(trip.arrivalTime)}
                                </span>
                                <span className="small text-muted fw-semibold">{destination}</span>
                              </div>
                            </div>

                            <span className="badge bg-success-subtle text-success border border-success fw-bold">
                              {availableSeats} Seats Left
                            </span>
                          </div>

                          {/* Price & Select Seats Button */}
                          <div className="col-md-3 text-md-end border-start-md ps-md-3">
                            <span className="small text-muted d-block">Starts From</span>
                            <div className="fs-3 fw-extrabold text-dark brand-font mb-2">₹{trip.price}</div>
                            <button
                              className="btn btn-buslink-primary w-100 fw-bold py-2 shadow-sm d-flex align-items-center justify-content-center gap-1"
                              onClick={() => handleSelectSeats(trip)}
                            >
                              Select Seats <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default BusSearch;
