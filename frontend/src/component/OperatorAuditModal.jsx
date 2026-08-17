import React, { useState, useEffect } from 'react';
import { getOperatorAuditDetails } from '../services/userservice';
import { Bus, MapPin, Star, AlertTriangle, ShieldCheck, User, Mail, Phone, Building } from 'lucide-react';

const OperatorAuditModal = ({ operatorId, onClose, onApproveDeactivation, onRejectDeactivation }) => {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAudit = async () => {
      setLoading(true);
      try {
        const data = await getOperatorAuditDetails(operatorId);
        setAuditData(data);
      } catch (err) {
        setError(err.message || 'Failed to load operator audit details');
      } finally {
        setLoading(false);
      }
    };
    if (operatorId) {
      fetchAudit();
    }
  }, [operatorId]);

  if (!operatorId) return null;

  const hasDeactivationRequest = auditData?.deactivationStatus === 'REQUESTED' || auditData?.approvalStatus === 'DEACTIVATION_REQUESTED' || auditData?.deactivationReason;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          
          {/* Header */}
          <div className="modal-header bg-dark text-white p-3 px-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <ShieldCheck className="text-warning" size={24} />
              <div>
                <h5 className="modal-title fw-bold mb-0">Operator Audit & Profile Review</h5>
                <span className="small text-muted">Verification details excluding financial revenue</span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4 bg-light">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status"></div>
                <p className="mt-2 text-muted fw-semibold">Loading operator details...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger p-3">{error}</div>
            ) : auditData ? (
              <div>
                {/* Deactivation Reason Callout - Only shown if requested */}
                {hasDeactivationRequest && (
                  <div className="alert alert-warning border-start border-4 border-warning shadow-sm mb-4">
                    <div className="d-flex align-items-start gap-3">
                      <AlertTriangle className="text-warning flex-shrink-0 mt-1" size={22} />
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">Deactivation Request Pending Review</h6>
                        <p className="mb-0 text-dark small">
                          <strong>Reason Provided by Operator:</strong> "{auditData.deactivationReason || 'No reason specified'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Summary Card */}
                <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
                  <div className="row g-3 align-items-center">
                    <div className="col-md-7">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle bg-warning bg-opacity-20 text-dark d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: 54, height: 54 }}>
                          {auditData.companyName ? auditData.companyName.charAt(0) : 'O'}
                        </div>
                        <div>
                          <h4 className="fw-bold text-dark mb-1">{auditData.companyName}</h4>
                          <p className="text-muted small mb-1 flex items-center gap-2">
                            <User size={14} /> {auditData.fullName} &nbsp;|&nbsp; <Building size={14} /> {auditData.city || 'Pune'}
                          </p>
                          <div className="d-flex gap-2">
                            <span className="badge bg-secondary"><Mail size={12} /> {auditData.email}</span>
                            <span className="badge bg-secondary"><Phone size={12} /> {auditData.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-5 text-md-end border-start border-md-start-0 border-light ps-md-4">
                      <div className="d-flex justify-content-md-end gap-3 text-center">
                        <div className="p-2 bg-light rounded px-3">
                          <span className="small text-muted d-block fw-bold">RATING</span>
                          <span className="fw-extrabold text-warning fs-5 flex items-center gap-1">
                            <Star size={16} fill="#f59e0b" /> {auditData.rating || 4.5}
                          </span>
                        </div>
                        <div className="p-2 bg-light rounded px-3">
                          <span className="small text-muted d-block fw-bold">TOTAL TRIPS</span>
                          <span className="fw-extrabold text-dark fs-5">{auditData.totalTripsCount}</span>
                        </div>
                        <div className="p-2 bg-light rounded px-3">
                          <span className="small text-muted d-block fw-bold">SCHEDULED</span>
                          <span className="fw-extrabold text-primary fs-5">{auditData.scheduledTripsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <ul className="nav nav-pills nav-fill mb-3 bg-white p-1 rounded-3 shadow-sm border">
                  <li className="nav-item">
                    <button 
                      className={`nav-link fw-bold btn-sm ${activeTab === 'overview' ? 'active bg-dark text-white' : 'text-dark'}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      <Bus size={15} className="me-1" /> Fleet ({auditData.buses?.length || 0})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link fw-bold btn-sm ${activeTab === 'routes' ? 'active bg-dark text-white' : 'text-dark'}`}
                      onClick={() => setActiveTab('routes')}
                    >
                      <MapPin size={15} className="me-1" /> Routes ({auditData.routes?.length || 0})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link fw-bold btn-sm ${activeTab === 'reviews' ? 'active bg-dark text-white' : 'text-dark'}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      <Star size={15} className="me-1" /> Reviews ({auditData.reviews?.length || 0})
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="card border-0 shadow-sm p-3 bg-white">
                    <h6 className="fw-bold mb-3">Registered Fleet & Buses</h6>
                    {!auditData.buses || auditData.buses.length === 0 ? (
                      <p className="text-muted small mb-0">No buses registered by this operator.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Bus Name</th>
                              <th>Bus Number</th>
                              <th>Type</th>
                              <th>Seats</th>
                              <th>Layout</th>
                              <th>Amenities</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditData.buses.map((bus) => (
                              <tr key={bus.id}>
                                <td className="fw-bold">{bus.busName}</td>
                                <td><span className="badge bg-light text-dark border">{bus.busNumber}</span></td>
                                <td>{bus.busType}</td>
                                <td>{bus.totalSeats} Seats</td>
                                <td>{bus.layoutType}</td>
                                <td className="small text-muted">{bus.amenities || 'Standard'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'routes' && (
                  <div className="card border-0 shadow-sm p-3 bg-white">
                    <h6 className="fw-bold mb-3">Operator Created Routes</h6>
                    {!auditData.routes || auditData.routes.length === 0 ? (
                      <p className="text-muted small mb-0">No routes registered by this operator.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Route ID</th>
                              <th>Source City</th>
                              <th>Destination City</th>
                              <th>Distance (Km)</th>
                              <th>Duration (Hrs)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditData.routes.map((route) => (
                              <tr key={route.id}>
                                <td>#{route.id}</td>
                                <td className="fw-bold text-success">{route.sourceCity}</td>
                                <td className="fw-bold text-primary">{route.destinationCity}</td>
                                <td>{route.distanceKm || 'N/A'} km</td>
                                <td>{route.duration || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="card border-0 shadow-sm p-3 bg-white">
                    <h6 className="fw-bold mb-3">Customer Ratings & Feedback</h6>
                    {!auditData.reviews || auditData.reviews.length === 0 ? (
                      <p className="text-muted small mb-0">No customer reviews recorded yet.</p>
                    ) : (
                      <div className="d-grid gap-2">
                        {auditData.reviews.map((rev) => (
                          <div key={rev.id} className="p-3 border rounded-3 bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="fw-bold small">{rev.customerName}</span>
                              <span className="badge bg-warning text-dark flex items-center gap-1">
                                <Star size={12} fill="#000" /> {rev.rating} / 5
                              </span>
                            </div>
                            <p className="small text-muted mb-0">"{rev.comment || 'Great service'}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Footer - ONLY show Approve / Dismiss IF operator actually requested deactivation */}
          <div className="modal-footer bg-white p-3 px-4 d-flex justify-content-between">
            <button type="button" className="btn btn-secondary fw-semibold btn-sm" onClick={onClose}>Close</button>
            
            {hasDeactivationRequest && onApproveDeactivation && (
              <div className="d-flex gap-2">
                {onRejectDeactivation && (
                  <button 
                    type="button" 
                    className="btn btn-outline-dark fw-bold btn-sm"
                    onClick={() => {
                      onRejectDeactivation(operatorId);
                      onClose();
                    }}
                  >
                    Dismiss Request
                  </button>
                )}
                <button 
                  type="button" 
                  className="btn btn-danger fw-bold btn-sm"
                  onClick={() => {
                    onApproveDeactivation(operatorId);
                    onClose();
                  }}
                >
                  Approve Deactivation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorAuditModal;
