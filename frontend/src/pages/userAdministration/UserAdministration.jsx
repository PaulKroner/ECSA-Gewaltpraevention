/**
 * The `UserAdministration` component provides an interface for managing user roles.
 * It fetches user data from the backend, displays it in a table, and allows authenticated admins to edit or delete users.
 */

import { useState, useContext, useEffect } from "react";
import WithAuth from '../../context/WithAuth';
import { UserRole, AuthContext } from "../../context/AuthContext";
import { getDataRoles } from "../../api/UserAdministrationAPI";
import { getRoleString } from "../../lib/utils";
import DeleteUser from "../../components/UserAdministration/DeleteUser";
import EditUserDialog from "../../components/UserAdministration/EditUserDialog";
import SelectRowSort from "../../components/dashboardPage/SelectRowSort";
import TableSearchBar from "../../components/dashboardPage/TableSearchBar";
import { useNavigate } from "react-router-dom";

const UserAdministration = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { userRole, isAuthenticated } = useContext(AuthContext);

  const navigate = useNavigate();

  const options = [
    { label: "Name", value: "name" },
    { label: "Vorname", value: "vorname" },
    { label: "E-Mail", value: "email" },
    { label: "Rolle", value: "role_id" },
  ];

  // Filter data based on search query
  const filteredData = data.filter(row => {
    const query = searchQuery.toLowerCase();
    return (
      row.name?.toLowerCase().includes(query) ||
      row.vorname?.toLowerCase().includes(query) ||
      row.email?.toLowerCase().includes(query) ||
      row.role?.toLowerCase().includes(query)
    );
  });

  const backToDashboard = () => {
    navigate("/dashboard");
  };

  // Fetch data from the backend on mount
  useEffect(() => {
    const fetchData = async () => {
      const result = await getDataRoles();
      if (result) {
        setData(result);
      }
    };
    fetchData();

  }, []);

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center p-16 bg-ec">
        <div className="relative bg-white h-full rounded-2xl p-12 flex flex-col justify-center items-center gap-8">
          <h1 className="flex justify-center items-center font-extrabold headline">Rechteverwaltung</h1>
          <button className="absolute top-4 left-4 m-1" onClick={backToDashboard}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>

          <section className="flex gap-6 sm:gap-4 flex-col sm:flex-row sm:mr-auto">
            <SelectRowSort data={data} setData={setData} options={options} />
            <TableSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </section>

          <table id="overview-table" className="w-full table-auto">
            <thead>
              <tr className="bg-green-500">
                <th className="border border-slate-300 bg-green-500">Name</th>
                <th className="border border-slate-300 bg-green-500">Vorname</th>
                <th className="border border-slate-300 bg-green-500">E-Mail</th>
                <th className="border border-slate-300 bg-green-500">Rolle</th>
                <th className="border border-slate-300 bg-green-500" colSpan="2">Optionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map(row => (
                  <tr key={row.id} className="odd:bg-gray-200">
                    <td className="border border-slate-300 sticky-col">{row.name || 'kein Name'}</td>
                    <td className="border border-slate-300">{row.vorname || 'kein Vorname'}</td>
                    <td className="border border-slate-300">{row.email || 'keine E-Mail'}</td>
                    <td className="border border-slate-300">{getRoleString(row.role_id) || 'keine Rolle'}</td>
                    {userRole === 1 && isAuthenticated === true ? (
                      <>
                        <td className="border-r border-b border-slate-300" id="editDialotTD"><EditUserDialog data={data} row={row} setData={setData} /></td>
                        <td className="border-l border-b border-slate-300" id="deleteDialotTD"><DeleteUser data={data} row={row} setData={setData} /></td>
                      </>
                    ) : (
                      <></>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">Keine Daten vorhanden</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
};

export default WithAuth(UserAdministration, UserRole.Admin);