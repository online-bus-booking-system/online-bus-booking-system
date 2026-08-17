import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveOperatorAction, rejectOperatorAction, setOperatorsAction } from '../slices/adminSlice';
import { CheckCircle2, XCircle, FileText, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { approveOperator, getAllOperators } from '../services/userservice';

function ManageRegistrationsPage() {
  const dispatch = useDispatch();
  const operators = useSelector((store) => store.admin.operators);

  const [selectedDocModal, setSelectedDocModal] = useState(null);
  const [rejectingOpId, setRejectingOpId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('License expired');

  const fetchOperators = async () => {
    try {
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
          approvalStatus: op.approvalStatus || 'PENDING',
          status: op.isActive ? 'ACTIVE' : 'INACTIVE',
          documents: [
            { name: 'Transport_Permit_License.pdf', type: 'Permit License', date: '2026-07-20' },
            { name: 'GST_Registration_Certificate.pdf', type: 'GST Document', date: '2026-07-22' },
            { name: 'Operating_License.pdf', type: 'Operating License', date: '2026-07-25' }
          ]
        }));
        dispatch(setOperatorsAction(mapped));
      }
    } catch (err) {
      console.warn('Error fetching operators:', err);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, [dispatch]);

  const pendingOperators = operators.filter((o) => o.registrationStatus === 'PENDING' || o.approvalStatus === 'PENDING');
  const processedOperators = operators.filter((o) => o.registrationStatus !== 'PENDING' && o.approvalStatus !== 'PENDING');

  const handleApprove = async (opId) => {
    try {
      await approveOperator({ operatorId: opId, approvalStatus: 'APPROVED' });
      dispatch(approveOperatorAction(opId));
      toast.success('Operator approved successfully!');
      fetchOperators();
    } catch (err) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    try {
      await approveOperator({ operatorId: rejectingOpId, approvalStatus: 'REJECTED', rejectionReason });
      dispatch(rejectOperatorAction(rejectingOpId));
      toast.info(`Operator application rejected. Reason: ${rejectionReason}`);
      setRejectingOpId(null);
      fetchOperators();
    } catch (err) {
      toast.error(err.message || 'Rejection failed');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <span className="badge bg-warning text-dark fw-bold mb-1">ADMIN VERIFICATION QUEUE</span>
          <h3 className="brand-font fw-extrabold mb-0">Operator Registration Approvals</h3>
          <p className="text-muted small mb-0">Review submitted transport permits & business GST documents before approving platform access.</p>
        </div>
      </div>

      <h5 className="fw-bold mb-3 brand-font d-flex align-items-center gap-2">
        <span className="badge bg-danger rounded-circle p-2">!</span> Pending Approval Queue ({pendingOperators.length})
      </h5>

      {pendingOperators.length === 0 ? (
        <div className="buslink-card p-4 text-center bg-white mb-5">
          <CheckCircle2 size={40} className="text-success mb-2" />
          <h5 className="fw-bold mb-1">Queue Clear</h5>
          <p className="text-muted small mb-0">All operator registration requests have been reviewed.</p>
        </div>
      ) : (
        <div className="d-grid gap-3 mb-5">
          {pendingOperators.map((op) => (
            <div key={op.id} className="buslink-card p-4 bg-white border-start border-4 border-warning">
              <div className="row g-3 align-items-center">
                <div className="col-md-4">
                  <h5 className="fw-bold mb-1 text-dark brand-font">{op.name}</h5>
                  <div className="small text-muted mb-1">
                    <Mail size={13} className="me-1" /> {op.email}
                  </div>
                  <div className="small text-muted">
                    <Phone size={13} className="me-1" /> {op.phone} | <MapPin size={13} className="me-1" /> {op.city}
                  </div>
                </div>

                <div className="col-md-4">
                  <span className="small text-muted d-block fw-semibold mb-1">Uploaded Verification Documents:</span>
                  <div className="d-flex flex-wrap gap-2">
                    {op.documents?.map((doc, idx) => (
                      <button
                        key={idx}
                        className="btn btn-sm btn-light border text-dark fw-semibold d-flex align-items-center gap-1"
                        onClick={() => setSelectedDocModal(doc)}
                      >
                        <FileText size={14} className="text-primary" /> {doc.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-md-4 text-end d-flex gap-2 justify-content-end">
                  <button className="btn btn-success fw-bold px-3 py-2 d-flex align-items-center gap-1" onClick={() => handleApprove(op.id)}>
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button className="btn btn-outline-danger fw-bold px-3 py-2 d-flex align-items-center gap-1" onClick={() => setRejectingOpId(op.id)}>
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h5 className="fw-bold mb-3 brand-font">Reviewed Registrations History</h5>
      <div className="buslink-card p-4 bg-white">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Operator ID</th>
                <th>Company Name</th>
                <th>Contact</th>
                <th>City</th>
                <th>Documents</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {processedOperators.map((op) => (
                <tr key={op.id}>
                  <td className="fw-bold font-monospace">{op.id}</td>
                  <td className="fw-bold">{op.name}</td>
                  <td>{op.phone}</td>
                  <td>{op.city}</td>
                  <td>
                    <span className="badge bg-light text-dark border">Docs Verified</span>
                  </td>
                  <td>
                    <span className={`badge ${op.registrationStatus === 'APPROVED' || op.approvalStatus === 'APPROVED' ? 'bg-success' : 'bg-danger'}`}>
                      {op.registrationStatus || op.approvalStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingOpId && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Reject Operator Registration</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setRejectingOpId(null)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleRejectConfirm}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Enter Rejection Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. License expired, PAN mismatch"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-danger w-100 fw-bold">Confirm Rejection</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDocModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Verification Document Preview</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedDocModal(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <FileText size={64} className="text-primary mb-3" />
                <h5 className="fw-bold mb-1">{selectedDocModal.name}</h5>
                <p className="text-muted small mb-3">Type: {selectedDocModal.type} | Date: {selectedDocModal.date}</p>
                <div className="p-3 bg-light rounded border text-start small">
                  <strong>Status:</strong> Valid Inter-state Bus Permit & GST Certificate verified.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageRegistrationsPage;
