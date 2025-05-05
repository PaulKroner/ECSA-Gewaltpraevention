import axiosInstanceAPI from "./axiosInstanceAPI";
import { getData } from "./DashboardTableAPI";

export const InsertEmployee = async (data, setData, transformedFormData, toast, setLoading) => {

  try {
    setLoading(true);
    const response = await axiosInstanceAPI.post('/dashboard/insertEmployee.php', transformedFormData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const sendEmailRequest = async (endpoint, successMessage) => {
      return axiosInstanceAPI.post(endpoint, {
        email: transformedFormData.email,
        name: transformedFormData.name,
        vorname: transformedFormData.vorname
      }, {
        headers: { 'Content-Type': 'application/json' },
      })
        .then(() => successMessage)
        .catch((emailError) => {
          toast({
            variant: "destructive",
            description: "Fehler beim Senden der E-Mail: " + emailError.response?.data?.message,
          });
          return null; // Return null if the email fails
        });
    };

    let emailMessages = [];

    if (transformedFormData.fz_eingetragen === null) {
      const message = await sendEmailRequest('/sendEmailRequestFZ.php',
        "Führungszeugnis-Anforderung");
      if (message) emailMessages.push(message);
    }

    if (transformedFormData.sve_eingetragen === null) {
      const message = await sendEmailRequest('/sendEmailRequestSVE.php',
        "Selbstverpflichtungserklärung-Anforderung");
      if (message) emailMessages.push(message);
    }

    if (response.status === 200) {
      // function to update the table without refreshing the page
      const updatedData = await getData();
      setData(updatedData);
      if (emailMessages.length > 0) {
        toast({
          description: `Mitarbeiter erfolgreich hinzugefügt und folgende Emails wurden versand: ${emailMessages.join(', ')}.`,
        });
      } else {
        toast({
          description: "Mitarbeiter erfolgreich hinzugefügt.",
        });
      }
    }
    setLoading(false);

  } catch (error) {
    if (error.response) {
      toast({
        variant: "destructive",
        description: 'Fehler beim Hinzufügen des Mitarbeiters: ' + error.response?.data?.message,
      });
    } else {
      toast({
        variant: "destructive",
        description: "Anderer Fehler beim Hinzufügen des Mitarbeiters: Backend ist nicht verfügbar.",
      });
    }
  }

  setLoading(false);
};