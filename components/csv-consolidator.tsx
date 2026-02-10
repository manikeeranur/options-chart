"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  FileDown,
  Layers,
  PieChart,
  BarChart,
  LineChart,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  RefreshCw,
  Zap,
  Target,
} from "lucide-react";
import * as XLSX from "xlsx";

// Type definitions
interface CandleData {
  date: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  oi: number;
  bodySize: number;
  candleType: "Bullish" | "Bearish" | "Doji";
  fileName: string;
  minuteNumber: number;
  candleSize: number;
  returnPercent: number;
  vwap?: number;
  timestamp: string;
}

interface FileAnalysis {
  id: string;
  name: string;
  data: CandleData[];
  summary: {
    totalVolume: number;
    totalOI: number;
    avgBodySize: number;
    avgVolume: number;
    avgOI: number;
    maxVolume: number;
    maxOI: number;
    bullishCandles: number;
    bearishCandles: number;
    dojiCandles: number;
    totalCandles: number;
    avgCandleSize: number;
    volatility: number;
    volumeToOIRatio: number;
    avgReturn: number;
    maxReturn: number;
    minReturn: number;
  };
}

interface ConsolidatedSummary {
  totalFiles: number;
  totalCandles: number;
  totalVolume: number;
  totalOI: number;
  avgBodySize: number;
  avgVolume: number;
  avgOI: number;
  maxVolume: number;
  maxOI: number;
  bullishCandles: number;
  bearishCandles: number;
  dojiCandles: number;
  avgCandleSize: number;
  volatility: number;
  volumeToOIRatio: number;
  bullishPercentage: string;
  bearishPercentage: string;
  dojiPercentage: string;
  avgReturn: number;
  maxReturn: number;
  minReturn: number;
}

const CSVConsolidator = () => {
  // State management
  const [files, setFiles] = useState<FileAnalysis[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<CandleData[]>([]);
  const [consolidatedSummary, setConsolidatedSummary] =
    useState<ConsolidatedSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "upload" | "files" | "consolidated" | "analysis"
  >("upload");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV content
  const parseCSVContent = useCallback(
    (text: string, fileName: string): CandleData[] => {
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length === 0) return [];

      // Parse headers - handle different delimiter possibilities
      const firstLine = lines[0];
      let delimiter = ",";
      if (firstLine.includes("\t")) delimiter = "\t";
      if (firstLine.includes(";")) delimiter = ";";

      const headers = firstLine
        .split(delimiter)
        .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

      const candleData: CandleData[] = [];
      let cumulativeVolume = 0;
      let cumulativeValue = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line
          .split(delimiter)
          .map((v) => v.trim().replace(/"/g, ""));
        const row: any = {};

        headers.forEach((header, index) => {
          if (values[index] !== undefined) {
            row[header] = values[index];
          }
        });

        // Parse date and time
        let dateStr = "";
        let timeStr = "09:15"; // Default time

        // Try different date formats
        if (row.date) {
          const dateValue = row.date;
          // Check if date contains time
          if (dateValue.includes(" ") || dateValue.includes("T")) {
            const dateTimeParts = dateValue.split(/[\sT]/);
            dateStr = dateTimeParts[0];
            if (dateTimeParts[1]) {
              timeStr = dateTimeParts[1].substring(0, 5); // Take HH:mm
            }
          } else {
            dateStr = dateValue;
            timeStr = row.time || "09:15";
          }
        }

        // Parse numeric values with error handling
        const open = parseFloat(row.open) || parseFloat(row.o) || 0;
        const high = parseFloat(row.high) || parseFloat(row.h) || 0;
        const low = parseFloat(row.low) || parseFloat(row.l) || 0;
        const close = parseFloat(row.close) || parseFloat(row.c) || 0;
        const volume = parseFloat(row.volume) || parseFloat(row.vol) || 0;
        const oi =
          parseFloat(row.oi) ||
          parseFloat(row["open interest"]) ||
          parseFloat(row.openinterest) ||
          parseFloat(row["open_int"]) ||
          0;

        if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
          const bodySize = Math.abs(close - open);
          const candleType: "Bullish" | "Bearish" | "Doji" =
            close > open ? "Bullish" : close < open ? "Bearish" : "Doji";

          const candleSize = high - low;

          // Calculate VWAP (Volume Weighted Average Price)
          cumulativeVolume += volume;
          cumulativeValue += ((open + high + low + close) / 4) * volume;
          const vwap =
            cumulativeVolume > 0 ? cumulativeValue / cumulativeVolume : close;

          // Calculate return percentage
          const prevClose =
            i > 1
              ? parseFloat(
                  lines[i - 1].split(delimiter)[headers.indexOf("close")] ||
                    close,
                )
              : close;
          const returnPercent = ((close - prevClose) / prevClose) * 100;

          candleData.push({
            date: dateStr,
            time: timeStr,
            open,
            high,
            low,
            close,
            volume,
            oi,
            bodySize,
            candleType,
            fileName: fileName.replace(".csv", ""),
            minuteNumber: i,
            candleSize,
            returnPercent,
            vwap,
            timestamp: `${dateStr} ${timeStr}`,
          });
        }
      }

      return candleData;
    },
    [],
  );

  // Calculate file summary
  const calculateFileSummary = useCallback((data: CandleData[]) => {
    if (data.length === 0) return null;

    const totalVolume = data.reduce((sum, candle) => sum + candle.volume, 0);
    const totalOI = data.reduce((sum, candle) => sum + candle.oi, 0);
    const avgBodySize =
      data.reduce((sum, candle) => sum + candle.bodySize, 0) / data.length;
    const avgVolume = totalVolume / data.length;
    const avgOI = totalOI / data.length;
    const maxVolume = Math.max(...data.map((c) => c.volume));
    const maxOI = Math.max(...data.map((c) => c.oi));

    const bullishCandles = data.filter(
      (c) => c.candleType === "Bullish",
    ).length;
    const bearishCandles = data.filter(
      (c) => c.candleType === "Bearish",
    ).length;
    const dojiCandles = data.filter((c) => c.candleType === "Doji").length;

    const avgCandleSize =
      data.reduce((sum, candle) => sum + candle.candleSize, 0) / data.length;

    const returns = data.map((candle, index) => {
      if (index === 0) return 0;
      return (candle.close - data[index - 1].close) / data[index - 1].close;
    });
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
        returns.length,
    );

    const maxReturn = Math.max(...returns.map((r) => r * 100));
    const minReturn = Math.min(...returns.map((r) => r * 100));

    const volumeToOIRatio = avgVolume / (avgOI || 1);

    return {
      totalVolume,
      totalOI,
      avgBodySize,
      avgVolume,
      avgOI,
      maxVolume,
      maxOI,
      bullishCandles,
      bearishCandles,
      dojiCandles,
      totalCandles: data.length,
      avgCandleSize,
      volatility,
      volumeToOIRatio,
      avgReturn: avgReturn * 100,
      maxReturn,
      minReturn,
    };
  }, []);

  // Calculate consolidated data - MOVED THIS BEFORE handleFileUpload
  const calculateConsolidatedData = useCallback((allFiles: FileAnalysis[]) => {
    if (allFiles.length === 0) {
      setConsolidatedData([]);
      setConsolidatedSummary(null);
      return;
    }

    // Combine all candle data
    const allCandles: CandleData[] = [];
    allFiles.forEach((file) => {
      allCandles.push(...file.data);
    });

    setConsolidatedData(allCandles);

    // Calculate consolidated summary
    const totalVolume = allCandles.reduce(
      (sum, candle) => sum + candle.volume,
      0,
    );
    const totalOI = allCandles.reduce((sum, candle) => sum + candle.oi, 0);
    const avgBodySize =
      allCandles.reduce((sum, candle) => sum + candle.bodySize, 0) /
      allCandles.length;
    const avgVolume = totalVolume / allCandles.length;
    const avgOI = totalOI / allCandles.length;
    const maxVolume = Math.max(...allCandles.map((c) => c.volume));
    const maxOI = Math.max(...allCandles.map((c) => c.oi));

    const bullishCandles = allCandles.filter(
      (c) => c.candleType === "Bullish",
    ).length;
    const bearishCandles = allCandles.filter(
      (c) => c.candleType === "Bearish",
    ).length;
    const dojiCandles = allCandles.filter(
      (c) => c.candleType === "Doji",
    ).length;

    const avgCandleSize =
      allCandles.reduce((sum, candle) => sum + candle.candleSize, 0) /
      allCandles.length;

    const returns = allCandles.map((candle, index) => {
      if (index === 0) return 0;
      return (
        (candle.close - allCandles[index - 1].close) /
        allCandles[index - 1].close
      );
    });
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
        returns.length,
    );

    const maxReturn = Math.max(...returns.map((r) => r * 100));
    const minReturn = Math.min(...returns.map((r) => r * 100));

    const volumeToOIRatio = avgVolume / (avgOI || 1);

    setConsolidatedSummary({
      totalFiles: allFiles.length,
      totalCandles: allCandles.length,
      totalVolume,
      totalOI,
      avgBodySize,
      avgVolume,
      avgOI,
      maxVolume,
      maxOI,
      bullishCandles,
      bearishCandles,
      dojiCandles,
      avgCandleSize,
      volatility,
      volumeToOIRatio,
      bullishPercentage: ((bullishCandles / allCandles.length) * 100).toFixed(
        1,
      ),
      bearishPercentage: ((bearishCandles / allCandles.length) * 100).toFixed(
        1,
      ),
      dojiPercentage: ((dojiCandles / allCandles.length) * 100).toFixed(1),
      avgReturn: avgReturn * 100,
      maxReturn,
      minReturn,
    });
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (fileList: File[]) => {
      setIsProcessing(true);
      const newFiles: FileAnalysis[] = [];

      for (const file of fileList) {
        try {
          const text = await file.text();
          const candleData = parseCSVContent(text, file.name);

          if (candleData.length > 0) {
            const summary = calculateFileSummary(candleData);

            if (summary) {
              newFiles.push({
                id: `${file.name}-${Date.now()}`,
                name: file.name.replace(".csv", ""),
                data: candleData,
                summary,
              });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }

      // Update state
      setFiles((prev) => [...prev, ...newFiles]);
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newFiles.forEach((file) => newSet.add(file.id));
        return newSet;
      });

      // Switch to files tab
      setActiveTab("files");
      setIsProcessing(false);

      // Show success notification
      if (newFiles.length > 0) {
        setTimeout(() => {
          calculateConsolidatedData([...files, ...newFiles]);
        }, 100);
      }
    },
    [files, parseCSVContent, calculateFileSummary, calculateConsolidatedData],
  );

  // Drag and drop handlers
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const fileArray = Array.from(e.dataTransfer.files).filter(
          (file) =>
            file.type === "text/csv" ||
            file.name.toLowerCase().endsWith(".csv"),
        );
        if (fileArray.length > 0) {
          handleFileUpload(fileArray);
        }
      }
    },
    [handleFileUpload],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const fileArray = Array.from(e.target.files);
        handleFileUpload(fileArray);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [handleFileUpload],
  );

  // File management
  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const newFiles = prev.filter((file) => file.id !== id);
        calculateConsolidatedData(newFiles);
        return newFiles;
      });
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
    [calculateConsolidatedData],
  );

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setConsolidatedData([]);
    setConsolidatedSummary(null);
    setSelectedFiles(new Set());
    setActiveTab("upload");
  }, []);

  const toggleFileSelection = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAllFiles = useCallback(() => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map((f) => f.id)));
    }
  }, [files, selectedFiles.size]);

  // Filter data
  const filteredConsolidatedData = consolidatedData.filter((candle) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      candle.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candle.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candle.candleType.toLowerCase().includes(searchTerm.toLowerCase());

    // Type filter
    const matchesType =
      filterType === "all" || candle.candleType === filterType;

    return matchesSearch && matchesType;
  });

  const selectedFileData = files.filter((file) => selectedFiles.has(file.id));

  // Export functions
  const exportConsolidatedCSV = useCallback(() => {
    if (filteredConsolidatedData.length === 0) return;

    setExportProgress(0);

    // Prepare headers
    const headers = [
      "File Name",
      "Date",
      "Time",
      "Minute",
      "Open",
      "High",
      "Low",
      "Close",
      "Volume",
      "OI",
      "Body Size",
      "Candle Type",
      "Candle Size",
      "Return %",
      "VWAP",
      "Timestamp",
    ];

    // Prepare rows
    const rows = [headers.join(",")];

    filteredConsolidatedData.forEach((candle, index) => {
      const row = [
        candle.fileName,
        candle.date,
        candle.time,
        candle.minuteNumber,
        candle.open.toFixed(2),
        candle.high.toFixed(2),
        candle.low.toFixed(2),
        candle.close.toFixed(2),
        candle.volume,
        candle.oi,
        candle.bodySize.toFixed(2),
        candle.candleType,
        candle.candleSize.toFixed(2),
        candle.returnPercent.toFixed(2),
        candle.vwap?.toFixed(2) || "",
        candle.timestamp,
      ].join(",");

      rows.push(row);

      // Update progress
      setExportProgress(
        Math.round(((index + 1) / filteredConsolidatedData.length) * 100),
      );
    });

    // Create and download CSV
    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `consolidated-candle-data-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset progress
    setTimeout(() => setExportProgress(0), 1000);
  }, [filteredConsolidatedData]);

  const exportConsolidatedExcel = useCallback(() => {
    if (filteredConsolidatedData.length === 0) return;

    setExportProgress(0);

    // Prepare data for Excel
    const excelData = filteredConsolidatedData.map((candle, index) => ({
      "File Name": candle.fileName,
      Date: candle.date,
      Time: candle.time,
      Minute: candle.minuteNumber,
      Open: candle.open,
      High: candle.high,
      Low: candle.low,
      Close: candle.close,
      Volume: candle.volume,
      OI: candle.oi,
      "Body Size": candle.bodySize,
      "Candle Type": candle.candleType,
      "Candle Size": candle.candleSize,
      "Return %": candle.returnPercent,
      VWAP: candle.vwap,
      Timestamp: candle.timestamp,
    }));

    // Add summary sheet
    const summaryData = consolidatedSummary
      ? [
          ["Consolidated Summary"],
          ["Total Files", consolidatedSummary.totalFiles],
          ["Total Candles", consolidatedSummary.totalCandles],
          ["Total Volume", consolidatedSummary.totalVolume],
          ["Total OI", consolidatedSummary.totalOI],
          ["Average Body Size", consolidatedSummary.avgBodySize.toFixed(2)],
          ["Average Volume", consolidatedSummary.avgVolume.toFixed(0)],
          ["Average OI", consolidatedSummary.avgOI.toFixed(0)],
          [
            "Bullish Candles",
            `${consolidatedSummary.bullishCandles} (${consolidatedSummary.bullishPercentage}%)`,
          ],
          [
            "Bearish Candles",
            `${consolidatedSummary.bearishCandles} (${consolidatedSummary.bearishPercentage}%)`,
          ],
          [
            "Doji Candles",
            `${consolidatedSummary.dojiCandles} (${consolidatedSummary.dojiPercentage}%)`,
          ],
          ["Average Return %", consolidatedSummary.avgReturn.toFixed(2)],
          ["Volatility", consolidatedSummary.volatility.toFixed(4)],
        ]
      : [];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add data sheet
    const wsData = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, wsData, "Candle Data");

    // Add summary sheet
    if (summaryData.length > 0) {
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }

    // Add individual file summaries
    const fileSummaries = selectedFileData.map((file) => [
      file.name,
      file.summary.totalCandles,
      file.summary.totalVolume,
      file.summary.totalOI,
      file.summary.avgBodySize.toFixed(2),
      file.summary.avgReturn.toFixed(2),
      `${file.summary.bullishCandles} / ${file.summary.bearishCandles}`,
      file.summary.volatility.toFixed(4),
    ]);

    const fileSummaryData = [
      [
        "File Name",
        "Candles",
        "Total Volume",
        "Total OI",
        "Avg Body Size",
        "Avg Return %",
        "Bullish/Bearish",
        "Volatility",
      ],
      ...fileSummaries,
    ];

    const wsFileSummary = XLSX.utils.aoa_to_sheet(fileSummaryData);
    XLSX.utils.book_append_sheet(wb, wsFileSummary, "File Summaries");

    // Generate and download Excel file
    XLSX.writeFile(
      wb,
      `consolidated-analysis-${new Date().toISOString().split("T")[0]}.xlsx`,
    );

    setExportProgress(100);
    setTimeout(() => setExportProgress(0), 1000);
  }, [filteredConsolidatedData, consolidatedSummary, selectedFileData]);

  const exportSelectedFiles = useCallback(() => {
    if (selectedFileData.length === 0) return;

    // Combine data from selected files
    const selectedCandles: CandleData[] = [];
    selectedFileData.forEach((file) => {
      selectedCandles.push(...file.data);
    });

    // Prepare CSV
    const headers = [
      "File Name",
      "Date",
      "Time",
      "Minute",
      "Open",
      "High",
      "Low",
      "Close",
      "Volume",
      "OI",
      "Candle Type",
    ];
    const rows = [headers.join(",")];

    selectedCandles.forEach((candle) => {
      const row = [
        candle.fileName,
        candle.date,
        candle.time,
        candle.minuteNumber,
        candle.open.toFixed(2),
        candle.high.toFixed(2),
        candle.low.toFixed(2),
        candle.close.toFixed(2),
        candle.volume,
        candle.oi,
        candle.candleType,
      ].join(",");
      rows.push(row);
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `selected-files-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedFileData]);

  // Auto-calculate when files change
  useEffect(() => {
    if (files.length > 0) {
      calculateConsolidatedData(files);
    }
  }, [files, calculateConsolidatedData]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                CSV Candle Data Consolidator
              </h1>
              <p className="text-gray-600 mt-2">
                Upload multiple CSV files, analyze candle patterns, and export
                consolidated data
              </p>
            </div>

            <div className="flex items-center gap-3">
              {files.length > 0 && (
                <button
                  onClick={clearAllFiles}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}

              {consolidatedData.length > 0 && (
                <button
                  onClick={() => setActiveTab("consolidated")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "upload"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>

            {files.length > 0 && (
              <>
                <button
                  onClick={() => setActiveTab("files")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "files"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Files ({files.length})
                </button>

                <button
                  onClick={() => setActiveTab("consolidated")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "consolidated"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Consolidated Data
                </button>

                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "analysis"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analysis
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main>
          {/* Upload Section */}
          {activeTab === "upload" && (
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Upload CSV Files
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload multiple CSV files with OHLCV data. Each file will be
                    analyzed and consolidated into a single dataset.
                  </p>
                </div>

                {/* Drag & Drop Area */}
                <div
                  className={`relative border-3 border-dashed rounded-2xl p-10 text-center transition-all mb-8 ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isProcessing}
                  />

                  {isProcessing ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Processing Files...
                      </p>
                      <p className="text-gray-600">
                        Please wait while we analyze your data
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-xl font-semibold text-gray-900 mb-3">
                        Drag & drop CSV files here
                      </p>
                      <p className="text-gray-600 mb-6">
                        or click to browse files
                      </p>
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">
                          Supports multiple CSV files
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* File Requirements */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    File Format Requirements
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          CSV format with headers
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          Required columns: Date, Open, High, Low, Close
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          Optional columns: Volume, OI
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          Date format: DD-MM-YYYY or YYYY-MM-DD
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          Time can be in separate column or with date
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">
                          Supports comma, tab, or semicolon delimiters
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sample Data Preview */}
                {files.length === 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Sample Data Format:
                    </h4>
                    <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm">
                        {`Date,Open,High,Low,Close,Volume,OI
04-02-2026 09:15,283.4,283.4,207.15,232.7,1021670,1439815
04-02-2026 09:16,232.8,245.6,230.1,240.3,845620,1456320
04-02-2026 09:17,240.4,250.2,238.9,248.7,923450,1489120`}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Files Section */}
          {activeTab === "files" && files.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Uploaded Files
                  </h2>
                  <p className="text-gray-600">
                    {files.length} files • {consolidatedData.length} total
                    candles
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAllFiles}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {selectedFiles.size === files.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>

                  {selectedFiles.size > 0 && (
                    <button
                      onClick={exportSelectedFiles}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Selected ({selectedFiles.size})
                    </button>
                  )}
                </div>
              </div>

              {/* File List */}
              <div className="space-y-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`border rounded-xl p-5 transition-all ${
                      selectedFiles.has(file.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleFileSelection(file.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center ${
                              selectedFiles.has(file.id)
                                ? "bg-blue-600 border-blue-600"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {selectedFiles.has(file.id) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>

                          <div
                            className={`p-3 rounded-lg ${
                              selectedFiles.has(file.id)
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <FileText
                              className={`w-6 h-6 ${
                                selectedFiles.has(file.id)
                                  ? "text-blue-600"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {file.name}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {file.data.length} candles
                            </span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              {file.summary.bullishCandles} bullish
                            </span>
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                              {file.summary.bearishCandles} bearish
                            </span>
                          </div>

                          {/* File Statistics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">
                                Total Volume
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatNumber(file.summary.totalVolume)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Total OI
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatNumber(file.summary.totalOI)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Avg Body Size
                              </div>
                              <div className="font-semibold text-gray-900">
                                {file.summary.avgBodySize.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Avg Return
                              </div>
                              <div
                                className={`font-semibold ${
                                  file.summary.avgReturn >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {file.summary.avgReturn.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consolidated Data Section */}
          {activeTab === "consolidated" && consolidatedData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Consolidated Data
                  </h2>
                  <p className="text-gray-600">
                    {filteredConsolidatedData.length} of{" "}
                    {consolidatedData.length} candles
                    {filterType !== "all" && ` • Filtered by: ${filterType}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={exportConsolidatedCSV}
                      disabled={exportProgress > 0}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        exportProgress > 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {exportProgress > 0 ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {exportProgress}%
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4" />
                          Export CSV
                        </>
                      )}
                    </button>

                    <button
                      onClick={exportConsolidatedExcel}
                      disabled={exportProgress > 0}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        exportProgress > 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      Export Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by file name, date, or type..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Candle Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["all", "Bullish", "Bearish", "Doji"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                              filterType === type
                                ? type === "Bullish"
                                  ? "bg-green-600 text-white"
                                  : type === "Bearish"
                                    ? "bg-red-600 text-white"
                                    : type === "Doji"
                                      ? "bg-gray-600 text-white"
                                      : "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {type === "all" ? "All Types" : type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Minute
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OHLC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredConsolidatedData
                      .slice(0, 50)
                      .map((candle, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {candle.fileName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{candle.date}</div>
                            <div className="text-gray-400">{candle.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {candle.minuteNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-16 h-8 rounded flex flex-col items-center justify-center ${
                                  candle.candleType === "Bullish"
                                    ? "bg-green-50"
                                    : candle.candleType === "Bearish"
                                      ? "bg-red-50"
                                      : "bg-gray-50"
                                }`}
                              >
                                <div className="text-xs font-semibold">
                                  {candle.open.toFixed(1)} →{" "}
                                  {candle.close.toFixed(1)}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  H:{candle.high.toFixed(1)} L:
                                  {candle.low.toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(candle.volume)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(candle.oi)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                candle.candleType === "Bullish"
                                  ? "bg-green-100 text-green-800"
                                  : candle.candleType === "Bearish"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {candle.candleType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-semibold ${
                                candle.returnPercent >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {candle.returnPercent >= 0 ? "+" : ""}
                              {candle.returnPercent.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {filteredConsolidatedData.length > 50 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="text-center text-sm text-gray-500">
                      Showing 50 of {filteredConsolidatedData.length} candles
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Section */}
          {activeTab === "analysis" && consolidatedSummary && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Files
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {consolidatedSummary.totalFiles}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Total uploaded files
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Candles
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {consolidatedSummary.totalCandles}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Total analyzed candles
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Bullish %
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {consolidatedSummary.bullishPercentage}%
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {consolidatedSummary.bullishCandles} bullish candles
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      Bearish %
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {consolidatedSummary.bearishPercentage}%
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {consolidatedSummary.bearishCandles} bearish candles
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Volume & OI Analysis */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Volume & Open Interest Analysis
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {formatNumber(consolidatedSummary.totalVolume)}
                      </div>
                      <div className="text-sm text-blue-600 font-medium mt-1">
                        Total Volume
                      </div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {formatNumber(consolidatedSummary.totalOI)}
                      </div>
                      <div className="text-sm text-purple-600 font-medium mt-1">
                        Total OI
                      </div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {consolidatedSummary.volumeToOIRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Volume/OI Ratio
                      </div>
                    </div>

                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-700">
                        {formatNumber(consolidatedSummary.maxVolume)}
                      </div>
                      <div className="text-sm text-red-600 font-medium mt-1">
                        Max Volume
                      </div>
                    </div>

                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">
                        {formatNumber(consolidatedSummary.maxOI)}
                      </div>
                      <div className="text-sm text-yellow-600 font-medium mt-1">
                        Max OI
                      </div>
                    </div>

                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-700">
                        {consolidatedSummary.volatility.toFixed(4)}
                      </div>
                      <div className="text-sm text-indigo-600 font-medium mt-1">
                        Volatility
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candle Statistics */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Candle Statistics
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Average Body Size</span>
                        <span className="font-medium">
                          {consolidatedSummary.avgBodySize.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${Math.min(consolidatedSummary.avgBodySize * 10, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Average Candle Size</span>
                        <span className="font-medium">
                          {consolidatedSummary.avgCandleSize.toFixed(2)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${Math.min(consolidatedSummary.avgCandleSize * 5, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Average Return</span>
                        <span
                          className={`font-medium ${
                            consolidatedSummary.avgReturn >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {consolidatedSummary.avgReturn >= 0 ? "+" : ""}
                          {consolidatedSummary.avgReturn.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            consolidatedSummary.avgReturn >= 0
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(Math.abs(consolidatedSummary.avgReturn) * 10, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Max/Min Return</span>
                        <span className="font-medium">
                          {consolidatedSummary.maxReturn.toFixed(2)}% /{" "}
                          {consolidatedSummary.minReturn.toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                          style={{
                            width: "100%",
                            backgroundSize: "200% 100%",
                            backgroundPosition: `${(consolidatedSummary.minReturn + 10) * 5}% 0`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candle Type Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Candle Type Distribution
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-100 mb-4">
                      <div className="text-3xl font-bold text-green-700">
                        {consolidatedSummary.bullishPercentage}%
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      Bullish Candles
                    </div>
                    <div className="text-gray-600">
                      {consolidatedSummary.bullishCandles} candles
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-red-100 mb-4">
                      <div className="text-3xl font-bold text-red-700">
                        {consolidatedSummary.bearishPercentage}%
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      Bearish Candles
                    </div>
                    <div className="text-gray-600">
                      {consolidatedSummary.bearishCandles} candles
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-4">
                      <div className="text-3xl font-bold text-gray-700">
                        {consolidatedSummary.dojiPercentage}%
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      Doji Candles
                    </div>
                    <div className="text-gray-600">
                      {consolidatedSummary.dojiCandles} candles
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer Status */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Bullish: {consolidatedSummary?.bullishCandles || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Bearish: {consolidatedSummary?.bearishCandles || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Doji: {consolidatedSummary?.dojiCandles || 0}</span>
              </div>
            </div>

            <div>
              Total Data: {consolidatedData.length} candles from {files.length}{" "}
              files
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CSVConsolidator;
