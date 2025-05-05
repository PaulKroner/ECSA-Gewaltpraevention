/**
 * Higher-order component (HOC) to handle authentication and authorization.
 * This function wraps a given component and ensures that only authenticated users 
 * with the required role can access it. If the user is not authenticated or does not 
 * have the necessary role, they are redirected or shown a not found page.
 * 
 * @param {React.Component} WrappedComponent - The component to be wrapped with authentication logic.
 * @param {number} [requiredRole=UserRole.User] - The minimum user role required to access the component.
*/

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext, useAuthContext, UserRole } from './AuthContext';
import LoadingContainer from '../components/LoadingContainer/LoadingContainer';

const withAuth = (WrappedComponent, requiredRole = UserRole.User) => {
  const WithAuthComponent = (props) => {
    const { isAuthenticated, loading, userRole } = useAuthContext();
    const navigate = useNavigate(); // React Router hook for navigation
    const location = useLocation(); // React Router hook for current location

    useEffect(() => {
      if (!loading) {  // Only perform redirect if loading is finished
        if (!isAuthenticated) {
          navigate('/login', { state: { from: location } });
        }
        if (userRole > requiredRole) {
          navigate('/');
        }
      }
    }, [loading, isAuthenticated, userRole, requiredRole]);

    if (loading) {
      return <div><LoadingContainer /></div>;
    }

    if (!isAuthenticated) {
      return null;  // Do not render the component until authentication is verified
    }

    return <WrappedComponent {...props} />;
  };

  // Set the displayName to help with debugging
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};

export default withAuth;
