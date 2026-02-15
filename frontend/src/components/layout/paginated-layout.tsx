"use client";

import { useState, useEffect, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@/components/ui/pagination";
import type { PaginatedResponse } from "@/types";

interface PaginatedLayoutProps<T> {
  // Query configuration (Optional if external data provided)
  queryKey?: any[];
  queryFn?: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>;
  initialPageSize?: number;

  // External state (Optional)
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  
  // External data (Optional)
  data?: T[];
  totalCount?: number;
  isLoading?: boolean;
  error?: Error | null;
  refetch?: () => void;

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
  page: externalPage,
  onPageChange: externalOnPageChange,
  pageSize: externalPageSize,
  onPageSizeChange: externalOnPageSizeChange,
  data: externalData,
  totalCount: externalTotalCount,
  isLoading: externalIsLoading,
  error: externalError,
  refetch: externalRefetch,
  children,
  className,
  showPagination = true,
  showPageSizeSelector = true,
  paginationClassName,
  autoResetPageOnChange = true,
  staleTime = 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus = false,
}: PaginatedLayoutProps<T>) {
  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(initialPageSize);

  const currentPage = externalPage ?? internalPage;
  const currentPageSize = externalPageSize ?? internalPageSize;

  const [prevBaseQueryKey, setPrevBaseQueryKey] = useState(
    queryKey ? queryKey.slice(0, -2) : [],
  );

  // Build dynamic query key including pagination params
  const fullQueryKey = queryKey ? [...queryKey, currentPage, currentPageSize] : ["paginated-layout-placeholder"];

  const { data: internalDataResponse, isLoading: internalIsLoading, error: internalError, refetch: internalRefetch } = useQuery<
    PaginatedResponse<T>,
    Error
  >({
    queryKey: fullQueryKey,
    queryFn: queryFn ? () => queryFn(currentPage, currentPageSize) : () => Promise.reject("No queryFn provided"),
    staleTime,
    refetchOnWindowFocus,
    enabled: !!queryKey && !!queryFn,
  });

  const items = externalData ?? internalDataResponse?.results ?? [];
  const totalCount = externalTotalCount ?? internalDataResponse?.count ?? 0;
  const isLoading = externalIsLoading ?? internalIsLoading;
  const error = externalError ?? internalError;
  const refetch = externalRefetch ?? internalRefetch;
  
  const totalPages = Math.ceil(totalCount / currentPageSize);

  const handlePageChange = (page: number) => {
    if (externalOnPageChange) {
      externalOnPageChange(page);
    } else {
      setInternalPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (externalOnPageSizeChange) {
      externalOnPageSizeChange(newPageSize);
    } else {
      setInternalPageSize(newPageSize);
      if (autoResetPageOnChange) {
        setInternalPage(1);
      }
    }
  };

  // Reset page when base query dependencies change (filters, etc.), but NOT when page changes
  const baseQueryKey = queryKey ? queryKey.slice(0, -2) : [];
  useEffect(() => {
    if (
      autoResetPageOnChange &&
      queryKey &&
      JSON.stringify(baseQueryKey) !== JSON.stringify(prevBaseQueryKey)
    ) {
      if (externalOnPageChange) {
        externalOnPageChange(1);
      } else {
        setInternalPage(1);
      }
      setPrevBaseQueryKey(baseQueryKey);
    }
  }, [baseQueryKey, prevBaseQueryKey, autoResetPageOnChange, queryKey, externalOnPageChange]);

  return (
    <div className={`flex flex-col h-full ${className || ""}`}>
      <div className="flex-1 min-h-0 overflow-auto">
        {children(items, isLoading, error, refetch)}
      </div>

      {showPagination && totalCount > 0 && (
        <div
          className={`mt-4 flex justify-center items-center ${paginationClassName || ""}`}
          style={{ width: "60%", marginLeft: "auto", marginRight: "auto" }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={showPageSizeSelector ? currentPageSize : undefined}
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
