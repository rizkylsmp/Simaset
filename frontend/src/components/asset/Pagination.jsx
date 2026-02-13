import { CaretLeft, CaretRight, DotsThree } from "@phosphor-icons/react";

export default function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
      {/* Info */}
      {totalItems > 0 && (
        <p className="text-sm text-text-tertiary order-2 sm:order-1">
          Menampilkan{" "}
          <span className="font-medium text-text-primary">
            {startItem}-{endItem}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-text-primary">{totalItems}</span>{" "}
          data
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-text-secondary hover:bg-surface-tertiary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous page"
        >
          <CaretLeft size={16} weight="bold" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`min-w-9 h-9 px-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              page === currentPage
                ? "bg-accent text-white dark:text-gray-900 shadow-sm"
                : page === "..."
                  ? "cursor-default text-text-muted"
                  : "border border-border text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
            }`}
          >
            {page === "..." ? <DotsThree size={16} weight="bold" /> : page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center border border-border rounded-lg text-text-secondary hover:bg-surface-tertiary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next page"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
