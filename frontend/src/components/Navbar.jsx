import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Vote, LayoutDashboard, User, LogOut, Shield, Database, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Vote size={28} style={{ color: 'var(--primary)' }} />
          <span>DecideSecure</span>
        </Link>

        {user ? (
          <ul className="navbar-menu">
            {user.role === 'admin' ? (
              <>
                <li>
                  <Link to="/admin" className={`navbar-link ${isActive('/admin')}`}>
                    <Shield size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Admin
                  </Link>
                </li>
                <li>
                  <Link to="/admin/elections" className={`navbar-link ${isActive('/admin/elections')}`}>
                    <Calendar size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Elections
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>
                    <LayoutDashboard size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/elections" className={`navbar-link ${isActive('/elections')}`}>
                    <Vote size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Vote
                  </Link>
                </li>
              </>
            )}
            {user.role === 'admin' && (
              <li>
                <Link to="/profile" className={`navbar-link ${isActive('/profile')}`}>
                  <User size={16} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                  Profile
                </Link>
              </li>
            )}
            <li>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        ) : (
          <ul className="navbar-menu">
            <li>
              <Link to="/login" className={`navbar-link ${isActive('/login')}`}>Login</Link>
            </li>
            <li>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Register</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
