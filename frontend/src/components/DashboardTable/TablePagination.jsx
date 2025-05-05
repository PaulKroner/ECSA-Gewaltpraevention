import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const TablePagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={() => onPageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink 
                href="#" 
                isActive={index + 1 === currentPage}
                className=""
                onClick={() => onPageChange(index + 1)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

export default TablePagination;
