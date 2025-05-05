import axiosInstanceAPI from './axiosInstanceAPI';

// Function to get all user data
export const getDataRoles = async () => {
  try {
    const response = await axiosInstanceAPI.get('/userAdministration/getUserData.php');
    return response.data; // Return the fetched data
  } catch (error) {
    return null;
  }
};

export const deleteUserFromDB = async (id, toast, data, setData) => {
  try {
    await axiosInstanceAPI.delete(`/userAdministration/deleteUser.php?id=${id}`);
    setData(data.filter(employee => employee.id !== id));
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
        description: "Anderer Fehler beim Löschen des Mitarbeiters: " + error.response?.data.message,
      });
    }
  }
};

export const updateUser = async (id, formData, setLoading, setData, toast, getDataRoles) => {
  setLoading(true);
  try {
    const response = await axiosInstanceAPI.post(`/userAdministration/updateUser.php`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: { id },
    });

    if (response.status === 200) {
      const updatedData = await getDataRoles(); //display the updated users
      setData(updatedData);
      toast({
        description: "User erfolgreich aktualisiert.",
      });
      setLoading(false);
    }
  } catch (error) {
    toast({
      variant: "destructive",
      description: 'Fehler bei Update des Users: ' + error.response?.data.message,
    });
  }
  setLoading(false);
};