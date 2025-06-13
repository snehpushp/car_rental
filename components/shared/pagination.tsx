'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export function Pagination({ pagination }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const { page, total_pages, has_prev, has_next } = pagination;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= total_pages) {
      router.push(`${pathname}?${createQueryString('page', String(newPage))}`);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    if (total_pages <= maxPagesToShow) {
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else if (page <= half) {
      for (let i = 1; i <= maxPagesToShow - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(total_pages);
    } else if (page >= total_pages - half) {
      pages.push(1);
      pages.push('...');
      for (let i = total_pages - maxPagesToShow + 2; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - (half -1) ; i <= page + (half - 1); i++) {
            pages.push(i);
        }
        pages.push('...');
        pages.push(total_pages);
    }
    return pages;
  };

  if (total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center">
        <ShadcnPagination>
            <PaginationContent className="gap-2">
                <PaginationItem>
                    <PaginationPrevious 
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(page - 1);}}
                        className={`border-border text-foreground hover:bg-muted ${!has_prev ? 'pointer-events-none opacity-50' : ''}`}
                    />
                </PaginationItem>

                {getPageNumbers().map((p, index) => (
                    <PaginationItem key={index}>
                        {p === '...' ? (
                            <PaginationEllipsis className="text-muted-foreground" />
                        ) : (
                            <PaginationLink 
                                href="#"
                                onClick={(e) => { e.preventDefault(); handlePageChange(p as number);}}
                                isActive={page === p}
                                className={`border-border text-foreground hover:bg-muted ${
                                    page === p ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                                }`}
                            >
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext 
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(page + 1);}}
                        className={`border-border text-foreground hover:bg-muted ${!has_next ? 'pointer-events-none opacity-50' : ''}`}
                    />
                </PaginationItem>
            </PaginationContent>
        </ShadcnPagination>
    </div>
  );
} 