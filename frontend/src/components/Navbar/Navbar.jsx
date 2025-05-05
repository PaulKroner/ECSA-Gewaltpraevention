import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from "../../hooks/use-toast";
import LoadingSpinner from "../LoadingContainer/LoadingSpinner";
import { AuthContext } from "../../context/AuthContext";
import { Button } from '../ui/button';

const NavBar = () => {
  const { userRole, isAuthenticated, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const Logout = () => {
    setLoading(true);
    logout();
    toast({
      description: "Ausloggen war erfolgreich.",
    });
  };
  return (
    <>
      <nav className="bg-white border-gray-200 py-2.5 dark:bg-gray-900">

        <div className="flex flex-col items-center justify-between max-w-full px-4 md:flex-row">

          <div className="flex items-center order-2 mt-4 sm:mt-0">
            <button className="flex flex-row items-center gap-1.5 bg-blue-500 text-white py-2 px-4 rounded-3xl text-2xl font-semibold disabled:opacity-50" onClick={Logout} disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner spinnerWidht={"w-6"} spinnerHeight={"h-6"} color={"text-white"} />
                </>
              ) : (
                <></>
              )}
              <p>Logout</p>
              <div className="flex justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
              </div>
            </button>
          </div>

          <div className="items-center justify-center w-full flex sm:w-auto order-1 mt-4 sm:mt-0" id="mobile-menu-2">
            <ul className="flex flex-col items-center font-medium gap-3 sm:flex-row">
              {userRole === 1 && isAuthenticated === true ? (
                <li>
                  <Link
                    to="/registration"
                    className="block py-2 pl-3 pr-4 text-gray-700 lg:hover:bg-transparent lg:border-0 hover:text-blue-500 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    <Button variant="" className="w-48">
                      Benutzer registrieren
                    </Button>
                  </Link>
                </li>) :
                (
                  <></>
                )}

              {userRole === 1 && isAuthenticated === true ? (
                <li>
                  <Link
                    to="/userAdministration"
                    className="block py-2 pl-3 pr-4 text-gray-700 lg:hover:bg-transparent lg:border-0 hover:text-blue-500 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    <Button variant="" className="w-48">
                      Benutzer verwalten
                    </Button>
                  </Link>
                </li>) :
                (
                  <></>
                )}
            </ul>
          </div>
        </div>
      </nav>

    </>
  )
};

export default NavBar;