/**
 * The `Registration` component renders a registration form for users. It includes fields for email, 
 * password, last name (Nachname), first name (Vorname), and role selection. The form submission is handled
 * asynchronously, sending a POST request to the server for user registration.
 *
 * Protected Component:
 * - The component is wrapped with `WithAuth`, ensuring only users with `Admin` role can access it.
 */

import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/use-toast";
import WithAuth from '../../context/WithAuth';
import { UserRole } from "../../context/AuthContext";
import SelectRoleRegistration from "../../components/SelectRoleRegistration";
import SubmitButton from '../../components/SubmitButton';
import { handleRegistration } from '../../api/RegistrationAPI';
import { Input } from '../../components/ui/input';
import { Label } from "../../components/ui/label";

const Registration = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    vorname: '',
    role: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    minLength: false,
    hasUpperCase: false,
    hasSpecialChar: false,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const backToDashboard = () => {
    navigate("/dashboard");
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    let newValue = value;

    if (id === "name" || id === "vorname") {
      // Allow only letters and spaces (including German special characters)
      newValue = value.replace(/[^a-zA-ZäöüÄÖÜß\s-]/g, '');
    }

    // Convert email to lowercase
    if (id === "email") {
      newValue = value.toLowerCase();
    }

    setFormData(prevState => ({
      ...prevState,
      [id]: newValue
    }));
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

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center p-16 bg-ec">
        <div className="relative bg-white h-full rounded-2xl p-12">
          <button className="absolute top-4 left-4 m-1" onClick={backToDashboard}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>

          <form onSubmit={(event) => handleRegistration(event, formData, toast, setLoading, navigate)} className="flex flex-col justify-center items-center gap-4">

            <div className="flex justify-center items-center font-extrabold headline">
              Registrierung
            </div>


            <div className="w-64 flex flex-col gap-2">
              <Label htmlFor="email">E-Mail-Adresse</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@beispiel.com"
                value={formData.email}
                onChange={handleChange}
                aria-label="Email"
                required
              />
            </div>

            <div className="w-64 flex flex-col gap-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={formData.password}
                onChange={(e) => {
                  handleChange(e);
                  validatePassword(e.target.value);
                }}
                required />
            </div>

            <div className="mt-2 text-sm block w-64">
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

            <div className="w-64 flex flex-col gap-2">
              <Label htmlFor="name" className="">
                Nachname
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nachname"
                value={formData.name}
                onChange={handleChange}
                className=""
                aria-label="name"
                required
              />
            </div>

            <div className="w-64 flex flex-col gap-2">
              <Label htmlFor="email" className="">
                Vorname
              </Label>
              <Input
                id="vorname"
                name="vorname"
                type="text"
                placeholder="Vorname"
                value={formData.vorname}
                onChange={handleChange}
                className=""
                aria-label="vorname"
                required
              />
            </div>

            <div className="w-64 flex flex-col gap-2">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Rolle / Berechtigung
              </label>
              <div className="">
                <SelectRoleRegistration formData={formData} setFormData={setFormData} />
              </div>
            </div>

            <SubmitButton text={"registrieren"} loading={loading} />
          </form>
        </div>
      </div>

    </>
  )
};

export default WithAuth(Registration, UserRole.Admin);