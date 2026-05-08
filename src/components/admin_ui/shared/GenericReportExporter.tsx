"use client";

import React, { useState } from "react";
import { Button } from "@/components/admin_ui/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/admin_ui/ui/dropdown-menu";
import { Upload, Sheet, FileUp, FileSpreadsheet } from "lucide-react";

const REPORT_TITLE = "Blog posts";
const MODULE_SLUG = "blogs";

interface ColumnConfig {
  key: string;
  label: string;
  width?: number;
  format?: "date" | "percentage" | "array" | "object" | "user" | "html" | string;
}

const BLOG_COLUMNS: ColumnConfig[] = [
  { key: "title", label: "Title", width: 220 },
  { key: "slug", label: "Slug", width: 180 },
  { key: "status", label: "Status", width: 100 },
  { key: "category", label: "Category", width: 150 },
  { key: "updated", label: "Updated", width: 120 },
];

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const loadAndAddLogo = async (doc: InstanceType<typeof import("jspdf").default>) => {
  try {
    const logoImg = await loadImage("/566-removebg-preview.png");
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 50;
    const imgHeight = (logoImg.height / logoImg.width) * imgWidth;
    const x = (pageWidth - imgWidth) / 2;
    doc.addImage(logoImg, "PNG", x, 10, imgWidth, imgHeight);
  } catch (error) {
    console.warn("Failed to load logo:", error);
  }
};

const stripHtml = (html: string): string => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const formatCellValue = (value: unknown, format?: string): string => {
  if (value == null) return "";

  switch (format) {
    case "date":
      return new Date(value as string | number | Date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    case "percentage":
      return `${value}%`;
    case "array":
      return Array.isArray(value) ? value.join(", ") : String(value);
    case "object":
      return typeof value === "object" && value !== null
        ? (value as { projectName?: string; displayName?: string; name?: string; title?: string }).projectName ||
            (value as { displayName?: string }).displayName ||
            (value as { name?: string }).name ||
            (value as { title?: string }).title ||
            JSON.stringify(value)
        : String(value);
    case "user":
      return typeof value === "object" && value !== null
        ? (value as { displayName?: string; name?: string; email?: string }).displayName ||
            (value as { name?: string }).name ||
            (value as { email?: string }).email ||
            ""
        : String(value);
    case "html":
      return stripHtml(String(value));
    default:
      return String(value);
  }
};

function prepareExportData(data: Record<string, unknown>[], columns: ColumnConfig[]) {
  const headers = columns.map((col) => col.label);
  const rows = data.map((item) => columns.map((col) => formatCellValue(item[col.key], col.format)));
  return { headers, rows };
}

export interface BlogExportResult {
  success: boolean;
  message: string;
  fileName?: string;
}

export async function exportBlogReport(
  format: "pdf" | "excel" | "csv",
  data: Record<string, unknown>[],
  onExportComplete?: (result: BlogExportResult) => void,
): Promise<BlogExportResult> {
  if (data.length === 0) {
    const err: BlogExportResult = { success: false, message: "No rows to export" };
    onExportComplete?.(err);
    return err;
  }

  const columns = BLOG_COLUMNS;
  const { headers, rows } = prepareExportData(data, columns);
  const dateStamp = new Date().toISOString().split("T")[0];

  try {
    if (format === "pdf") {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(24);
      doc.text(`${REPORT_TITLE} report`, 10, 20);
      await loadAndAddLogo(doc);

      // jsPDF only (no jspdf-autotable dependency)
      const colWidth = 55;
      const colGap = 5;
      let yPosition = 60;

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      headers.forEach((header, idx) => {
        const xPos = 10 + idx * (colWidth + colGap);
        const headerText = header.length > 50 ? header.substring(0, 50) : header;
        doc.text(headerText, xPos, yPosition);
      });
      doc.setFont("helvetica", "normal");
      yPosition += 8;

      let currentPage = 1;
      rows.forEach((row) => {
        if (yPosition > pageHeight - 20) {
          doc.setFontSize(8);
          doc.text(`Page ${currentPage}`, pageWidth - 25, pageHeight - 10);
          doc.addPage();
          currentPage++;
          yPosition = 15;
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          headers.forEach((header, idx) => {
            const xPos = 10 + idx * (colWidth + colGap);
            const headerText = header.length > 50 ? header.substring(0, 50) : header;
            doc.text(headerText, xPos, yPosition);
          });
          doc.setFont("helvetica", "normal");
          yPosition += 8;
        }

        doc.setFontSize(7);
        row.forEach((cell, colIdx) => {
          const xPos = 10 + colIdx * (colWidth + colGap);
          const text = cell.length > 50 ? cell.substring(0, 50) + "..." : cell;
          doc.text(text, xPos, yPosition);
        });
        yPosition += 6;
      });

      const totalPages = (doc as unknown as { internal: { getNumberOfPages?: () => number } }).internal.getNumberOfPages?.() || 1;
      doc.setFontSize(8);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, pageHeight - 10);
      doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 40, pageHeight - 10);

      const fileName = `${MODULE_SLUG}_report_${dateStamp}.pdf`;
      doc.save(fileName);
      const ok: BlogExportResult = { success: true, message: "PDF exported successfully", fileName };
      onExportComplete?.(ok);
      return ok;
    }

    if (format === "excel") {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Blog posts");
      const fileName = `${MODULE_SLUG}_report_${dateStamp}.xlsx`;
      XLSX.writeFile(wb, fileName);
      const ok: BlogExportResult = { success: true, message: "Excel exported successfully", fileName };
      onExportComplete?.(ok);
      return ok;
    }

    const { saveAs } = await import("file-saver");
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `${MODULE_SLUG}_report_${dateStamp}.csv`;
    saveAs(blob, fileName);
    const ok: BlogExportResult = { success: true, message: "CSV exported successfully", fileName };
    onExportComplete?.(ok);
    return ok;
  } catch (error) {
    const fail: BlogExportResult = {
      success: false,
      message: error instanceof Error ? error.message : "Export failed",
    };
    onExportComplete?.(fail);
    return fail;
  }
}

interface GenericReportExporterProps {
  data: Record<string, unknown>[];
  onExportComplete?: (result: BlogExportResult) => void;
}

const GenericReportExporter: React.FC<GenericReportExporterProps> = ({ data, onExportComplete }) => {
  const [isExporting, setIsExporting] = useState(false);

  const run = async (format: "pdf" | "excel" | "csv") => {
    setIsExporting(true);
    try {
      await exportBlogReport(format, data, onExportComplete);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={isExporting || data.length === 0}>
            {isExporting ? "Exporting..." : <Upload className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="[&>*]:cursor-pointer">
          <DropdownMenuItem onClick={() => void run("pdf")}>
            <FileUp className="mr-2 h-4 w-4" /> PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void run("excel")}>
            <Sheet className="mr-2 h-4 w-4" /> Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void run("csv")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GenericReportExporter;
