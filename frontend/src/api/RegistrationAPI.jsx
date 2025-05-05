import axiosInstanceAPI from "./axiosInstanceAPI";

export const handleRegistration = async (event, formData, toast, setLoading, navigate) => {
  event.preventDefault();
  setLoading(true);

  // check if role is selected - role is mandatory
  if (!formData.role) {
    toast({
      variant: "destructive",
      description: "Bitte wählen Sie eine Rolle",
    });
    return;
  }

  try {
    const response = await axiosInstanceAPI.post('/registration/registerUser.php', formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      toast({
        description: "Registrierung war erfolgreich!",
      });
      navigate("/dashboard");
    } else {
      toast({
        variant: "destructive",
        description: "Registrierung fehlgeschlagen: " + response.data.message,
      });
    }
  } catch (error) {

    if (error.response) {
      toast({
        variant: "destructive",
        description: "Registrierung fehlgeschlagen: " + error.response?.data.message,
      });
    }
    toast({
      variant: "destructive",
      description: "Ein anderer Fehler ist aufgetreten: das Backend ist nicht verfügbar.",
    });
  }
  setLoading(false);
};

export const handleResetPassword = async (event, checkAccordance, token, password, toast, navigate, setLoading, honeypot) => {
  event.preventDefault();
  setLoading(true);

  // honeypot check
  if (honeypot) {
    return;
  }

  // Passwortvalidierung
  const passwordRegex = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/;
  if (!passwordRegex.test(password)) {
    toast({
      variant: "destructive",
      description: "Das neue Passwort erfüllt die Anforderungen nicht!",
    });
    setLoading(false);
    return;
  }

  try {
    checkAccordance(); // throw error if passwords don't match
    const res = await axiosInstanceAPI.post('/registration/resetPassword.php', {
      token, // use the token from the URL
      newPassword: password,
    });

    if (res.status === 200) {
      toast({
        description: "Passwort zurücksetzen war erfolgreich!",
      });
      navigate("/login");
    }
  } catch (error) {
    if (error.message === "Passwords do not match") {
      toast({
        variant: "destructive",
        description: "Die Passwörter stimmen nicht überein.",
      });
    } else if (error.response) {
      toast({
        variant: "destructive",
        description: 'Passwort zurücksetzen fehlgeschlagen: ' + error.response?.data?.message,
      });
    } else {
      toast({
        variant: "destructive",
        description: "Ein anderer Fehler ist aufgetreten: Backend ist nicht verfügbar.",
      });
    }
  } finally {
    setLoading(false);
  }
};

export const handleResetRequest = async (event, email, toast, setLoading) => {
  event.preventDefault();
  setLoading(true);

  try {
    const response = await axiosInstanceAPI.post('/sendResetPasswordEmail.php', {
      email,
    });

    // Display the backend message in the toast notification
    toast({
      description: response.data.message || "Anfrage ist abgeschickt. Bitte überprüfen Sie Ihre E-Mails!",
    });

  } catch (error) {
    // Handle error responses
    toast({
      description: error.response?.data?.message || "Fehler beim Senden der Anfrage.",
      status: "error",
    });
  }

  setLoading(false);
};

export const validateToken = async (token, toast, setIsTokenValid) => {
  try {
    const response = await axiosInstanceAPI.get(`/registration/validateResetToken.php`, {
      params: { token },
    });

    // response if valid or not is in the first element of the array
    if (response.data?.[0]?.valid) {
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
    }

  } catch (error) {
    setIsTokenValid(false);
    toast({
      description: error.response?.data?.message || "Fehler beim Senden der Anfrage.",
      status: "error",
    });
  }
};