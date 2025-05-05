import axiosInstanceAPI from "./axiosInstanceAPI";

// function for getting all employees data
export const getData = async () => {
  try {
    const response = await axiosInstanceAPI.get('/dashboard/getEmployeesData.php');
    return response.data;
  } catch (error) {
    return null;
  }
};

export const deleteEmployee = async (id, data, setData, toast) => {
  try {
    await axiosInstanceAPI.delete(`/dashboard/deleteEmployee.php?id=${id}`, {
      headers: { 'Content-Type': 'application/json' }
    });

    setData(data.filter(employee => employee.id !== id)); // remove the deleted employee from the table without refreshing the page
    toast({
      description: "Mitarbeiter wurde erfolgreich gelöscht.",
    });
  } catch (error) {
    if (error.response) {
      toast({
        variant: "destructive",
        description: 'Fehler beim Löschen des Mitarbeiters: ' + error.response?.data.message,
      });
    } else {
      toast({
        variant: "destructive",
        description: "Anderer Fehler beim Löschen des Mitarbeiters: Backend ist nicht verfügbar.",
      });
    }
  }
};

export const updateEmployee = async (id, formData, setData, toast, setLoading) => {
  setLoading(true);
  try {
    const response = await axiosInstanceAPI.post(`/dashboard/updateEmployee.php`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: { id },
    });

    if (response.status === 200) {
      // function to update the table without refreshing the page
      const updatedData = await getData();
      setData(updatedData);
      toast({
        description: "Mitarbeiter erfolgreich aktualisiert.",
      });
    }
    setLoading(false);
  } catch (error) {
    if (error.response) {
      // Server-side error
      toast({
        variant: "destructive",
        description: 'Fehler bei Update des Mitarbeiters: ' + error.response?.data.message,
      });
    } else {
      // Other error (e.g., network)
      toast({
        variant: "destructive",
        description: "Anderer Fehler bei Update des Mitarbeiters: Backend ist nicht verfügbar",
      });
    }
  }
  setLoading(false);
};