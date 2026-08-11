import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userSignup } from '../services/userservice';
import { toast } from 'react-toastify';
import { User, Lock, Mail, Phone, Building, ArrowRight, FileText } from 'lucide-react';

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');

  // Operator Document Uploads
  const [panDoc, setPanDoc] = useState('');
  const [gstDoc, setGstDoc] = useState('');
  const [licenseDoc, setLicenseDoc] = useState('');

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    try {
      const body = {
        role,
        fullName,
        email,
        gender: role === 'customer' ? gender : null,
        phone,
        companyName,
        password,
        documents: role === 'operator' ? [
          { documentType: 'PAN_CARD', documentName: panDoc || 'pan_card.pdf' },
          { documentType: 'GST_CERTIFICATE', documentName: gstDoc || 'gst_certificate.pdf' },
          { documentType: 'OPERATING_LICENSE', documentName: licenseDoc || 'operating_license.pdf' }
        ] : []
      };

      await userSignup(body);
      toast.success('Registration successful! Please Sign In.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error during registration');
      console.log(error);
    }
  };

  return (
    <div className="container py-5 my-3">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="buslink-card p-4 p-md-5 bg-white border-0 shadow-lg">
            <div className="text-center mb-4">
              <h3 className="brand-font fw-extrabold text-dark mb-1">Create Account</h3>
              <p className="text-muted small mb-0">Join BusLink to book tickets or register your bus fleet.</p>
            </div>

            <form onSubmit={handleRegisterClick}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted text-uppercase">I want to register as</label>
                <div className="d-flex gap-2">
                  <div className="form-check flex-fill p-2 border rounded-3 bg-light">
                    <input
                      className="form-check-input ms-1"
                      type="radio"
                      name="regRole"
                      id="regCustomer"
                      checked={role === 'customer'}
                      onChange={() => setRole('customer')}
                    />
                    <label className="form-check-label fw-semibold ms-2 cursor-pointer" htmlFor="regCustomer">
                      Passenger
                    </label>
                  </div>
                  <div className="form-check flex-fill p-2 border rounded-3 bg-light">
                    <input
                      className="form-check-input ms-1"
                      type="radio"
                      name="regRole"
                      id="regOperator"
                      checked={role === 'operator'}
                      onChange={() => setRole('operator')}
                    />
                    <label className="form-check-label fw-semibold ms-2 cursor-pointer" htmlFor="regOperator">
                      Bus Operator
                    </label>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className={role === 'customer' ? 'col-md-7' : 'col-md-12'}>
                  <label className="form-label small fw-semibold">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><User size={16} /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter full name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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

              {role === 'operator' && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Agency / Company Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Building size={16} /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Royal Travels Pvt Ltd"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white"><Mail size={16} /></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
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
                      placeholder="+91 98765 43210"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {role === 'operator' && (
                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <h6 className="fw-bold small mb-2 d-flex align-items-center gap-1 text-dark">
                    <FileText size={15} className="text-buslink-orange" /> Mandatory Operator Verification Documents
                  </h6>
                  <div className="d-grid gap-2">
                    <div>
                      <label className="form-label small text-muted mb-1">PAN Card (PDF/Image)</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setPanDoc(e.target.files[0]?.name || '')}
                      />
                    </div>
                    <div>
                      <label className="form-label small text-muted mb-1">GST Registration Certificate</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setGstDoc(e.target.files[0]?.name || '')}
                      />
                    </div>
                    <div>
                      <label className="form-label small text-muted mb-1">Bus Operating License</label>
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf,.jpg,.png"
                        onChange={(e) => setLicenseDoc(e.target.files[0]?.name || '')}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Lock size={16} /></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4 text-center small">
                <span className="text-muted">Already have an account? </span>
                <Link to="/login" className="fw-bold text-buslink-orange text-decoration-none">
                  Sign In Here
                </Link>
              </div>

              <button type="submit" className="btn btn-buslink-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2">
                Register Account <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
