import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bus, Download, Printer, CheckCircle2, ArrowRight, Calendar, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function ETicketPage() {
  const navigate = useNavigate();
  const ticketRef = useRef();

  const booking = useSelector((store) => store.booking.activeTicket);

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold mb-3">No Active Ticket Found</h4>
        <button className="btn btn-buslink-primary fw-bold" onClick={() => navigate('/search')}>
          Go to Bus Search
        </button>
      </div>
    );
  }

  const travelDateVal = booking.travelDate || booking.trip?.departureDate || booking.departureDate;
  const departureTimeVal = booking.departureTime || booking.trip?.departureTime || '06:00 AM';

  const handleDownloadPDF = async () => {
    if (!ticketRef.current) return;
    const canvas = await html2canvas(ticketRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`BusLink_Ticket_${booking.pnrNumber || booking.pnr || 'Pass'}.pdf`);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          {/* Banner */}
          <div className="alert alert-success d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={24} className="text-success" />
              <div>
                <strong className="d-block text-dark fs-5">Booking Confirmed Successfully!</strong>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-dark btn-sm fw-bold" onClick={() => window.print()}>
                <Printer size={14} className="me-1" /> Print
              </button>
              <button className="btn btn-buslink-primary btn-sm fw-bold" onClick={handleDownloadPDF}>
                <Download size={14} className="me-1" /> Download PDF
              </button>
            </div>
          </div>

          {/* Printable Ticket Box */}
          <div ref={ticketRef} className="buslink-card bg-white p-4 p-md-5 shadow-lg border-2">
            <div className="d-flex justify-content-between align-items-center pb-4 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-buslink-orange text-white p-2 rounded-3">
                  <Bus size={28} />
                </div>
                <div>
                  <h3 className="brand-font fw-extrabold mb-0 text-dark">
                    Bus<span style={{ color: 'var(--buslink-orange)' }}>Link</span>
                  </h3>
                  <span className="small text-muted fw-bold">Official e-Boarding Pass</span>
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-success-subtle text-success border border-success px-3 py-1 fw-bold fs-6">
                  {booking.bookingStatus || 'CONFIRMED'}
                </span>
                <span className="d-block small text-muted mt-1">
                  Booked on: {booking.bookingDate ? String(booking.bookingDate).substring(0, 10) : new Date().toISOString().substring(0, 10)}
                </span>
              </div>
            </div>

            <div className="row g-3 py-3 bg-light rounded-3 my-4 border text-center text-md-start">
              <div className="col-md-4 border-end-md">
                <span className="small text-muted d-block fw-bold text-uppercase">PNR Number</span>
                <span className="fs-4 fw-extrabold text-dark brand-font">{booking.pnrNumber || booking.pnr}</span>
              </div>
              <div className="col-md-4 border-end-md">
                <span className="small text-muted d-block fw-bold text-uppercase">Booking Ref ID</span>
                <span className="fs-5 fw-bold text-secondary">{booking.id}</span>
              </div>
              <div className="col-md-4">
                <span className="small text-muted d-block fw-bold text-uppercase">Payment Mode</span>
                <span className="badge bg-dark text-warning fw-bold">{booking.paymentMethod || 'UPI (GPay)'}</span>
              </div>
            </div>

            {/* PROMINENT TRAVEL DATE & DEPARTURE TIME BANNER */}
            <div className="alert alert-primary bg-primary-subtle text-primary border-primary d-flex align-items-center justify-content-between p-3 rounded-3 mb-4 shadow-sm">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary text-white p-2 rounded-circle">
                  <Calendar size={22} />
                </div>
                <div>
                  <span className="small text-muted d-block text-uppercase fw-bold">Date of Journey / Travel Date</span>
                  <span className="fs-5 fw-extrabold text-dark brand-font">
                    {travelDateVal ? String(travelDateVal) : 'As Scheduled'}
                  </span>
                </div>
              </div>
              <div className="text-end border-start ps-3">
                <span className="small text-muted d-block text-uppercase fw-bold">Scheduled Departure</span>
                <span className="fs-5 fw-extrabold text-buslink-orange brand-font d-flex align-items-center justify-content-end gap-1">
                  <Clock size={18} /> {departureTimeVal}
                </span>
              </div>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-8">
                <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">Journey Route & Stops</h6>
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div>
                    <span className="badge bg-warning text-dark fw-bold mb-1">BOARDING</span>
                    <h5 className="fw-bold mb-0 text-dark">{booking.boardingPoint}</h5>
                  </div>
                  <div className="flex-grow-1 text-center px-3">
                    <ArrowRight size={24} className="text-buslink-orange" />
                  </div>
                  <div>
                    <span className="badge bg-danger text-white fw-bold mb-1">DROPPING</span>
                    <h5 className="fw-bold mb-0 text-dark">{booking.droppingPoint}</h5>
                  </div>
                </div>

                <div className="row g-3 bg-light p-3 rounded-3 border">
                  <div className="col-6">
                    <span className="small text-muted d-block">Passenger Seats</span>
                    <span className="fw-bold text-dark fs-5">
                      {booking.passengers ? booking.passengers.map((p) => p.seatNumber || p.seat).join(', ') : booking.selectedSeats?.join(', ')}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="small text-muted d-block">Total Paid</span>
                    <span className="fw-extrabold text-success fs-5">₹{booking.totalFare}</span>
                  </div>
                </div>
              </div>

              <div className="col-md-4 text-center d-flex flex-column align-items-center justify-content-center border-start-md">
                <div className="bg-white p-3 border rounded-3 shadow-sm mb-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.qrCodeData || booking.pnrNumber || booking.pnr}`}
                    alt="Ticket QR Code"
                    className="img-fluid"
                    style={{ width: 140, height: 140 }}
                  />
                </div>
                <span className="small text-muted fw-bold">SCAN FOR BOARDING</span>
                <span className="small text-secondary" style={{ fontSize: '0.65rem' }}>{booking.pnrNumber || booking.pnr}</span>
              </div>
            </div>

            <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2 mb-3">Passenger List</h6>
            <div className="table-responsive mb-4">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Passenger Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Seat Number</th>
                  </tr>
                </thead>
                <tbody>
                  {booking.passengers?.map((p, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{idx + 1}</td>
                      <td className="fw-bold">{p.passengerName || p.name}</td>
                      <td>{p.age} yrs</td>
                      <td>{p.gender}</td>
                      <td>
                        <span className="badge bg-dark text-warning">{p.seatNumber || p.seat}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-light rounded-3 border">
              <h6 className="fw-bold small mb-1">Boarding Instructions & Terms:</h6>
              <ul className="small text-muted mb-0 ps-3">
                <li>Please report at the boarding location 15 minutes before scheduled departure.</li>
                <li>Carry a valid photo ID proof (Aadhaar, Driving License, Voter ID, Passport) along with this e-ticket.</li>
                <li>For any live bus position query, contact BusLink Helpline at 1800-BUS-LINK.</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-4">
            <button className="btn btn-outline-dark fw-bold px-4 py-2" onClick={() => navigate('/search')}>
              ← Back to Search Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ETicketPage;
