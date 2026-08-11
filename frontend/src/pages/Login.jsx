import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginAction } from '../slices/authSlice';
import { userSignin } from '../services/userservice';
import { toast } from 'react-toastify';
import { Lock, Mail, ArrowRight } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignInClick = async (e) => {
    e.preventDefault();
    try {
      const { user, token } = await userSignin(email, password);
      const userRole = user.role ? user.role.toLowerCase() : 'customer';
      toast.success(`Signin successful! Welcome ${user.name}`);
      dispatch(
        loginAction({
          user: user,
          token: token,
          role: userRole
        })
      );

      if (userRole === 'customer') navigate('/search');
      else if (userRole === 'operator') navigate('/operator/dashboard');
      else if (userRole === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password');
      console.log(error);
    }
  };

  return (
    <div className="container py-5 my-3">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="buslink-card p-4 p-md-5 bg-white border-0 shadow-lg">
            <div className="text-center mb-4">
              <h3 className="brand-font fw-extrabold text-dark mb-1">Welcome Back</h3>
              <p className="text-muted small mb-0">Sign in to your account to manage bookings & trips.</p>
            </div>

            <form onSubmit={handleSignInClick}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Mail size={16} /></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-white"><Lock size={16} /></span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4 text-center small">
                <span className="text-muted">Don't have an account yet? </span>
                <Link to="/register" className="fw-bold text-buslink-orange text-decoration-none">
                  Register Here
                </Link>
              </div>

              <button type="submit" className="btn btn-buslink-primary w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2">
                Sign In to Account <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
