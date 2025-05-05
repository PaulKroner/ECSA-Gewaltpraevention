import axiosInstanceAPI from "./axiosInstanceAPI";
import { jwtDecode } from 'jwt-decode';

export const handleLogin = async (event, email, password, setLoading, login, toast, navigate, honeypot, captchaToken, setCaptchaError, recaptchaRef) => {
  event.preventDefault();
  setLoading(true); // Show loading spinner

  localStorage.clear(); // when loggin in as both roles it has weird side-effects

  // honeypot check
  if (honeypot) {
    return;
  }

  if (!captchaToken) {
    setCaptchaError('Bitte bestätige, dass du kein Roboter bist.');
    setLoading(false);
    return;
  }

  try {
    const res = await axiosInstanceAPI.post('/login/login.php', { email, password, honeypot, token: captchaToken });

    // Ensure response is valid and contains a token
    if (res.status === 200 && res.data.token) {
      const token = res.data.token;

      // Decode the JWT to check the expiration
      const decodedToken = jwtDecode(token);

      // Check if the token has expired (exp is in seconds)
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decodedToken.exp < currentTime) {
        // If token is expired, handle the expiration (logout the user)
        localStorage.removeItem('token'); // Remove the expired token
        toast({
          variant: "destructive",
          description: "Session expired. Please log in again.",
        });
        return;
      }

      localStorage.setItem('token', token);

      login(token); // Store JWT properly

      navigate("/dashboard");

      toast({
        description: "Login war erfolgreich!",
      });
    } else {
      // Prevent success message when token is null
      toast({
        variant: "destructive",
        description: "Login fehlgeschlagen: " + res.data.message,
      });
      throw new Error(res.data.message || "Login fehlgeschlagen");

    }
  } catch (error) {

    // --- hier resetten ---
    if (recaptchaRef && recaptchaRef.current) {
      recaptchaRef.current.reset();  // reCAPTCHA neu laden
    }
    setCaptchaError('Bitte bestätige erneut, dass du kein Roboter bist.');
    // --- ende reset ---


    if (error.response.status === 401) {
      toast({
        variant: "destructive",
        description: error.response.data.message || "Falsche Zugangsdaten.",
      });
    } else if (error.message.includes("Network Error")) {
      toast({
        variant: "destructive",
        description: "Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.",
      });
    }
    else if (error.response.status === 429) {
      toast({
        variant: "destructive",
        description: error.response.data.message,
      });

    } else {
      toast({
        variant: "destructive",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut. " + error.response.data.message,
      });
    }
  } finally {
    setLoading(false); // Hide loading spinner
  }
};
