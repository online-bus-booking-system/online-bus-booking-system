import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSeatsAction } from '../slices/busSlice';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

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

function SeatSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedTripData = useSelector((store) => store.bus.selectedTrip);

  if (!selectedTripData) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold mb-3">No Bus Selected</h4>
        <button className="btn btn-buslink-primary fw-bold" onClick={() => navigate('/search')}>
          ← Go Back to Bus Search
        </button>
      </div>
    );
  }

  const trip = selectedTripData.trip || selectedTripData;
  const bus = selectedTripData.bus || trip.bus || { layout: 'SLEEPER', name: 'Volvo Multi-Axle', busType: 'AC Sleeper' };
  const route = selectedTripData.route || trip.route || {};
  const operator = selectedTripData.operator || bus.operator || { name: 'Express Line' };

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeDeck, setActiveDeck] = useState('LOWER');

  const bookedSeats = trip.bookedSeats || [];
  const ladiesSeats = trip.ladiesSeats || [];

  const handleSeatClick = (seatCode) => {
    if (bookedSeats.includes(seatCode)) return;

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatCode));
    } else {
      if (selectedSeats.length >= 6) {
        toast.warning('You can select a maximum of 6 seats per ticket.');
        return;
      }
      setSelectedSeats((prev) => [...prev, seatCode]);
    }
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least 1 seat');
      return;
    }
    dispatch(setSelectedSeatsAction(selectedSeats));
    navigate('/passenger-info');
  };

  const totalPrice = selectedSeats.length * (trip.price || 0);
  const isSleeper = (bus.layout || bus.layoutType) === 'SLEEPER' || (bus.busType && bus.busType.toLowerCase().includes('sleeper'));

  const renderSeaterGrid = () => {
    const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return (
      <div className="seat-grid-container text-center">
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span className="small text-muted fw-bold">FRONT / ENTRANCE</span>
          <span className="small text-secondary fw-bold">DRIVER 🛞</span>
        </div>

        <div className="d-grid gap-2">
          {rows.map((row) => {
            const seatA = `${row}A`;
            const seatB = `${row}B`;
            const seatC = `${row}C`;
            const seatD = `${row}D`;

            const getSeatClass = (code) => {
              if (bookedSeats.includes(code)) return 'seat-box booked';
              if (selectedSeats.includes(code)) return 'seat-box selected';
              if (ladiesSeats.includes(code)) return 'seat-box ladies';
              return 'seat-box available';
            };

            return (
              <div key={row} className="d-flex justify-content-center align-items-center gap-2">
                <div className={getSeatClass(seatA)} onClick={() => handleSeatClick(seatA)}>
                  {seatA}
                </div>
                <div className={getSeatClass(seatB)} onClick={() => handleSeatClick(seatB)}>
                  {seatB}
                </div>
                <div className="px-3 small text-muted font-monospace">AISLE</div>
                <div className={getSeatClass(seatC)} onClick={() => handleSeatClick(seatC)}>
                  {seatC}
                </div>
                <div className={getSeatClass(seatD)} onClick={() => handleSeatClick(seatD)}>
                  {seatD}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSleeperGrid = () => {
    const prefix = activeDeck === 'LOWER' ? 'L' : 'U';

    return (
      <div className="seat-grid-container text-center">
        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className={`btn btn-sm ${activeDeck === 'LOWER' ? 'btn-buslink-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveDeck('LOWER')}
          >
            LOWER DECK
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeDeck === 'UPPER' ? 'btn-buslink-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveDeck('UPPER')}
          >
            UPPER DECK
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <span className="small text-muted fw-bold">{activeDeck} DECK BERTHS</span>
          <span className="small text-secondary fw-bold">FRONT 🛞</span>
        </div>

        <div className="d-grid gap-3">
          {[1, 2, 3, 4, 5].map((row) => {
            const singleCode = `${prefix}${row * 3 - 2}`;
            const doubleCode1 = `${prefix}${row * 3 - 1}`;
            const doubleCode2 = `${prefix}${row * 3}`;

            const getBerthClass = (code) => {
              if (bookedSeats.includes(code)) return 'sleeper-berth booked';
              if (selectedSeats.includes(code)) return 'sleeper-berth selected';
              if (ladiesSeats.includes(code)) return 'sleeper-berth ladies';
              return 'sleeper-berth available';
            };

            return (
              <div key={row} className="d-flex justify-content-center align-items-center gap-3">
                <div className={getBerthClass(singleCode)} onClick={() => handleSeatClick(singleCode)}>
                  🛌 {singleCode}
                </div>
                <div className="px-2 small text-muted font-monospace">AISLE</div>
                <div className={getBerthClass(doubleCode1)} onClick={() => handleSeatClick(doubleCode1)}>
                  🛌 {doubleCode1}
                </div>
                <div className={getBerthClass(doubleCode2)} onClick={() => handleSeatClick(doubleCode2)}>
                  🛌 {doubleCode2}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <button className="btn btn-outline-dark btn-sm fw-bold mb-3 d-inline-flex align-items-center gap-1" onClick={() => navigate('/search')}>
        <ArrowLeft size={16} /> Back to Search Results
      </button>

      <div className="buslink-card p-4 bg-white mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between">
          <div>
            <span className="badge bg-warning text-dark fw-bold mb-1">{operator?.name || bus?.name}</span>
            <h4 className="fw-bold mb-0 text-dark brand-font">
              {route?.sourceCity || route?.source} ➔ {route?.destinationCity || route?.destination}
            </h4>
            <p className="small text-muted mb-0">
              {bus?.name} ({bus?.busType}) | {trip?.departureDate} at {formatDisplayTime(trip?.departureTime)}
            </p>
          </div>
          <div className="text-end">
            <span className="small text-muted d-block">Price per Seat</span>
            <span className="fs-4 fw-bold text-dark">₹{trip?.price}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 p-3 bg-light rounded-3 mb-4 border">
        <div className="d-flex align-items-center gap-2 small fw-semibold">
          <div className="seat-box available" style={{ width: 22, height: 22 }}></div> Available
        </div>
        <div className="d-flex align-items-center gap-2 small fw-semibold">
          <div className="seat-box selected" style={{ width: 22, height: 22 }}></div> Selected
        </div>
        <div className="d-flex align-items-center gap-2 small fw-semibold">
          <div className="seat-box booked" style={{ width: 22, height: 22 }}></div> Booked
        </div>
        <div className="d-flex align-items-center gap-2 small fw-semibold">
          <div className="seat-box ladies" style={{ width: 22, height: 22 }}></div> Ladies Only
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-7">{isSleeper ? renderSleeperGrid() : renderSeaterGrid()}</div>

        <div className="col-md-5">
          <div className="buslink-card p-4 bg-light border">
            <h6 className="fw-bold mb-3 border-bottom pb-2">Seat Selection Summary</h6>

            <div className="mb-3">
              <span className="small text-muted d-block fw-semibold">Selected Seats</span>
              {selectedSeats.length === 0 ? (
                <span className="text-muted small italic">Click on seats to select...</span>
              ) : (
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {selectedSeats.map((seat) => (
                    <span key={seat} className="badge bg-buslink-orange text-white px-2 py-1 fs-6">
                      {seat}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-top mb-4">
              <span className="small text-muted d-block fw-semibold">Total Fare</span>
              <h3 className="fw-extrabold text-dark mb-0 brand-font">₹{totalPrice}</h3>
            </div>

            <button
              className="btn btn-buslink-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
              disabled={selectedSeats.length === 0}
              onClick={handleProceed}
            >
              CONTINUE TO PASSENGER INFO <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
