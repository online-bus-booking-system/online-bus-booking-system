import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addBookingAction } from '../slices/bookingSlice';
import { createBooking } from '../services/bookingservice';
import { CreditCard, QrCode, Building, Sparkles, Loader2, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedTrip, selectedSeats, boardingPoint, droppingPoint, passengers, contactEmail, contactPhone } = useSelector((store) => store.bus);
  const { user } = useSelector((store) => store.auth);

  const basePrice = selectedSeats.length * (selectedTrip?.price || selectedTrip?.trip?.price || 650);

  const [payMethod, setPayMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 9012 8841 9012');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvv, setCardCvv] = useState('482');

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'CDAC100') {
      setDiscount(100);
      toast.success('CDAC Special Coupon Applied! ₹100 Discount.');
    } else if (couponCode.toUpperCase() === 'BUSLINK50') {
      setDiscount(50);
      toast.success('BUSLINK50 Coupon Applied! ₹50 Discount.');
    } else {
      toast.error('Invalid Promo Code. Try CDAC100 or BUSLINK50');
    }
  };

  const finalFare = Math.max(0, basePrice - discount);

  const handlePayNow = async (e) => {
    e.preventDefault();

    // Payment validation
    if (payMethod === 'UPI') {
      if (!upiId || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID (e.g. user@okaxis)');
        return;
      }
    } else if (payMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 12) {
        toast.error('Please enter a valid Card Number (16 digits)');
        return;
      }
      if (!cardExpiry || !cardExpiry.includes('/')) {
        toast.error('Please enter Card Expiry Date (MM/YY)');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter a valid 3-digit CVV');
        return;
      }
    }

    setIsProcessing(true);

    const firstPassenger = passengers?.[0];
    const guestName = firstPassenger?.name || user?.name || 'Guest Passenger';
    const guestEmail = user?.email || contactEmail || 'guest@buslink.com';
    const guestPhone = user?.phone || contactPhone || '+91 99999 00000';

    const bookingPayload = {
      tripId: selectedTrip?.id || selectedTrip?.trip?.id || 1,
      passengerName: guestName,
      passengerEmail: guestEmail,
      passengerPhone: guestPhone,
      passengers: passengers.length ? passengers : [{ name: guestName, age: 25, gender: 'Male', seat: selectedSeats[0] || 'L1' }],
      selectedSeats: selectedSeats.length ? selectedSeats : ['L1'],
      boardingPoint: boardingPoint || 'Swargate Bus Stand (06:00 AM)',
      droppingPoint: droppingPoint || 'Borivali East (10:00 AM)',
      totalFare: finalFare,
      paymentMethod: payMethod === 'UPI' ? 'UPI (GPay)' : payMethod === 'CARD' ? 'Credit Card' : 'NetBanking',
      paymentSuccess: true
    };

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      const userIdParam = user?.id ? user.id : 0;
      const apiBooking = await createBooking(userIdParam, bookingPayload);

      if (apiBooking) {
        // Tag as guest booking if not logged in
        if (!user?.id) {
          apiBooking.isGuest = true;
          apiBooking.guestContact = {
            fullName: guestName,
            email: guestEmail,
            phone: guestPhone
          };
        }
        dispatch(addBookingAction(apiBooking));
        toast.success('Payment successful! e-Ticket generated.');
        setIsProcessing(false);
        navigate('/ticket');
      } else {
        toast.error('Booking creation failed');
        setIsProcessing(false);
      }
    } catch (err) {
      toast.error(err.message || 'Payment processing error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container py-4">
      <button className="btn btn-outline-dark btn-sm fw-bold mb-3 d-inline-flex align-items-center gap-1" onClick={() => navigate('/passenger-info')}>
        <ArrowLeft size={16} /> Back to Passenger Info
      </button>

      <div className="buslink-card p-4 bg-white mb-4">
        <h4 className="fw-bold mb-1 brand-font">Final Step: Payment Checkout</h4>
        <p className="text-muted small mb-0">Select your preferred payment method to complete ticket booking.</p>
      </div>

      {isProcessing ? (
        <div className="buslink-card p-5 text-center bg-white my-4">
          <Loader2 size={56} className="text-warning mb-3 spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
          <h4 className="fw-bold mb-2">Processing Payment...</h4>
          <p className="text-muted small">Communicating with payment gateway. Please do not refresh.</p>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="buslink-card p-4 bg-white">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Select Payment Method</h6>
              <div className="d-flex gap-2 mb-4">
                <button
                  type="button"
                  className={`btn flex-fill py-2.5 small fw-semibold ${payMethod === 'UPI' ? 'btn-buslink-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setPayMethod('UPI')}
                >
                  <QrCode size={16} className="me-1" /> UPI / QR
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2.5 small fw-semibold ${payMethod === 'CARD' ? 'btn-buslink-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setPayMethod('CARD')}
                >
                  <CreditCard size={16} className="me-1" /> Card
                </button>
                <button
                  type="button"
                  className={`btn flex-fill py-2.5 small fw-semibold ${payMethod === 'NETBANKING' ? 'btn-buslink-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setPayMethod('NETBANKING')}
                >
                  <Building size={16} className="me-1" /> NetBanking
                </button>
              </div>

              {payMethod === 'UPI' && (
                <div className="p-3 border rounded-3 bg-light text-center">
                  <p className="small text-muted mb-2">Scan QR Code using GPay, PhonePe, Paytm or BHIM</p>
                  <div className="bg-white p-3 d-inline-block rounded border shadow-sm mb-3">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=buslink@upi&pn=BusLinkTickets"
                      alt="UPI QR Code"
                      className="img-fluid"
                      style={{ width: 140, height: 140 }}
                    />
                  </div>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. user@okaxis)"
                    />
                    <button
                      className="btn btn-outline-dark fw-bold"
                      type="button"
                      onClick={() => {
                        if (upiId.includes('@')) toast.success('UPI ID Verified!');
                        else toast.error('Invalid UPI ID');
                      }}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {payMethod === 'CARD' && (
                <div className="p-3 border rounded-3 bg-light">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Card Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number"
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">CVV</label>
                      <input
                        type="password"
                        className="form-control"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                      />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === 'NETBANKING' && (
                <div className="p-3 border rounded-3 bg-light">
                  <label className="form-label small fw-semibold">Select Your Bank</label>
                  <select className="form-select">
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <div className="buslink-card p-4 bg-white">
              <h6 className="fw-bold mb-3 border-bottom pb-2">Fare Breakdown</h6>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Base Fare ({selectedSeats.length} seats)</span>
                <span className="fw-semibold">₹{basePrice}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">GST & Taxes (18%)</span>
                <span className="fw-semibold text-success">INCLUDED</span>
              </div>

              {discount > 0 && (
                <div className="d-flex justify-content-between mb-2 small text-success">
                  <span>Promo Discount</span>
                  <span className="fw-bold">-₹{discount}</span>
                </div>
              )}

              <div className="my-3">
                <label className="form-label small fw-semibold d-flex align-items-center gap-1">
                  <Sparkles size={14} className="text-warning" /> Apply CDAC Promo Code
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CDAC100"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button className="btn btn-outline-primary fw-bold" type="button" onClick={applyCoupon}>
                    Apply
                  </button>
                </div>
                <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                  Use CDAC100 for ₹100 OFF
                </span>
              </div>

              <div className="pt-3 border-top mb-4">
                <span className="small text-muted d-block fw-semibold">Total Amount Payable</span>
                <h3 className="fw-extrabold text-dark mb-0 brand-font">₹{finalFare}</h3>
              </div>

              <button
                className="btn btn-buslink-primary w-100 py-3 fw-bold fs-6 d-flex align-items-center justify-content-center gap-2"
                onClick={handlePayNow}
              >
                PAY ₹{finalFare} NOW <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
