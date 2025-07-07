import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SelectNumberRows = ({ rowsPerPage, setRowsPerPage }) => {

  return (
    <>
      <Select onValueChange={(value) => setRowsPerPage(parseInt(value, 10))}>
        <SelectTrigger className="w-[100px] border-2 border-ec rounded-lg">
          <SelectValue placeholder="Zeilen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectContent>
      </Select>

    </>
  );
};

export default SelectNumberRows;
