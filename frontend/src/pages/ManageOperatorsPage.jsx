import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleOperatorStatusAction, setOperatorsAction } from '../slices/adminSlice';
import { Power, ShieldCheck, Search, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllOperators, toggleOperatorStatus, searchOperatorsByName, getDeactivationRequests, processDeactivation } from '../services/userservice';
import OperatorAuditModal from '../component/OperatorAuditModal';

function ManageOperatorsPage() {
  const dispatch = useDispatch();
  const operators = useSelector((store) => store.admin.operators);

  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'deactivations'
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [deactivationRequests, setDeactivationRequests] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const liveOps = await getAllOperators();
      if (liveOps) {
        dispatch(setOperatorsAction(liveOps));
        setFilteredOperators(liveOps.filter((op) => op.approvalStatus === 'APPROVED' || op.approvalStatus === 'DEACTIVATED'));
      }
      const deactReqs = await getDeactivationRequests();
      if (deactReqs) {
        setDeactivationRequests(deactReqs);
      }
    } catch (err) {
      console.warn('API error fetching operators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setFilteredOperators(operators.filter((op) => op.approvalStatus === 'APPROVED' || op.approvalStatus === 'DEACTIVATED'));
      return;
    }
    try {
      const results = await searchOperatorsByName(q);
      setFilteredOperators(results);
    } catch (err) {
      const qLower = q.toLowerCase();
      setFilteredOperators(operators.filter((op) => 
        (op.companyName && op.companyName.toLowerCase().includes(qLower)) ||
        (op.name && op.name.toLowerCase().includes(qLower))
      ));
    }
  };

  const handleToggle = async (opId, currentIsActive) => {
    const newIsActive = !currentIsActive;
    try {
      await toggleOperatorStatus(opId, newIsActive);
      dispatch(toggleOperatorStatusAction(opId));
      toast.success(`Operator account ${newIsActive ? 'ACTIVATED' : 'DEACTIVATED'} successfully.`);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle operator status');
    }
  };

  const handleApproveDeactivation = async (opId) => {
    if (window.confirm('Are you sure you want to approve deactivation for this operator? Their account will be deactivated.')) {
      try {
        await processDeactivation(opId, true);
        toast.success('Operator deactivation approved. Account is now deactivated.');
        loadData();
      } catch (err) {
        toast.error(err.message || 'Failed to approve deactivation.');
      }
    }
  };

  const handleRejectDeactivation = async (opId) => {
    try {
      await processDeactivation(opId, false);
      toast.success('Deactivation request dismissed. Operator account remains active.');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to dismiss deactivation request.');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <span className="badge bg-danger text-white fw-bold mb-1">ADMIN MASTER CONTROL</span>
          <h3 className="brand-font fw-extrabold mb-0">Operator Management</h3>
          <p className="text-muted small mb-0">Search registered bus operators by name, review audit profiles (excluding revenue), and manage deactivation requests.</p>
        </div>
        <button className="btn btn-outline-dark btn-sm fw-bold" onClick={loadData} disabled={loading}>
          <RefreshCw size={14} className={`me-1 ${loading ? 'spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4 fw-bold">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'directory' ? 'active text-dark border-bottom border-3 border-danger' : 'text-muted'}`}
            onClick={() => setActiveTab('directory')}
          >
            Approved Operators Directory
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link position-relative ${activeTab === 'deactivations' ? 'active text-dark border-bottom border-3 border-danger' : 'text-muted'}`}
            onClick={() => setActiveTab('deactivations')}
          >
            Deactivation Requests Queue
            {deactivationRequests.length > 0 && (
              <span className="badge rounded-pill bg-danger ms-2">
                {deactivationRequests.length}
              </span>
            )}
          </button>
        </li>
      </ul>

      {/* TAB 1: DIRECTORY WITH NAME SEARCH */}
      {activeTab === 'directory' && (
        <div>
          <div className="row g-3 align-items-center mb-4">
            <div className="col-md-6">
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search operator by name or company name..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <div className="buslink-card p-4 bg-white shadow-sm border-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Operator ID</th>
                    <th>Operator / Company Name</th>
                    <th>Contact Info</th>
                    <th>Approval Status</th>
                    <th>Account Status</th>
                    <th>Review Details</th>
                    <th>Status Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperators.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No matching bus operators found.
                      </td>
                    </tr>
                  ) : (
                    filteredOperators.map((op) => {
                      const isActive = op.isActive !== false && op.status !== 'INACTIVE' && op.deactivationStatus !== 'APPROVED' && op.approvalStatus !== 'DEACTIVATED';

                      return (
                        <tr key={op.id}>
                          <td className="fw-bold font-monospace">#{op.id}</td>
                          <td>
                            <strong className="d-block text-dark">{op.companyName || op.name}</strong>
                            <span className="small text-muted">{op.email}</span>
                          </td>
                          <td>{op.phone}</td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success d-inline-flex align-items-center gap-1 fw-bold">
                              <ShieldCheck size={13} /> {op.approvalStatus || 'APPROVED'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${isActive ? 'bg-success' : 'bg-danger'}`}>
                              {isActive ? 'ACTIVE' : 'INACTIVE / DEACTIVATED'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-dark fw-bold d-inline-flex align-items-center gap-1"
                              onClick={() => setSelectedAuditId(op.id)}
                              title="Review operator profile, fleet, and routes (Excludes Revenue)"
                            >
                              <Eye size={14} /> Review
                            </button>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm fw-bold ${isActive ? 'btn-outline-danger' : 'btn-success'}`}
                              onClick={() => handleToggle(op.id, isActive)}
                            >
                              <Power size={13} className="me-1" />
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEACTIVATION REQUESTS QUEUE */}
      {activeTab === 'deactivations' && (
        <div className="buslink-card p-4 bg-white shadow-sm border-0 border-start border-4 border-danger">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Operator ID</th>
                  <th>Company / Operator Name</th>
                  <th>Contact Information</th>
                  <th>Reason for Deactivation</th>
                  <th>Audit Review</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {deactivationRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <ShieldCheck size={36} className="text-success mb-2" />
                      <h6 className="fw-bold mb-1">No Pending Deactivation Requests</h6>
                      <p className="text-muted small mb-0">All operator accounts are active or already processed.</p>
                    </td>
                  </tr>
                ) : (
                  deactivationRequests.map((op) => (
                    <tr key={op.id}>
                      <td className="fw-bold font-monospace">#{op.id}</td>
                      <td>
                        <strong className="d-block text-dark">{op.companyName || op.name}</strong>
                        <span className="small text-muted">{op.email}</span>
                      </td>
                      <td>{op.phone}</td>
                      <td style={{ maxWidth: 280 }}>
                        <div className="p-2 bg-light rounded text-dark small fw-semibold border">
                          <AlertTriangle size={13} className="me-1 text-warning" />
                          "{op.deactivationReason || 'Operator requested account closure'}"
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-dark fw-bold d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedAuditId(op.id)}
                        >
                          <Eye size={14} /> Review Data
                        </button>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-danger fw-bold"
                            onClick={() => handleApproveDeactivation(op.id)}
                          >
                            Approve Deactivation
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary fw-semibold"
                            onClick={() => handleRejectDeactivation(op.id)}
                          >
                            Dismiss Request
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operator Audit Modal */}
      {selectedAuditId && (
        <OperatorAuditModal
          operatorId={selectedAuditId}
          onClose={() => setSelectedAuditId(null)}
          onApproveDeactivation={handleApproveDeactivation}
          onRejectDeactivation={handleRejectDeactivation}
        />
      )}
    </div>
  );
}

export default ManageOperatorsPage;
