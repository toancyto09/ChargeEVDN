import { Navigate } from 'react-router-dom';

/**
 * Route Protection Wrapper
 * Protects routes based on user role
 */

// Get user role from token
const getUserRole = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.vai_tro || payload.role || null;
  } catch (error) {
    return null;
  }
};

/**
 * Protect USER routes - only accessible by 'user' role
 * Redirect owner/admin to their respective dashboards
 */
export function UserRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = getUserRole();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (userRole === 'owner') {
    return <Navigate to="/owner/dashboard" />;
  }

  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
}

/**
 * Protect OWNER routes - only accessible by 'owner' role
 * Redirect user to user dashboard
 */
export function OwnerRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = getUserRole();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (userRole !== 'owner') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

/**
 * Protect ADMIN routes - only accessible by 'admin' role
 */
export function AdminRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = getUserRole();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

/**
 * Generic protected route - just requires login
 */
export function ProtectedRoute({ children }) {
  const isLoggedIn = !!localStorage.getItem('token');

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
}

