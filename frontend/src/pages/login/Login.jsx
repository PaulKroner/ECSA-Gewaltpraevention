/**
 * Login component for user authentication.
 * This component provides a form for users to enter their email and password to log in. 
 * It handles form submission, sending credentials to the server for validation, and provides 
 * feedback on the login status (success or failure).
 */

import { useState, useContext, useRef } from 'react';
import { useToast } from "../../hooks/use-toast";
import { AuthContext } from "../../context/AuthContext";
import SubmitButton from "../../components/SubmitButton";
import { handleLogin } from "../../api/LoginAPI";
import { useNavigate } from "react-router-dom";
import eclogo from "../../lib/Ec11.svg.png";
import ReCAPTCHA from 'react-google-recaptcha';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Honeypot
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [captchaError, setCaptchaError] = useState('');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Access the login function from context

  const routeToReset = (event) => {
    event.preventDefault();
    navigate("/registration/resetPasswordRequest");
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-16 bg-ec '>
      <div className="bg-white h-full rounded-2xl p-12 login-container">
        <form onSubmit={(event) => handleLogin(event, email, password, setLoading, login, toast, navigate, honeypot, captchaToken, setCaptchaError, recaptchaRef)} className="flex flex-col justify-center items-center gap-6">

          <div className="flex gap-4 flex-col items-center">
            <div className="w-full flex justify-center">
              <img src={eclogo} alt="EC-Logo" className="w-16 h-16" />
            </div>
            <div className="flex justify-center items-center font-extrabold text-2xl text-center">
              Gewaltprävention Login
            </div>
          </div>

          {/* honeypot against simple bots */}
          <div className="hidden">
            <label htmlFor="honeypot">E-Mail</label>
            <input
              type="text"
              id="form_email"
              name="form_email"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>


          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              E-Mail-Adresse
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="email@beispiel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                className="block w-64 rounded-md border-0 py-1.5 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                aria-label="Email address"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Passwort
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-64 rounded-md border-0 py-1.5 pl-4 pr-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                aria-label="Password"
                autoComplete="password"
                required
              />
            </div>
          </div>

          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
            onChange={token => {
              setCaptchaToken(token);
              setCaptchaError('');
            }}
            onExpired={() => {
              setCaptchaToken(null);
              setCaptchaError('Bitte bestätige erneut, dass du kein Roboter bist.');
            }}
          />
          {captchaError && (
            <p className="text-red-600 text-sm">{captchaError}</p>
          )}

          <SubmitButton text={"einloggen"} loading={loading} />
        </form>
        <a href="" onClick={routeToReset} className="flex justify-end mt-4 text-sm font-medium text-primary-600 hover:underline text-blue-500">Passwort zurücksetzen?</a>
      </div>
    </div>

  );
};

export default Login;