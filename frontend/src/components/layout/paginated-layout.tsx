"use client";

import { useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/pagination";
import type { PaginatedResponse } from "@/types";

interface PaginatedLayoutProps<T> {
  // Query configuration
  queryKey: any[];
  queryFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>;
  initialPageSize?: number;

  // Page content
  children: (
    data: T[],
    isLoading: boolean,
    error: Error | null,
    refetch: () => void,
  ) => ReactNode;

  // UI options
  className?: string;
  showPagination?: boolean;
  showPageSizeSelector?: boolean;
  paginationClassName?: string;

  // Additional options
  autoResetPageOnChange?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
}

export function PaginatedLayout<T>({
  queryKey,
  queryFn,
  initialPageSize = 10,
  children,
  className,
  showPagination = true,
  showPageSizeSelector = true,
  paginationClassName,
  autoResetPageOnChange = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus = false,
}: PaginatedLayoutProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [prevBaseQueryKey, setPrevBaseQueryKey] = useState(
    queryKey.slice(0, -2),
  );
  const queryClient = useQueryClient();

  // Build dynamic query key including pagination params
  const fullQueryKey = [...queryKey, currentPage, pageSize];

  console.log("Full query key:", fullQueryKey);

  const { data, isLoading, error, refetch } = useQuery<
    PaginatedResponse<T>,
    Error
  >({
    queryKey: fullQueryKey,
    queryFn: () => {
      console.log("Query function called with:", { currentPage, pageSize });
      return queryFn(currentPage, pageSize);
    },
    staleTime,
    refetchOnWindowFocus,
  });

  const items = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    console.log("Page change requested:", page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    console.log("Page size change requested:", newPageSize);
    setPageSize(newPageSize);
    if (autoResetPageOnChange) {
      setCurrentPage(1);
    }
  };

  // Reset page when base query dependencies change (filters, etc.), but NOT when page changes
  const baseQueryKey = queryKey.slice(0, -2);
  useEffect(() => {
    if (
      autoResetPageOnChange &&
      JSON.stringify(baseQueryKey) !== JSON.stringify(prevBaseQueryKey)
    ) {
      console.log("Base query key changed, resetting page to 1");
      setCurrentPage(1);
      setPrevBaseQueryKey(baseQueryKey);
    }
  }, [baseQueryKey, prevBaseQueryKey, autoResetPageOnChange]);

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 min-h-0">
        {children(items, isLoading, error, refetch)}
      </div>

      {showPagination && totalCount > 0 && (
        <div
          className={`mt-4 flex justify-center items-center ${paginationClassName || ""}`}
          style={{ width: "40%", marginLeft: "auto", marginRight: "auto" }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={showPageSizeSelector ? pageSize : undefined}
            onPageSizeChange={
              showPageSizeSelector ? handlePageSizeChange : undefined
            }
            totalItems={totalCount}
          />
        </div>
      )}
    </div>
  );
}

// Hook for easier integration with existing useRepairs hook pattern
export function usePaginatedData<T>(
  queryKey: string[],
  queryFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  options?: {
    initialPageSize?: number;
    autoResetPageOnChange?: boolean;
    staleTime?: number;
  },
) {
  const [currentPage, setCurrentPage] = useState(
    options?.initialPageSize ? 1 : 1,
  );
  const [pageSize, setPageSize] = useState(options?.initialPageSize || 10);

  const fullQueryKey = [...queryKey, currentPage, pageSize];

  const query = useQuery<PaginatedResponse<T>, Error>({
    queryKey: fullQueryKey,
    queryFn: () => queryFn(currentPage, pageSize),
    staleTime: options?.staleTime || 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = query.data?.results || [];
  const totalCount = query.data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    if (options?.autoResetPageOnChange !== false) {
      setCurrentPage(1);
    }
  };

  return {
    ...query,
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    items,
    handlePageChange,
    handlePageSizeChange,
  };
}
