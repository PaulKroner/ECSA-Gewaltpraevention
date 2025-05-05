/**
 * The `ResetPassword` component allows users to reset their password using a token provided via URL.
 * It includes input fields for the new password and password confirmation, and checks if both match before submitting.
*/

import React, { useState, useEffect } from 'react';
import { useToast } from "../../../../hooks/use-toast";
import SubmitButton from '../../../../components/SubmitButton';
import { handleResetPassword } from '../../../../api/RegistrationAPI';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { validateToken } from '../../../../api/RegistrationAPI';
import LoadingContainer from '../../../../components/LoadingContainer/LoadingContainer';

const ResetPassword = ({ params }) => {
  const { toast } = useToast();
  const { token } = useParams();
  const navigate = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [honeypot, setHoneypot] = useState(''); // Honeypot

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confiPassword, setConfiPassword] = useState('');
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false,
  });

  const checkAccordance = () => {
    // Check all password rules are met
    if (!passwordValidations.minLength || !passwordValidations.hasUpperCase || !passwordValidations.hasSpecialChar) {
      throw new Error("Password does not meet the required criteria");
    }
    if (password !== confiPassword) {
      throw new Error("Passwords do not match");
    }
  };

  // Function to validate the password as user types
  const validatePassword = (password) => {
    const minLength = /.{6,}/;  // At least 6 characters
    const hasUpperCase = /[A-Z]/; // At least one uppercase letter
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/; // At least one special character

    setPasswordValidations({
      minLength: minLength.test(password),
      hasUpperCase: hasUpperCase.test(password),
      hasSpecialChar: hasSpecialChar.test(password),
    });
  };

  // Function to validate the token
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const result = await validateToken(token, toast, setIsTokenValid); // Validate the token
      setLoading(false);
    };

    if (token) {
      fetchData(); // Only call if token is available
    }
  }, [token]); // Re-run if the token changes

  if (loading) {
    return <LoadingContainer />;
  }

  if (isTokenValid === false) {
    navigate('/not-found');
  }

  if (isTokenValid === true) {
    return (
      <>
        <section className="">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
              <h2 className="flex justify-center items-center font-extrabold headline">
                Passwort ändern
              </h2>

              <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={(event) => handleResetPassword(event, checkAccordance, token, password, toast, navigate, setLoading, honeypot)}>
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
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    neues Passwort
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                  />
                  {/* Display password validation results */}
                  <div className="mt-2 text-sm">
                    <div className={`flex items-center ${passwordValidations.minLength ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordValidations.minLength ?
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                        </svg>
                      }
                      Mind. 6 Zeichen
                    </div>

                    <div className={`flex items-center ${passwordValidations.hasUpperCase ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordValidations.hasUpperCase ?
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                        </svg>
                      }
                      Mind. 1 Großbuchstaben
                    </div>

                    <div className={`flex items-center ${passwordValidations.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordValidations.hasSpecialChar ?
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                        :
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 mr-2">
                          <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                        </svg>
                      }
                      Mind. 1 Sonderzeichen (!@#$%^&*)
                    </div>
                  </div>

                </div>
                <div>
                  <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    neues Passwort bestätigen
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    value={confiPassword}
                    onChange={(e) => setConfiPassword(e.target.value)}
                  />
                </div>

                <SubmitButton text={"abschicken"} loading={loading} />
              </form>
            </div>
          </div>
        </section>
      </>
    );
  };
};

export default ResetPassword;