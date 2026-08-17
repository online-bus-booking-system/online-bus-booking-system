import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setBoardingDroppingAction, setPassengersAction, setContactInfoAction } from '../slices/busSlice';
import { MapPin, Mail, Phone, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

function PassengerInfoPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedTrip, selectedSeats } = useSelector((store) => store.bus);
  const { user } = useSelector((store) => store.auth);
  const route = selectedTrip?.route || selectedTrip?.trip?.route;

  const [selectedBoarding, setSelectedBoarding] = useState(
    route?.boardingPoints?.[0] ? `${route.boardingPoints[0].location} (${route.boardingPoints[0].time})` : 'Swargate Bus Stand (06:00 AM)'
  );
  const [selectedDropping, setSelectedDropping] = useState(
    route?.droppingPoints?.[0] ? `${route.droppingPoints[0].location} (${route.droppingPoints[0].time})` : 'Borivali East (10:00 AM)'
  );

  const [passengers, setPassengers] = useState(
    (selectedSeats || []).map((seat, idx) => ({
      seat,
      name: idx === 0 && user?.name ? user.name : '',
      age: '',
      gender: 'Male'
    }))
  );

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handlePassengerChange = (index, field, value) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    // Validate Passenger Names & Ages
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.name.trim().length < 2) {
        toast.error(`Please enter a valid full name for Passenger ${i + 1} (Seat ${p.seat})`);
        return;
      }
      if (!p.age || p.age < 1 || p.age > 100) {
        toast.error(`Please enter a valid age (1-100) for Passenger ${i + 1}`);
        return;
      }
    }

    // Validate Recipient Contact Email & Phone
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      toast.error('Please enter a valid recipient email address');
      return;
    }

    const phoneDigits = (phone || '').replace(/\D/g, '');
    if (!phone || phoneDigits.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number for ticket SMS');
      return;
    }

    dispatch(
      setBoardingDroppingAction({
        boardingPoint: selectedBoarding,
        droppingPoint: selectedDropping
      })
    );
    dispatch(setPassengersAction(passengers));
    dispatch(setContactInfoAction({ contactEmail: email, contactPhone: phone }));
    navigate('/payment');
  };

  if (!selectedSeats || selectedSeats.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold mb-3">No Seats Selected</h4>
        <button className="btn btn-buslink-primary fw-bold" onClick={() => navigate('/search')}>
          Go to Bus Search
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <button className="btn btn-outline-dark btn-sm fw-bold mb-3 d-inline-flex align-items-center gap-1" onClick={() => navigate('/seat-selection')}>
        <ArrowLeft size={16} /> Back to Seat Selection
      </button>

      <div className="row g-4">
        <div className="col-lg-8">
          <form onSubmit={handleProceedToPayment}>
            {/* Boarding & Dropping Points */}
            <div className="buslink-card p-4 bg-white mb-4">
              <h5 className="fw-bold mb-3 brand-font border-bottom pb-2">1. Select Boarding & Dropping Points</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <MapPin size={16} className="text-warning" /> Boarding Point
                  </label>
                  <select className="form-select fw-semibold" value={selectedBoarding} onChange={(e) => setSelectedBoarding(e.target.value)}>
                    {route?.boardingPoints?.map((bp, i) => {
                      const val = `${bp.location} (${bp.time})`;
                      return <option key={i} value={val}>{val}</option>;
                    }) || <option value="Swargate Bus Stand (06:00 AM)">Swargate Bus Stand (06:00 AM)</option>}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted d-flex align-items-center gap-1">
                    <MapPin size={16} className="text-danger" /> Dropping Point
                  </label>
                  <select className="form-select fw-semibold" value={selectedDropping} onChange={(e) => setSelectedDropping(e.target.value)}>
                    {route?.droppingPoints?.map((dp, i) => {
                      const val = `${dp.location} (${dp.time})`;
                      return <option key={i} value={val}>{val}</option>;
                    }) || <option value="Borivali East (10:00 AM)">Borivali East (10:00 AM)</option>}
                  </select>
                </div>
              </div>
            </div>

            {/* Passenger Forms */}
            <div className="buslink-card p-4 bg-white mb-4">
              <h5 className="fw-bold mb-3 brand-font border-bottom pb-2">2. Passenger Information</h5>
              <div className="d-grid gap-3">
                {passengers.map((p, idx) => (
                  <div key={p.seat} className="p-3 border rounded-3 bg-light">
                    <span className="badge bg-buslink-orange text-white fw-bold mb-2">
                      Passenger {idx + 1} (Seat {p.seat})
                    </span>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Aniket Kedar"
                          required
                          value={p.name}
                          onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">Age</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 24"
                          min="1"
                          max="99"
                          required
                          value={p.age}
                          onChange={(e) => handlePassengerChange(idx, 'age', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-semibold">Gender</label>
                        <select
                          className="form-select"
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(idx, 'gender', e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Details */}
            <div className="buslink-card p-4 bg-white mb-4">
              <h5 className="fw-bold mb-3 brand-font border-bottom pb-2">3. Ticket Contact Recipient</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Mobile Number</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Phone size={16} /></span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="9876543210"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-buslink-primary w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2">
              PROCEED TO PAYMENT <ChevronRight size={18} />
            </button>
          </form>
        </div>

        {/* Fare Summary Column */}
        <div className="col-lg-4">
          <div className="buslink-card p-4 bg-white sticky-top" style={{ top: '90px' }}>
            <h6 className="fw-bold mb-3 border-bottom pb-2">Booking Summary</h6>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Seats Selected</span>
              <span className="fw-bold">{selectedSeats.join(', ')}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 small">
              <span className="text-muted">Total Passengers</span>
              <span className="fw-bold">{selectedSeats.length}</span>
            </div>
            <div className="pt-3 border-top">
              <span className="small text-muted d-block fw-semibold">Total Fare</span>
              <h3 className="fw-extrabold text-dark mb-0 brand-font">
                ₹{selectedSeats.length * (selectedTrip?.price || selectedTrip?.trip?.price || 650)}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PassengerInfoPage;
