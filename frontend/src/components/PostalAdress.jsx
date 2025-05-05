// import { AuthContext } from "@/app/context/AuthContext";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PostalAdress = ({ formData, setFormData }) => {
  const { userRole, isAuthenticated } = useContext(AuthContext);
  const [postalData, setPostalData] = useState({
    zip: "",
    city: "",
  });

  // UseEffect to split the formData.postadresse
  useEffect(() => {
    // Check if postadresse is neither "keine Postadresse" nor an empty string
    if (formData.postadresse !== "keine Postadresse" && formData.postadresse !== "") {
      const splitAddress = formData?.postadresse?.split(" ") || [];
      const zip = splitAddress[0];
      const city = splitAddress.slice(1).join(" ");

      setPostalData({
        zip: zip,
        city: city,
      });
    }
    else {
      setPostalData({
        zip: "",
        city: "",
      });
    }
  }, []);

  const handlePostalChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "zip") {
      newValue = value.replace(/\D/g, "").slice(0, 5); // only digits, max. 5 
    } else if (id === "city") {
      newValue = value.replace(/[^a-zA-ZäöüÄÖÜß\s]/g, ""); // only letters, spaces and german umlaute
    }

    let updatedPostalData = { ...postalData, [id]: newValue };

    setPostalData(updatedPostalData);

    setFormData((prevData) => ({
      ...prevData,
      postadresse: `${updatedPostalData.zip} ${updatedPostalData.city}`.trim(),
    }));
  };

  return (
    <>
      <div className="grid grid-cols-6 items-center gap-4">
        <Label htmlFor="postadresse" className="col-span-2">Postadresse</Label>

        {/* ZIP Code Input */}
        <Input
          type="text"
          id="zip"
          value={postalData.zip}
          onChange={handlePostalChange}
          className="col-span-1"
          placeholder="PLZ"
        />

        {/* City Input */}
        <Input
          type="text"
          id="city"
          value={postalData.city}
          onChange={handlePostalChange}
          className="col-span-2"
          placeholder="Ort"
        />

      </div >
    </>
  );
};

export default PostalAdress;
