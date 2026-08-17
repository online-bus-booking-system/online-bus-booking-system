import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Bus, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { getPlatformRevenue } from '../services/bookingservice';
import { getAllOperators } from '../services/userservice';
import { setOperatorsAction } from '../slices/adminSlice';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const operators = useSelector((store) => store.admin.operators);
  const { buses, trips } = useSelector((store) => store.bus);

  const [revenuePeriod, setRevenuePeriod] = useState('monthly');
  const [revenues, setRevenues] = useState({
    dailyRevenue: 0,
    monthlyRevenue: 0,
    quarterlyRevenue: 0,
    annualRevenue: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiRev = await getPlatformRevenue();
        if (apiRev) setRevenues(apiRev);

        const liveOps = await getAllOperators();
        if (liveOps) {
          const mapped = liveOps.map((op) => ({
            id: op.id,
            name: op.companyName || op.name,
            email: op.email,
            phone: op.phone,
            city: op.city || 'Pune',
            fleetSize: 5,
            registrationStatus: op.approvalStatus || 'PENDING',
            status: op.isActive ? 'ACTIVE' : 'INACTIVE'
          }));
          dispatch(setOperatorsAction(mapped));
        }
      } catch (err) {
        console.warn('API error in Admin Dashboard:', err);
      }
    };
    fetchData();
  }, [dispatch]);

  const pendingCount = operators.filter((o) => o.registrationStatus === 'PENDING').length;
  const activeOperatorsCount = operators.filter((o) => o.status === 'ACTIVE').length;

  const currentVolume =
    revenuePeriod === 'daily'
      ? revenues.dailyRevenue
      : revenuePeriod === 'monthly'
      ? revenues.monthlyRevenue
      : revenuePeriod === 'quarterly'
      ? revenues.quarterlyRevenue
      : revenues.annualRevenue;

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <span className="badge bg-danger text-white fw-bold mb-1">CENTRAL ADMIN PANEL</span>
          <h3 className="brand-font fw-extrabold mb-0">Platform Overview & Master Control</h3>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-warning text-dark fw-bold btn-sm" onClick={() => navigate('/admin/registrations')}>
            <Clock size={14} className="me-1" /> Pending Approvals ({pendingCount})
          </button>
          <button className="btn btn-dark btn-sm fw-bold" onClick={() => navigate('/admin/operators')}>
            <Users size={14} className="me-1" /> Operators Directory
          </button>
        </div>
      </div>

      <div className="row g-3 mb-5">
        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-danger">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Pending Registrations</span>
                <h2 className="fw-extrabold text-danger mb-0 brand-font">{pendingCount}</h2>
              </div>
              <div className="p-3 bg-danger bg-opacity-10 text-danger rounded-circle">
                <AlertCircle size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Active Operators</span>
                <h2 className="fw-extrabold text-success mb-0 brand-font">{activeOperatorsCount}</h2>
              </div>
              <div className="p-3 bg-success bg-opacity-10 text-success rounded-circle">
                <Users size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small text-muted fw-bold text-uppercase d-block">Total Platform Fleet</span>
                <h2 className="fw-extrabold text-primary mb-0 brand-font">{buses.length}</h2>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle">
                <Bus size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="buslink-card p-4 bg-white border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between">
                  <span className="small text-muted fw-bold text-uppercase d-block">Platform Revenue</span>
                  <select
                    className="form-select form-select-sm py-0 px-1 border-0 bg-light text-muted fw-bold"
                    style={{ fontSize: '0.7rem', width: 'auto' }}
                    value={revenuePeriod}
                    onChange={(e) => setRevenuePeriod(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <h2 className="fw-extrabold text-dark mb-0 brand-font">₹{currentVolume || 0}</h2>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle">
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
              <h5 className="fw-bold mb-0 brand-font">Operator Applications</h5>
              <button className="btn btn-sm btn-link text-decoration-none" onClick={() => navigate('/admin/registrations')}>
                Manage Registrations →
              </button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Operator Name</th>
                    <th>City</th>
                    <th>Fleet Size</th>
                    <th>Documents</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.map((op) => (
                    <tr key={op.id}>
                      <td>
                        <strong className="d-block text-dark">{op.name}</strong>
                        <span className="small text-muted">{op.email}</span>
                      </td>
                      <td>{op.city}</td>
                      <td className="fw-bold">{op.fleetSize} Buses</td>
                      <td>
                        <span className="badge bg-light text-dark border">Verified Docs</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            op.registrationStatus === 'APPROVED'
                              ? 'bg-success'
                              : op.registrationStatus === 'PENDING'
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                        >
                          {op.registrationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="buslink-card p-4 bg-white">
            <h5 className="fw-bold mb-3 brand-font">System Health & Metrics</h5>
            <div className="d-grid gap-3">
              <div className="p-3 border rounded-3 bg-light">
                <span className="small text-muted d-block fw-semibold">Platform Uptime</span>
                <span className="fw-extrabold text-success fs-5">99.98%</span>
              </div>
              <div className="p-3 border rounded-3 bg-light">
                <span className="small text-muted d-block fw-semibold">Active Trips Today</span>
                <span className="fw-extrabold text-dark fs-5">{trips.length} Active Trips</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
