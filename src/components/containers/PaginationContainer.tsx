import React, { useState } from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../ui/pagination";

interface PaginationContainerProps {
    currentPage: number;
    setCurrentPage: (value: number | ((prev: number) => number)) => void;
    totalPages: number;
}

function PaginationContainer({
    currentPage,
    setCurrentPage,
    totalPages,
}: PaginationContainerProps) {
    return (
        <div className="flex justify-items-start my-8">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationFirst
                            onClick={() => setCurrentPage(1)}
                            className={`${currentPage === 1 ? "pointer-events-none opacity-50 text-xs" : ""
                                }`}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className={`${currentPage === 1 ? "pointer-events-none opacity-50 text-xs" : ""
                                }`}
                        />
                    </PaginationItem>

                    {currentPage > 3 && (
                        <>
                            <PaginationItem>
                                <PaginationLink onClick={() => setCurrentPage(1)}>
                                    1
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationEllipsis />
                        </>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .slice(
                            Math.max(0, currentPage - 3),
                            Math.min(currentPage + 2, totalPages)
                        )
                        .map((pageNum) => (
                            <PaginationItem key={pageNum}>
                                <PaginationLink
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`${pageNum === currentPage ? "font-normal text-xs" : "font-normal text-xs"}`}
                                    isActive={pageNum === currentPage}
                                >
                                    {pageNum}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                    {totalPages > currentPage + 2 && (
                        <>
                            <PaginationEllipsis />
                            <PaginationItem>
                                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                                    {totalPages}
                                </PaginationLink>
                            </PaginationItem>
                        </>
                    )}

                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                            }
                            className={`${currentPage === totalPages
                                ? "pointer-events-none opacity-50 text-xs"
                                : ""
                                }`}
                        />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLast
                            onClick={() => setCurrentPage(totalPages)}
                            className={`${currentPage === totalPages
                                ? "pointer-events-none opacity-50 text-xs"
                                : ""
                                }`}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export default PaginationContainer;