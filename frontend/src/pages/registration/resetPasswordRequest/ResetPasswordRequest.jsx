/**
 * The `ResetPasswordRequest` component provides a form where users can request a password reset.
 * It handles form submission by sending the user's email to the backend, triggering a password reset email.
 */

import { useState } from 'react';
import { useToast } from "../../../hooks/use-toast";
import SubmitButton from '../../../components/SubmitButton';
import { handleResetRequest } from '../../../api/RegistrationAPI';
import { useNavigate } from "react-router-dom";

function ResetPasswordRequest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

const backToDashboard = () => {
  navigate("/");
};

return (
  <>
    <div className='flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0'>

      <div className="relative w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
        <button className="absolute top-4 left-4 m-1" onClick={backToDashboard}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
          </svg>
        </button>

        <h2 className="flex justify-center items-center text-center font-extrabold headline pt-4">
          Passwort zurücksetzen
        </h2>
        <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5" onSubmit={(event) => handleResetRequest(event, email, toast, setLoading)}>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">E-Mail-Adresse</label>
          <input
            type="email"
            value={email}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Gib deine E-Mail-Adresse ein"
            required
          />
          <SubmitButton text={"abschicken"} loading={loading} />
        </form>
      </div>
    </div>
  </>
);
}

export default ResetPasswordRequest;
