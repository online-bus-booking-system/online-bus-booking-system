import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileAction, logoutAction } from '../slices/authSlice';
import { User, Mail, Phone, Shield, Edit2, CheckCircle2, Save, Trash2, AlertTriangle, FileUp, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { softDeleteCustomer, requestOperatorDeactivation, resubmitOperatorDocs, checkOperatorDeactivationEligibility } from '../services/userservice';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector((store) => store.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(user?.email || 'user@gmail.com');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  
  // Deactivation state
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [scheduledTripsWarning, setScheduledTripsWarning] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Operator resubmission docs state
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [resubmitPan, setResubmitPan] = useState('');
  const [resubmitGst, setResubmitGst] = useState('');
  const [resubmitLicense, setResubmitLicense] = useState('');

  const handleSave = (e) => {
    e.preventDefault();

    if (!name || name.trim().length < 2) {
      toast.error('Please enter a valid name');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    const phoneDigits = (phone || '').replace(/\D/g, '');
    if (!phone || phoneDigits.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    dispatch(
      updateProfileAction({
        name: name.trim(),
        email: email.trim(),
        gender,
        phone: phone.trim()
      })
    );

    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCustomerSoftDelete = async () => {
    if (window.confirm('Are you sure you want to deactivate/delete your customer account?')) {
      try {
        await softDeleteCustomer(user?.id || 100);
        toast.success('Customer account soft deleted successfully.');
        dispatch(logoutAction());
        navigate('/search');
      } catch (err) {
        toast.error(err.message || 'Cannot delete account because you have an upcoming journey.');
      }
    }
  };

  const handleOpenDeactivateModal = async () => {
    setCheckingEligibility(true);
    setScheduledTripsWarning(null);
    try {
      const eligibility = await checkOperatorDeactivationEligibility(user?.id || 10);
      if (eligibility && !eligibility.isEligible) {
        setScheduledTripsWarning(eligibility.message || `Cannot request account deactivation while you have ${eligibility.scheduledTripsCount} scheduled or upcoming trips.`);
      }
      setShowDeactivateModal(true);
    } catch (err) {
      toast.error(err.message || 'Failed to check deactivation eligibility.');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleOperatorDeactivationRequest = async (e) => {
    e.preventDefault();
    if (scheduledTripsWarning) {
      toast.error('Please complete all scheduled trips before requesting account deactivation.');
      return;
    }
    if (!deactivationReason.trim()) {
      toast.error('Please provide a reason for account deactivation.');
      return;
    }

    try {
      await requestOperatorDeactivation(user?.id || 10, deactivationReason.trim());
      toast.success('Account deactivation request submitted to Admin for review.');
      setShowDeactivateModal(false);
    } catch (err) {
      toast.error(err.message || 'Cannot request account deactivation while you have scheduled or upcoming trips.');
    }
  };

  const handleResubmitDocs = async (e) => {
    e.preventDefault();
    try {
      await resubmitOperatorDocs(user?.id || 10, {
        companyName: user?.companyName || user?.name,
        documents: [
          { documentType: 'PAN_CARD', documentName: resubmitPan || 'pan_card_updated.pdf' },
          { documentType: 'GST_CERTIFICATE', documentName: resubmitGst || 'gst_cert_updated.pdf' },
          { documentType: 'OPERATING_LICENSE', documentName: resubmitLicense || 'operating_license_updated.pdf' }
        ]
      });
      toast.success('Updated documents resubmitted! Pending Admin review.');
      setShowResubmitModal(false);
    } catch (err) {
      toast.error(err.message || 'Resubmission failed.');
    }
  };

  const isEditableRole = role === 'customer' || role === 'operator';

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          {user?.approvalStatus === 'REJECTED' && (
            <div className="alert alert-danger shadow-sm border-0 mb-4 p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="fw-bold mb-1">
                    <AlertTriangle size={18} className="me-1 text-danger" /> Operator Registration Rejected
                  </h6>
                  <p className="small mb-0">Reason: <strong>{user?.rejectionReason || 'License expired or missing'}</strong></p>
                </div>
                <button className="btn btn-dark btn-sm fw-bold" onClick={() => setShowResubmitModal(true)}>
                  <FileUp size={14} className="me-1" /> Resubmit Docs
                </button>
              </div>
            </div>
          )}

          {user?.approvalStatus === 'DEACTIVATION_REQUESTED' && (
            <div className="alert alert-warning shadow-sm border-0 mb-4 p-3">
              <div className="d-flex align-items-center gap-2">
                <AlertCircle size={20} className="text-warning" />
                <div>
                  <h6 className="fw-bold mb-0">Deactivation Requested</h6>
                  <p className="small mb-0 text-muted">Your account deactivation request is currently under review by Admin.</p>
                </div>
              </div>
            </div>
          )}

          <div className="buslink-card p-4 p-md-5 bg-white border-0 shadow-sm">
            <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-4 mb-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-3 shadow-sm"
                  style={{ width: 64, height: 64, backgroundColor: 'var(--buslink-orange)' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="fw-extrabold mb-1 brand-font">{user?.name || 'User Profile'}</h4>
                  <span className="badge bg-dark text-warning text-uppercase px-2 py-1 me-2">
                    Role: {role}
                  </span>
                  <span className="badge bg-success-subtle text-success border border-success">
                    <CheckCircle2 size={12} className="me-1" /> Active Account
                  </span>
                </div>
              </div>

              {isEditableRole && !isEditing && (
                <button className="btn btn-outline-dark fw-bold btn-sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} className="me-1" /> Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="row g-3 mb-3">
                  <div className={role === 'customer' ? 'col-md-7' : 'col-md-12'}>
                    <label className="form-label small fw-semibold">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><User size={16} /></span>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  {role === 'customer' && (
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold">Gender</label>
                      <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><Mail size={16} /></span>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mobile Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white"><Phone size={16} /></span>
                      <input
                        type="tel"
                        className="form-control"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-buslink-primary fw-bold px-4">
                    <Save size={16} className="me-1" /> Save Profile
                  </button>
                  <button type="button" className="btn btn-light border fw-semibold" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="d-grid gap-3">
                <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted fw-semibold d-block">Full Name</span>
                    <strong className="text-dark fs-6">{user?.name || name}</strong>
                  </div>
                  <User size={20} className="text-muted" />
                </div>

                {role === 'customer' && (
                  <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
                    <div>
                      <span className="small text-muted fw-semibold d-block">Gender</span>
                      <strong className="text-dark fs-6">{user?.gender || gender}</strong>
                    </div>
                    <Shield size={20} className="text-muted" />
                  </div>
                )}

                <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted fw-semibold d-block">Email Address</span>
                    <strong className="text-dark fs-6">{user?.email || email}</strong>
                  </div>
                  <Mail size={20} className="text-muted" />
                </div>

                <div className="p-3 border rounded-3 bg-light d-flex align-items-center justify-content-between">
                  <div>
                    <span className="small text-muted fw-semibold d-block">Mobile Number</span>
                    <strong className="text-dark fs-6">{user?.phone || phone}</strong>
                  </div>
                  <Phone size={20} className="text-muted" />
                </div>

                {role === 'customer' && (
                  <div className="pt-3 border-top">
                    <button className="btn btn-outline-danger btn-sm fw-bold w-100" onClick={handleCustomerSoftDelete}>
                      <Trash2 size={14} className="me-1" /> Delete My Account
                    </button>
                  </div>
                )}

                {role === 'operator' && (
                  <div className="pt-3 border-top">
                    <button 
                      className="btn btn-outline-danger btn-sm fw-bold w-100" 
                      onClick={handleOpenDeactivateModal}
                      disabled={checkingEligibility}
                    >
                      <AlertTriangle size={14} className="me-1" /> 
                      {checkingEligibility ? 'Checking Eligibility...' : 'Request Account Deactivation'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeactivateModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0 shadow-2xl rounded-4">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Request Account Deactivation</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeactivateModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {scheduledTripsWarning ? (
                  <div className="alert alert-danger border-start border-4 border-danger p-3 mb-3">
                    <div className="d-flex align-items-start gap-2">
                      <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-1" />
                      <div>
                        <h6 className="fw-bold mb-1">Deactivation Blocked</h6>
                        <p className="small mb-0">{scheduledTripsWarning}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="small text-muted mb-3">
                    Your account is eligible for closure. Please state your reason below. Your deactivation request will be submitted to Admin for review.
                  </p>
                )}

                <form onSubmit={handleOperatorDeactivationRequest}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason for Closure / Deactivation</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      required
                      disabled={Boolean(scheduledTripsWarning)}
                      placeholder="e.g. Business closure or fleet migration"
                      value={deactivationReason}
                      onChange={(e) => setDeactivationReason(e.target.value)}
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-danger w-100 fw-bold"
                    disabled={Boolean(scheduledTripsWarning)}
                  >
                    Submit Deactivation Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResubmitModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Resubmit Verification Documents</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResubmitModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleResubmitDocs}>
                  <p className="small text-muted mb-3">
                    Upload updated legal documents to address the rejection reason: <strong>{user?.rejectionReason || 'License expired'}</strong>
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">PAN Card Document</label>
                    <input type="file" className="form-control form-control-sm" onChange={(e) => setResubmitPan(e.target.files[0]?.name)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">GST Registration Certificate</label>
                    <input type="file" className="form-control form-control-sm" onChange={(e) => setResubmitGst(e.target.files[0]?.name)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bus Operating License</label>
                    <input type="file" className="form-control form-control-sm" onChange={(e) => setResubmitLicense(e.target.files[0]?.name)} />
                  </div>
                  <button type="submit" className="btn btn-buslink-primary w-100 fw-bold">Resubmit for Admin Review</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
