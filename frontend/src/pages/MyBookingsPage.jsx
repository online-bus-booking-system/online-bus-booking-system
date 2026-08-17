import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { cancelBookingAction, setActiveTicketAction, setBookingsAction } from '../slices/bookingSlice';
import { Ticket, MapPin, Download, AlertTriangle, Star, Calendar, Clock, Search, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { getCustomerBookings, cancelBooking, submitReview, getBookingByPnrAndPhone } from '../services/bookingservice';

function MyBookingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);
  const bookings = useSelector((store) => store.booking.bookings);
  const [activeTab, setActiveTab] = useState('UPCOMING');
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // PNR & Mobile lookup state for anonymous users
  const [lookupPnr, setLookupPnr] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (user?.id) {
        try {
          const userBookings = await getCustomerBookings(user.id);
          if (userBookings) dispatch(setBookingsAction(userBookings));
        } catch (err) {
          console.warn('API error fetching user bookings:', err);
        }
      }
    };
    fetchUserBookings();
  }, [user, dispatch]);

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupPnr.trim()) {
      toast.error('Please enter PNR Number');
      return;
    }
    if (!lookupPhone.trim()) {
      toast.error('Please enter Mobile Number');
      return;
    }

    setIsSearching(true);
    const fetchedBooking = await getBookingByPnrAndPhone(lookupPnr, lookupPhone);
    setIsSearching(false);

    if (fetchedBooking) {
      dispatch(setActiveTicketAction(fetchedBooking));
      toast.success('Ticket found! Redirecting to e-Boarding Pass...');
      navigate('/ticket');
    }
  };

  // Filter bookings based on login state
  const userBookingsList = bookings.filter((b) => {
    if (user?.id) {
      return !b.userId || b.userId === user.id;
    }
    return false;
  });

  const filteredBookings = userBookingsList.filter((b) => {
    if (activeTab === 'CANCELLED') return b.bookingStatus === 'CANCELLED';
    return b.bookingStatus === 'CONFIRMED';
  });

  // Check if a trip is eligible for review (ONLY completed trips, NOT cancelled or future trips)
  const isTripEligibleForReview = (booking) => {
    if (booking.bookingStatus === 'CANCELLED') return false;

    const tripStatus = booking.trip?.status || booking.status;
    if (tripStatus === 'COMPLETED') return true;

    const depDateStr = booking.travelDate || booking.departureDate || booking.trip?.departureDate;
    if (depDateStr) {
      const depDate = new Date(depDateStr);
      const today = new Date();
      depDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return depDate < today;
    }
    return false;
  };

  const handleConfirmCancel = async () => {
    if (selectedBookingForCancel) {
      try {
        await cancelBooking(user?.id || 100, {
          bookingId: selectedBookingForCancel.id,
          cancellationReason: 'Customer requested cancellation from My Bookings dashboard'
        });
        dispatch(cancelBookingAction(selectedBookingForCancel.id));
        toast.info(`Booking ${selectedBookingForCancel.pnrNumber || selectedBookingForCancel.pnr} has been cancelled. Refund processed.`);
      } catch (err) {
        toast.error(err.message || 'Failed to cancel booking');
      }
      setSelectedBookingForCancel(null);
    }
  };

  const handleViewTicket = (booking) => {
    dispatch(setActiveTicketAction(booking));
    navigate('/ticket');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (showReviewModal) {
      try {
        await submitReview({
          bookingId: showReviewModal.id,
          busId: showReviewModal.trip?.bus?.id || showReviewModal.busId || 1,
          rating: rating,
          comment: reviewComment
        });
        toast.success(`Thank you! ${rating}-star review saved to database.`);
      } catch (err) {
        toast.error(err.message || 'Failed to save review');
      }
    }
    setShowReviewModal(null);
    setReviewComment('');
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h3 className="brand-font fw-extrabold mb-0">My Bookings Dashboard</h3>
        </div>
      </div>

      {!user ? (
        <>
          {/* Anonymous User Banner Message */}
          <div className="alert alert-warning border-0 shadow-sm p-4 text-center rounded-3 mb-4 bg-white border-start border-4 border-warning">
            <h5 className="fw-extrabold text-dark mb-2">Please login to view bookings.</h5>
            <p className="text-muted small mb-3">
              If you booked a ticket as a guest, search and download your PDF e-ticket using your PNR & Mobile Number below.
            </p>
            <button className="btn btn-buslink-primary btn-sm fw-bold px-4 shadow-sm" onClick={() => navigate('/login')}>
              <LogIn size={16} className="me-1" /> Sign In to Account
            </button>
          </div>

          {/* Download Ticket using PNR and Mobile Number for Anonymous Users */}
          <div className="buslink-card p-4 p-md-5 bg-white border-0 shadow-sm mb-4">
            <div className="text-center mb-4">
              <h4 className="brand-font fw-extrabold text-dark mb-0">Download Ticket</h4>
            </div>

            <form onSubmit={handleLookupSubmit} className="row g-3 justify-content-center">
              <div className="col-md-5">
                <label className="form-label small fw-bold text-muted text-uppercase">PNR Number</label>
                <input
                  type="text"
                  className="form-control form-control-lg fs-6 fw-bold font-monospace text-uppercase"
                  placeholder="e.g. PNR-BL-1571-03A44B"
                  value={lookupPnr}
                  onChange={(e) => setLookupPnr(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted text-uppercase">Mobile Number</label>
                <input
                  type="tel"
                  className="form-control form-control-lg fs-6 fw-bold"
                  placeholder="e.g. 9876543210"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-buslink-primary w-100 py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  disabled={isSearching}
                >
                  <Download size={18} /> {isSearching ? 'Searching...' : 'Download Ticket'}
                </button>
              </div>
            </form>
          </div>
        </>
      ) : (
        <>
          <ul className="nav nav-pills mb-4 border-bottom pb-2">
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${activeTab === 'UPCOMING' ? 'active bg-buslink-orange' : 'text-dark'}`}
                onClick={() => setActiveTab('UPCOMING')}
              >
                Confirmed Trips ({userBookingsList.filter((b) => b.bookingStatus === 'CONFIRMED').length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link fw-bold ${activeTab === 'CANCELLED' ? 'active bg-buslink-orange' : 'text-dark'}`}
                onClick={() => setActiveTab('CANCELLED')}
              >
                Cancelled Tickets ({userBookingsList.filter((b) => b.bookingStatus === 'CANCELLED').length})
              </button>
            </li>
          </ul>

          {filteredBookings.length === 0 ? (
            <div className="buslink-card p-5 text-center bg-white">
              <Ticket size={48} className="text-muted mb-3 opacity-50" />
              <h5 className="fw-bold mb-2">No Bookings Found</h5>
              <p className="text-muted small mb-0">
                You don't have any tickets in this section.
              </p>
            </div>
          ) : (
            <div className="d-grid gap-3">
              {filteredBookings.map((b) => {
                const travelDateVal = b.travelDate || b.trip?.departureDate || b.departureDate;
                const departureTimeVal = b.departureTime || b.trip?.departureTime || '06:00 AM';

                return (
                  <div key={b.id || b.pnrNumber} className="buslink-card p-4 bg-white border-start border-4 border-warning shadow-sm">
                    <div className="row g-3 align-items-center">
                      <div className="col-md-4">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-dark text-warning font-monospace">{b.pnrNumber || b.pnr}</span>
                          <span className={`badge ${b.bookingStatus === 'CONFIRMED' ? 'bg-success' : 'bg-danger'}`}>
                            {b.bookingStatus}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-1 text-dark">{b.passengerName || b.guestContact?.fullName}</h6>
                        <p className="small text-muted mb-0">
                          Seats: <strong>{b.passengers ? b.passengers.map((p) => p.seatNumber || p.seat).join(', ') : b.selectedSeats?.join(', ')}</strong> | Paid: <strong>₹{b.totalFare}</strong>
                        </p>
                      </div>

                      <div className="col-md-5">
                        <div className="small mb-1 text-primary fw-bold d-flex align-items-center gap-1">
                          <Calendar size={14} className="text-primary" />
                          <span>Travel Date:</span> {travelDateVal ? String(travelDateVal) : 'As Scheduled'}
                          <Clock size={14} className="text-muted ms-2 me-1" />
                          <span className="text-dark fw-semibold">{departureTimeVal}</span>
                        </div>
                        <div className="small mb-1 text-muted">
                          <MapPin size={14} className="text-warning me-1" />
                          <strong>Boarding:</strong> {b.boardingPoint}
                        </div>
                        <div className="small text-muted">
                          <MapPin size={14} className="text-danger me-1" />
                          <strong>Dropping:</strong> {b.droppingPoint}
                        </div>
                      </div>

                      <div className="col-md-3 text-end d-flex flex-column gap-2">
                        {b.bookingStatus === 'CONFIRMED' && (
                          <>
                            <button className="btn btn-buslink-primary btn-sm fw-bold d-flex align-items-center justify-content-center gap-1" onClick={() => handleViewTicket(b)}>
                              <Download size={14} /> View Ticket
                            </button>
                            <button className="btn btn-outline-danger btn-sm fw-bold" onClick={() => setSelectedBookingForCancel(b)}>
                              Cancel Ticket
                            </button>
                          </>
                        )}
                        {isTripEligibleForReview(b) && (
                          <button className="btn btn-outline-secondary btn-sm fw-semibold" onClick={() => setShowReviewModal(b)}>
                            <Star size={13} className="me-1 text-warning" /> Rate & Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Cancel Modal */}
      {selectedBookingForCancel && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title fw-bold">Cancel Ticket Confirmation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedBookingForCancel(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-warning d-flex align-items-center gap-2">
                  <AlertTriangle size={24} />
                  <div>
                    <strong className="d-block">Cancellation Refund Calculation</strong>
                    <span className="small">Cancellation &gt; 12 hours before departure: 80% Refund</span>
                  </div>
                </div>
                <p className="mb-3">
                  Are you sure you want to cancel ticket PNR <strong>{selectedBookingForCancel.pnrNumber || selectedBookingForCancel.pnr}</strong>?
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-danger flex-fill fw-bold" onClick={handleConfirmCancel}>
                    Yes, Cancel Ticket
                  </button>
                  <button className="btn btn-secondary flex-fill fw-bold" onClick={() => setSelectedBookingForCancel(null)}>
                    Keep Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Rate & Review Bus Service</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReviewModal(null)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleReviewSubmit}>
                  <div className="mb-3 text-center">
                    <label className="form-label small fw-bold text-uppercase d-block mb-2">Overall Rating</label>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={32}
                          className="cursor-pointer"
                          fill={star <= rating ? '#FF5A00' : 'none'}
                          color="#FF5A00"
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Your Review / Feedback</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Cleanliness, Punctuality, Driver Behavior..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-buslink-primary w-100 fw-bold">
                    Submit Rating & Review
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;
