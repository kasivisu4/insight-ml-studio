
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";

type DataTableProps = {
  data: any[];
  onSelectFeatures?: (features: string[]) => void;
  onSelectTarget?: (target: string) => void;
  selectedFeatures?: string[];
  selectedTarget?: string;
  selectable?: boolean;
  className?: string;
};

const DataTable: React.FC<DataTableProps> = ({
  data,
  onSelectFeatures,
  onSelectTarget,
  selectedFeatures = [],
  selectedTarget = "",
  selectable = false,
  className,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const rowsPerPage = 10;

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p>No data available</p>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  // Filter columns based on search term
  const filteredHeaders = searchTerm
    ? headers.filter(header => 
        header.toLowerCase().includes(searchTerm.toLowerCase()))
    : headers;

  // Calculate pagination
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const endRow = Math.min(startRow + rowsPerPage, data.length);
  const currentRows = data.slice(startRow, endRow);

  const handleFeatureClick = (column: string) => {
    if (onSelectFeatures) {
      let newFeatures = [...selectedFeatures];
      
      if (column === selectedTarget) {
        // Can't select target as feature
        return;
      }
      
      if (newFeatures.includes(column)) {
        // Remove if already selected
        newFeatures = newFeatures.filter(f => f !== column);
      } else {
        // Add if not selected
        newFeatures.push(column);
      }
      
      onSelectFeatures(newFeatures);
    }
  };

  const handleTargetClick = (column: string) => {
    if (onSelectTarget) {
      let newTarget = "";
      
      if (column === selectedTarget) {
        // Deselect current target
        newTarget = "";
      } else {
        // Select as new target
        newTarget = column;
        
        // Remove from features if it was selected
        if (onSelectFeatures && selectedFeatures.includes(column)) {
          const newFeatures = selectedFeatures.filter(f => f !== column);
          onSelectFeatures(newFeatures);
        }
      }
      
      onSelectTarget(newTarget);
    }
  };

  return (
    <div className={`w-full ${className || ''}`}>
      {selectable && (
        <div className="mb-4">
          <Input
            placeholder="Search columns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mb-2"
          />
          <div className="text-sm text-gray-500 mb-2">
            <span className="bg-blue-100 border border-blue-300 rounded-sm px-1.5 py-0.5 mr-2">
              Feature
            </span>
            <span className="bg-purple-100 border border-purple-300 rounded-sm px-1.5 py-0.5">
              Target
            </span>
          </div>
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                {filteredHeaders.map((header) => (
                  <TableHead key={header} className="whitespace-nowrap">
                    {selectable ? (
                      <div className="flex items-center gap-1.5">
                        <span>{header}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleFeatureClick(header)}
                            className={`h-4 w-4 rounded-sm border ${
                              selectedFeatures.includes(header) 
                                ? "bg-blue-500 border-blue-500" 
                                : "border-gray-300"
                            }`}
                            title="Select as feature"
                            disabled={header === selectedTarget}
                          />
                          <button
                            onClick={() => handleTargetClick(header)}
                            className={`h-4 w-4 rounded-full border ${
                              header === selectedTarget 
                                ? "bg-purple-500 border-purple-500" 
                                : "border-gray-300"
                            }`}
                            title="Select as target"
                          />
                        </div>
                      </div>
                    ) : (
                      header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRows.map((row, index) => (
                <TableRow key={index}>
                  {filteredHeaders.map((header) => (
                    <TableCell key={`${index}-${header}`} className="whitespace-nowrap">
                      {row[header] !== null && row[header] !== undefined
                        ? String(row[header])
                        : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500">
          Showing {startRow + 1} to {endRow} of {data.length} rows
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex h-9 items-center justify-center px-3 text-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
