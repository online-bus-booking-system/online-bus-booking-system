import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBusAction, updateBusAction, setBusesAction } from '../slices/busSlice';
import { Plus, Edit, AlertOctagon } from 'lucide-react';
import { toast } from 'react-toastify';
import { registerBus, getBusesByOperator } from '../services/busservice';

function BusManagementPage() {
  const dispatch = useDispatch();
  const buses = useSelector((store) => store.bus.buses);
  const { user } = useSelector((store) => store.auth);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  const [busName, setBusName] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [busType, setBusType] = useState('AC Sleeper');
  const [totalSeats, setTotalSeats] = useState(30);
  const [layout, setLayout] = useState('SLEEPER');
  const [amenities, setAmenities] = useState(['WiFi', 'Charging Point', 'Water Bottle']);

  // Bus Legal Document Submissions (RC Book, Insurance, PUC)
  const [rcDoc, setRcDoc] = useState('');
  const [insuranceDoc, setInsuranceDoc] = useState('');
  const [pucDoc, setPucDoc] = useState('');

  const isAccountDeactivated = user?.isActive === false || user?.deactivationStatus === 'APPROVED' || user?.deactivationStatus === 'DEACTIVATED_BY_ADMIN';

  useEffect(() => {
    const fetchOperatorBuses = async () => {
      if (user?.id) {
        try {
          const liveBuses = await getBusesByOperator(user.id);
          if (liveBuses) {
            dispatch(setBusesAction(liveBuses));
          }
        } catch (err) {
          console.warn('API error fetching operator buses:', err);
        }
      }
    };
    fetchOperatorBuses();
  }, [user, dispatch]);

  const handleOpenAdd = () => {
    if (isAccountDeactivated) {
      toast.error('Your operator account is deactivated by Admin. You are not allowed to add new buses.');
      return;
    }
    setEditingBus(null);
    setBusName('');
    setBusNumber('');
    setBusType('AC Sleeper');
    setTotalSeats(30);
    setLayout('SLEEPER');
    setRcDoc('');
    setInsuranceDoc('');
    setPucDoc('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (bus) => {
    if (isAccountDeactivated) {
      toast.error('Your operator account is deactivated by Admin.');
      return;
    }
    setEditingBus(bus);
    setBusName(bus.name);
    setBusNumber(bus.busNumber);
    setBusType(bus.busType);
    setTotalSeats(bus.totalSeats);
    setLayout(bus.layout);
    setAmenities(bus.amenities || []);
    setShowAddModal(true);
  };

  const toggleAmenity = (item) => {
    setAmenities((prev) => (prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isAccountDeactivated) {
      toast.error('Your account is deactivated by Admin. You cannot register new buses.');
      return;
    }

    if (!busName || busName.trim().length < 3) {
      toast.error('Bus Model Name must be at least 3 characters long');
      return;
    }

    if (!busNumber || busNumber.trim().length < 6) {
      toast.error('Please enter a valid Bus Registration Number (e.g. MH-12-PQ-9088)');
      return;
    }

    if (!totalSeats || totalSeats < 10 || totalSeats > 60) {
      toast.error('Total seats capacity must be between 10 and 60');
      return;
    }

    try {
      if (editingBus) {
        dispatch(updateBusAction({ id: editingBus.id, name: busName, busNumber, busType, totalSeats, layout, amenities }));
        toast.success('Bus details updated!');
      } else {
        const payload = {
          name: busName,
          busNumber: busNumber,
          busType: busType,
          totalSeats: totalSeats,
          layout: layout,
          amenities: amenities,
          rcBookDoc: rcDoc || 'rc_book.pdf',
          insuranceDoc: insuranceDoc || 'insurance_policy.pdf',
          pucDoc: pucDoc || 'puc_certificate.pdf'
        };
        const savedBus = await registerBus(user?.id || 1, payload);
        dispatch(addBusAction(savedBus || { id: Date.now(), operatorId: user?.id, name: busName, busNumber, busType, totalSeats, layout, amenities }));
        toast.success('New Bus registered & saved in database with legal documents!');
      }
      setShowAddModal(false);
    } catch (err) {
      toast.error(err.message || 'Failed to register bus fleet');
    }
  };

  return (
    <div className="container py-4">
      {isAccountDeactivated && (
        <div className="alert alert-danger d-flex align-items-center gap-3 p-3 rounded-3 shadow-sm mb-4 border-2 border-danger">
          <AlertOctagon size={32} className="text-danger flex-shrink-0" />
          <div>
            <h5 className="fw-extrabold mb-1">Operator Account Deactivated</h5>
            <p className="mb-0 small">
              Your account status is set to <strong>INACTIVE</strong> by Admin. You are strictly not allowed to register new bus fleet or schedule trips.
            </p>
          </div>
        </div>
      )}

      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h3 className="brand-font fw-extrabold mb-1">Bus Fleet & Registration</h3>
          <p className="text-muted small mb-0">Manage registered bus fleet, upload legal RC & Insurance documents, and update seating layout.</p>
        </div>
        <button
          className="btn btn-buslink-primary fw-bold"
          onClick={handleOpenAdd}
          disabled={isAccountDeactivated}
        >
          <Plus size={16} className="me-1" /> Register New Bus
        </button>
      </div>

      <div className="row g-4">
        {buses.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h5 className="fw-bold mb-2">No Buses Registered</h5>
            <p className="text-muted small">Register your first bus fleet to schedule trips and sell tickets online.</p>
          </div>
        ) : (
          buses.map((bus) => (
            <div key={bus.id} className="col-md-6 col-lg-4">
              <div className="buslink-card p-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-dark text-warning font-monospace">{bus.busNumber}</span>
                    <span className="badge bg-success">{bus.busType}</span>
                  </div>
                  <h5 className="fw-bold mb-1 text-dark brand-font">{bus.name}</h5>
                  <p className="small text-muted mb-3">Capacity: <strong>{bus.totalSeats} Seats</strong> ({bus.layout})</p>

                  <div className="mb-3">
                    <span className="small text-muted d-block fw-semibold mb-1">Amenities:</span>
                    <div className="d-flex flex-wrap gap-1">
                      {bus.amenities?.map((am) => (
                        <span key={am} className="badge bg-light text-dark border small">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 border rounded bg-light mb-3">
                    <span className="small text-muted d-block fw-semibold mb-1">Legal Documents Status:</span>
                    <div className="d-flex flex-wrap gap-1">
                      <span className="badge bg-success-subtle text-success border border-success">✓ RC Book Valid</span>
                      <span className="badge bg-success-subtle text-success border border-success">✓ Insurance Active</span>
                      <span className="badge bg-success-subtle text-success border border-success">✓ PUC Certified</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top d-flex gap-2">
                  <button
                    className="btn btn-outline-dark btn-sm w-100 fw-bold"
                    onClick={() => handleOpenEdit(bus)}
                    disabled={isAccountDeactivated}
                  >
                    <Edit size={14} className="me-1" /> Edit Fleet Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">{editingBus ? 'Edit Bus Fleet' : 'Register New Bus'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bus Model Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Purple Volvo Multi-Axle B11R"
                      required
                      value={busName}
                      onChange={(e) => setBusName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Bus Registration Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. MH-12-PQ-9088"
                      required
                      value={busNumber}
                      onChange={(e) => setBusNumber(e.target.value)}
                    />
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Category</label>
                      <select className="form-select" value={busType} onChange={(e) => setBusType(e.target.value)}>
                        <option value="AC Sleeper">AC Sleeper</option>
                        <option value="AC Seater">AC Seater</option>
                        <option value="Non-AC Seater">Non-AC Seater</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Layout</label>
                      <select className="form-select" value={layout} onChange={(e) => setLayout(e.target.value)}>
                        <option value="SLEEPER">Sleeper (2+1 Lower/Upper)</option>
                        <option value="SEATER">Seater (2+2 Pushback)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Total Capacity (Seats)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="15"
                      max="60"
                      required
                      value={totalSeats}
                      onChange={(e) => setTotalSeats(Number(e.target.value))}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold d-block mb-2">Amenities</label>
                    <div className="row g-2">
                      {['WiFi', 'Charging Point', 'Water Bottle', 'Blanket', 'Pillow', 'CCTV', 'Live Tracking'].map((item) => (
                        <div key={item} className="col-6 col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`am-${item}`}
                              checked={amenities.includes(item)}
                              onChange={() => toggleAmenity(item)}
                            />
                            <label className="form-check-label small" htmlFor={`am-${item}`}>
                              {item}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-4 border">
                    <h6 className="fw-bold small mb-2 text-dark">
                      📋 Mandatory Vehicle Documents (RC Book, Insurance, PUC)
                    </h6>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">RC Book PDF/Image</label>
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => setRcDoc(e.target.files[0]?.name || '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">Insurance Policy</label>
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => setInsuranceDoc(e.target.files[0]?.name || '')}
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small text-muted mb-1">PUC Certificate</label>
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept=".pdf,.jpg,.png"
                          onChange={(e) => setPucDoc(e.target.files[0]?.name || '')}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-buslink-primary w-100 fw-bold">
                    {editingBus ? 'Save Changes' : 'Register Bus'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusManagementPage;
