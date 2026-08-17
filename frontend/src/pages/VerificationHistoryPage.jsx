import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setOperatorsAction } from '../slices/adminSlice';
import { ShieldCheck } from 'lucide-react';
import { getAllOperators } from '../services/userservice';

function VerificationHistoryPage() {
  const dispatch = useDispatch();
  const operators = useSelector((store) => store.admin.operators);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const liveOps = await getAllOperators();
        if (liveOps) {
          dispatch(setOperatorsAction(liveOps));
        }
      } catch (err) {
        console.warn('Error fetching operators for verification history:', err);
      }
    };
    fetchOperators();
  }, [dispatch]);

  const processedOperators = operators.filter(
    (o) => o.approvalStatus !== 'PENDING' && o.registrationStatus !== 'PENDING'
  );

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <span className="badge bg-success text-white fw-bold mb-1">VERIFICATION LOG</span>
          <h3 className="brand-font fw-extrabold mb-0">Verification History</h3>
          <p className="text-muted small mb-0">Historical log of all operator registration applications reviewed, approved, or rejected on the platform.</p>
        </div>
      </div>

      <div className="buslink-card p-4 bg-white shadow-sm border-0">
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
              {processedOperators.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No reviewed registration records found.
                  </td>
                </tr>
              ) : (
                processedOperators.map((op) => {
                  const status = op.approvalStatus || op.registrationStatus;
                  const isApproved = status === 'APPROVED';

                  return (
                    <tr key={op.id}>
                      <td className="fw-bold font-monospace">#{op.id}</td>
                      <td className="fw-bold text-dark">{op.companyName || op.name}</td>
                      <td>{op.phone}</td>
                      <td>{op.city || 'Pune'}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          <ShieldCheck size={12} className="me-1 text-success" /> Docs Verified
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isApproved ? 'bg-success' : 'bg-danger'}`}>
                          {status}
                        </span>
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
  );
}

export default VerificationHistoryPage;
