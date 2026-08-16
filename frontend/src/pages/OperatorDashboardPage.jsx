import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bus, Calendar, Users, TrendingUp, PlusCircle, XCircle } from 'lucide-react';
import { getOperatorDashboardStats } from '../services/bookingservice';

function OperatorDashboardPage() {
  const navigate = useNavigate();

  const { user } = useSelector((store) => store.auth);
  const { buses, trips } = useSelector((store) => store.bus);
  const bookings = useSelector((store) => store.booking.bookings);

  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState({
    totalBookings: bookings.length,
    cancelledBookings: bookings.filter((b) => b.bookingStatus === 'CANCELLED').length,
    activeTrips: trips.length,
    revenue: bookings.reduce((sum, b) => sum + (b.bookingStatus === 'CONFIRMED' ? b.totalFare : 0), 0)
  });

  useEffect(() => {
    const fetchStats = async () => {
      const apiStats = await getOperatorDashboardStats(user?.id || 10, period);
      if (apiStats) {
        let rev = 0;
        if (period === 'daily') rev = apiStats.revenues?.dailyRevenue || 0;
        else if (period === 'monthly') rev = apiStats.revenues?.monthlyRevenue || 0;
        else if (period === 'quarterly') rev = apiStats.revenues?.quarterlyRevenue || 0;
        else rev = apiStats.revenues?.annualRevenue || 0;

        setStats({
          totalBookings: apiStats.totalBookings || 0,
          cancelledBookings: apiStats.cancelledBookings || 0,
          activeTrips: apiStats.activeTrips || 0,
          revenue: rev
        });
      }
    };
    fetchStats();
  }, [user, period]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <span className="badge bg-warning text-dark fw-bold mb-1">BUS OPERATOR PORTAL</span>
          <h3 className="brand-font fw-extrabold mb-0">{user?.companyName || user?.name || 'Bus Operator'} Dashboard</h3>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 bg-light p-1 rounded border">
            <span className="small fw-bold text-muted px-2">Period:</span>
            {['daily', 'monthly', 'quarterly', 'annual'].map((p) => (
              <button
                key={p}
                className={`btn btn-xs ${period === p ? 'btn-dark fw-bold' : 'btn-light text-muted'}`}
                onClick={() => setPeriod(p)}
                style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="btn btn-buslink-primary btn-sm fw-bold" onClick={() => navigate('/operator/fleet')}>
            <PlusCircle size={14} className="me-1" /> Register New Bus
          </button>
          <button className="btn btn-outline-dark btn-sm fw-bold" onClick={() => navigate('/operator/trips')}>
            <Calendar size={14} className="me-1" /> Schedule Trip
          </button>
        </div>
      </div>

      <div className="row g-3 mb-5">
        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Active Trips ({period})</span>
                <h2 className="fw-extrabold text-dark mb-0 brand-font">{stats.activeTrips}</h2>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <Calendar size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Total Bookings ({period})</span>
                <h2 className="fw-extrabold text-dark mb-0 brand-font">{stats.totalBookings}</h2>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <Users size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Cancelled ({period})</span>
                <h2 className="fw-extrabold text-dark mb-0 brand-font">{stats.cancelledBookings}</h2>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <XCircle size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-dark">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Net Revenue ({period})</span>
                <h2 className="fw-extrabold text-dark mb-0 brand-font">₹{stats.revenue}</h2>
              </div>
              <div className="p-3 bg-dark bg-opacity-10 text-dark rounded-circle">
                <TrendingUp size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="buslink-card p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 brand-font">Active Scheduled Trips</h5>
              <button className="btn btn-sm btn-link text-decoration-none" onClick={() => navigate('/operator/trips')}>
                View All →
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Trip ID</th>
                    <th>Bus</th>
                    <th>Departure</th>
                    <th>Price</th>
                    <th>Occupancy</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => {
                    const bus = buses.find((b) => b.id === t.busId);
                    return (
                      <tr key={t.id}>
                        <td className="fw-bold font-monospace">{t.id}</td>
                        <td>
                          <strong className="d-block text-dark">{bus?.name}</strong>
                          <span className="small text-muted">{bus?.busNumber}</span>
                        </td>
                        <td>{t.departureDate} at {t.departureTime}</td>
                        <td className="fw-bold">₹{t.price}</td>
                        <td>
                          <span className="badge bg-primary">
                            {t.bookedSeats?.length || 0} / {bus?.totalSeats || 30} Seats
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success-subtle text-success border border-success fw-bold">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="buslink-card p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 brand-font">Registered Fleet</h5>
              <button className="btn btn-sm btn-link text-decoration-none" onClick={() => navigate('/operator/fleet')}>
                Manage →
              </button>
            </div>
            <div className="d-grid gap-3">
              {buses.map((b) => (
                <div key={b.id} className="p-3 border rounded-3 bg-light">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <strong className="text-dark small">{b.name}</strong>
                    <span className="badge bg-dark text-warning">{b.busNumber}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted">
                    <span>Type: {b.busType}</span>
                    <span>Capacity: {b.totalSeats} Seats</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OperatorDashboardPage;
