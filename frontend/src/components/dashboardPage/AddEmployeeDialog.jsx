import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../../hooks/use-toast";
import { useState } from "react";
import { calculateExpirationDate } from "../../lib/utils";
import ModalSubmitButton from "../ModalSubmitButton";
import { InsertEmployee } from "../../api/DashboardPageAPI";
import PostalAdress from "../PostalAdress";
import React from "react";

const AddEmployeeDialog = ({ data, setData }) => {

  const { toast } = useToast();

  const initialFormState = {
    name: "",
    vorname: "",
    email: "",
    postadresse: "",
    gemeinde_freizeit: "",
    fz_eingetragen: "",
    fz_abgelaufen: "",
    fz_kontrolliert: "",
    fz_kontrolliert_am: "",
    gs_eingetragen: "",
    gs_erneuert: "",
    gs_kontrolliert: "",
    us_eingetragen: "",
    us_abgelaufen: "",
    us_kontrolliert: "",
    sve_eingetragen: "",
    sve_kontrolliert: "",
    fz_kontrolliert_first: "",
    fz_kontrolliert_second: "",
    hauptamt: false,
  };

  // State for the AddEmployee-Dialog
  const [formData, setFormData] = useState(initialFormState);

  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [gsDisabled, setGsDisabled] = useState(true);
  const [activeButton, setActiveButton] = useState('no'); // Set 'no' as the default active button
  const [hauptamt, setHauptamt] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "name" || id === "vorname" || (id.includes("_kontrolliert") && id !== "fz_kontrolliert_am")) {
      // Allow only letters and spaces (including German special characters)
      newValue = value.replace(/[^a-zA-ZäöüÄÖÜß\s-]/g, '');
    }

    // Convert email to lowercase for consistency
    if (id === "email") {
      newValue = value.toLowerCase();
    }

    if (id === 'fz_eingetragen') {
      let year = hauptamt ? 3 : 5; // hauptamt = 3 years, not hauptamt = 5 years
      const newFzAbgelaufen = calculateExpirationDate(value, year);
      setFormData((prevData) => ({
        ...prevData,
        [id]: newValue,
        fz_abgelaufen: newFzAbgelaufen,
      }));
    } else if (id === 'us_eingetragen') {
      const newUsAbgelaufen = calculateExpirationDate(value, 1);
      setFormData((prevData) => ({
        ...prevData,
        [id]: newValue,
        us_abgelaufen: newUsAbgelaufen,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: newValue,
      }));
    }

    if (id === "gs_eingetragen") {
      setGsDisabled(false);
    }
  };


  // replace "" with null for all fields except name, vorname and email
  const transformFormData = (formData) => {
    return Object.fromEntries(
      Object.entries(formData).map(([key, value]) => {
        if (["name", "vorname", "email"].includes(key)) {
          return [key, value];
        }
        return [key, value === "" ? null : value];
      })
    );
  };

  // validate every field and then execute the InsertEmployee function
  const validateAndInsertEmployee = async (e) => {
    e.preventDefault();
    setLoading(true);
    const year2000 = new Date('2000-01-01');

    // Check if any required field is empty
    if (formData.name === "" || formData.vorname === "" || formData.email === "") {
      toast({
        variant: "destructive",
        description: "Bitte füllen Sie die Pflichtfelder Name, Vorname und E-Mail aus.",
      });
      setLoading(false);
      return;
    }

    if (formData.postadresse) {
      const splitAddress = formData?.postadresse?.trim().split(/\s+/) || [];
      const zip = splitAddress[0];
      const city = splitAddress.slice(1).join(" ");

      if (zip.length < 5 && zip.length > 1 || zip.length > 5) {
        const errorMessage = `Die Postleitzahl ist falsch eingetragen.`;
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        setLoading(false);
        return;
      }

      if (city.length < 2) {
        const errorMessage = `Der Ort ist falsch eingetragen.`;
        toast({
          variant: "destructive",
          description: errorMessage,
        });
        setLoading(false);
        return;
      }
    }

    // Check for invalid dates
    const invalidFields = [];
    const fieldsToCheck = [
      { key: 'fz_eingetragen', label: 'Führungszeugnis gültig ab' },
      { key: 'gs_eingetragen', label: 'Grundlagenschulung gültig ab' },
      { key: 'us_eingetragen', label: 'Upgradeschulung gültig ab' },
      { key: 'sve_eingetragen', label: 'Selbstverpflichtungserklärung gültig ab' },
    ];

    fieldsToCheck.forEach(({ key, label }) => {
      if (new Date(formData[key]) <= year2000) {
        invalidFields.push(label);
      }
    });

    if (invalidFields.length > 0) {
      const errorMessage = `Das Datum ist falsch eingetragen: ${invalidFields.join(', ')}`;
      setDateError(errorMessage);
      toast({
        variant: "destructive",
        description: errorMessage,
      });
      setLoading(false);
      return;
    } else {
      setDateError('');
      setLoading(false);
    }

    // check fields for empty values
    // Function to validate each group of fields 
    const validateGroup = (groupFields, groupName) => {
      const isFilled = val => val !== null && val !== undefined && (typeof val === 'string' ? val.trim() !== '' : true);

      const filled = groupFields.filter(({ key }) => isFilled(formData[key]));
      const missing = groupFields.filter(({ key }) => !isFilled(formData[key]));

      if (filled.length > 0 && missing.length > 0) {
        const missingLabels = missing.map(f => f.label).join(', ');
        toast({
          variant: 'destructive',
          description: `${groupName}: Bitte felder ausfüllen: ${missingLabels}.`,
        });
        setLoading(false);
        return false;
      }
      return true;
    };

    // Define the groups and their fields
    const groups = [
      {
        name: 'Führungszeugnis',
        fields: [
          { key: 'fz_eingetragen', label: 'Führungszeugnis gültig ab' },
          { key: 'fz_kontrolliert_first', label: 'Führungszeugnis kontrolliert von (Person 1)' },
          { key: 'fz_kontrolliert_second', label: 'Führungszeugnis kontrolliert von (Person 2)' },
          { key: 'fz_kontrolliert_am', label: 'Führungszeugnis kontrolliert am' },
        ],
      },
      {
        name: 'Grundlagenschulung',
        fields: [
          { key: 'gs_eingetragen', label: 'Grundlagenschulung gültig ab' },
          { key: 'gs_kontrolliert', label: 'Grundlagenschulung kontrolliert von' },
        ],
      },
      {
        name: 'Upgradeschulung',
        fields: [
          { key: 'us_eingetragen', label: 'Upgradeschulung gültig ab' },
          { key: 'us_abgelaufen', label: 'Upgradeschulung Ablaufdatum' },
          { key: 'us_kontrolliert', label: 'Upgradeschulung kontrolliert von' },
        ],
      },
      {
        name: 'Selbstverpflichtungserklärung',
        fields: [
          { key: 'sve_eingetragen', label: 'Selbstverständniserklärung gültig ab' },
          { key: 'sve_kontrolliert', label: 'Selbstverständniserklärung kontrolliert von' },
        ],
      },
    ];

    // Validate each group
    for (const { name, fields } of groups) {
      if (!validateGroup(fields, name)) return;
    }

    // Combine the two fields for fz_kontrolliert into one field (db requirement)
    const fz_kontrolliert = `${formData.fz_kontrolliert_first.trim()} ${formData.fz_kontrolliert_second.trim()}`.trim();
    const { fz_kontrolliert_first, fz_kontrolliert_second, ...dataToSubmit } = formData;
    const transformedFormData = transformFormData({
      ...dataToSubmit,
      fz_kontrolliert
    });

    // InsertEmployee(data, setData, transformedFormData, toast, setLoading)
    try {
      await InsertEmployee(data, setData, transformedFormData, toast, setLoading);
      setFormData(initialFormState); // Reset form data after successful submission
      setActiveButton('no');
      setHauptamt(false);
    } catch (error) {
      //
    }
  }

  // Hauptamt button
  const handleButtonClick = (button) => {
    const isHauptamt = button === 'yes';
    setHauptamt(isHauptamt); // Set hauptamt based on the button clicked
    setActiveButton(button);

    // Update formData.hauptamt
    setFormData((prevData) => ({
      ...prevData,
      hauptamt: isHauptamt, // Set hauptamt in formData based on button clicked
    }));

    // Recalculate newFzAbgelaufen if fz_eingetragen is in formData
    if (formData.fz_eingetragen) {
      const year = isHauptamt ? 3 : 5;
      const newFzAbgelaufen = calculateExpirationDate(formData.fz_eingetragen, year);
      setFormData((prevData) => ({
        ...prevData,
        fz_abgelaufen: newFzAbgelaufen,
      }));
    }
  };

  // Fields to dynamically render
  const fields = [
    { id: "name", label: "Name", placeholder: "Nachname", required: true },
    { id: "vorname", label: "Vorname", placeholder: "Vorname", required: true },
    { id: "email", label: "E-Mail", placeholder: "E-Mail", type: "email", required: true },
    { id: "gemeinde_freizeit", label: "Gemeinde / Freizeit", placeholder: "Gemeinde / Freizeit" },
    { id: "fz_eingetragen", label: "Führungszeugnis gültig ab", type: "date" },
    { id: "fz_abgelaufen", label: "Führungszeugnis Ablaufdatum", type: "date", disabled: true },
    { id: "fz_kontrolliert_first", label: "Führungszeugnis kontrolliert von", placeholder: "Max Mustermann" },
    { id: "fz_kontrolliert_second", placeholder: "Max Mustermann" },
    { id: "fz_kontrolliert_am", label: "Führungszeugnis kontrolliert am", type: "date" },
    { id: "gs_eingetragen", label: "Grundlagenschulung gültig ab", type: "date" },
    { id: "gs_erneuert", label: "Grundlagenschulung erneuert am", type: "date", disabled: gsDisabled },
    { id: "gs_kontrolliert", label: "Grundlagenschulung kontrolliert von", placeholder: "Max Mustermann" },
    { id: "us_eingetragen", label: "Upgradeschulung gültig ab", type: "date" },
    { id: "us_abgelaufen", label: "Upgradeschulung Ablaufdatum", type: "date", disabled: true },
    { id: "us_kontrolliert", label: "Upgradeschulung kontrolliert von", placeholder: "Max Mustermann" },
    { id: "sve_eingetragen", label: "Selbstverpflichtungserklärung gültig ab", type: "date" },
    { id: "sve_kontrolliert", label: "Selbstverpflichtungserklärung kontrolliert", placeholder: "Max Mustermann" },
  ];


  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="" className="gap-3 w-60">
            <p>
              Mitarbeiter hinzufügen
            </p>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="addEmployee-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Mitarbeiter hinzufügen</DialogTitle>
            <DialogDescription>

            </DialogDescription>
          </DialogHeader>
          <section>
            <div>Hier können Sie einen neuen Mitarbeiter hinzufügen.</div>
            <div className="flex flex-row">
              Achtung:
              <span className="ml-1"></span>
              <span className="after:content-['*'] after:ml-0.5 after:text-red-500">Felder</span>
              <span className="ml-1"></span>
              sind Pflichtfelder!
            </div>
          </section>

          <form className="grid gap-3 py-4" onSubmit={validateAndInsertEmployee}>

            {fields.map(({ id, label, ...rest }, index) => {
              if (id === "email") {
                return (
                  <React.Fragment key={id}>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={id} className={rest.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                      </Label>
                      <Input id={id} value={formData[id] || ""} onChange={handleChange} {...rest} />

                    </div>
                    <PostalAdress formData={formData} setFormData={setFormData} />
                  </React.Fragment>
                );
              };

              if (id === "gemeinde_frezizeit") {
                return (
                  <React.Fragment key={id}>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={id} className={rest.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                      </Label>
                      <Input id={id} value={formData[id] || ""} onChange={handleChange} {...rest} />

                      <span className="col-span-1 leading-none font-medium text-xs text-muted-foreground">
                        <div>Auszufüllen, falls zugehörige Gemeinde nicht mit Wohnort übereinstimmt.</div>
                      </span>
                    </div>
                  </React.Fragment>
                );
              }

              if (id === "fz_eingetragen") {
                return (
                  <React.Fragment key={id}>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={id} className={rest.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                      </Label>
                      <Input id={id} value={formData[id] || ""} onChange={handleChange} {...rest} />

                      <span className="col-span-1 leading-none font-medium text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <div className="flex flex-row">
                            <div>Klicken Sie auf</div>
                            <span className="ml-1"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                              <path fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z" clipRule="evenodd" />
                            </svg>
                            <div>,</div>
                            <span className="ml-1"></span>
                          </div>
                          <div>um ein Datum einzutragen</div>
                        </div>
                      </span>
                    </div>
                  </React.Fragment>
                );
              }
              if (id === "fz_kontrolliert_first") {
                return (
                  <React.Fragment key={id}>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={id} className={rest.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {label}
                      </Label>
                      <Input id={id} value={formData[id] || ""} onChange={handleChange} {...rest} />
                      <span className="col-span-1 leading-none font-medium text-xs text-muted-foreground">
                        <div className="flex flex-col">
                          <div>Es müssen zwei Personen kontrolliert haben. Vor- und Nachname erforderlich!</div>
                        </div>
                      </span>
                    </div>
                  </React.Fragment>
                );
              }

              // Render default field layout
              return (
                <div key={id} className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor={id} className={rest.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                    {label}
                  </Label>
                  <Input id={id} value={formData[id] || ""} onChange={handleChange} {...rest} />
                </div>
              );
            })}

            {/* Hauptamt */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="sve_kontrolliert" className="col-span-1">Hauptamt</Label>
              <div className="flex flex-row justify-around items-center">
                <Button
                  className={`bg-white text-black w-16 rounded-md hover:bg-lime-200 border-ec border-2 ${activeButton === 'yes' ? 'bg-ec hover:bg-ec' : ''}`}
                  onClick={(event) => {
                    event.preventDefault(); // Prevent the form from submitting
                    handleButtonClick('yes'); // Set 'yes' button as active
                  }}
                >
                  Ja
                </Button>
                <Button
                  className={`bg-white text-black w-16 rounded-md hover:bg-lime-200 border-ec border-2 ${activeButton === 'no' ? 'bg-ec hover:bg-ec' : ''}`}
                  onClick={(event) => {
                    event.preventDefault();
                    handleButtonClick('no'); // Set 'no' button as active
                  }}
                >
                  Nein
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  abbrechen
                </Button>
              </DialogClose>
              <Button className="px-0" type="submit">
                <ModalSubmitButton text="Mitarbeiter hinzufügen" loading={loading} />
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
};

export default AddEmployeeDialog;
