import { Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/dashboard/dashboard';
import UserAdministration from './pages/userAdministration/UserAdministration';
import Registration from './pages/registration/Registration';
import NotFoundPage from './pages/notFound/NotFoundPage';
import Login from './pages/login/Login';
import { Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ResetPasswordRequest from './pages/registration/resetPasswordRequest/ResetPasswordRequest';
import ResetPassword from './pages/registration/resetPassword/[token]/ResetPassword';

function App() {
  return (
    <>
      <AuthProvider>
        <main className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/userAdministration" element={<UserAdministration />} />
            <Route path="/not-found" element={<NotFoundPage />} />
            <Route path="/registration/resetPasswordRequest" element={<ResetPasswordRequest />} />
            <Route path="/registration/resetPassword/:token" element={<ResetPassword />} />

            {/* Catch all unknown routes and redirect to NotFoundPage */}
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </main>
      </AuthProvider>
    </>
  );
}

export default App;
