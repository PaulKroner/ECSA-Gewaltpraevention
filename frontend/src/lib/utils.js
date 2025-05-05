import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Function to calculate expiration date
export const calculateExpirationDate = (dateString, year) => {
  const newDate = new Date(dateString);
  newDate.setFullYear(newDate.getFullYear() + year);
  return newDate.toISOString().split('T')[0];
};

// function to convert role_id into string
export const getRoleString = (roleId) => {
  switch (roleId) {
    case 1:
      return "Admin";
    case 2:
      return "Mitarbeiter";
    default:
      return "Unknown Role";
  }
};

// function to convert role string into role_id
export const getRoleStringToId = (roleId) => {
  switch (roleId) {
    case 'Admin':
      return 1;
    case 'Mitarbeiter':
      return 2;
    default:
      return "Unknown Role";
  }
};

// converting data to dd-mm-yyyy format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

export const formatDateForInput = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // The expected format for <input type="date">
};