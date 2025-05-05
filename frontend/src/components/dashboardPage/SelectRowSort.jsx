import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getRoleString } from "../../lib/utils";

const SelectRowSort = ({ data, setData, options = [] }) => {

  const sortBy = (key) => {
    const sortedData = [...data].sort((a, b) => {
      const valA = a[key];
      const valB = b[key];

      let strA, strB;

      if (key === "role_id") {
        strA = getRoleString(valA)?.toLowerCase() || "";  // Ensure a fallback if undefined
        strB = getRoleString(valB)?.toLowerCase() || "";  // Ensure a fallback if undefined
      } else {
        strA = typeof valA === "string" ? valA.toLowerCase() : String(valA);
        strB = typeof valB === "string" ? valB.toLowerCase() : String(valB);
      }

      return strA.localeCompare(strB);
    });

    setData(sortedData); // Update the state with sorted data
  };

  return (
    <>
      <Select onValueChange={(value) => sortBy(value)} className="border-2">
        <SelectTrigger className="w-36 border-2 border-ec rounded-lg">
          <SelectValue placeholder="Sortiere nach" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default SelectRowSort;
