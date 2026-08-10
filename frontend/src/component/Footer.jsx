import React from 'react';
import { Bus, ShieldCheck, HeartHandshake, Award, Clock } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary">
      <div className="container">
        {/* Features banner */}
        <div className="row g-4 pb-5 border-bottom border-secondary">
          <div className="col-md-3 d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-secondary bg-opacity-25 text-warning">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">100% Secure Payments</h6>
              <p className="text-light opacity-75 small mb-0">UPI, Cards, NetBanking protected</p>
            </div>
          </div>
          <div className="col-md-3 d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-secondary bg-opacity-25 text-warning">
              <Award size={28} />
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">Verified Bus Operators</h6>
              <p className="text-light opacity-75 small mb-0">Strict admin document verification</p>
            </div>
          </div>
          <div className="col-md-3 d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-secondary bg-opacity-25 text-warning">
              <Clock size={28} />
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">Live Bus Tracking</h6>
              <p className="text-light opacity-75 small mb-0">Real-time trip departure alerts</p>
            </div>
          </div>
          <div className="col-md-3 d-flex align-items-center gap-3">
            <div className="p-3 rounded-circle bg-secondary bg-opacity-25 text-warning">
              <HeartHandshake size={28} />
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-white">Instant Cancellation</h6>
              <p className="text-light opacity-75 small mb-0">Easy refunds & transparent policy</p>
            </div>
          </div>
        </div>

        <div className="row g-4 pt-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-warning text-dark p-2 rounded">
                <Bus size={22} />
              </div>
              <span className="brand-font fw-bold fs-4 text-white">Bus<span style={{ color: 'var(--buslink-orange)' }}>Link</span></span>
            </div>
            <p className="text-light opacity-75 small">
              BusLink is an Online Bus Ticket Booking & Multi-Operator Management Platform providing seamless travel booking across India.
            </p>
            <p className="text-light opacity-75 small mb-0">
              © {new Date().getFullYear()} BusLink Inc. All rights reserved.
            </p>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold text-uppercase text-warning mb-3">Top Routes</h6>
            <ul className="list-unstyled text-light opacity-75 small d-grid gap-2">
              <li>Pune to Mumbai Bus</li>
              <li>Mumbai to Goa Sleeper</li>
              <li>Delhi to Manali Volvo</li>
              <li>Bangalore to Hyderabad</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase text-warning mb-3">Bus Operators</h6>
            <ul className="list-unstyled text-light opacity-75 small d-grid gap-2">
              <li>Purple Metrolink Pvt Ltd</li>
              <li>VRL Logistics & Travels</li>
              <li>Neeta Tours & Travels</li>
              <li>Royal Star Express</li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold text-uppercase text-warning mb-3">Support</h6>
            <ul className="list-unstyled text-light opacity-75 small d-grid gap-2">
              <li>24/7 Customer Helpdesk</li>
              <li>Booking FAQs & Guidelines</li>
              <li>Cancellation & Refund Policy</li>
              <li>Terms & Privacy Policy</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
