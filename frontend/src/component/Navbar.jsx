import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAction } from '../slices/authSlice';
import { setBookingsAction } from '../slices/bookingSlice';
import { Bus, User, Ticket, LogOut, ChevronDown, Compass, ShieldAlert, History, LayoutDashboard, Route as RouteIcon, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loginStatus, role, user } = useSelector((store) => store.auth);
  const bookings = useSelector((store) => store.booking.bookings);
  const activeBookingsCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;

  const handleLogout = () => {
    dispatch(logoutAction());
    dispatch(setBookingsAction([]));
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="navbar-custom navbar-dark">
      {/* Main Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark py-2.5 px-3 container-fluid">
        <div className="container-fluid">
          {/* Brand Logo - Links to Default Home Page */}
          <Link
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
            to="/"
          >
            <div
              className="d-flex align-items-center justify-content-center text-white rounded-3 p-2 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #FF5A00 0%, #FF7B25 100%)', boxShadow: '0 4px 14px rgba(255,90,0,0.35)' }}
            >
              <Bus size={24} strokeWidth={2.5} />
            </div>
            <div className="d-flex flex-column">
              <span className="brand-font fw-extrabold fs-3 text-white leading-tight" style={{ letterSpacing: '-0.5px' }}>
                Bus<span style={{ color: 'var(--buslink-orange)' }}>Link</span>
              </span>
              <span className="text-secondary small fw-bold" style={{ fontSize: '0.62rem', letterSpacing: '0.5px', marginTop: '-4px', color: '#94A3B8' }}>
                EXPRESS BUS TRAVEL
              </span>
            </div>
          </Link>

          {/* Toggle Button for Mobile */}
          <button
            className="navbar-toggler border-0 shadow-none p-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Links */}
          <div className="collapse navbar-collapse" id="navbarContent">
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              {(!role || role === 'customer') && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-2 ${isActivePath('/search') ? 'active' : ''}`} to="/search">
                      <Compass size={17} className="text-buslink-orange" /> Search Buses
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link-custom position-relative d-flex align-items-center gap-2 ${isActivePath('/my-bookings') ? 'active' : ''}`} to="/my-bookings">
                      <Ticket size={17} className="text-warning" /> My Bookings
                      {activeBookingsCount > 0 && (
                        <span className="badge rounded-pill bg-danger ms-1 shadow-sm">
                          {activeBookingsCount}
                        </span>
                      )}
                    </Link>
                  </li>
                </>
              )}

              {role === 'operator' && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1.5 ${isActivePath('/operator/dashboard') ? 'active' : ''}`} to="/operator/dashboard">
                      <LayoutDashboard size={16} /> Overview
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1.5 ${isActivePath('/operator/fleet') ? 'active' : ''}`} to="/operator/fleet">
                      <Bus size={16} /> Fleet Management
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1.5 ${isActivePath('/operator/routes') ? 'active' : ''}`} to="/operator/routes">
                      <RouteIcon size={16} /> Routes
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1.5 ${isActivePath('/operator/trips') ? 'active' : ''}`} to="/operator/trips">
                      <Calendar size={16} /> Trips Scheduler
                    </Link>
                  </li>
                </>
              )}

              {role === 'admin' && (
                <>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1 ${isActivePath('/admin/dashboard') ? 'active' : ''}`} to="/admin/dashboard">
                      Master Analytics
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1 ${isActivePath('/admin/registrations') ? 'active' : ''}`} to="/admin/registrations">
                      Registrations Queue
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`nav-link-custom d-flex align-items-center gap-1 ${isActivePath('/admin/operators') ? 'active' : ''}`} to="/admin/operators">
                      Operators Directory
                    </Link>
                  </li>

                  {/* Admin Actions Dropdown */}
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link-custom dropdown-toggle d-flex align-items-center gap-1 cursor-pointer"
                      href="#adminActions"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Admin Actions <ChevronDown size={14} className="text-secondary" />
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-custom shadow-lg mt-2">
                      <li>
                        <Link className="dropdown-item dropdown-item-custom text-danger d-flex align-items-center gap-2" to="/admin/deactivation-requests">
                          <ShieldAlert size={15} /> Deactivation Requests
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider my-1 border-secondary opacity-25" /></li>
                      <li>
                        <Link className="dropdown-item dropdown-item-custom d-flex align-items-center gap-2" to="/admin/verification-history">
                          <History size={15} className="text-info" /> Verification History
                        </Link>
                      </li>
                    </ul>
                  </li>
                </>
              )}

              {loginStatus ? (
                <li className="nav-item d-flex align-items-center gap-2 ms-lg-2">
                  <Link to="/profile" className="btn btn-dark border border-secondary text-white btn-sm fw-semibold text-decoration-none d-flex align-items-center px-3 py-1.5 rounded-3 shadow-xs">
                    <User size={15} className="me-1 text-buslink-orange" /> {user?.name || 'My Profile'}
                  </Link>
                  <button className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center gap-1 px-3 py-1.5 rounded-3" onClick={handleLogout}>
                    <LogOut size={15} /> Logout
                  </button>
                </li>
              ) : (
                <li className="nav-item d-flex gap-2 ms-lg-2">
                  <Link className="btn btn-buslink-outline btn-sm fw-bold px-3 py-2" to="/login">
                    Sign In
                  </Link>
                  <Link className="btn btn-buslink-primary btn-sm fw-bold px-3 py-2" to="/register">
                    Register
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
