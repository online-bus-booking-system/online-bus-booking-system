import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRouteAction, setRoutesAction } from '../slices/busSlice';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { createRoute, getRoutesByOperator, getAllRoutes } from '../services/busservice';

function RouteManagementPage() {
  const dispatch = useDispatch();
  const routes = useSelector((store) => store.bus.routes);
  const { user } = useSelector((store) => store.auth);

  const [showAddRoute, setShowAddRoute] = useState(false);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(250);
  const [duration, setDuration] = useState('5h 00m');

  // Dynamic Boarding and Dropping Points
  const [boardingPoints, setBoardingPoints] = useState([
    { id: 'bp-1', location: 'Main Bus Stand', landmark: 'City Center', time: '07:00 AM' }
  ]);
  const [droppingPoints, setDroppingPoints] = useState([
    { id: 'dp-1', location: 'Central Stop', landmark: 'Highway Exit', time: '12:00 PM' }
  ]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        let liveRoutes = [];
        if (user?.id) {
          liveRoutes = await getRoutesByOperator(user.id);
        } else {
          liveRoutes = await getAllRoutes();
        }
        if (liveRoutes) {
          dispatch(setRoutesAction(liveRoutes));
        }
      } catch (err) {
        console.warn('API error fetching routes:', err);
      }
    };
    fetchRoutes();
  }, [user, dispatch]);

  const addBoardingPoint = () => {
    setBoardingPoints((prev) => [
      ...prev,
      { id: `bp-${Date.now()}`, location: '', landmark: '', time: '08:00 AM' }
    ]);
  };

  const removeBoardingPoint = (id) => {
    if (boardingPoints.length === 1) {
      toast.warning('At least one boarding point is required');
      return;
    }
    setBoardingPoints((prev) => prev.filter((bp) => bp.id !== id));
  };

  const updateBoardingPoint = (id, field, value) => {
    setBoardingPoints((prev) => prev.map((bp) => (bp.id === id ? { ...bp, [field]: value } : bp)));
  };

  const addDroppingPoint = () => {
    setDroppingPoints((prev) => [
      ...prev,
      { id: `dp-${Date.now()}`, location: '', landmark: '', time: '01:00 PM' }
    ]);
  };

  const removeDroppingPoint = (id) => {
    if (droppingPoints.length === 1) {
      toast.warning('At least one dropping point is required');
      return;
    }
    setDroppingPoints((prev) => prev.filter((dp) => dp.id !== id));
  };

  const updateDroppingPoint = (id, field, value) => {
    setDroppingPoints((prev) => prev.map((dp) => (dp.id === id ? { ...dp, [field]: value } : dp)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!source || !source.trim() || !destination || !destination.trim()) {
      toast.error('Both Source and Destination cities are required');
      return;
    }

    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      toast.error('Source and Destination cities cannot be the same');
      return;
    }

    if (!distanceKm || distanceKm <= 0) {
      toast.error('Distance in km must be greater than 0');
      return;
    }

    if (boardingPoints.some((bp) => !bp.location.trim())) {
      toast.error('Please enter a location name for all boarding points');
      return;
    }

    if (droppingPoints.some((dp) => !dp.location.trim())) {
      toast.error('Please enter a location name for all dropping points');
      return;
    }

    try {
      const payload = {
        sourceCity: source.trim(),
        destinationCity: destination.trim(),
        distanceKm: distanceKm,
        duration: duration || '4h 00m',
        boardingPoints: boardingPoints.map((bp) => ({ location: bp.location, landmark: bp.landmark, time: bp.time })),
        droppingPoints: droppingPoints.map((dp) => ({ location: dp.location, landmark: dp.landmark, time: dp.time }))
      };

      const savedRoute = await createRoute(payload, user?.id);
      dispatch(addRouteAction(savedRoute || payload));
      toast.success('Operator-specific route & stops saved successfully!');
      setShowAddRoute(false);

      // Refresh operator routes
      if (user?.id) {
        const updatedRoutes = await getRoutesByOperator(user.id);
        if (updatedRoutes) dispatch(setRoutesAction(updatedRoutes));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save route');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h3 className="brand-font fw-extrabold mb-1">Route & Stops Management</h3>
          <p className="text-muted small mb-0">Define your operator-specific travel routes, boarding pick-up points, and dropping locations.</p>
        </div>
        <button className="btn btn-buslink-primary fw-bold" onClick={() => setShowAddRoute(true)}>
          <Plus size={16} className="me-1" /> Add New Route
        </button>
      </div>

      <div className="d-grid gap-4">
        {routes.length === 0 ? (
          <div className="text-center py-5 bg-white rounded border">
            <h5 className="fw-bold mb-2">No Operator Routes Configured</h5>
            <p className="text-muted small mb-0">Click "Add New Route" to define travel routes and pick-up/drop-off stops unique to your bus fleet.</p>
          </div>
        ) : (
          routes.map((r) => (
            <div key={r.id || `${r.sourceCity}-${r.destinationCity}`} className="buslink-card p-4 bg-white">
              <div className="d-flex flex-wrap align-items-center justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <h4 className="fw-bold mb-1 text-dark brand-font">
                    {r.sourceCity || r.source} ➔ {r.destinationCity || r.destination}
                  </h4>
                  <span className="badge bg-light text-dark border me-2">{r.distanceKm} km</span>
                  <span className="badge bg-light text-dark border">Est. Duration: {r.duration}</span>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-6 border-end-md">
                  <h6 className="fw-bold text-uppercase text-warning small mb-2 d-flex align-items-center gap-1">
                    <MapPin size={16} /> Boarding Points ({r.sourceCity || r.source})
                  </h6>
                  <div className="d-grid gap-2">
                    {r.boardingPoints?.map((bp, idx) => (
                      <div key={idx} className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block text-dark small">{bp.location}</strong>
                          <span className="small text-muted">{bp.landmark}</span>
                        </div>
                        <span className="badge bg-dark text-warning">{bp.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-md-6">
                  <h6 className="fw-bold text-uppercase text-danger small mb-2 d-flex align-items-center gap-1">
                    <MapPin size={16} /> Dropping Points ({r.destinationCity || r.destination})
                  </h6>
                  <div className="d-grid gap-2">
                    {r.droppingPoints?.map((dp, idx) => (
                      <div key={idx} className="p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                        <div>
                          <strong className="d-block text-dark small">{dp.location}</strong>
                          <span className="small text-muted">{dp.landmark}</span>
                        </div>
                        <span className="badge bg-dark text-warning">{dp.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddRoute && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content buslink-card border-0">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title fw-bold">Create New Route & Stops</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddRoute(false)}></button>
              </div>
              <div className="modal-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Source City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Pune"
                        required
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Destination City</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Goa"
                        required
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Distance (in km)</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(Number(e.target.value))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Estimated Travel Duration</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 8h 30m"
                        required
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Boarding Points Section */}
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold small mb-0 text-dark d-flex align-items-center gap-1">
                        <MapPin size={16} className="text-warning" /> Boarding Pick-up Points ({source || 'Source'})
                      </h6>
                      <button type="button" className="btn btn-sm btn-outline-dark fw-semibold" onClick={addBoardingPoint}>
                        <Plus size={14} /> Add Boarding Point
                      </button>
                    </div>
                    <div className="d-grid gap-2">
                      {boardingPoints.map((bp) => (
                        <div key={bp.id} className="row g-2 align-items-center bg-white p-2 border rounded">
                          <div className="col-md-5">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Location name (e.g. Swargate)"
                              required
                              value={bp.location}
                              onChange={(e) => updateBoardingPoint(bp.id, 'location', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Landmark (e.g. Near Bus Stand)"
                              value={bp.landmark}
                              onChange={(e) => updateBoardingPoint(bp.id, 'landmark', e.target.value)}
                            />
                          </div>
                          <div className="col-md-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Time (06:00 AM)"
                              value={bp.time}
                              onChange={(e) => updateBoardingPoint(bp.id, 'time', e.target.value)}
                            />
                          </div>
                          <div className="col-md-1 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => removeBoardingPoint(bp.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dropping Points Section */}
                  <div className="p-3 bg-light rounded-3 mb-4 border">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold small mb-0 text-dark d-flex align-items-center gap-1">
                        <MapPin size={16} className="text-danger" /> Dropping Points ({destination || 'Destination'})
                      </h6>
                      <button type="button" className="btn btn-sm btn-outline-dark fw-semibold" onClick={addDroppingPoint}>
                        <Plus size={14} /> Add Dropping Point
                      </button>
                    </div>
                    <div className="d-grid gap-2">
                      {droppingPoints.map((dp) => (
                        <div key={dp.id} className="row g-2 align-items-center bg-white p-2 border rounded">
                          <div className="col-md-5">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Location name (e.g. Mapusa)"
                              required
                              value={dp.location}
                              onChange={(e) => updateDroppingPoint(dp.id, 'location', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Landmark (e.g. Highway Circle)"
                              value={dp.landmark}
                              onChange={(e) => updateDroppingPoint(dp.id, 'landmark', e.target.value)}
                            />
                          </div>
                          <div className="col-md-2">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Time (02:00 PM)"
                              value={dp.time}
                              onChange={(e) => updateDroppingPoint(dp.id, 'time', e.target.value)}
                            />
                          </div>
                          <div className="col-md-1 text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => removeDroppingPoint(dp.id)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-buslink-primary w-100 fw-bold">
                    Save New Route with Stops
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

export default RouteManagementPage;
