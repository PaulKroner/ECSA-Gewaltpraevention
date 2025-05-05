import { useState, useContext } from "react";
import EditEmployeeDialog from "./EditEmployeeDialog";
import DeleteEmployee from "./DeleteEmployee";
import TablePagination from "./TablePagination";
import LoadingContainer from "../LoadingContainer/LoadingContainer";
import { AuthContext } from "../../context/AuthContext";
import { formatDate } from "../../lib/utils";

const DashboardTable = ({ data, setData, loading, showNachweise, searchQuery, rowsPerPage }) => {

  const [currentPage, setCurrentPage] = useState(1); // State for the current page of pagination[]
  const { userRole, isAuthenticated } = useContext(AuthContext);

  if (loading) {
    return <LoadingContainer />; // Ladecontainer anzeigen, wenn loading true ist
  }

  // Utility function to check the date difference for coloring
  const getDateStatus = (date) => {
    const currentDate = new Date();
    const dateToCheck = new Date(date);

    // Calculate the difference in months
    const diffTime = dateToCheck - currentDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const diffMonths = diffDays / 30;

    if (diffMonths <= 0) {
      return 'bg-red-400'; // Date is in the past or today
    } else if (diffMonths <= 1) {
      return 'bg-red-400'; // Date is within 1 month
    } else if (diffMonths <= 3) {
      return 'bg-yellow-400'; // Date is within 3 months
    }
    return ''; // Date is more than 3 months away
  };

  // Filter data based on search query
  const filteredData = data.filter(row => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true; // Return all data if searchQuery is empty

    // Split the search query into parts, so we can handle multiple terms (e.g., both vorname and name)
    const queryParts = query.split(' ');

    // Check if query matches name and vorname (either individually or combined)
    const nameMatch = queryParts.every(part =>
      row.name?.toLowerCase().includes(part) ||
      row.vorname?.toLowerCase().includes(part)
    );

    // Check if query matches other columns like email, postadresse, etc.
    const otherFieldsMatch = (
      row.email?.toLowerCase().includes(query) ||
      row.postadresse?.toLowerCase().includes(query) ||
      row.fz_kontrolliert?.toLowerCase().includes(query) ||
      row.gs_kontrolliert?.toLowerCase().includes(query) ||
      row.us_kontrolliert?.toLowerCase().includes(query)
    );

    // Return true if either the name/vorname match or any of the other fields match
    return nameMatch || otherFieldsMatch;
  });


  // Pagination var and functions
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  function formatKontrolliertNames(names) {
    if (!names) return '';
    const splitNames = names.split(' ').reduce((acc, curr, index, array) => {
      if (index % 2 === 0) {
        acc.push(array.slice(index, index + 2).join(' '));
      }
      return acc;
    }, []);
    return splitNames.join('<br/>');
  }

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex); // slice filteredData based on the current page

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table id="overview-table" className="w-full table-auto">
          <thead>
            <tr className="bg-green-500">
              <th className="border border-slate-300">Name</th>
              <th className="border border-slate-300">Vorname</th>
              <th className="border border-slate-300">E-Mail</th>
              <th className="border border-slate-300">Postadresse</th>
              <th className="border border-slate-300">Gemeinde / Freizeit</th>
              {showNachweise.nachweis1 && (
                <>
                  <th className="border border-slate-300">Führungszeugnis gültig ab</th>
                  <th className="border border-slate-300">Führungszeugnis Ablaufdatum</th>
                  <th className="border border-slate-300">Führungszeugnis kontrolliert von</th>
                  <th className="border border-slate-300">Führungszeugnis kontrolliert am</th>
                </>
              )}
              {showNachweise.nachweis2 && (
                <>
                  <th className="border border-slate-300">Grundlagenschulung gültig ab</th>
                  <th className="border border-slate-300">Grundlagenschulung erneuert am</th>
                  <th className="border border-slate-300">Grundlagenschulung kontrolliert von</th>
                </>
              )}
              {showNachweise.nachweis3 && (
                <>
                  <th className="border border-slate-300">Upgradeschulung gültig ab</th>
                  <th className="border border-slate-300">Upgradeschulung Ablaufdatum</th>
                  <th className="border border-slate-300">Upgradeschulung kontrolliert von</th>
                </>
              )}
              {showNachweise.nachweis4 && (
                <>
                  <th className="border border-slate-300">Selbstverpflichtungserklärung gültig ab</th>
                  <th className="border border-slate-300">Selbstverpflichtungserklärung kontrolliert von</th>
                </>
              )}
              <th className="border border-slate-300">Hauptamt</th>
              {(userRole === 1 || userRole === 2) && isAuthenticated === true ? (
                <th className="border border-slate-300 text-center" colSpan="2">Optionen</th>) : (
                <></>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={row.id} className="odd:bg-gray-200">
                  <td className="border border-slate-300 sticky-col">{row.name || ''}</td>
                  <td className="border border-slate-300">{row.vorname || ''}</td>
                  <td className="border border-slate-300">{row.email || ''}</td>
                  <td className="border border-slate-300 min-w-[300px]">{row.postadresse || ''}</td>
                  <td className="border border-slate-300 min-w-[300px]">{row.gemeinde_freizeit || ''}</td>

                  {showNachweise.nachweis1 && (
                    <>
                      <td className="border border-slate-300">{row.fz_eingetragen ? formatDate(row.fz_eingetragen) : ''}</td>
                      <td className={`border border-slate-300 ${row.fz_abgelaufen ? getDateStatus(row.fz_abgelaufen) : ''}`}>
                        {row.fz_abgelaufen ? formatDate(row.fz_abgelaufen) : ''}
                      </td>
                      <td className="border border-slate-300" dangerouslySetInnerHTML={{ __html: formatKontrolliertNames(row.fz_kontrolliert) }}></td>                      <td className="border border-slate-300">{row.fz_kontrolliert_am ? formatDate(row.fz_kontrolliert_am) : ""}</td>
                    </>
                  )}

                  {showNachweise.nachweis2 && (
                    <>
                      <td className="border border-slate-300">{row.gs_eingetragen ? formatDate(row.gs_eingetragen) : ''}</td>
                      <td className="border border-slate-300">{row.gs_erneuert ? formatDate(row.gs_erneuert) : ''}
                      </td>
                      <td className="border border-slate-300" dangerouslySetInnerHTML={{ __html: formatKontrolliertNames(row.gs_kontrolliert) }}></td>                    </>
                  )}

                  {showNachweise.nachweis3 && (
                    <>
                      <td className="border border-slate-300">{row.us_eingetragen ? formatDate(row.us_eingetragen) : ''}</td>
                      <td className={`border border-slate-300 ${row.us_abgelaufen ? getDateStatus(row.us_abgelaufen) : ''}`}>
                        {row.us_abgelaufen ? formatDate(row.us_abgelaufen) : ''}
                      </td>
                      <td className="border border-slate-300" dangerouslySetInnerHTML={{ __html: formatKontrolliertNames(row.us_kontrolliert) }}></td>                    </>
                  )}
                  {showNachweise.nachweis4 && (<>
                    <td className="border border-slate-300">{row.sve_eingetragen ? formatDate(row.sve_eingetragen) : ''}</td>
                    <td className="border border-slate-300" dangerouslySetInnerHTML={{ __html: formatKontrolliertNames(row.sve_kontrolliert) }}></td>                  </>)}

                  <td className="border border-slate-300">{row.hauptamt ? ("Ja") : ("Nein")}</td>
                  
                  {(userRole === 1 || userRole === 2) && isAuthenticated === true ? (
                    <td className="border-r border-b border-slate-300 sticky" id="editDialogTD"><EditEmployeeDialog data={data} setData={setData} showNachweise={showNachweise} row={row} /></td>
                  ) : (
                    <></>
                  )}
                  {userRole === 1 && isAuthenticated === true ? (
                    <td className="border-l border-b border-slate-300" id="deleteDialogTD"><DeleteEmployee data={data} row={row} setData={setData} /></td>
                  ) : (
                    <></>
                  )}


                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showNachweise.nachweis1 ? 6 : 4} className="text-center py-4">
                  Keine Daten gefunden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginator */}
      <div className="mt-6 mb-4">
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
};

export default DashboardTable;