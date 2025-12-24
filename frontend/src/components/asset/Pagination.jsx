import { useState } from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 10,
  onPageChange,
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

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="border-2 border-black px-3 py-2 text-sm font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        &lt;
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`border-2 border-black px-3 py-2 text-sm font-bold transition ${
            page === currentPage
              ? "bg-black text-white"
              : page === "..."
              ? "border-0 cursor-default"
              : "hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="border-2 border-black px-3 py-2 text-sm font-bold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        &gt;
      </button>
    </div>
  );
}
