import { Dialog, DialogContent, DialogClose, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { useState, useEffect } from "react";
import { calculateExpirationDate } from "../../lib/utils";
import ModalSubmitButton from "../ModalSubmitButton";
import { updateEmployee } from "../../api/DashboardTableAPI";
import PostalAdress from "../PostalAdress";
import { formatDateForInput } from "../../lib/utils";
import React from "react";

const EditEmployeeDialog = ({ data, setData, showNachweise, row }) => {

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [disabled, setDisabled] = useState({
    fz_abgelaufen: true,
    gs_erneuert: true,
    us_abgelaufen: true,
  });
  const [activeButton, setActiveButton] = useState(null); // State to track the active hauptamt button
  const [hauptamt, setHauptamt] = useState(false); // State for the Hauptamt button


  // State for the EditEmployee-Dialog
  const [formData, setFormData] = useState({
    id: data.id,
    name: data.name || '',
    vorname: data.vorname || '',
    email: data.email || '',
    postadresse: data.postadresse || '',
    gemeinde_freizeit: data.gemeinde_freizeit || '',
    fz_eingetragen: data.fz_eingetragen || '',
    fz_abgelaufen: data.fz_abgelaufen || '',
    fz_kontrolliert: data.fz_kontrolliert || '',
    fz_kontrolliert_am: data.fz_kontrolliert_am || '',
    gs_eingetragen: data.gs_eingetragen || '',
    gs_erneuert: data.gs_erneuert || '',
    gs_kontrolliert: data.gs_kontrolliert || '',
    us_eingetragen: data.us_eingetragen || '',
    us_abgelaufen: data.us_abgelaufen || '',
    us_kontrolliert: data.us_kontrolliert || '',
    sve_eingetragen: data.sve_eingetragen || '',
    sve_kontrolliert: data.sve_kontrolliert || '',
    fz_kontrolliert_first: '',
    fz_kontrolliert_second: '',
    hauptamt: data.hauptamt || false,
  });

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
      let year = hauptamt ? 3 : 5;
      const newFzAbgelaufen = calculateExpirationDate(value, year);
      setFormData({
        ...formData,
        [id]: newValue,
        fz_abgelaufen: newFzAbgelaufen,
      });
    } else if (id === 'us_eingetragen') {
      const newUsAbgelaufen = calculateExpirationDate(value, 1);
      setFormData({
        ...formData,
        [id]: newValue,
        us_abgelaufen: newUsAbgelaufen,
      });
    } else {
      setFormData({
        ...formData,
        [id]: newValue,
      });
    }

  };

  const handleEditEmployeeClick = (row) => {

    const kontrolliertNames = row.fz_kontrolliert ? row.fz_kontrolliert.split(' ') : [];
    // Extract first and second names safely
    const fz_kontrolliert_first = kontrolliertNames.length > 0 ? kontrolliertNames[0] + ' ' + (kontrolliertNames[1] || '') : '';
    const fz_kontrolliert_second = kontrolliertNames.length > 2 ? kontrolliertNames[2] + ' ' + (kontrolliertNames[3] || '') : '';

    // Set the form data from the EditEmployee-Dialog with the row data
    setFormData({
      id: row.id,
      name: row.name || "",
      vorname: row.vorname || "",
      email: row.email || "",
      postadresse: row.postadresse || "",
      gemeinde_freizeit: row.gemeinde_freizeit || "",
      fz_eingetragen: row.fz_eingetragen ? formatDateForInput(row.fz_eingetragen) : "",
      fz_abgelaufen: row.fz_abgelaufen ? formatDateForInput(row.fz_abgelaufen) : "",
      fz_kontrolliert: row.fz_kontrolliert || "",
      fz_kontrolliert_am: row.fz_kontrolliert_am ? formatDateForInput(row.fz_kontrolliert_am) : "",
      gs_eingetragen: row.gs_eingetragen ? formatDateForInput(row.gs_eingetragen) : "",
      gs_erneuert: row.gs_erneuert ? formatDateForInput(row.gs_erneuert) : "",
      gs_kontrolliert: row.gs_kontrolliert || "",
      us_eingetragen: row.us_eingetragen ? formatDateForInput(row.us_eingetragen) : "",
      us_abgelaufen: row.us_abgelaufen ? formatDateForInput(row.us_abgelaufen) : "",
      us_kontrolliert: row.us_kontrolliert || "",
      sve_eingetragen: row.sve_eingetragen ? formatDateForInput(row.sve_eingetragen) : "",
      sve_kontrolliert: row.sve_kontrolliert || "",
      fz_kontrolliert_first,
      fz_kontrolliert_second,
      hauptamt: row.hauptamt || false,
    });

    setActiveButton(row.hauptamt ? 'yes' : 'no');
  };

  const validateAndUpdateEmployee = (e) => {
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
          description: `${groupName}: Bitte Felder ausfüllen: ${missingLabels}.`,
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

    // validate each group
    for (const { name, fields } of groups) {
      if (!validateGroup(fields, name)) return;
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

    // Combine the fz_kontrolliert_first and fz_kontrolliert_second fields into one string
    const fz_kontrolliert = `${formData.fz_kontrolliert_first.trim()} ${formData.fz_kontrolliert_second.trim()}`.trim();
    const updatedFormData = {
      ...formData,
      fz_kontrolliert
    };

    updateEmployee(updatedFormData.id, updatedFormData, setData, toast, setLoading);
  };

  // Hauptamt button
  const handleButtonClick = (button) => {
    const isHauptamt = button === 'yes';
    setHauptamt(isHauptamt); // Set hauptamt based on the button clicked
    setActiveButton(button); // Update active button state

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

  useEffect(() => {
    const fields = ["fz", "gs", "us"];

    const updatedDisabled = fields.reduce((acc, field) => {
      acc[`${field}_abgelaufen`] = !formData[`${field}_eingetragen`];
      return acc;
    }, {});

    const gsErneuertDisabled = !formData.gs_eingetragen;
    updatedDisabled.gs_erneuert = gsErneuertDisabled;

    setDisabled(updatedDisabled);
  }, [formData]);

  // Fields to dynamically render
  const fields = [
    { id: "name", label: "Name", placeholder: "Nachname", required: true },
    { id: "vorname", label: "Vorname", placeholder: "Vorname", required: true },
    { id: "email", label: "E-Mail", placeholder: "E-Mail", type: "email", required: true },
    { id: "gemeinde_freizeit", label: "Gemeinde / Freizeit", placeholder: "Gemeinde / Freizeit" },
    { id: "fz_eingetragen", label: "Führungszeugnis gültig ab", type: "date" },
    { id: "fz_abgelaufen", label: "Führungszeugnis Ablaufdatum", type: "date" },
    { id: "fz_kontrolliert_first", label: "Führungszeugnis kontrolliert von", placeholder: "Max Mustermann" },
    { id: "fz_kontrolliert_second", placeholder: "Max Mustermann" },
    { id: "fz_kontrolliert_am", label: "Führungszeugnis kontrolliert am", type: "date" },
    { id: "gs_eingetragen", label: "Grundlagenschulung gültig ab", type: "date" },
    { id: "gs_erneuert", label: "Grundlagenschulung erneuert am", type: "date" },
    { id: "gs_kontrolliert", label: "Grundlagenschulung kontrolliert von", placeholder: "Max Mustermann" },
    { id: "us_eingetragen", label: "Upgradeschulung gültig ab", type: "date" },
    { id: "us_abgelaufen", label: "Upgradeschulung Ablaufdatum", type: "date" },
    { id: "us_kontrolliert", label: "Upgradeschulung kontrolliert von", placeholder: "Max Mustermann" },
    { id: "sve_eingetragen", label: "Selbstverpflichtungserklärung gültig ab", type: "date" },
    { id: "sve_kontrolliert", label: "Selbstverpflichtungserklärung kontrolliert", placeholder: "Max Mustermann" },
  ];

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="" onClick={() => handleEditEmployeeClick(row)} className="svg-dialog">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
            <DialogDescription>
              Hier können Sie Änderungen vornehmen. Klicken Sie auf Speichern, wenn Sie fertig sind. <br />
              Falls Sie nicht alle Felder sehen, wählen sie vorher die Spalten aus, die sie benötigen.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-3 py-4"
            onSubmit={(e) => {
              validateAndUpdateEmployee(e);
            }}>
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
  );
};

export default EditEmployeeDialog;