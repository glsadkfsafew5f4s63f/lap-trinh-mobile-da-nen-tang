import { useState } from "react";
import "./pagination.css";

/* eslint-disable react-refresh/only-export-components */
export const RECORDS_PER_PAGE = 5;

export function usePaginatedRows<T>(rows: T[], resetKey: string) {
  const [pagination, setPagination] = useState({ resetKey, page: 1 });
  const totalPages = Math.max(1, Math.ceil(rows.length / RECORDS_PER_PAGE));
  const page = pagination.resetKey === resetKey ? pagination.page : 1;
  const currentPage = Math.min(page, totalPages);
  const setPage = (nextPage: number) => {
    setPagination({
      resetKey,
      page: Math.max(1, Math.min(nextPage, totalPages)),
    });
  };

  return {
    pageRows: rows.slice(
      (currentPage - 1) * RECORDS_PER_PAGE,
      currentPage * RECORDS_PER_PAGE,
    ),
    page: currentPage,
    totalPages,
    totalRows: rows.length,
    setPage,
  };
}

export function PaginationControls({
  page,
  totalPages,
  totalRows,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalRows: number;
  onPageChange: (page: number) => void;
}) {
  const firstRow = totalRows === 0 ? 0 : (page - 1) * RECORDS_PER_PAGE + 1;
  const lastRow = Math.min(page * RECORDS_PER_PAGE, totalRows);

  return (
    <div className="pagination-controls">
      <span className="pagination-summary">
        {firstRow}-{lastRow} / {totalRows} bản ghi · {RECORDS_PER_PAGE} bản ghi/trang
      </span>
      <div className="pagination-navigation">
        <button
          type="button"
          aria-label="Trang trước"
          title="Trang trước"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        <span>Trang {page} / {totalPages}</span>
        <button
          type="button"
          aria-label="Trang sau"
          title="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}