"use client";

import React, { useState, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import MinuteChart from "./minute-chart";

const formatDateToString = (input: Date | string | number): string => {
  try {
    let d: Date;

    if (input instanceof Date) {
      d = input;
    } else if (typeof input === "number") {
      const excelEpoch = new Date(1899, 11, 30);
      d = new Date(excelEpoch.getTime() + input * 86400000);
    } else if (typeof input === "string") {
      const str = input.trim();

      // Handle DD-MM-YYYY HH:mm[:ss] format
      const match = str.match(
        /(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/,
      );

      if (match) {
        const [, dd, mm, yyyy, hh = "0", min = "0", sec = "0"] = match;
        d = new Date(
          Number(yyyy),
          Number(mm) - 1,
          Number(dd),
          Number(hh),
          Number(min),
          Number(sec),
        );
      } else {
        d = new Date(str);
      }
    } else {
      throw new Error("Invalid date type");
    }

    if (isNaN(d.getTime())) {
      throw new Error("Invalid date");
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  } catch (err) {
    console.error("Error formatting date:", input, err);
    return "01-01-1970 00:00:00";
  }
};

const CSVChartUploader = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate pagination
  const totalPages = Math.ceil(chartData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = chartData.slice(startIndex, endIndex);

  // Analyze data for the cards
  const analysisData = useMemo(() => {
    if (chartData.length < 2) return null;

    const intervals = [];

    for (let i = 1; i < chartData.length; i++) {
      const prev = chartData[i - 1];
      const current = chartData[i];

      if (prev.OI !== undefined && current.OI !== undefined) {
        const oiChange = current.OI - prev.OI;
        const priceChange = current.Close - prev.Close;

        if (oiChange > 0 && priceChange < 0) {
          intervals.push({
            type: "oi_increase_price_decrease",
            from: prev.Date,
            to: current.Date,
            oiChange,
            priceChange,
            prevPrice: prev.Close,
            currentPrice: current.Close,
            prevOI: prev.OI,
            currentOI: current.OI,
          });
        } else if (oiChange < 0 && priceChange > 0) {
          intervals.push({
            type: "oi_decrease_price_increase",
            from: prev.Date,
            to: current.Date,
            oiChange,
            priceChange,
            prevPrice: prev.Close,
            currentPrice: current.Close,
            prevOI: prev.OI,
            currentOI: current.OI,
          });
        } else if (prev.OI > 0 && Math.abs(oiChange / prev.OI) < 0.01) {
          intervals.push({
            type: "oi_no_change",
            from: prev.Date,
            to: current.Date,
            oiChange,
            priceChange,
            prevPrice: prev.Close,
            currentPrice: current.Close,
            prevOI: prev.OI,
            currentOI: current.OI,
          });
        }
      }

      if (prev.Volume !== undefined) {
        const volume = prev.Volume;
        const avgVolume =
          chartData.reduce((sum, d) => sum + (d.Volume || 0), 0) /
          chartData.length;
        if (volume > avgVolume * 2) {
          intervals.push({
            type: "high_volume",
            from: prev.Date,
            to: current.Date,
            volume,
            avgVolume,
            price: prev.Close,
          });
        }
      }
    }

    const grouped = {
      oiIncreasePriceDecrease: intervals.filter(
        (i) => i.type === "oi_increase_price_decrease",
      ),
      oiDecreasePriceIncrease: intervals.filter(
        (i) => i.type === "oi_decrease_price_increase",
      ),
      oiNoChange: intervals.filter((i) => i.type === "oi_no_change"),
      highVolume: intervals.filter((i) => i.type === "high_volume"),
    };

    const findSignificantPeriod = (items: any[], metric: string) => {
      if (items.length === 0) return null;

      if (metric === "magnitude") {
        return items.reduce((max, item) =>
          Math.abs(item.oiChange || item.volume) >
          Math.abs(max.oiChange || max.volume)
            ? item
            : max,
        );
      } else {
        return items[0];
      }
    };

    return {
      oiIncreasePriceDecrease: findSignificantPeriod(
        grouped.oiIncreasePriceDecrease,
        "magnitude",
      ),
      oiDecreasePriceIncrease: findSignificantPeriod(
        grouped.oiDecreasePriceIncrease,
        "magnitude",
      ),
      oiNoChange: findSignificantPeriod(grouped.oiNoChange, "magnitude"),
      highVolume: findSignificantPeriod(grouped.highVolume, "magnitude"),
    };
  }, [chartData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setLoading(true);
    setCurrentPage(1);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error("Failed to read file");
        }

        let workbook;

        if (
          file.name.toLowerCase().endsWith(".csv") ||
          file.type.includes("csv")
        ) {
          const csvText =
            typeof data === "string"
              ? data
              : new TextDecoder().decode(data as ArrayBuffer);
          workbook = XLSX.read(csvText, {
            type: "string",
            raw: true,
            codepage: 65001,
            cellDates: true,
            dateNF: "dd-mm-yyyy hh:mm",
          });
        } else {
          workbook = XLSX.read(data, {
            type: "binary",
            cellDates: true,
            dateNF: "dd-mm-yyyy hh:mm",
          });
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          raw: false,
          dateNF: "dd-mm-yyyy hh:mm",
          defval: "",
        });

        if (!jsonData.length) {
          throw new Error("No data found in file");
        }

        const firstRow = jsonData[0] as any;
        const headers = Object.keys(firstRow);

        const findColumnName = (patterns: string[]): string | null => {
          const lowerHeaders = headers.map((h) =>
            h.toString().toLowerCase().trim(),
          );
          for (const pattern of patterns) {
            const index = lowerHeaders.indexOf(pattern.toLowerCase());
            if (index !== -1) return headers[index];
          }

          for (const header of headers) {
            const lowerHeader = header.toLowerCase();
            for (const pattern of patterns) {
              if (lowerHeader.includes(pattern.toLowerCase())) {
                return header;
              }
            }
          }

          return null;
        };

        const dateCol = findColumnName([
          "date",
          "time",
          "timestamp",
          "datetime",
        ]);
        const openCol = findColumnName(["open", "opening"]);
        const highCol = findColumnName(["high", "highest"]);
        const lowCol = findColumnName(["low", "lowest"]);
        const closeCol = findColumnName(["close", "closing", "last"]);
        const volumeCol = findColumnName(["volume", "vol", "qty"]);
        const oiCol = findColumnName([
          "oi",
          "open interest",
          "openinterest",
          "open_int",
        ]);

        if (!dateCol || !openCol || !highCol || !lowCol || !closeCol) {
          throw new Error(
            `Required columns not found. Found: ${headers.join(", ")}. Need: Date, Open, High, Low, Close`,
          );
        }

        const processedData = jsonData
          .map((row: any, index: number) => {
            try {
              const dateValue = row[dateCol];
              if (
                dateValue === null ||
                dateValue === undefined ||
                dateValue === ""
              ) {
                console.warn(`Row ${index + 2}: Missing date value`);
                return null;
              }

              let formattedDate: string;
              try {
                formattedDate = formatDateToString(dateValue);
              } catch (dateError) {
                formattedDate = `01-01-${new Date().getFullYear()} 00:00:00`;
              }

              const parseNumeric = (value: any, colName: string): number => {
                if (value === null || value === undefined || value === "") {
                  return 0;
                }

                const strValue = String(value).trim();
                if (!strValue) return 0;

                const cleaned = strValue.replace(/[^\d.-]/g, "");
                const num = parseFloat(cleaned);

                if (isNaN(num)) {
                  return 0;
                }
                return num;
              };

              const result = {
                Date: formattedDate,
                Open: parseNumeric(row[openCol], "Open"),
                High: parseNumeric(row[highCol], "High"),
                Low: parseNumeric(row[lowCol], "Low"),
                Close: parseNumeric(row[closeCol], "Close"),
                Volume: volumeCol
                  ? parseNumeric(row[volumeCol], "Volume")
                  : undefined,
                OI: oiCol ? parseNumeric(row[oiCol], "OI") : undefined,
              };

              if (
                result.Open === 0 &&
                result.High === 0 &&
                result.Low === 0 &&
                result.Close === 0
              ) {
                return null;
              }

              return result;
            } catch (rowError) {
              console.error(`Error processing row ${index + 2}:`, rowError);
              return null;
            }
          })
          .filter(Boolean);

        if (processedData.length === 0) {
          throw new Error("No valid data rows found after processing");
        }

        processedData.sort((a: any, b: any) => {
          const parseDate = (str: string) => {
            const [datePart, timePart] = str.split(" ");
            const [day, month, year] = datePart.split("-").map(Number);
            const [hour = 0, minute = 0, second = 0] = (timePart || "")
              .split(":")
              .map(Number);
            return new Date(
              year,
              month - 1,
              day,
              hour,
              minute,
              second,
            ).getTime();
          };
          return parseDate(a.Date) - parseDate(b.Date);
        });

        setChartData(processedData as any[]);
      } catch (error) {
        console.error("Error processing file:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Error processing file. Please check the file format and try again.",
        );
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
      setLoading(false);
    };

    if (file.name.toLowerCase().endsWith(".csv")) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearData = () => {
    setChartData([]);
    setFileName("");
    setError(null);
    setCurrentPage(1);
  };

  const formatTimeRange = (from: string, to: string) => {
    const getTime = (dateStr: string) => {
      return dateStr.split(" ")[1] || "";
    };
    return `${getTime(from)} to ${getTime(to)}`;
  };

  return (
    <div className="p-4">
      {/* Upload Controls - Always visible */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          {chartData.length > 0 && (
            <button
              onClick={triggerFileInput}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span>📁</span>
                  Upload File
                </>
              )}
            </button>
          )}
          {chartData.length > 0 && (
            <button
              onClick={clearData}
              disabled={loading}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
            >
              Clear Data
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xls,.xlsx"
            className="hidden"
            disabled={loading}
          />
        </div>

        {fileName && (
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">{fileName}</span>
            {chartData.length > 0 && (
              <span className="ml-2">• {chartData.length} records loaded</span>
            )}
          </div>
        )}

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {!error && chartData.length === 0 && fileName && !loading && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            No valid data found or file is empty
          </div>
        )}
      </div>

      {/* Initial Upload Card - Only show when no data is loaded */}
      {!chartData.length && !loading && !fileName && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white mb-6">
          <div className="max-w-md mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500 mb-2">
              Upload a CSV or Excel file to view the chart
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Expected format: Date (DD-MM-YYYY HH:mm), Open, High, Low, Close
              columns
            </p>
            <button
              onClick={triggerFileInput}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Select File
            </button>
          </div>
        </div>
      )}

      {/* Chart - Only show when data is loaded */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <MinuteChart data={chartData} />
        </div>
      )}

      {/* Analysis Cards - Only show when data is loaded */}
      {chartData.length > 0 && analysisData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Market Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="font-medium text-red-800">OI ↑ Price ↓</h4>
              </div>
              {analysisData.oiIncreasePriceDecrease ? (
                <div>
                  <p className="text-red-700 text-sm">
                    {formatTimeRange(
                      analysisData.oiIncreasePriceDecrease.from,
                      analysisData.oiIncreasePriceDecrease.to,
                    )}
                  </p>
                  <div className="mt-2 text-xs text-red-600 space-y-1">
                    <p>
                      Price:{" "}
                      {analysisData.oiIncreasePriceDecrease.prevPrice.toFixed(
                        2,
                      )}{" "}
                      →{" "}
                      {analysisData.oiIncreasePriceDecrease.currentPrice.toFixed(
                        2,
                      )}
                    </p>
                    <p>
                      OI:{" "}
                      {analysisData.oiIncreasePriceDecrease.prevOI.toLocaleString()}{" "}
                      →{" "}
                      {analysisData.oiIncreasePriceDecrease.currentOI.toLocaleString()}
                    </p>
                    <p>
                      Change: OI +
                      {analysisData.oiIncreasePriceDecrease.oiChange.toLocaleString()}
                      , Price{" "}
                      {analysisData.oiIncreasePriceDecrease.priceChange.toFixed(
                        2,
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-red-600 text-sm">
                  No significant period found
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-medium text-green-800">OI ↓ Price ↑</h4>
              </div>
              {analysisData.oiDecreasePriceIncrease ? (
                <div>
                  <p className="text-green-700 text-sm">
                    {formatTimeRange(
                      analysisData.oiDecreasePriceIncrease.from,
                      analysisData.oiDecreasePriceIncrease.to,
                    )}
                  </p>
                  <div className="mt-2 text-xs text-green-600 space-y-1">
                    <p>
                      Price:{" "}
                      {analysisData.oiDecreasePriceIncrease.prevPrice.toFixed(
                        2,
                      )}{" "}
                      →{" "}
                      {analysisData.oiDecreasePriceIncrease.currentPrice.toFixed(
                        2,
                      )}
                    </p>
                    <p>
                      OI:{" "}
                      {analysisData.oiDecreasePriceIncrease.prevOI.toLocaleString()}{" "}
                      →{" "}
                      {analysisData.oiDecreasePriceIncrease.currentOI.toLocaleString()}
                    </p>
                    <p>
                      Change: OI{" "}
                      {analysisData.oiDecreasePriceIncrease.oiChange.toLocaleString()}
                      , Price +
                      {analysisData.oiDecreasePriceIncrease.priceChange.toFixed(
                        2,
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-green-600 text-sm">
                  No significant period found
                </p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h4 className="font-medium text-yellow-800">OI No Change</h4>
              </div>
              {analysisData.oiNoChange ? (
                <div>
                  <p className="text-yellow-700 text-sm">
                    {formatTimeRange(
                      analysisData.oiNoChange.from,
                      analysisData.oiNoChange.to,
                    )}
                  </p>
                  <div className="mt-2 text-xs text-yellow-600 space-y-1">
                    <p>
                      Price: {analysisData.oiNoChange.prevPrice.toFixed(2)} →{" "}
                      {analysisData.oiNoChange.currentPrice.toFixed(2)}
                    </p>
                    <p>
                      OI Change:{" "}
                      {analysisData.oiNoChange.oiChange.toLocaleString()}
                    </p>
                    <p>
                      Price Change:{" "}
                      {analysisData.oiNoChange.priceChange.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-yellow-600 text-sm">
                  No significant period found
                </p>
              )}
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h4 className="font-medium text-purple-800">High Volume</h4>
              </div>
              {analysisData.highVolume ? (
                <div>
                  <p className="text-purple-700 text-sm">
                    {formatTimeRange(
                      analysisData.highVolume.from,
                      analysisData.highVolume.to,
                    )}
                  </p>
                  <div className="mt-2 text-xs text-purple-600 space-y-1">
                    <p>
                      Volume: {analysisData.highVolume.volume.toLocaleString()}
                    </p>
                    <p>
                      Avg Volume:{" "}
                      {Math.round(
                        analysisData.highVolume.avgVolume,
                      ).toLocaleString()}
                    </p>
                    <p>Price: {analysisData.highVolume.price.toFixed(2)}</p>
                    <p>
                      {(
                        analysisData.highVolume.volume /
                        analysisData.highVolume.avgVolume
                      ).toFixed(1)}
                      x average
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-purple-600 text-sm">
                  No significant period found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Data Table with Pagination - Only show when data is loaded */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-700">Full Data Table</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Show:</label>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-600">rows</span>
              </div>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, chartData.length)} of {chartData.length}{" "}
                entries
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 sticky left-0 bg-gray-100">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Open
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    High
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Low
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Close
                  </th>
                  {chartData.some((d) => d.Volume !== undefined) && (
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      Volume
                    </th>
                  )}
                  {chartData.some((d) => d.OI !== undefined) && (
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      OI
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentData.map((row, index) => (
                  <tr
                    key={startIndex + index}
                    className="hover:bg-gray-50 group"
                  >
                    <td className="px-4 py-3 text-gray-700 font-medium sticky left-0 bg-white group-hover:bg-gray-50 whitespace-nowrap">
                      {row.Date}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.Open.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.High.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.Low.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      {row.Close.toFixed(2)}
                    </td>
                    {row.Volume !== undefined && (
                      <td className="px-4 py-3 text-gray-700">
                        {row.Volume.toLocaleString()}
                      </td>
                    )}
                    {row.OI !== undefined && (
                      <td className="px-4 py-3 text-gray-700">
                        {row.OI.toLocaleString()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white border-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVChartUploader;
