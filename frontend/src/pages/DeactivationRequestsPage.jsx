import React, { useState, useEffect } from 'react';
import { AlertTriangle, Eye, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getDeactivationRequests, processDeactivation } from '../services/userservice';
import OperatorAuditModal from '../component/OperatorAuditModal';

function DeactivationRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getDeactivationRequests();
      if (data) setRequests(data);
    } catch (err) {
      console.warn('Error fetching deactivation requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveDeactivation = async (opId) => {
    if (window.confirm('Are you sure you want to approve deactivation for this operator? Their account will be deactivated.')) {
      try {
        await processDeactivation(opId, true);
        toast.success('Operator deactivation approved. Account is now deactivated.');
        fetchRequests();
      } catch (err) {
        toast.error(err.message || 'Failed to approve deactivation.');
      }
    }
  };

  const handleRejectDeactivation = async (opId) => {
    try {
      await processDeactivation(opId, false);
      toast.success('Deactivation request dismissed. Operator account remains active.');
      fetchRequests();
    } catch (err) {
      toast.error(err.message || 'Failed to dismiss deactivation request.');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <span className="badge bg-danger text-white fw-bold mb-1">DEACTIVATION QUEUE</span>
          <h3 className="brand-font fw-extrabold mb-0">Deactivation Requests</h3>
          <p className="text-muted small mb-0">Review operator account closure requests, reasons provided, and execute deactivation.</p>
        </div>
        <button className="btn btn-outline-dark btn-sm fw-bold" onClick={fetchRequests} disabled={loading}>
          <RefreshCw size={14} className={`me-1 ${loading ? 'spin' : ''}`} /> Refresh Requests
        </button>
      </div>

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
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <CheckCircle2 size={36} className="text-success mb-2" />
                    <h6 className="fw-bold mb-1">No Pending Deactivation Requests</h6>
                    <p className="text-muted small mb-0">All operator accounts are active or already processed.</p>
                  </td>
                </tr>
              ) : (
                requests.map((op) => (
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
                          Dismiss
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

export default DeactivationRequestsPage;
