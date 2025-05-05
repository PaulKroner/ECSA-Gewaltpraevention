import { Dialog, DialogContent, DialogClose, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { useState } from "react";
import SelectRoleRegistration from "../SelectRoleRegistration";
import { getDataRoles, updateUser } from "../../api/UserAdministrationAPI";
import ModalSubmitButton from "../ModalSubmitButton";

const EditUserDialog = ({ data, setData, row }) => {

  const { toast } = useToast();
  const [role, setRole] = useState(''); // State for the role of the user of Dropdown
  const [loading, setLoading] = useState(false);

  // State for the EditEmployee-Dialog
  const [formData, setFormData] = useState({
    id: data.id,
    name: data.name || '',
    vorname: data.vorname || '',
    email: data.email || '',
    role: data.role_id || '',
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    let newValue = value;

    if (id === "name" || id === "vorname") {
      // Allow only letters and spaces (including German special characters)
      newValue = value.replace(/[^a-zA-ZäöüÄÖÜß\s-]/g, '');
    }

    // Convert email to lowercase
    if (id === "email") {
      newValue = value.toLowerCase();
    }

    setFormData({
      ...formData,
      [id]: newValue,
    });
  };

  const handleEditUserClick = (row) => {
    setFormData({
      id: row.id,
      name: row.name || "",
      vorname: row.vorname || "",
      email: row.email || "",
      role: row.role_id || "",
    });
  };

  const validateAndUpdateUser = (e) => {
    e.preventDefault();
    if (formData.name === '' || formData.vorname === '' || formData.email === '' || formData.role === '') {
      toast({
        variant: 'destructive',
        description: 'Bitte füllen Sie alle Felder aus.',
      });
    } else {
      updateUser(formData.id, formData, setLoading, setData, toast, getDataRoles);
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="" onClick={() => handleEditUserClick(row)} className="svg-dialog">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="svg-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle>User bearbeiten</DialogTitle>
            <DialogDescription>
              Hier können Sie Änderungen vornehmen. <br />
              Klicken Sie auf Speichern, wenn Sie fertig sind.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={validateAndUpdateUser} className="grid gap-3 py-4">
            {/* Name Field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className=""
                placeholder="Name"
              />
            </div>
            {/* Vorname Field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="vorname">Vorname</Label>
              <Input
                type="text"
                id="vorname"
                value={formData.vorname}
                onChange={handleChange}
                className=""
                placeholder="Vorname"
              />
            </div>
            {/* Email Field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className=""
                placeholder="E-Mail"
              />
            </div>
            {/* Role Field */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="role">Rolle</Label>
              <SelectRoleRegistration formData={formData} setFormData={setFormData} />
              <span className="col-span-1 leading-none font-medium text-xs text-muted-foreground">
                <div className="flex flex-col">
                  <div className="flex flex-row">
                    <div>Wählen sie eine Rolle aus!</div>
                    <span className="ml-1"></span>
                  </div>
                </div>
              </span>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  abbrechen
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button className="px-0" type="submit">
                  <ModalSubmitButton text="Änderungen speichern" loading={loading} />
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditUserDialog;
