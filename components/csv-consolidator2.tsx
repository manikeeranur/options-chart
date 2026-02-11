// "use client";

// import React, { useState, useCallback, useEffect, useRef } from "react";
// import {
//   Upload,
//   FileText,
//   BarChart3,
//   TrendingUp,
//   Download,
//   FileDown,
//   Layers,
//   PieChart,
//   BarChart,
//   LineChart,
//   X,
//   Check,
//   AlertCircle,
//   ChevronRight,
//   ChevronLeft,
//   Filter,
//   Search,
//   RefreshCw,
//   Zap,
//   Target,
//   Clock,
//   GitCompare,
// } from "lucide-react";
// import * as XLSX from "xlsx";

// // Type definitions
// interface CandleData {
//   date: string;
//   time: string;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume: number;
//   oi: number;
//   bodySize: number;
//   candleType: "Bullish" | "Bearish" | "Doji";
//   fileName: string;
//   minuteNumber: number;
//   candleSize: number;
//   returnPercent: number;
//   vwap?: number;
//   timestamp: string;
//   optionType?: "CE" | "PE";
//   strikePrice?: number;
//   expiry?: string;
// }

// interface FileAnalysis {
//   id: string;
//   name: string;
//   data: CandleData[];
//   first5MinData: CandleData[];
//   summary: {
//     totalVolume: number;
//     totalOI: number;
//     avgBodySize: number;
//     avgVolume: number;
//     avgOI: number;
//     maxVolume: number;
//     maxOI: number;
//     bullishCandles: number;
//     bearishCandles: number;
//     dojiCandles: number;
//     totalCandles: number;
//     avgCandleSize: number;
//     volatility: number;
//     volumeToOIRatio: number;
//     avgReturn: number;
//     maxReturn: number;
//     minReturn: number;
//   };
//   first5MinSummary: {
//     totalVolume: number;
//     totalOI: number;
//     avgBodySize: number;
//     avgVolume: number;
//     avgOI: number;
//     bullishCandles: number;
//     bearishCandles: number;
//     dojiCandles: number;
//     totalCandles: number;
//     avgCandleSize: number;
//     avgReturn: number;
//   };
// }

// interface ConsolidatedSummary {
//   totalFiles: number;
//   totalCandles: number;
//   totalVolume: number;
//   totalOI: number;
//   avgBodySize: number;
//   avgVolume: number;
//   avgOI: number;
//   maxVolume: number;
//   maxOI: number;
//   bullishCandles: number;
//   bearishCandles: number;
//   dojiCandles: number;
//   avgCandleSize: number;
//   volatility: number;
//   volumeToOIRatio: number;
//   bullishPercentage: string;
//   bearishPercentage: string;
//   dojiPercentage: string;
//   avgReturn: number;
//   maxReturn: number;
//   minReturn: number;
// }

// interface CE_PE_Comparison {
//   date: string;
//   ceData: {
//     fileName: string;
//     totalVolume: number;
//     totalOI: number;
//     bullishCandles: number;
//     bearishCandles: number;
//     avgReturn: number;
//   };
//   peData: {
//     fileName: string;
//     totalVolume: number;
//     totalOI: number;
//     bullishCandles: number;
//     bearishCandles: number;
//     avgReturn: number;
//   };
//   comparison: {
//     volumeDifference: number;
//     oiDifference: number;
//     sentimentDifference: number;
//     returnDifference: number;
//   };
// }

// const CSVConsolidator2 = () => {
//   // State management
//   const [files, setFiles] = useState<FileAnalysis[]>([]);
//   const [consolidatedData, setConsolidatedData] = useState<CandleData[]>([]);
//   const [first5MinConsolidatedData, setFirst5MinConsolidatedData] = useState<
//     CandleData[]
//   >([]);
//   const [consolidatedSummary, setConsolidatedSummary] =
//     useState<ConsolidatedSummary | null>(null);
//   const [first5MinConsolidatedSummary, setFirst5MinConsolidatedSummary] =
//     useState<ConsolidatedSummary | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [activeTab, setActiveTab] = useState<
//     "upload" | "files" | "consolidated" | "analysis" | "first5min" | "cepe"
//   >("upload");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState<string>("all");
//   const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
//   const [exportProgress, setExportProgress] = useState<number>(0);
//   const [showFilters, setShowFilters] = useState(false);
//   const [cePeComparisons, setCePeComparisons] = useState<CE_PE_Comparison[]>(
//     [],
//   );
//   const [dragActive, setDragActive] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Parse CSV content with option type detection
//   // Parse CSV content with option type detection
//   const parseCSVContent = useCallback(
//     (text: string, fileName: string): CandleData[] => {
//       const lines = text.split("\n").filter((line) => line.trim());
//       if (lines.length === 0) return [];

//       const firstLine = lines[0];
//       let delimiter = ",";
//       if (firstLine.includes("\t")) delimiter = "\t";
//       if (firstLine.includes(";")) delimiter = ";";

//       const headers = firstLine
//         .split(delimiter)
//         .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

//       const candleData: CandleData[] = [];
//       let cumulativeVolume = 0;
//       let cumulativeValue = 0;

//       let optionType: "CE" | "PE" | undefined;
//       const fileNameUpper = fileName.toUpperCase();
//       if (fileNameUpper.includes("CE") && !fileNameUpper.includes("PEACE")) {
//         optionType = "CE";
//       } else if (fileNameUpper.includes("PE")) {
//         optionType = "PE";
//       }

//       let strikePrice: number | undefined;
//       const strikeMatch = fileName.match(/(\d+)/);
//       if (strikeMatch) {
//         strikePrice = parseInt(strikeMatch[1]);
//       }

//       // Find column indices
//       const openIndex = headers.findIndex((h) => h === "open" || h === "o");
//       const highIndex = headers.findIndex((h) => h === "high" || h === "h");
//       const lowIndex = headers.findIndex((h) => h === "low" || h === "l");
//       const closeIndex = headers.findIndex((h) => h === "close" || h === "c");
//       const volumeIndex = headers.findIndex(
//         (h) => h === "volume" || h === "vol",
//       );
//       const oiIndex = headers.findIndex(
//         (h) =>
//           h === "oi" ||
//           h === "open interest" ||
//           h === "openinterest" ||
//           h === "open_int",
//       );
//       const dateIndex = headers.findIndex(
//         (h) => h === "date" || h === "datetime",
//       );
//       const timeIndex = headers.findIndex((h) => h === "time");

//       // Store previous close for return calculation
//       let prevClose: number | null = null;

//       for (let i = 1; i < lines.length; i++) {
//         const line = lines[i].trim();
//         if (!line) continue;

//         const values = line
//           .split(delimiter)
//           .map((v) => v.trim().replace(/"/g, ""));

//         // Helper function to safely parse values
//         const getValue = (index: number, defaultValue: any = 0) => {
//           return index >= 0 && values[index] !== undefined
//             ? values[index]
//             : defaultValue;
//         };

//         let dateStr = "";
//         let timeStr = "09:15";

//         // Parse date and time
//         if (dateIndex >= 0) {
//           const dateValue = getValue(dateIndex, "");
//           if (dateValue) {
//             if (dateValue.includes(" ") || dateValue.includes("T")) {
//               const dateTimeParts = dateValue.split(/[\sT]/);
//               dateStr = dateTimeParts[0];
//               if (dateTimeParts[1]) {
//                 timeStr = dateTimeParts[1].substring(0, 5);
//               }
//             } else {
//               dateStr = dateValue;
//               if (timeIndex >= 0) {
//                 const timeValue = getValue(timeIndex, "09:15");
//                 timeStr = timeValue.substring(0, 5);
//               }
//             }
//           }
//         }

//         const open = parseFloat(getValue(openIndex, 0));
//         const high = parseFloat(getValue(highIndex, 0));
//         const low = parseFloat(getValue(lowIndex, 0));
//         const close = parseFloat(getValue(closeIndex, 0));
//         const volume = parseFloat(getValue(volumeIndex, 0));
//         const oi = parseFloat(getValue(oiIndex, 0));

//         if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
//           const bodySize = Math.abs(close - open);
//           const candleType: "Bullish" | "Bearish" | "Doji" =
//             close > open ? "Bullish" : close < open ? "Bearish" : "Doji";

//           const candleSize = high - low;

//           // Calculate VWAP
//           cumulativeVolume += volume;
//           cumulativeValue += ((open + high + low + close) / 4) * volume;
//           const vwap =
//             cumulativeVolume > 0 ? cumulativeValue / cumulativeVolume : close;

//           // Calculate return percentage using previous close
//           let returnPercent = 0;
//           if (prevClose !== null && prevClose !== 0) {
//             returnPercent = ((close - prevClose) / prevClose) * 100;
//           }
//           prevClose = close;

//           candleData.push({
//             date: dateStr,
//             time: timeStr,
//             open,
//             high,
//             low,
//             close,
//             volume,
//             oi,
//             bodySize,
//             candleType,
//             fileName: fileName.replace(".csv", ""),
//             minuteNumber: i,
//             candleSize,
//             returnPercent,
//             vwap,
//             timestamp: `${dateStr} ${timeStr}`,
//             optionType,
//             strikePrice,
//           });
//         }
//       }

//       return candleData;
//     },
//     [],
//   );

//   const extractFirst5MinutesData = useCallback(
//     (data: CandleData[]): CandleData[] => {
//       return data.filter((candle) => {
//         const time = candle.time;
//         return time >= "09:15" && time <= "09:20";
//       });
//     },
//     [],
//   );

//   const calculateFileSummary = useCallback((data: CandleData[]) => {
//     if (data.length === 0) return null;

//     const totalVolume = data.reduce((sum, candle) => sum + candle.volume, 0);
//     const totalOI = data.reduce((sum, candle) => sum + candle.oi, 0);
//     const avgBodySize =
//       data.reduce((sum, candle) => sum + candle.bodySize, 0) / data.length;
//     const avgVolume = totalVolume / data.length;
//     const avgOI = totalOI / data.length;
//     const maxVolume = Math.max(...data.map((c) => c.volume));
//     const maxOI = Math.max(...data.map((c) => c.oi));

//     const bullishCandles = data.filter(
//       (c) => c.candleType === "Bullish",
//     ).length;
//     const bearishCandles = data.filter(
//       (c) => c.candleType === "Bearish",
//     ).length;
//     const dojiCandles = data.filter((c) => c.candleType === "Doji").length;

//     const avgCandleSize =
//       data.reduce((sum, candle) => sum + candle.candleSize, 0) / data.length;

//     const returns = data.map((candle, index) => {
//       if (index === 0) return 0;
//       return (candle.close - data[index - 1].close) / data[index - 1].close;
//     });
//     const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
//     const volatility = Math.sqrt(
//       returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
//         returns.length,
//     );

//     const maxReturn = Math.max(...returns.map((r) => r * 100));
//     const minReturn = Math.min(...returns.map((r) => r * 100));

//     const volumeToOIRatio = avgVolume / (avgOI || 1);

//     return {
//       totalVolume,
//       totalOI,
//       avgBodySize,
//       avgVolume,
//       avgOI,
//       maxVolume,
//       maxOI,
//       bullishCandles,
//       bearishCandles,
//       dojiCandles,
//       totalCandles: data.length,
//       avgCandleSize,
//       volatility,
//       volumeToOIRatio,
//       avgReturn: avgReturn * 100,
//       maxReturn,
//       minReturn,
//     };
//   }, []);

//   const calculateFirst5MinSummary = useCallback((data: CandleData[]) => {
//     if (data.length === 0) return null;

//     const totalVolume = data.reduce((sum, candle) => sum + candle.volume, 0);
//     const totalOI = data.reduce((sum, candle) => sum + candle.oi, 0);
//     const avgBodySize =
//       data.reduce((sum, candle) => sum + candle.bodySize, 0) / data.length;
//     const avgVolume = totalVolume / data.length;
//     const avgOI = totalOI / data.length;

//     const bullishCandles = data.filter(
//       (c) => c.candleType === "Bullish",
//     ).length;
//     const bearishCandles = data.filter(
//       (c) => c.candleType === "Bearish",
//     ).length;
//     const dojiCandles = data.filter((c) => c.candleType === "Doji").length;

//     const avgCandleSize =
//       data.reduce((sum, candle) => sum + candle.candleSize, 0) / data.length;

//     const returns = data.map((candle, index) => {
//       if (index === 0) return 0;
//       return (candle.close - data[index - 1].close) / data[index - 1].close;
//     });
//     const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

//     return {
//       totalVolume,
//       totalOI,
//       avgBodySize,
//       avgVolume,
//       avgOI,
//       bullishCandles,
//       bearishCandles,
//       dojiCandles,
//       totalCandles: data.length,
//       avgCandleSize,
//       avgReturn: avgReturn * 100,
//     };
//   }, []);

//   const calculateCEPEComparisons = useCallback(
//     (allFiles: FileAnalysis[]) => {
//       const comparisons: CE_PE_Comparison[] = [];

//       const fileGroups: { [key: string]: FileAnalysis[] } = {};

//       allFiles.forEach((file) => {
//         if (file.data.length > 0) {
//           const date = file.data[0].date;
//           const key = date;

//           if (!fileGroups[key]) {
//             fileGroups[key] = [];
//           }
//           fileGroups[key].push(file);
//         }
//       });

//       Object.entries(fileGroups).forEach(([date, dateFiles]) => {
//         const ceFile = dateFiles.find((f) => f.data[0]?.optionType === "CE");
//         const peFile = dateFiles.find((f) => f.data[0]?.optionType === "PE");

//         if (ceFile && peFile) {
//           const ceFirst5Min = ceFile.first5MinData;
//           const peFirst5Min = peFile.first5MinData;

//           const ceSummary = calculateFirst5MinSummary(ceFirst5Min);
//           const peSummary = calculateFirst5MinSummary(peFirst5Min);

//           if (ceSummary && peSummary) {
//             comparisons.push({
//               date,
//               ceData: {
//                 fileName: ceFile.name,
//                 totalVolume: ceSummary.totalVolume,
//                 totalOI: ceSummary.totalOI,
//                 bullishCandles: ceSummary.bullishCandles,
//                 bearishCandles: ceSummary.bearishCandles,
//                 avgReturn: ceSummary.avgReturn,
//               },
//               peData: {
//                 fileName: peFile.name,
//                 totalVolume: peSummary.totalVolume,
//                 totalOI: peSummary.totalOI,
//                 bullishCandles: peSummary.bullishCandles,
//                 bearishCandles: peSummary.bearishCandles,
//                 avgReturn: peSummary.avgReturn,
//               },
//               comparison: {
//                 volumeDifference: ceSummary.totalVolume - peSummary.totalVolume,
//                 oiDifference: ceSummary.totalOI - peSummary.totalOI,
//                 sentimentDifference:
//                   ceSummary.bullishCandles -
//                   ceSummary.bearishCandles -
//                   (peSummary.bullishCandles - peSummary.bearishCandles),
//                 returnDifference: ceSummary.avgReturn - peSummary.avgReturn,
//               },
//             });
//           }
//         }
//       });

//       setCePeComparisons(comparisons);
//     },
//     [calculateFirst5MinSummary],
//   );

//   const calculateConsolidatedData = useCallback(
//     (allFiles: FileAnalysis[]) => {
//       if (allFiles.length === 0) {
//         setConsolidatedData([]);
//         setConsolidatedSummary(null);
//         setFirst5MinConsolidatedData([]);
//         setFirst5MinConsolidatedSummary(null);
//         return;
//       }

//       const allCandles: CandleData[] = [];
//       const allFirst5MinCandles: CandleData[] = [];

//       allFiles.forEach((file) => {
//         allCandles.push(...file.data);
//         allFirst5MinCandles.push(...file.first5MinData);
//       });

//       setConsolidatedData(allCandles);
//       setFirst5MinConsolidatedData(allFirst5MinCandles);

//       const totalVolume = allCandles.reduce(
//         (sum, candle) => sum + candle.volume,
//         0,
//       );
//       const totalOI = allCandles.reduce((sum, candle) => sum + candle.oi, 0);
//       const avgBodySize =
//         allCandles.reduce((sum, candle) => sum + candle.bodySize, 0) /
//         allCandles.length;
//       const avgVolume = totalVolume / allCandles.length;
//       const avgOI = totalOI / allCandles.length;
//       const maxVolume = Math.max(...allCandles.map((c) => c.volume));
//       const maxOI = Math.max(...allCandles.map((c) => c.oi));

//       const bullishCandles = allCandles.filter(
//         (c) => c.candleType === "Bullish",
//       ).length;
//       const bearishCandles = allCandles.filter(
//         (c) => c.candleType === "Bearish",
//       ).length;
//       const dojiCandles = allCandles.filter(
//         (c) => c.candleType === "Doji",
//       ).length;

//       const avgCandleSize =
//         allCandles.reduce((sum, candle) => sum + candle.candleSize, 0) /
//         allCandles.length;

//       const returns = allCandles.map((candle, index) => {
//         if (index === 0) return 0;
//         return (
//           (candle.close - allCandles[index - 1].close) /
//           allCandles[index - 1].close
//         );
//       });
//       const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
//       const volatility = Math.sqrt(
//         returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
//           returns.length,
//       );

//       const maxReturn = Math.max(...returns.map((r) => r * 100));
//       const minReturn = Math.min(...returns.map((r) => r * 100));

//       const volumeToOIRatio = avgVolume / (avgOI || 1);

//       setConsolidatedSummary({
//         totalFiles: allFiles.length,
//         totalCandles: allCandles.length,
//         totalVolume,
//         totalOI,
//         avgBodySize,
//         avgVolume,
//         avgOI,
//         maxVolume,
//         maxOI,
//         bullishCandles,
//         bearishCandles,
//         dojiCandles,
//         avgCandleSize,
//         volatility,
//         volumeToOIRatio,
//         bullishPercentage: ((bullishCandles / allCandles.length) * 100).toFixed(
//           1,
//         ),
//         bearishPercentage: ((bearishCandles / allCandles.length) * 100).toFixed(
//           1,
//         ),
//         dojiPercentage: ((dojiCandles / allCandles.length) * 100).toFixed(1),
//         avgReturn: avgReturn * 100,
//         maxReturn,
//         minReturn,
//       });

//       if (allFirst5MinCandles.length > 0) {
//         const first5MinTotalVolume = allFirst5MinCandles.reduce(
//           (sum, candle) => sum + candle.volume,
//           0,
//         );
//         const first5MinTotalOI = allFirst5MinCandles.reduce(
//           (sum, candle) => sum + candle.oi,
//           0,
//         );
//         const first5MinAvgBodySize =
//           allFirst5MinCandles.reduce(
//             (sum, candle) => sum + candle.bodySize,
//             0,
//           ) / allFirst5MinCandles.length;
//         const first5MinAvgVolume =
//           first5MinTotalVolume / allFirst5MinCandles.length;
//         const first5MinAvgOI = first5MinTotalOI / allFirst5MinCandles.length;

//         const first5MinBullishCandles = allFirst5MinCandles.filter(
//           (c) => c.candleType === "Bullish",
//         ).length;
//         const first5MinBearishCandles = allFirst5MinCandles.filter(
//           (c) => c.candleType === "Bearish",
//         ).length;
//         const first5MinDojiCandles = allFirst5MinCandles.filter(
//           (c) => c.candleType === "Doji",
//         ).length;

//         const first5MinAvgCandleSize =
//           allFirst5MinCandles.reduce(
//             (sum, candle) => sum + candle.candleSize,
//             0,
//           ) / allFirst5MinCandles.length;

//         const first5MinReturns = allFirst5MinCandles.map((candle, index) => {
//           if (index === 0) return 0;
//           return (
//             (candle.close - allFirst5MinCandles[index - 1].close) /
//             allFirst5MinCandles[index - 1].close
//           );
//         });
//         const first5MinAvgReturn =
//           first5MinReturns.reduce((a, b) => a + b, 0) / first5MinReturns.length;

//         setFirst5MinConsolidatedSummary({
//           totalFiles: allFiles.length,
//           totalCandles: allFirst5MinCandles.length,
//           totalVolume: first5MinTotalVolume,
//           totalOI: first5MinTotalOI,
//           avgBodySize: first5MinAvgBodySize,
//           avgVolume: first5MinAvgVolume,
//           avgOI: first5MinAvgOI,
//           maxVolume: Math.max(...allFirst5MinCandles.map((c) => c.volume)),
//           maxOI: Math.max(...allFirst5MinCandles.map((c) => c.oi)),
//           bullishCandles: first5MinBullishCandles,
//           bearishCandles: first5MinBearishCandles,
//           dojiCandles: first5MinDojiCandles,
//           avgCandleSize: first5MinAvgCandleSize,
//           volatility: Math.sqrt(
//             first5MinReturns.reduce(
//               (a, b) => a + Math.pow(b - first5MinAvgReturn, 2),
//               0,
//             ) / first5MinReturns.length,
//           ),
//           volumeToOIRatio: first5MinAvgVolume / (first5MinAvgOI || 1),
//           bullishPercentage: (
//             (first5MinBullishCandles / allFirst5MinCandles.length) *
//             100
//           ).toFixed(1),
//           bearishPercentage: (
//             (first5MinBearishCandles / allFirst5MinCandles.length) *
//             100
//           ).toFixed(1),
//           dojiPercentage: (
//             (first5MinDojiCandles / allFirst5MinCandles.length) *
//             100
//           ).toFixed(1),
//           avgReturn: first5MinAvgReturn * 100,
//           maxReturn: Math.max(...first5MinReturns.map((r) => r * 100)),
//           minReturn: Math.min(...first5MinReturns.map((r) => r * 100)),
//         });
//       }

//       calculateCEPEComparisons(allFiles);
//     },
//     [calculateCEPEComparisons],
//   );

//   const handleFileUpload = useCallback(
//     async (fileList: File[]) => {
//       setIsProcessing(true);
//       const newFiles: FileAnalysis[] = [];

//       for (const file of fileList) {
//         try {
//           const text = await file.text();
//           const candleData = parseCSVContent(text, file.name);
//           const first5MinData = extractFirst5MinutesData(candleData);

//           if (candleData.length > 0) {
//             const summary = calculateFileSummary(candleData);
//             const first5MinSummary = calculateFirst5MinSummary(first5MinData);

//             if (summary && first5MinSummary) {
//               newFiles.push({
//                 id: `${file.name}-${Date.now()}`,
//                 name: file.name.replace(".csv", ""),
//                 data: candleData,
//                 first5MinData: first5MinData,
//                 summary,
//                 first5MinSummary,
//               });
//             }
//           }
//         } catch (error) {
//           console.error(`Error processing file ${file.name}:`, error);
//         }
//       }

//       setFiles((prev) => [...prev, ...newFiles]);
//       setSelectedFiles((prev) => {
//         const newSet = new Set(prev);
//         newFiles.forEach((file) => newSet.add(file.id));
//         return newSet;
//       });

//       setActiveTab("files");
//       setIsProcessing(false);

//       if (newFiles.length > 0) {
//         setTimeout(() => {
//           calculateConsolidatedData([...files, ...newFiles]);
//         }, 100);
//       }
//     },
//     [
//       files,
//       parseCSVContent,
//       calculateFileSummary,
//       calculateFirst5MinSummary,
//       extractFirst5MinutesData,
//       calculateConsolidatedData,
//     ],
//   );

//   const handleDrag = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   }, []);

//   const handleDrop = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       setDragActive(false);

//       if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//         const fileArray = Array.from(e.dataTransfer.files).filter(
//           (file) =>
//             file.type === "text/csv" ||
//             file.name.toLowerCase().endsWith(".csv"),
//         );
//         if (fileArray.length > 0) {
//           handleFileUpload(fileArray);
//         }
//       }
//     },
//     [handleFileUpload],
//   );

//   const handleFileInput = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (e.target.files && e.target.files.length > 0) {
//         const fileArray = Array.from(e.target.files);
//         handleFileUpload(fileArray);
//         if (fileInputRef.current) {
//           fileInputRef.current.value = "";
//         }
//       }
//     },
//     [handleFileUpload],
//   );

//   const removeFile = useCallback(
//     (id: string) => {
//       setFiles((prev) => {
//         const newFiles = prev.filter((file) => file.id !== id);
//         calculateConsolidatedData(newFiles);
//         return newFiles;
//       });
//       setSelectedFiles((prev) => {
//         const newSet = new Set(prev);
//         newSet.delete(id);
//         return newSet;
//       });
//     },
//     [calculateConsolidatedData],
//   );

//   const clearAllFiles = useCallback(() => {
//     setFiles([]);
//     setConsolidatedData([]);
//     setConsolidatedSummary(null);
//     setFirst5MinConsolidatedData([]);
//     setFirst5MinConsolidatedSummary(null);
//     setSelectedFiles(new Set());
//     setActiveTab("upload");
//     setCePeComparisons([]);
//   }, []);

//   const toggleFileSelection = useCallback((id: string) => {
//     setSelectedFiles((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(id)) {
//         newSet.delete(id);
//       } else {
//         newSet.add(id);
//       }
//       return newSet;
//     });
//   }, []);

//   const selectAllFiles = useCallback(() => {
//     if (selectedFiles.size === files.length) {
//       setSelectedFiles(new Set());
//     } else {
//       setSelectedFiles(new Set(files.map((f) => f.id)));
//     }
//   }, [files, selectedFiles.size]);

//   const filteredConsolidatedData = consolidatedData.filter((candle) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       candle.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       candle.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       candle.candleType.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesType =
//       filterType === "all" || candle.candleType === filterType;

//     return matchesSearch && matchesType;
//   });

//   const filteredFirst5MinData = first5MinConsolidatedData.filter((candle) => {
//     const matchesSearch =
//       searchTerm === "" ||
//       candle.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       candle.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       candle.candleType.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesType =
//       filterType === "all" || candle.candleType === filterType;

//     return matchesSearch && matchesType;
//   });

//   const selectedFileData = files.filter((file) => selectedFiles.has(file.id));

//   const exportConsolidatedCSV = useCallback(() => {
//     if (filteredConsolidatedData.length === 0) return;

//     setExportProgress(0);

//     const headers = [
//       "File Name",
//       "Option Type",
//       "Strike Price",
//       "Date",
//       "Time",
//       "Minute",
//       "Open",
//       "High",
//       "Low",
//       "Close",
//       "Volume",
//       "OI",
//       "Body Size",
//       "Candle Type",
//       "Candle Size",
//       "Return %",
//       "VWAP",
//       "Timestamp",
//     ];

//     const rows = [headers.join(",")];

//     filteredConsolidatedData.forEach((candle, index) => {
//       const row = [
//         candle.fileName,
//         candle.optionType || "N/A",
//         candle.strikePrice || "N/A",
//         candle.date,
//         candle.time,
//         candle.minuteNumber,
//         candle.open.toFixed(2),
//         candle.high.toFixed(2),
//         candle.low.toFixed(2),
//         candle.close.toFixed(2),
//         candle.volume,
//         candle.oi,
//         candle.bodySize.toFixed(2),
//         candle.candleType,
//         candle.candleSize.toFixed(2),
//         candle.returnPercent.toFixed(2),
//         candle.vwap?.toFixed(2) || "",
//         candle.timestamp,
//       ].join(",");

//       rows.push(row);

//       setExportProgress(
//         Math.round(((index + 1) / filteredConsolidatedData.length) * 100),
//       );
//     });

//     const csvContent = rows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `consolidated-candle-data-${new Date().toISOString().split("T")[0]}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     setTimeout(() => setExportProgress(0), 1000);
//   }, [filteredConsolidatedData]);

//   const exportConsolidatedExcel = useCallback(() => {
//     if (filteredConsolidatedData.length === 0) return;

//     setExportProgress(0);

//     const excelData = filteredConsolidatedData.map((candle, index) => ({
//       "File Name": candle.fileName,
//       "Option Type": candle.optionType || "N/A",
//       "Strike Price": candle.strikePrice || "N/A",
//       Date: candle.date,
//       Time: candle.time,
//       Minute: candle.minuteNumber,
//       Open: candle.open,
//       High: candle.high,
//       Low: candle.low,
//       Close: candle.close,
//       Volume: candle.volume,
//       OI: candle.oi,
//       "Body Size": candle.bodySize,
//       "Candle Type": candle.candleType,
//       "Candle Size": candle.candleSize,
//       "Return %": candle.returnPercent,
//       VWAP: candle.vwap,
//       Timestamp: candle.timestamp,
//     }));

//     const summaryData = consolidatedSummary
//       ? [
//           ["Consolidated Summary"],
//           ["Total Files", consolidatedSummary.totalFiles],
//           ["Total Candles", consolidatedSummary.totalCandles],
//           ["Total Volume", consolidatedSummary.totalVolume],
//           ["Total OI", consolidatedSummary.totalOI],
//           ["Average Body Size", consolidatedSummary.avgBodySize.toFixed(2)],
//           ["Average Volume", consolidatedSummary.avgVolume.toFixed(0)],
//           ["Average OI", consolidatedSummary.avgOI.toFixed(0)],
//           [
//             "Bullish Candles",
//             `${consolidatedSummary.bullishCandles} (${consolidatedSummary.bullishPercentage}%)`,
//           ],
//           [
//             "Bearish Candles",
//             `${consolidatedSummary.bearishCandles} (${consolidatedSummary.bearishPercentage}%)`,
//           ],
//           [
//             "Doji Candles",
//             `${consolidatedSummary.dojiCandles} (${consolidatedSummary.dojiPercentage}%)`,
//           ],
//           ["Average Return %", consolidatedSummary.avgReturn.toFixed(2)],
//           ["Volatility", consolidatedSummary.volatility.toFixed(4)],
//         ]
//       : [];

//     const wb = XLSX.utils.book_new();

//     const wsData = XLSX.utils.json_to_sheet(excelData);
//     XLSX.utils.book_append_sheet(wb, wsData, "Candle Data");

//     if (summaryData.length > 0) {
//       const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
//       XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
//     }

//     const fileSummaries = selectedFileData.map((file) => [
//       file.name,
//       file.data[0]?.optionType || "N/A",
//       file.data[0]?.strikePrice || "N/A",
//       file.summary.totalCandles,
//       file.summary.totalVolume,
//       file.summary.totalOI,
//       file.summary.avgBodySize.toFixed(2),
//       file.summary.avgReturn.toFixed(2),
//       `${file.summary.bullishCandles} / ${file.summary.bearishCandles}`,
//       file.summary.volatility.toFixed(4),
//     ]);

//     const fileSummaryData = [
//       [
//         "File Name",
//         "Option Type",
//         "Strike Price",
//         "Candles",
//         "Total Volume",
//         "Total OI",
//         "Avg Body Size",
//         "Avg Return %",
//         "Bullish/Bearish",
//         "Volatility",
//       ],
//       ...fileSummaries,
//     ];

//     const wsFileSummary = XLSX.utils.aoa_to_sheet(fileSummaryData);
//     XLSX.utils.book_append_sheet(wb, wsFileSummary, "File Summaries");

//     XLSX.writeFile(
//       wb,
//       `consolidated-analysis-${new Date().toISOString().split("T")[0]}.xlsx`,
//     );

//     setExportProgress(100);
//     setTimeout(() => setExportProgress(0), 1000);
//   }, [filteredConsolidatedData, consolidatedSummary, selectedFileData]);

//   const exportSelectedFiles = useCallback(() => {
//     if (selectedFileData.length === 0) return;

//     const selectedCandles: CandleData[] = [];
//     selectedFileData.forEach((file) => {
//       selectedCandles.push(...file.data);
//     });

//     const headers = [
//       "File Name",
//       "Option Type",
//       "Strike Price",
//       "Date",
//       "Time",
//       "Minute",
//       "Open",
//       "High",
//       "Low",
//       "Close",
//       "Volume",
//       "OI",
//       "Candle Type",
//     ];
//     const rows = [headers.join(",")];

//     selectedCandles.forEach((candle) => {
//       const row = [
//         candle.fileName,
//         candle.optionType || "N/A",
//         candle.strikePrice || "N/A",
//         candle.date,
//         candle.time,
//         candle.minuteNumber,
//         candle.open.toFixed(2),
//         candle.high.toFixed(2),
//         candle.low.toFixed(2),
//         candle.close.toFixed(2),
//         candle.volume,
//         candle.oi,
//         candle.candleType,
//       ].join(",");
//       rows.push(row);
//     });

//     const csvContent = rows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `selected-files-${new Date().toISOString().split("T")[0]}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }, [selectedFileData]);

//   const exportFirst5MinCSV = useCallback(() => {
//     if (filteredFirst5MinData.length === 0) return;

//     const headers = [
//       "File Name",
//       "Option Type",
//       "Strike Price",
//       "Date",
//       "Time",
//       "Minute",
//       "Open",
//       "High",
//       "Low",
//       "Close",
//       "Volume",
//       "OI",
//       "Body Size",
//       "Candle Type",
//       "Candle Size",
//       "Return %",
//       "Timestamp",
//     ];

//     const rows = [headers.join(",")];

//     filteredFirst5MinData.forEach((candle, index) => {
//       const row = [
//         candle.fileName,
//         candle.optionType || "N/A",
//         candle.strikePrice || "N/A",
//         candle.date,
//         candle.time,
//         candle.minuteNumber,
//         candle.open.toFixed(2),
//         candle.high.toFixed(2),
//         candle.low.toFixed(2),
//         candle.close.toFixed(2),
//         candle.volume,
//         candle.oi,
//         candle.bodySize.toFixed(2),
//         candle.candleType,
//         candle.candleSize.toFixed(2),
//         candle.returnPercent.toFixed(2),
//         candle.timestamp,
//       ].join(",");

//       rows.push(row);
//     });

//     const csvContent = rows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `first5min-data-${new Date().toISOString().split("T")[0]}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }, [filteredFirst5MinData]);

//   const exportCEPEComparison = useCallback(() => {
//     if (cePeComparisons.length === 0) return;

//     const headers = [
//       "Date",
//       "CE File",
//       "CE Volume",
//       "CE OI",
//       "CE Bullish",
//       "CE Bearish",
//       "CE Avg Return %",
//       "PE File",
//       "PE Volume",
//       "PE OI",
//       "PE Bullish",
//       "PE Bearish",
//       "PE Avg Return %",
//       "Volume Diff (CE-PE)",
//       "OI Diff (CE-PE)",
//       "Sentiment Diff",
//       "Return Diff %",
//     ];

//     const rows = [headers.join(",")];

//     cePeComparisons.forEach((comparison) => {
//       const row = [
//         comparison.date,
//         comparison.ceData.fileName,
//         comparison.ceData.totalVolume,
//         comparison.ceData.totalOI,
//         comparison.ceData.bullishCandles,
//         comparison.ceData.bearishCandles,
//         comparison.ceData.avgReturn.toFixed(2),
//         comparison.peData.fileName,
//         comparison.peData.totalVolume,
//         comparison.peData.totalOI,
//         comparison.peData.bullishCandles,
//         comparison.peData.bearishCandles,
//         comparison.peData.avgReturn.toFixed(2),
//         comparison.comparison.volumeDifference,
//         comparison.comparison.oiDifference,
//         comparison.comparison.sentimentDifference,
//         comparison.comparison.returnDifference.toFixed(2),
//       ].join(",");

//       rows.push(row);
//     });

//     const csvContent = rows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `ce-pe-comparison-${new Date().toISOString().split("T")[0]}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }, [cePeComparisons]);

//   useEffect(() => {
//     if (files.length > 0) {
//       calculateConsolidatedData(files);
//     }
//   }, [files, calculateConsolidatedData]);

//   const formatNumber = (num: number) => {
//     return num.toLocaleString("en-IN", {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         <header className="mb-8">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 Options Data Analyzer
//               </h1>
//               <p className="text-gray-600 mt-2">
//                 Analyze first 5 minutes data and compare CE vs PE options
//               </p>
//             </div>

//             <div className="flex items-center gap-3">
//               {files.length > 0 && (
//                 <button
//                   onClick={clearAllFiles}
//                   className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
//                 >
//                   <X className="w-4 h-4" />
//                   Clear All
//                 </button>
//               )}

//               {consolidatedData.length > 0 && (
//                 <button
//                   onClick={() => setActiveTab("consolidated")}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                 >
//                   <Download className="w-4 h-4" />
//                   Export Data
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-2 mb-6">
//             <button
//               onClick={() => setActiveTab("upload")}
//               className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                 activeTab === "upload"
//                   ? "bg-blue-600 text-white"
//                   : "bg-white text-gray-700 hover:bg-gray-100"
//               }`}
//             >
//               <Upload className="w-4 h-4" />
//               Upload
//             </button>

//             {files.length > 0 && (
//               <>
//                 <button
//                   onClick={() => setActiveTab("files")}
//                   className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                     activeTab === "files"
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <FileText className="w-4 h-4" />
//                   Files ({files.length})
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("first5min")}
//                   className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                     activeTab === "first5min"
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <Clock className="w-4 h-4" />
//                   First 5 Min
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("cepe")}
//                   className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                     activeTab === "cepe"
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <GitCompare className="w-4 h-4" />
//                   CE vs PE
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("analysis")}
//                   className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                     activeTab === "analysis"
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <BarChart3 className="w-4 h-4" />
//                   Analysis
//                 </button>

//                 <button
//                   onClick={() => setActiveTab("consolidated")}
//                   className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                     activeTab === "consolidated"
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-700 hover:bg-gray-100"
//                   }`}
//                 >
//                   <Layers className="w-4 h-4" />
//                   Consolidated
//                 </button>
//               </>
//             )}
//           </div>
//         </header>

//         <main>
//           {activeTab === "upload" && (
//             <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
//               <div className="max-w-3xl mx-auto">
//                 <div className="text-center mb-8">
//                   <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
//                     <Upload className="w-10 h-10 text-blue-600" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-3">
//                     Upload CSV Files
//                   </h2>
//                   <p className="text-gray-600 mb-6">
//                     Upload multiple CSV files with OHLCV data. Each file will be
//                     analyzed and consolidated.
//                   </p>
//                 </div>

//                 <div
//                   className={`relative border-3 border-dashed rounded-2xl p-10 text-center transition-all mb-8 ${
//                     dragActive
//                       ? "border-blue-500 bg-blue-50"
//                       : "border-gray-300 hover:border-gray-400"
//                   } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                   onDragEnter={handleDrag}
//                   onDragLeave={handleDrag}
//                   onDragOver={handleDrag}
//                   onDrop={handleDrop}
//                   onClick={() => !isProcessing && fileInputRef.current?.click()}
//                 >
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     multiple
//                     accept=".csv"
//                     onChange={handleFileInput}
//                     className="hidden"
//                     disabled={isProcessing}
//                   />

//                   {isProcessing ? (
//                     <div className="flex flex-col items-center">
//                       <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
//                       <p className="text-lg font-medium text-gray-700 mb-2">
//                         Processing Files...
//                       </p>
//                       <p className="text-gray-600">
//                         Please wait while we analyze your data
//                       </p>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
//                         <Upload className="w-8 h-8 text-blue-600" />
//                       </div>
//                       <p className="text-xl font-semibold text-gray-900 mb-3">
//                         Drag & drop CSV files here
//                       </p>
//                       <p className="text-gray-600 mb-6">
//                         or click to browse files
//                       </p>
//                       <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-lg">
//                         <FileText className="w-5 h-5 text-gray-600" />
//                         <span className="font-medium text-gray-700">
//                           Supports multiple CSV files
//                         </span>
//                       </div>
//                     </>
//                   )}
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-6">
//                   <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                     <AlertCircle className="w-5 h-5 text-blue-600" />
//                     File Naming Convention for CE/PE Detection
//                   </h3>
//                   <div className="space-y-2">
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span className="text-gray-700">
//                         Include "CE" in filename for Call options
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span className="text-gray-700">
//                         Include "PE" in filename for Put options
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span className="text-gray-700">
//                         Include strike price in filename (e.g., 18000, 42000)
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <span className="text-gray-700">
//                         Examples: NIFTY_CE_18000.csv, BANKNIFTY_PE_42000.csv
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === "files" && files.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     Uploaded Files
//                   </h2>
//                   <p className="text-gray-600">
//                     {files.length} files • {consolidatedData.length} total
//                     candles • {first5MinConsolidatedData.length} first 5 min
//                     candles
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={selectAllFiles}
//                     className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                   >
//                     {selectedFiles.size === files.length
//                       ? "Deselect All"
//                       : "Select All"}
//                   </button>

//                   {selectedFiles.size > 0 && (
//                     <button
//                       onClick={exportSelectedFiles}
//                       className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                     >
//                       <Download className="w-4 h-4" />
//                       Export Selected ({selectedFiles.size})
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 {files.map((file) => (
//                   <div
//                     key={file.id}
//                     className={`border rounded-xl p-5 transition-all ${
//                       selectedFiles.has(file.id)
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-start gap-4 flex-1">
//                         <div className="flex items-center gap-3">
//                           <button
//                             onClick={() => toggleFileSelection(file.id)}
//                             className={`w-5 h-5 rounded border flex items-center justify-center ${
//                               selectedFiles.has(file.id)
//                                 ? "bg-blue-600 border-blue-600"
//                                 : "bg-white border-gray-300"
//                             }`}
//                           >
//                             {selectedFiles.has(file.id) && (
//                               <Check className="w-3 h-3 text-white" />
//                             )}
//                           </button>

//                           <div
//                             className={`p-3 rounded-lg ${
//                               selectedFiles.has(file.id)
//                                 ? "bg-blue-100"
//                                 : "bg-gray-100"
//                             }`}
//                           >
//                             <FileText
//                               className={`w-6 h-6 ${
//                                 selectedFiles.has(file.id)
//                                   ? "text-blue-600"
//                                   : "text-gray-600"
//                               }`}
//                             />
//                           </div>
//                         </div>

//                         <div className="flex-1">
//                           <div className="flex flex-wrap items-center gap-3 mb-3">
//                             <h3 className="text-lg font-semibold text-gray-900">
//                               {file.name}
//                             </h3>
//                             <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
//                               {file.data.length} candles
//                             </span>
//                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
//                               {file.first5MinData.length} first 5 min
//                             </span>
//                             {file.data[0]?.optionType && (
//                               <span
//                                 className={`px-3 py-1 rounded-full text-sm ${
//                                   file.data[0].optionType === "CE"
//                                     ? "bg-green-100 text-green-700"
//                                     : "bg-red-100 text-red-700"
//                                 }`}
//                               >
//                                 {file.data[0].optionType}
//                               </span>
//                             )}
//                           </div>

//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             <div>
//                               <div className="text-sm text-gray-600">
//                                 Total Volume
//                               </div>
//                               <div className="font-semibold text-gray-900">
//                                 {formatNumber(file.summary.totalVolume)}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-sm text-gray-600">
//                                 Total OI
//                               </div>
//                               <div className="font-semibold text-gray-900">
//                                 {formatNumber(file.summary.totalOI)}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-sm text-gray-600">
//                                 First 5 Min Volume
//                               </div>
//                               <div className="font-semibold text-gray-900">
//                                 {formatNumber(
//                                   file.first5MinSummary.totalVolume,
//                                 )}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-sm text-gray-600">
//                                 First 5 Min Return
//                               </div>
//                               <div
//                                 className={`font-semibold ${
//                                   file.first5MinSummary.avgReturn >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }`}
//                               >
//                                 {file.first5MinSummary.avgReturn.toFixed(2)}%
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <button
//                         onClick={() => removeFile(file.id)}
//                         className="p-2 text-gray-400 hover:text-red-500 transition-colors"
//                       >
//                         <X className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {activeTab === "first5min" && first5MinConsolidatedSummary && (
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     First 5 Minutes Data (9:15 - 9:20)
//                   </h2>
//                   <p className="text-gray-600">
//                     {filteredFirst5MinData.length} candles from {files.length}{" "}
//                     files
//                   </p>
//                 </div>

//                 <button
//                   onClick={exportFirst5MinCSV}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                 >
//                   <Download className="w-4 h-4" />
//                   Export First 5 Min Data
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-blue-50 rounded-xl p-4">
//                   <div className="text-sm text-blue-600 font-medium">
//                     Total Candles
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {first5MinConsolidatedSummary.totalCandles}
//                   </div>
//                 </div>
//                 <div className="bg-green-50 rounded-xl p-4">
//                   <div className="text-sm text-green-600 font-medium">
//                     Bullish %
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {first5MinConsolidatedSummary.bullishPercentage}%
//                   </div>
//                 </div>
//                 <div className="bg-red-50 rounded-xl p-4">
//                   <div className="text-sm text-red-600 font-medium">
//                     Bearish %
//                   </div>
//                   <div className="text-2xl font-bold text-gray-900">
//                     {first5MinConsolidatedSummary.bearishPercentage}%
//                   </div>
//                 </div>
//                 <div className="bg-purple-50 rounded-xl p-4">
//                   <div className="text-sm text-purple-600 font-medium">
//                     Avg Return
//                   </div>
//                   <div
//                     className={`text-2xl font-bold ${
//                       first5MinConsolidatedSummary.avgReturn >= 0
//                         ? "text-green-600"
//                         : "text-red-600"
//                     }`}
//                   >
//                     {first5MinConsolidatedSummary.avgReturn.toFixed(2)}%
//                   </div>
//                 </div>
//               </div>

//               <div className="overflow-x-auto rounded-lg border border-gray-200">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         File Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Type
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Time
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         OHLC
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Volume
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         OI
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Candle Type
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredFirst5MinData.slice(0, 30).map((candle, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {candle.fileName}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`px-2 py-1 rounded text-xs font-medium ${
//                               candle.optionType === "CE"
//                                 ? "bg-blue-100 text-blue-800"
//                                 : candle.optionType === "PE"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-gray-100 text-gray-800"
//                             }`}
//                           >
//                             {candle.optionType || "N/A"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {candle.time}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div
//                             className={`w-16 h-8 rounded flex flex-col items-center justify-center ${
//                               candle.candleType === "Bullish"
//                                 ? "bg-green-50"
//                                 : candle.candleType === "Bearish"
//                                   ? "bg-red-50"
//                                   : "bg-gray-50"
//                             }`}
//                           >
//                             <div className="text-xs font-semibold">
//                               {candle.open.toFixed(1)} →{" "}
//                               {candle.close.toFixed(1)}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {formatNumber(candle.volume)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                           {formatNumber(candle.oi)}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-medium ${
//                               candle.candleType === "Bullish"
//                                 ? "bg-green-100 text-green-800"
//                                 : candle.candleType === "Bearish"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-gray-100 text-gray-800"
//                             }`}
//                           >
//                             {candle.candleType}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {activeTab === "cepe" && cePeComparisons.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     CE vs PE Comparison (First 5 Minutes)
//                   </h2>
//                   <p className="text-gray-600">
//                     {cePeComparisons.length} date comparisons available
//                   </p>
//                 </div>

//                 <button
//                   onClick={exportCEPEComparison}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
//                 >
//                   <Download className="w-4 h-4" />
//                   Export CE-PE Comparison
//                 </button>
//               </div>

//               <div className="overflow-x-auto rounded-lg border border-gray-200">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         CE Data
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         PE Data
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Comparison
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {cePeComparisons.map((comparison, index) => (
//                       <tr key={index} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {comparison.date}
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-2">
//                             <div className="text-sm">
//                               <span className="font-medium">File:</span>{" "}
//                               {comparison.ceData.fileName}
//                             </div>
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                               <div>
//                                 Volume:{" "}
//                                 {formatNumber(comparison.ceData.totalVolume)}
//                               </div>
//                               <div>
//                                 OI: {formatNumber(comparison.ceData.totalOI)}
//                               </div>
//                               <div>
//                                 Bullish: {comparison.ceData.bullishCandles}
//                               </div>
//                               <div>
//                                 Bearish: {comparison.ceData.bearishCandles}
//                               </div>
//                               <div className="col-span-2">
//                                 Return:{" "}
//                                 <span
//                                   className={
//                                     comparison.ceData.avgReturn >= 0
//                                       ? "text-green-600"
//                                       : "text-red-600"
//                                   }
//                                 >
//                                   {comparison.ceData.avgReturn.toFixed(2)}%
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-2">
//                             <div className="text-sm">
//                               <span className="font-medium">File:</span>{" "}
//                               {comparison.peData.fileName}
//                             </div>
//                             <div className="grid grid-cols-2 gap-2 text-xs">
//                               <div>
//                                 Volume:{" "}
//                                 {formatNumber(comparison.peData.totalVolume)}
//                               </div>
//                               <div>
//                                 OI: {formatNumber(comparison.peData.totalOI)}
//                               </div>
//                               <div>
//                                 Bullish: {comparison.peData.bullishCandles}
//                               </div>
//                               <div>
//                                 Bearish: {comparison.peData.bearishCandles}
//                               </div>
//                               <div className="col-span-2">
//                                 Return:{" "}
//                                 <span
//                                   className={
//                                     comparison.peData.avgReturn >= 0
//                                       ? "text-green-600"
//                                       : "text-red-600"
//                                   }
//                                 >
//                                   {comparison.peData.avgReturn.toFixed(2)}%
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-2 text-xs">
//                             <div className="flex items-center gap-2">
//                               <span>Volume Diff:</span>
//                               <span
//                                 className={`font-medium ${
//                                   comparison.comparison.volumeDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }`}
//                               >
//                                 {comparison.comparison.volumeDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {formatNumber(
//                                   comparison.comparison.volumeDifference,
//                                 )}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span>OI Diff:</span>
//                               <span
//                                 className={`font-medium ${
//                                   comparison.comparison.oiDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }`}
//                               >
//                                 {comparison.comparison.oiDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {formatNumber(
//                                   comparison.comparison.oiDifference,
//                                 )}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span>Sentiment:</span>
//                               <span
//                                 className={`font-medium ${
//                                   comparison.comparison.sentimentDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }`}
//                               >
//                                 {comparison.comparison.sentimentDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {comparison.comparison.sentimentDifference}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <span>Return Diff:</span>
//                               <span
//                                 className={`font-medium ${
//                                   comparison.comparison.returnDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }`}
//                               >
//                                 {comparison.comparison.returnDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {comparison.comparison.returnDifference.toFixed(
//                                   2,
//                                 )}
//                                 %
//                               </span>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {activeTab === "consolidated" && consolidatedData.length > 0 && (
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">
//                     Consolidated Data
//                   </h2>
//                   <p className="text-gray-600">
//                     {filteredConsolidatedData.length} of{" "}
//                     {consolidatedData.length} candles
//                     {filterType !== "all" && ` • Filtered by: ${filterType}`}
//                   </p>
//                 </div>

//                 <div className="flex flex-wrap gap-3">
//                   <button
//                     onClick={() => setShowFilters(!showFilters)}
//                     className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
//                   >
//                     <Filter className="w-4 h-4" />
//                     {showFilters ? "Hide Filters" : "Show Filters"}
//                   </button>

//                   <div className="flex gap-3">
//                     <button
//                       onClick={exportConsolidatedCSV}
//                       disabled={exportProgress > 0}
//                       className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
//                         exportProgress > 0
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-green-600 hover:bg-green-700 text-white"
//                       }`}
//                     >
//                       {exportProgress > 0 ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                           {exportProgress}%
//                         </>
//                       ) : (
//                         <>
//                           <FileDown className="w-4 h-4" />
//                           Export CSV
//                         </>
//                       )}
//                     </button>

//                     <button
//                       onClick={exportConsolidatedExcel}
//                       disabled={exportProgress > 0}
//                       className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
//                         exportProgress > 0
//                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                           : "bg-blue-600 hover:bg-blue-700 text-white"
//                       }`}
//                     >
//                       <Download className="w-4 h-4" />
//                       Export Excel
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {showFilters && (
//                 <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Search
//                       </label>
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                         <input
//                           type="text"
//                           value={searchTerm}
//                           onChange={(e) => setSearchTerm(e.target.value)}
//                           placeholder="Search by file name, date, or type..."
//                           className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Candle Type
//                       </label>
//                       <div className="flex flex-wrap gap-2">
//                         {["all", "Bullish", "Bearish", "Doji"].map((type) => (
//                           <button
//                             key={type}
//                             onClick={() => setFilterType(type)}
//                             className={`px-4 py-2 rounded-lg transition-colors ${
//                               filterType === type
//                                 ? type === "Bullish"
//                                   ? "bg-green-600 text-white"
//                                   : type === "Bearish"
//                                     ? "bg-red-600 text-white"
//                                     : type === "Doji"
//                                       ? "bg-gray-600 text-white"
//                                       : "bg-blue-600 text-white"
//                                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                             }`}
//                           >
//                             {type === "all" ? "All Types" : type}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="overflow-x-auto rounded-lg border border-gray-200">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         File Name
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Option Type
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Date & Time
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Minute
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         OHLC
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Volume
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         OI
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Type
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         Return %
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {filteredConsolidatedData
//                       .slice(0, 50)
//                       .map((candle, index) => (
//                         <tr key={index} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                             {candle.fileName}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 py-1 rounded text-xs font-medium ${
//                                 candle.optionType === "CE"
//                                   ? "bg-blue-100 text-blue-800"
//                                   : candle.optionType === "PE"
//                                     ? "bg-red-100 text-red-800"
//                                     : "bg-gray-100 text-gray-800"
//                               }`}
//                             >
//                               {candle.optionType || "N/A"}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             <div>{candle.date}</div>
//                             <div className="text-gray-400">{candle.time}</div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {candle.minuteNumber}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center gap-2">
//                               <div
//                                 className={`w-16 h-8 rounded flex flex-col items-center justify-center ${
//                                   candle.candleType === "Bullish"
//                                     ? "bg-green-50"
//                                     : candle.candleType === "Bearish"
//                                       ? "bg-red-50"
//                                       : "bg-gray-50"
//                                 }`}
//                               >
//                                 <div className="text-xs font-semibold">
//                                   {candle.open.toFixed(1)} →{" "}
//                                   {candle.close.toFixed(1)}
//                                 </div>
//                                 <div className="text-[10px] text-gray-500">
//                                   H:{candle.high.toFixed(1)} L:
//                                   {candle.low.toFixed(1)}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {formatNumber(candle.volume)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {formatNumber(candle.oi)}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 candle.candleType === "Bullish"
//                                   ? "bg-green-100 text-green-800"
//                                   : candle.candleType === "Bearish"
//                                     ? "bg-red-100 text-red-800"
//                                     : "bg-gray-100 text-gray-800"
//                               }`}
//                             >
//                               {candle.candleType}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`text-sm font-semibold ${
//                                 candle.returnPercent >= 0
//                                   ? "text-green-600"
//                                   : "text-red-600"
//                               }`}
//                             >
//                               {candle.returnPercent >= 0 ? "+" : ""}
//                               {candle.returnPercent.toFixed(2)}%
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>

//                 {filteredConsolidatedData.length > 50 && (
//                   <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
//                     <div className="text-center text-sm text-gray-500">
//                       Showing 50 of {filteredConsolidatedData.length} candles
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {activeTab === "analysis" && consolidatedSummary && (
//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-blue-100 rounded-lg">
//                       <FileText className="w-6 h-6 text-blue-600" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500">
//                       Files
//                     </span>
//                   </div>
//                   <div className="text-3xl font-bold text-gray-900">
//                     {consolidatedSummary.totalFiles}
//                   </div>
//                   <div className="text-sm text-gray-500 mt-2">
//                     Total uploaded files
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-green-100 rounded-lg">
//                       <BarChart3 className="w-6 h-6 text-green-600" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500">
//                       Candles
//                     </span>
//                   </div>
//                   <div className="text-3xl font-bold text-gray-900">
//                     {consolidatedSummary.totalCandles}
//                   </div>
//                   <div className="text-sm text-gray-500 mt-2">
//                     Total analyzed candles
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-purple-100 rounded-lg">
//                       <TrendingUp className="w-6 h-6 text-purple-600" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500">
//                       Bullish %
//                     </span>
//                   </div>
//                   <div className="text-3xl font-bold text-gray-900">
//                     {consolidatedSummary.bullishPercentage}%
//                   </div>
//                   <div className="text-sm text-gray-500 mt-2">
//                     {consolidatedSummary.bullishCandles} bullish candles
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="p-3 bg-red-100 rounded-lg">
//                       <TrendingUp className="w-6 h-6 text-red-600" />
//                     </div>
//                     <span className="text-sm font-medium text-gray-500">
//                       Bearish %
//                     </span>
//                   </div>
//                   <div className="text-3xl font-bold text-gray-900">
//                     {consolidatedSummary.bearishPercentage}%
//                   </div>
//                   <div className="text-sm text-gray-500 mt-2">
//                     {consolidatedSummary.bearishCandles} bearish candles
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                     Volume & Open Interest Analysis
//                   </h3>

//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//                     <div className="text-center p-4 bg-blue-50 rounded-lg">
//                       <div className="text-2xl font-bold text-blue-700">
//                         {formatNumber(consolidatedSummary.totalVolume)}
//                       </div>
//                       <div className="text-sm text-blue-600 font-medium mt-1">
//                         Total Volume
//                       </div>
//                     </div>

//                     <div className="text-center p-4 bg-purple-50 rounded-lg">
//                       <div className="text-2xl font-bold text-purple-700">
//                         {formatNumber(consolidatedSummary.totalOI)}
//                       </div>
//                       <div className="text-sm text-purple-600 font-medium mt-1">
//                         Total OI
//                       </div>
//                     </div>

//                     <div className="text-center p-4 bg-green-50 rounded-lg">
//                       <div className="text-2xl font-bold text-green-700">
//                         {consolidatedSummary.volumeToOIRatio.toFixed(2)}
//                       </div>
//                       <div className="text-sm text-green-600 font-medium mt-1">
//                         Volume/OI Ratio
//                       </div>
//                     </div>

//                     <div className="text-center p-4 bg-red-50 rounded-lg">
//                       <div className="text-2xl font-bold text-red-700">
//                         {formatNumber(consolidatedSummary.maxVolume)}
//                       </div>
//                       <div className="text-sm text-red-600 font-medium mt-1">
//                         Max Volume
//                       </div>
//                     </div>

//                     <div className="text-center p-4 bg-yellow-50 rounded-lg">
//                       <div className="text-2xl font-bold text-yellow-700">
//                         {formatNumber(consolidatedSummary.maxOI)}
//                       </div>
//                       <div className="text-sm text-yellow-600 font-medium mt-1">
//                         Max OI
//                       </div>
//                     </div>

//                     <div className="text-center p-4 bg-indigo-50 rounded-lg">
//                       <div className="text-2xl font-bold text-indigo-700">
//                         {consolidatedSummary.volatility.toFixed(4)}
//                       </div>
//                       <div className="text-sm text-indigo-600 font-medium mt-1">
//                         Volatility
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-white rounded-xl shadow-lg p-6">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                     Candle Statistics
//                   </h3>

//                   <div className="space-y-4">
//                     <div>
//                       <div className="flex justify-between text-sm text-gray-600 mb-1">
//                         <span>Average Body Size</span>
//                         <span className="font-medium">
//                           {consolidatedSummary.avgBodySize.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-blue-500"
//                           style={{
//                             width: `${Math.min(consolidatedSummary.avgBodySize * 10, 100)}%`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex justify-between text-sm text-gray-600 mb-1">
//                         <span>Average Candle Size</span>
//                         <span className="font-medium">
//                           {consolidatedSummary.avgCandleSize.toFixed(2)}
//                         </span>
//                       </div>
//                       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-green-500"
//                           style={{
//                             width: `${Math.min(consolidatedSummary.avgCandleSize * 5, 100)}%`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex justify-between text-sm text-gray-600 mb-1">
//                         <span>Average Return</span>
//                         <span
//                           className={`font-medium ${
//                             consolidatedSummary.avgReturn >= 0
//                               ? "text-green-600"
//                               : "text-red-600"
//                           }`}
//                         >
//                           {consolidatedSummary.avgReturn >= 0 ? "+" : ""}
//                           {consolidatedSummary.avgReturn.toFixed(2)}%
//                         </span>
//                       </div>
//                       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className={`h-full ${
//                             consolidatedSummary.avgReturn >= 0
//                               ? "bg-green-500"
//                               : "bg-red-500"
//                           }`}
//                           style={{
//                             width: `${Math.min(Math.abs(consolidatedSummary.avgReturn) * 10, 100)}%`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex justify-between text-sm text-gray-600 mb-1">
//                         <span>Max/Min Return</span>
//                         <span className="font-medium">
//                           {consolidatedSummary.maxReturn.toFixed(2)}% /{" "}
//                           {consolidatedSummary.minReturn.toFixed(2)}%
//                         </span>
//                       </div>
//                       <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
//                           style={{
//                             width: "100%",
//                             backgroundSize: "200% 100%",
//                             backgroundPosition: `${(consolidatedSummary.minReturn + 10) * 5}% 0`,
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-lg p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-6">
//                   Candle Type Distribution
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div className="text-center">
//                     <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-100 mb-4">
//                       <div className="text-3xl font-bold text-green-700">
//                         {consolidatedSummary.bullishPercentage}%
//                       </div>
//                     </div>
//                     <div className="text-lg font-semibold text-gray-900">
//                       Bullish Candles
//                     </div>
//                     <div className="text-gray-600">
//                       {consolidatedSummary.bullishCandles} candles
//                     </div>
//                   </div>

//                   <div className="text-center">
//                     <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-red-100 mb-4">
//                       <div className="text-3xl font-bold text-red-700">
//                         {consolidatedSummary.bearishPercentage}%
//                       </div>
//                     </div>
//                     <div className="text-lg font-semibold text-gray-900">
//                       Bearish Candles
//                     </div>
//                     <div className="text-gray-600">
//                       {consolidatedSummary.bearishCandles} candles
//                     </div>
//                   </div>

//                   <div className="text-center">
//                     <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-4">
//                       <div className="text-3xl font-bold text-gray-700">
//                         {consolidatedSummary.dojiPercentage}%
//                       </div>
//                     </div>
//                     <div className="text-lg font-semibold text-gray-900">
//                       Doji Candles
//                     </div>
//                     <div className="text-gray-600">
//                       {consolidatedSummary.dojiCandles} candles
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </main>

//         <footer className="mt-8 pt-6 border-t border-gray-200">
//           <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
//             <div className="flex items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 <span>Bullish: {consolidatedSummary?.bullishCandles || 0}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                 <span>Bearish: {consolidatedSummary?.bearishCandles || 0}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
//                 <span>Doji: {consolidatedSummary?.dojiCandles || 0}</span>
//               </div>
//             </div>

//             <div>
//               Total Data: {consolidatedData.length} candles (
//               {first5MinConsolidatedData.length} first 5 min) from{" "}
//               {files.length} files
//             </div>
//           </div>
//         </footer>
//       </div>
//     </div>
//   );
// };

// export default CSVConsolidator2;

"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
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
  Clock,
  GitCompare,
  TrendingDown,
  Activity,
  Eye,
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
  optionType?: "CE" | "PE";
  strikePrice?: number;
  expiry?: string;
  minuteKey?: string; // For grouping by minute
}

interface FileAnalysis {
  id: string;
  name: string;
  data: CandleData[];
  first5MinData: CandleData[];
  summary: FileSummary;
  first5MinSummary: First5MinSummary;
}

interface FileSummary {
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
}

interface First5MinSummary {
  totalVolume: number;
  totalOI: number;
  avgBodySize: number;
  avgVolume: number;
  avgOI: number;
  bullishCandles: number;
  bearishCandles: number;
  dojiCandles: number;
  totalCandles: number;
  avgCandleSize: number;
  avgReturn: number;
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

interface MinuteComparison {
  date: string;
  time: string;
  minuteNumber: number;
  ceData: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    oi: number;
    candleType: "Bullish" | "Bearish" | "Doji";
    returnPercent: number;
    bodySize: number;
  };
  peData: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    oi: number;
    candleType: "Bullish" | "Bearish" | "Doji";
    returnPercent: number;
    bodySize: number;
  };
  comparison: {
    volumeDifference: number;
    volumeRatio: number;
    oiDifference: number;
    oiRatio: number;
    candleComparison:
      | "CE_Bullish"
      | "CE_Bearish"
      | "PE_Bullish"
      | "PE_Bearish"
      | "Both_Bullish"
      | "Both_Bearish"
      | "Both_Doji"
      | "Mixed";
    returnDifference: number;
    bodySizeDifference: number;
    ceWon: boolean; // CE performed better than PE
    directionAgreement: boolean; // Both moved in same direction
  };
}

interface CEPE_MinuteAnalysis {
  date: string;
  ceFileName: string;
  peFileName: string;
  strikePrice: number;
  minuteComparisons: MinuteComparison[];
  summary: {
    totalMinutes: number;
    ceTotalVolume: number;
    peTotalVolume: number;
    ceTotalOI: number;
    peTotalOI: number;
    ceBullishMinutes: number;
    ceBearishMinutes: number;
    peBullishMinutes: number;
    peBearishMinutes: number;
    minutesWithCEHigherVolume: number;
    minutesWithPEHigherVolume: number;
    minutesWithCEHigherOI: number;
    minutesWithPEHigherOI: number;
    ceAverageReturn: number;
    peAverageReturn: number;
    ceWins: number; // Minutes where CE performed better
    peWins: number; // Minutes where PE performed better
    directionAgreement: number; // Minutes where both moved same direction
    bestCEMinute: MinuteComparison | null;
    bestPEMinute: MinuteComparison | null;
    highestVolumeMinute: MinuteComparison | null;
  };
}

interface CE_PE_Comparison {
  date: string;
  ceData: {
    fileName: string;
    totalVolume: number;
    totalOI: number;
    bullishCandles: number;
    bearishCandles: number;
    avgReturn: number;
  };
  peData: {
    fileName: string;
    totalVolume: number;
    totalOI: number;
    bullishCandles: number;
    bearishCandles: number;
    avgReturn: number;
  };
  comparison: {
    volumeDifference: number;
    oiDifference: number;
    sentimentDifference: number;
    returnDifference: number;
  };
  minuteAnalysis?: CEPE_MinuteAnalysis; // New minute-by-minute analysis
}

const CSVConsolidator2 = () => {
  // State management
  const [files, setFiles] = useState<FileAnalysis[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<CandleData[]>([]);
  const [first5MinConsolidatedData, setFirst5MinConsolidatedData] = useState<
    CandleData[]
  >([]);
  const [consolidatedSummary, setConsolidatedSummary] =
    useState<ConsolidatedSummary | null>(null);
  const [first5MinConsolidatedSummary, setFirst5MinConsolidatedSummary] =
    useState<ConsolidatedSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "upload"
    | "files"
    | "consolidated"
    | "analysis"
    | "first5min"
    | "cepe"
    | "minutecomparison"
  >("upload");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [cePeComparisons, setCePeComparisons] = useState<CE_PE_Comparison[]>(
    [],
  );
  const [cePeMinuteAnalyses, setCePeMinuteAnalyses] = useState<
    CEPE_MinuteAnalysis[]
  >([]);
  const [selectedMinuteAnalysis, setSelectedMinuteAnalysis] =
    useState<CEPE_MinuteAnalysis | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized filtered data
  const filteredConsolidatedData = useMemo(() => {
    return consolidatedData.filter((candle) => {
      const matchesSearch =
        searchTerm === "" ||
        candle.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candle.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candle.candleType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || candle.candleType === filterType;
      return matchesSearch && matchesType;
    });
  }, [consolidatedData, searchTerm, filterType]);

  const filteredFirst5MinData = useMemo(() => {
    return first5MinConsolidatedData.filter((candle) => {
      const matchesSearch =
        searchTerm === "" ||
        candle.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candle.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candle.candleType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || candle.candleType === filterType;
      return matchesSearch && matchesType;
    });
  }, [first5MinConsolidatedData, searchTerm, filterType]);

  const selectedFileData = useMemo(() => {
    return files.filter((file) => selectedFiles.has(file.id));
  }, [files, selectedFiles]);

  // Parse CSV content with option type detection
  const parseCSVContent = useCallback(
    (text: string, fileName: string): CandleData[] => {
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length === 0) return [];

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

      // Detect option type from filename
      let optionType: "CE" | "PE" | undefined;
      const fileNameUpper = fileName.toUpperCase();
      if (fileNameUpper.includes("CE") && !fileNameUpper.includes("PEACE")) {
        optionType = "CE";
      } else if (fileNameUpper.includes("PE")) {
        optionType = "PE";
      }

      // Extract strike price
      let strikePrice: number | undefined;
      const strikeMatch = fileName.match(/(\d+)/);
      if (strikeMatch) {
        strikePrice = parseInt(strikeMatch[1]);
      }

      // Find column indices
      const openIndex = headers.findIndex((h) => h === "open" || h === "o");
      const highIndex = headers.findIndex((h) => h === "high" || h === "h");
      const lowIndex = headers.findIndex((h) => h === "low" || h === "l");
      const closeIndex = headers.findIndex((h) => h === "close" || h === "c");
      const volumeIndex = headers.findIndex(
        (h) => h === "volume" || h === "vol" || h === "volumne",
      );
      const oiIndex = headers.findIndex(
        (h) =>
          h === "oi" ||
          h === "open interest" ||
          h === "openinterest" ||
          h === "open_int",
      );
      const dateIndex = headers.findIndex(
        (h) => h === "date" || h === "datetime" || h === "timestamp",
      );
      const timeIndex = headers.findIndex((h) => h === "time");

      // Store previous close for return calculation
      let prevClose: number | null = null;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line
          .split(delimiter)
          .map((v) => v.trim().replace(/"/g, ""));

        const getValue = (index: number, defaultValue: any = 0) => {
          return index >= 0 && values[index] !== undefined
            ? values[index]
            : defaultValue;
        };

        let dateStr = "";
        let timeStr = "09:15";

        // Parse date and time
        if (dateIndex >= 0) {
          const dateValue = getValue(dateIndex, "");
          if (dateValue) {
            if (dateValue.includes(" ") || dateValue.includes("T")) {
              const dateTimeParts = dateValue.split(/[\sT]/);
              dateStr = dateTimeParts[0];
              if (dateTimeParts[1]) {
                timeStr = dateTimeParts[1].substring(0, 5);
              }
            } else {
              dateStr = dateValue;
              if (timeIndex >= 0) {
                const timeValue = getValue(timeIndex, "09:15");
                timeStr = timeValue.substring(0, 5);
              }
            }
          }
        }

        const open = parseFloat(getValue(openIndex, 0));
        const high = parseFloat(getValue(highIndex, 0));
        const low = parseFloat(getValue(lowIndex, 0));
        const close = parseFloat(getValue(closeIndex, 0));
        const volume = parseFloat(getValue(volumeIndex, 0));
        const oi = parseFloat(getValue(oiIndex, 0));

        if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
          const bodySize = Math.abs(close - open);
          const candleType: "Bullish" | "Bearish" | "Doji" =
            close > open ? "Bullish" : close < open ? "Bearish" : "Doji";

          const candleSize = high - low;

          // Calculate VWAP
          cumulativeVolume += volume;
          cumulativeValue += ((open + high + low + close) / 4) * volume;
          const vwap =
            cumulativeVolume > 0 ? cumulativeValue / cumulativeVolume : close;

          // Calculate return percentage
          let returnPercent = 0;
          if (prevClose !== null && prevClose !== 0) {
            returnPercent = ((close - prevClose) / prevClose) * 100;
          }
          prevClose = close;

          const minuteKey = `${dateStr}_${timeStr}`;

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
            optionType,
            strikePrice,
            minuteKey,
          });
        }
      }

      return candleData;
    },
    [],
  );

  const extractFirst5MinutesData = useCallback(
    (data: CandleData[]): CandleData[] => {
      return data.filter((candle) => {
        const time = candle.time;
        return time >= "09:15" && time <= "09:20";
      });
    },
    [],
  );

  const calculateFileSummary = useCallback(
    (data: CandleData[]): FileSummary | null => {
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
    },
    [],
  );

  const calculateFirst5MinSummary = useCallback(
    (data: CandleData[]): First5MinSummary | null => {
      if (data.length === 0) return null;

      const totalVolume = data.reduce((sum, candle) => sum + candle.volume, 0);
      const totalOI = data.reduce((sum, candle) => sum + candle.oi, 0);
      const avgBodySize =
        data.reduce((sum, candle) => sum + candle.bodySize, 0) / data.length;
      const avgVolume = totalVolume / data.length;
      const avgOI = totalOI / data.length;

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

      return {
        totalVolume,
        totalOI,
        avgBodySize,
        avgVolume,
        avgOI,
        bullishCandles,
        bearishCandles,
        dojiCandles,
        totalCandles: data.length,
        avgCandleSize,
        avgReturn: avgReturn * 100,
      };
    },
    [],
  );

  // New function to perform minute-by-minute CE vs PE comparison
  const calculateCEPE_MinuteAnalysis = useCallback(
    (
      ceFile: FileAnalysis,
      peFile: FileAnalysis,
      date: string,
    ): CEPE_MinuteAnalysis | null => {
      const ceCandles = ceFile.first5MinData;
      const peCandles = peFile.first5MinData;

      if (ceCandles.length === 0 || peCandles.length === 0) return null;

      // Group candles by minute for both CE and PE
      const ceByMinute = new Map<string, CandleData>();
      const peByMinute = new Map<string, CandleData>();

      ceCandles.forEach((candle) => {
        ceByMinute.set(candle.time, candle);
      });

      peCandles.forEach((candle) => {
        peByMinute.set(candle.time, candle);
      });

      // Get all unique minutes from both datasets
      const allMinutes = new Set([...ceByMinute.keys(), ...peByMinute.keys()]);
      const sortedMinutes = Array.from(allMinutes).sort();

      const minuteComparisons: MinuteComparison[] = [];
      let ceTotalVolume = 0;
      let peTotalVolume = 0;
      let ceTotalOI = 0;
      let peTotalOI = 0;
      let ceBullishMinutes = 0;
      let ceBearishMinutes = 0;
      let peBullishMinutes = 0;
      let peBearishMinutes = 0;
      let minutesWithCEHigherVolume = 0;
      let minutesWithPEHigherVolume = 0;
      let minutesWithCEHigherOI = 0;
      let minutesWithPEHigherOI = 0;
      let ceWins = 0;
      let peWins = 0;
      let directionAgreement = 0;
      let ceReturnSum = 0;
      let peReturnSum = 0;
      let bestCEMinute: MinuteComparison | null = null;
      let bestPEMinute: MinuteComparison | null = null;
      let highestVolumeMinute: MinuteComparison | null = null;
      let highestVolume = 0;

      sortedMinutes.forEach((time) => {
        const ceCandle = ceByMinute.get(time);
        const peCandle = peByMinute.get(time);

        // Skip if both are missing
        if (!ceCandle && !peCandle) return;

        // Create default candles for missing data
        const defaultCandle: CandleData = {
          date,
          time,
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
          oi: 0,
          bodySize: 0,
          candleType: "Doji",
          fileName: "",
          minuteNumber: parseInt(time.split(":")[1]) || 0,
          candleSize: 0,
          returnPercent: 0,
          timestamp: `${date} ${time}`,
        };

        const ceData = ceCandle || { ...defaultCandle, optionType: "CE" };
        const peData = peCandle || { ...defaultCandle, optionType: "PE" };

        // Calculate comparisons
        const volumeDifference = ceData.volume - peData.volume;
        const volumeRatio =
          peData.volume > 0
            ? ceData.volume / peData.volume
            : ceData.volume > 0
              ? Infinity
              : 0;
        const oiDifference = ceData.oi - peData.oi;
        const oiRatio =
          peData.oi > 0 ? ceData.oi / peData.oi : ceData.oi > 0 ? Infinity : 0;
        const returnDifference =
          (ceData.returnPercent || 0) - (peData.returnPercent || 0);
        const bodySizeDifference =
          (ceData.bodySize || 0) - (peData.bodySize || 0);

        // Determine candle comparison
        let candleComparison: MinuteComparison["comparison"]["candleComparison"];
        if (
          ceData.candleType === "Bullish" &&
          peData.candleType === "Bullish"
        ) {
          candleComparison = "Both_Bullish";
        } else if (
          ceData.candleType === "Bearish" &&
          peData.candleType === "Bearish"
        ) {
          candleComparison = "Both_Bearish";
        } else if (
          ceData.candleType === "Doji" &&
          peData.candleType === "Doji"
        ) {
          candleComparison = "Both_Doji";
        } else if (
          ceData.candleType === "Bullish" &&
          peData.candleType !== "Bullish"
        ) {
          candleComparison = "CE_Bullish";
        } else if (
          ceData.candleType === "Bearish" &&
          peData.candleType !== "Bearish"
        ) {
          candleComparison = "CE_Bearish";
        } else if (
          peData.candleType === "Bullish" &&
          ceData.candleType !== "Bullish"
        ) {
          candleComparison = "PE_Bullish";
        } else if (
          peData.candleType === "Bearish" &&
          ceData.candleType !== "Bearish"
        ) {
          candleComparison = "PE_Bearish";
        } else {
          candleComparison = "Mixed";
        }

        // Determine if CE performed better (higher return)
        const ceWon = ceData.returnPercent > peData.returnPercent;

        // Determine if both moved in same direction
        const sameDirection =
          (ceData.returnPercent > 0 && peData.returnPercent > 0) ||
          (ceData.returnPercent < 0 && peData.returnPercent < 0) ||
          (ceData.returnPercent === 0 && peData.returnPercent === 0);

        const comparison: MinuteComparison = {
          date,
          time,
          minuteNumber: parseInt(time.split(":")[1]) || 0,
          ceData: {
            open: ceData.open,
            high: ceData.high,
            low: ceData.low,
            close: ceData.close,
            volume: ceData.volume,
            oi: ceData.oi,
            candleType: ceData.candleType,
            returnPercent: ceData.returnPercent,
            bodySize: ceData.bodySize,
          },
          peData: {
            open: peData.open,
            high: peData.high,
            low: peData.low,
            close: peData.close,
            volume: peData.volume,
            oi: peData.oi,
            candleType: peData.candleType,
            returnPercent: peData.returnPercent,
            bodySize: peData.bodySize,
          },
          comparison: {
            volumeDifference,
            volumeRatio,
            oiDifference,
            oiRatio,
            candleComparison,
            returnDifference,
            bodySizeDifference,
            ceWon,
            directionAgreement: sameDirection,
          },
        };

        minuteComparisons.push(comparison);

        // Aggregate statistics
        ceTotalVolume += ceData.volume;
        peTotalVolume += peData.volume;
        ceTotalOI += ceData.oi;
        peTotalOI += peData.oi;

        if (ceData.candleType === "Bullish") ceBullishMinutes++;
        if (ceData.candleType === "Bearish") ceBearishMinutes++;
        if (peData.candleType === "Bullish") peBullishMinutes++;
        if (peData.candleType === "Bearish") peBearishMinutes++;

        if (ceData.volume > peData.volume) minutesWithCEHigherVolume++;
        else if (peData.volume > ceData.volume) minutesWithPEHigherVolume++;

        if (ceData.oi > peData.oi) minutesWithCEHigherOI++;
        else if (peData.oi > ceData.oi) minutesWithPEHigherOI++;

        if (ceWon) ceWins++;
        else peWins++;

        if (sameDirection) directionAgreement++;

        ceReturnSum += ceData.returnPercent;
        peReturnSum += peData.returnPercent;

        // Track best minutes
        if (
          !bestCEMinute ||
          ceData.returnPercent >
            (bestCEMinute?.ceData.returnPercent || -Infinity)
        ) {
          bestCEMinute = comparison;
        }
        if (
          !bestPEMinute ||
          peData.returnPercent >
            (bestPEMinute?.peData.returnPercent || -Infinity)
        ) {
          bestPEMinute = comparison;
        }

        const totalVolume = ceData.volume + peData.volume;
        if (totalVolume > highestVolume) {
          highestVolume = totalVolume;
          highestVolumeMinute = comparison;
        }
      });

      return {
        date,
        ceFileName: ceFile.name,
        peFileName: peFile.name,
        strikePrice:
          ceFile.data[0]?.strikePrice || peFile.data[0]?.strikePrice || 0,
        minuteComparisons,
        summary: {
          totalMinutes: minuteComparisons.length,
          ceTotalVolume,
          peTotalVolume,
          ceTotalOI,
          peTotalOI,
          ceBullishMinutes,
          ceBearishMinutes,
          peBullishMinutes,
          peBearishMinutes,
          minutesWithCEHigherVolume,
          minutesWithPEHigherVolume,
          minutesWithCEHigherOI,
          minutesWithPEHigherOI,
          ceAverageReturn:
            minuteComparisons.length > 0
              ? ceReturnSum / minuteComparisons.length
              : 0,
          peAverageReturn:
            minuteComparisons.length > 0
              ? peReturnSum / minuteComparisons.length
              : 0,
          ceWins,
          peWins,
          directionAgreement,
          bestCEMinute,
          bestPEMinute,
          highestVolumeMinute,
        },
      };
    },
    [],
  );

  const calculateCEPEComparisons = useCallback(
    (allFiles: FileAnalysis[]) => {
      const comparisons: CE_PE_Comparison[] = [];
      const minuteAnalyses: CEPE_MinuteAnalysis[] = [];

      // Group files by date
      const fileGroups: { [key: string]: FileAnalysis[] } = {};

      allFiles.forEach((file) => {
        if (file.data.length > 0) {
          const date = file.data[0].date;
          if (!fileGroups[date]) {
            fileGroups[date] = [];
          }
          fileGroups[date].push(file);
        }
      });

      Object.entries(fileGroups).forEach(([date, dateFiles]) => {
        const ceFile = dateFiles.find((f) => f.data[0]?.optionType === "CE");
        const peFile = dateFiles.find((f) => f.data[0]?.optionType === "PE");

        if (ceFile && peFile) {
          const ceFirst5Min = ceFile.first5MinData;
          const peFirst5Min = peFile.first5MinData;

          const ceSummary = calculateFirst5MinSummary(ceFirst5Min);
          const peSummary = calculateFirst5MinSummary(peFirst5Min);

          if (ceSummary && peSummary) {
            comparisons.push({
              date,
              ceData: {
                fileName: ceFile.name,
                totalVolume: ceSummary.totalVolume,
                totalOI: ceSummary.totalOI,
                bullishCandles: ceSummary.bullishCandles,
                bearishCandles: ceSummary.bearishCandles,
                avgReturn: ceSummary.avgReturn,
              },
              peData: {
                fileName: peFile.name,
                totalVolume: peSummary.totalVolume,
                totalOI: peSummary.totalOI,
                bullishCandles: peSummary.bullishCandles,
                bearishCandles: peSummary.bearishCandles,
                avgReturn: peSummary.avgReturn,
              },
              comparison: {
                volumeDifference: ceSummary.totalVolume - peSummary.totalVolume,
                oiDifference: ceSummary.totalOI - peSummary.totalOI,
                sentimentDifference:
                  ceSummary.bullishCandles -
                  ceSummary.bearishCandles -
                  (peSummary.bullishCandles - peSummary.bearishCandles),
                returnDifference: ceSummary.avgReturn - peSummary.avgReturn,
              },
            });

            // Add minute-by-minute analysis
            const minuteAnalysis = calculateCEPE_MinuteAnalysis(
              ceFile,
              peFile,
              date,
            );
            if (minuteAnalysis) {
              minuteAnalyses.push(minuteAnalysis);
            }
          }
        }
      });

      setCePeComparisons(comparisons);
      setCePeMinuteAnalyses(minuteAnalyses);

      // Auto-select first minute analysis
      if (minuteAnalyses.length > 0 && !selectedMinuteAnalysis) {
        setSelectedMinuteAnalysis(minuteAnalyses[0]);
      }
    },
    [calculateFirst5MinSummary, calculateCEPE_MinuteAnalysis],
  );

  const calculateConsolidatedData = useCallback(
    (allFiles: FileAnalysis[]) => {
      if (allFiles.length === 0) {
        setConsolidatedData([]);
        setConsolidatedSummary(null);
        setFirst5MinConsolidatedData([]);
        setFirst5MinConsolidatedSummary(null);
        return;
      }

      const allCandles: CandleData[] = [];
      const allFirst5MinCandles: CandleData[] = [];

      allFiles.forEach((file) => {
        allCandles.push(...file.data);
        allFirst5MinCandles.push(...file.first5MinData);
      });

      setConsolidatedData(allCandles);
      setFirst5MinConsolidatedData(allFirst5MinCandles);

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

      // Calculate first 5 minutes summary
      if (allFirst5MinCandles.length > 0) {
        const first5MinTotalVolume = allFirst5MinCandles.reduce(
          (sum, candle) => sum + candle.volume,
          0,
        );
        const first5MinTotalOI = allFirst5MinCandles.reduce(
          (sum, candle) => sum + candle.oi,
          0,
        );
        const first5MinAvgBodySize =
          allFirst5MinCandles.reduce(
            (sum, candle) => sum + candle.bodySize,
            0,
          ) / allFirst5MinCandles.length;
        const first5MinAvgVolume =
          first5MinTotalVolume / allFirst5MinCandles.length;
        const first5MinAvgOI = first5MinTotalOI / allFirst5MinCandles.length;

        const first5MinBullishCandles = allFirst5MinCandles.filter(
          (c) => c.candleType === "Bullish",
        ).length;
        const first5MinBearishCandles = allFirst5MinCandles.filter(
          (c) => c.candleType === "Bearish",
        ).length;
        const first5MinDojiCandles = allFirst5MinCandles.filter(
          (c) => c.candleType === "Doji",
        ).length;

        const first5MinAvgCandleSize =
          allFirst5MinCandles.reduce(
            (sum, candle) => sum + candle.candleSize,
            0,
          ) / allFirst5MinCandles.length;

        const first5MinReturns = allFirst5MinCandles.map((candle, index) => {
          if (index === 0) return 0;
          return (
            (candle.close - allFirst5MinCandles[index - 1].close) /
            allFirst5MinCandles[index - 1].close
          );
        });
        const first5MinAvgReturn =
          first5MinReturns.reduce((a, b) => a + b, 0) / first5MinReturns.length;

        setFirst5MinConsolidatedSummary({
          totalFiles: allFiles.length,
          totalCandles: allFirst5MinCandles.length,
          totalVolume: first5MinTotalVolume,
          totalOI: first5MinTotalOI,
          avgBodySize: first5MinAvgBodySize,
          avgVolume: first5MinAvgVolume,
          avgOI: first5MinAvgOI,
          maxVolume: Math.max(...allFirst5MinCandles.map((c) => c.volume)),
          maxOI: Math.max(...allFirst5MinCandles.map((c) => c.oi)),
          bullishCandles: first5MinBullishCandles,
          bearishCandles: first5MinBearishCandles,
          dojiCandles: first5MinDojiCandles,
          avgCandleSize: first5MinAvgCandleSize,
          volatility: Math.sqrt(
            first5MinReturns.reduce(
              (a, b) => a + Math.pow(b - first5MinAvgReturn, 2),
              0,
            ) / first5MinReturns.length,
          ),
          volumeToOIRatio: first5MinAvgVolume / (first5MinAvgOI || 1),
          bullishPercentage: (
            (first5MinBullishCandles / allFirst5MinCandles.length) *
            100
          ).toFixed(1),
          bearishPercentage: (
            (first5MinBearishCandles / allFirst5MinCandles.length) *
            100
          ).toFixed(1),
          dojiPercentage: (
            (first5MinDojiCandles / allFirst5MinCandles.length) *
            100
          ).toFixed(1),
          avgReturn: first5MinAvgReturn * 100,
          maxReturn: Math.max(...first5MinReturns.map((r) => r * 100)),
          minReturn: Math.min(...first5MinReturns.map((r) => r * 100)),
        });
      }

      calculateCEPEComparisons(allFiles);
    },
    [calculateCEPEComparisons],
  );

  const handleFileUpload = useCallback(
    async (fileList: File[]) => {
      setIsProcessing(true);
      const newFiles: FileAnalysis[] = [];

      for (const file of fileList) {
        try {
          const text = await file.text();
          const candleData = parseCSVContent(text, file.name);
          const first5MinData = extractFirst5MinutesData(candleData);

          if (candleData.length > 0) {
            const summary = calculateFileSummary(candleData);
            const first5MinSummary = calculateFirst5MinSummary(first5MinData);

            if (summary && first5MinSummary) {
              newFiles.push({
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: file.name.replace(".csv", ""),
                data: candleData,
                first5MinData: first5MinData,
                summary,
                first5MinSummary,
              });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }

      setFiles((prev) => [...prev, ...newFiles]);
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newFiles.forEach((file) => newSet.add(file.id));
        return newSet;
      });

      setActiveTab("files");
      setIsProcessing(false);

      if (newFiles.length > 0) {
        // Use requestAnimationFrame to avoid blocking UI
        requestAnimationFrame(() => {
          calculateConsolidatedData([...files, ...newFiles]);
        });
      }
    },
    [
      files,
      parseCSVContent,
      calculateFileSummary,
      calculateFirst5MinSummary,
      extractFirst5MinutesData,
      calculateConsolidatedData,
    ],
  );

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
    setFirst5MinConsolidatedData([]);
    setFirst5MinConsolidatedSummary(null);
    setSelectedFiles(new Set());
    setActiveTab("upload");
    setCePeComparisons([]);
    setCePeMinuteAnalyses([]);
    setSelectedMinuteAnalysis(null);
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

  // Export functions
  const exportConsolidatedCSV = useCallback(() => {
    if (filteredConsolidatedData.length === 0) return;

    setExportProgress(0);

    const headers = [
      "File Name",
      "Option Type",
      "Strike Price",
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

    const rows = [headers.join(",")];

    filteredConsolidatedData.forEach((candle, index) => {
      const row = [
        candle.fileName,
        candle.optionType || "N/A",
        candle.strikePrice || "N/A",
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

      setExportProgress(
        Math.round(((index + 1) / filteredConsolidatedData.length) * 100),
      );
    });

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

    setTimeout(() => setExportProgress(0), 1000);
  }, [filteredConsolidatedData]);

  const exportConsolidatedExcel = useCallback(() => {
    if (filteredConsolidatedData.length === 0) return;

    setExportProgress(0);

    const excelData = filteredConsolidatedData.map((candle) => ({
      "File Name": candle.fileName,
      "Option Type": candle.optionType || "N/A",
      "Strike Price": candle.strikePrice || "N/A",
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

    const wb = XLSX.utils.book_new();

    const wsData = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, wsData, "Candle Data");

    if (summaryData.length > 0) {
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
    }

    const fileSummaries = selectedFileData.map((file) => [
      file.name,
      file.data[0]?.optionType || "N/A",
      file.data[0]?.strikePrice || "N/A",
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
        "Option Type",
        "Strike Price",
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

    XLSX.writeFile(
      wb,
      `consolidated-analysis-${new Date().toISOString().split("T")[0]}.xlsx`,
    );

    setExportProgress(100);
    setTimeout(() => setExportProgress(0), 1000);
  }, [filteredConsolidatedData, consolidatedSummary, selectedFileData]);

  const exportSelectedFiles = useCallback(() => {
    if (selectedFileData.length === 0) return;

    const selectedCandles: CandleData[] = [];
    selectedFileData.forEach((file) => {
      selectedCandles.push(...file.data);
    });

    const headers = [
      "File Name",
      "Option Type",
      "Strike Price",
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
        candle.optionType || "N/A",
        candle.strikePrice || "N/A",
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

  const exportFirst5MinCSV = useCallback(() => {
    if (filteredFirst5MinData.length === 0) return;

    const headers = [
      "File Name",
      "Option Type",
      "Strike Price",
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
      "Timestamp",
    ];

    const rows = [headers.join(",")];

    filteredFirst5MinData.forEach((candle, index) => {
      const row = [
        candle.fileName,
        candle.optionType || "N/A",
        candle.strikePrice || "N/A",
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
        candle.timestamp,
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
      `first5min-data-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredFirst5MinData]);

  const exportCEPEComparison = useCallback(() => {
    if (cePeComparisons.length === 0) return;

    const headers = [
      "Date",
      "CE File",
      "CE Volume",
      "CE OI",
      "CE Bullish",
      "CE Bearish",
      "CE Avg Return %",
      "PE File",
      "PE Volume",
      "PE OI",
      "PE Bullish",
      "PE Bearish",
      "PE Avg Return %",
      "Volume Diff (CE-PE)",
      "OI Diff (CE-PE)",
      "Sentiment Diff",
      "Return Diff %",
    ];

    const rows = [headers.join(",")];

    cePeComparisons.forEach((comparison) => {
      const row = [
        comparison.date,
        comparison.ceData.fileName,
        comparison.ceData.totalVolume,
        comparison.ceData.totalOI,
        comparison.ceData.bullishCandles,
        comparison.ceData.bearishCandles,
        comparison.ceData.avgReturn.toFixed(2),
        comparison.peData.fileName,
        comparison.peData.totalVolume,
        comparison.peData.totalOI,
        comparison.peData.bullishCandles,
        comparison.peData.bearishCandles,
        comparison.peData.avgReturn.toFixed(2),
        comparison.comparison.volumeDifference,
        comparison.comparison.oiDifference,
        comparison.comparison.sentimentDifference,
        comparison.comparison.returnDifference.toFixed(2),
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
      `ce-pe-comparison-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [cePeComparisons]);

  const exportCEPE_MinuteAnalysis = useCallback(() => {
    if (cePeMinuteAnalyses.length === 0) return;

    const headers = [
      "Date",
      "Time",
      "Minute",
      "CE Open",
      "CE High",
      "CE Low",
      "CE Close",
      "CE Volume",
      "CE OI",
      "CE Candle",
      "CE Return %",
      "PE Open",
      "PE High",
      "PE Low",
      "PE Close",
      "PE Volume",
      "PE OI",
      "PE Candle",
      "PE Return %",
      "Vol Diff",
      "Vol Ratio",
      "OI Diff",
      "OI Ratio",
      "Return Diff %",
      "Candle Comparison",
      "CE Won",
      "Direction Agreement",
    ];

    const rows = [headers.join(",")];

    cePeMinuteAnalyses.forEach((analysis) => {
      analysis.minuteComparisons.forEach((comp) => {
        const row = [
          comp.date,
          comp.time,
          comp.minuteNumber,
          comp.ceData.open.toFixed(2),
          comp.ceData.high.toFixed(2),
          comp.ceData.low.toFixed(2),
          comp.ceData.close.toFixed(2),
          comp.ceData.volume,
          comp.ceData.oi,
          comp.ceData.candleType,
          comp.ceData.returnPercent.toFixed(2),
          comp.peData.open.toFixed(2),
          comp.peData.high.toFixed(2),
          comp.peData.low.toFixed(2),
          comp.peData.close.toFixed(2),
          comp.peData.volume,
          comp.peData.oi,
          comp.peData.candleType,
          comp.peData.returnPercent.toFixed(2),
          comp.comparison.volumeDifference,
          comp.comparison.volumeRatio.toFixed(2),
          comp.comparison.oiDifference,
          comp.comparison.oiRatio.toFixed(2),
          comp.comparison.returnDifference.toFixed(2),
          comp.comparison.candleComparison,
          comp.comparison.ceWon ? "Yes" : "No",
          comp.comparison.directionAgreement ? "Yes" : "No",
        ].join(",");
        rows.push(row);
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `ce-pe-minute-analysis-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [cePeMinuteAnalyses]);

  const exportMinuteComparisonExcel = useCallback(() => {
    if (cePeMinuteAnalyses.length === 0) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = cePeMinuteAnalyses.map((analysis) => [
      analysis.date,
      analysis.ceFileName,
      analysis.peFileName,
      analysis.strikePrice,
      analysis.summary.totalMinutes,
      analysis.summary.ceTotalVolume,
      analysis.summary.peTotalVolume,
      analysis.summary.ceTotalOI,
      analysis.summary.peTotalOI,
      analysis.summary.ceAverageReturn.toFixed(2),
      analysis.summary.peAverageReturn.toFixed(2),
      analysis.summary.ceWins,
      analysis.summary.peWins,
      analysis.summary.directionAgreement,
      `${((analysis.summary.directionAgreement / analysis.summary.totalMinutes) * 100).toFixed(1)}%`,
      analysis.summary.ceBullishMinutes,
      analysis.summary.ceBearishMinutes,
      analysis.summary.peBullishMinutes,
      analysis.summary.peBearishMinutes,
    ]);

    const summaryHeaders = [
      "Date",
      "CE File",
      "PE File",
      "Strike Price",
      "Total Minutes",
      "CE Volume",
      "PE Volume",
      "CE OI",
      "PE OI",
      "CE Avg Return %",
      "PE Avg Return %",
      "CE Wins",
      "PE Wins",
      "Direction Agreement",
      "Agreement %",
      "CE Bullish",
      "CE Bearish",
      "PE Bullish",
      "PE Bearish",
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // Minute-by-minute data for each date
    cePeMinuteAnalyses.forEach((analysis) => {
      const minuteData = analysis.minuteComparisons.map((comp) => [
        comp.time,
        comp.minuteNumber,
        comp.ceData.open.toFixed(2),
        comp.ceData.high.toFixed(2),
        comp.ceData.low.toFixed(2),
        comp.ceData.close.toFixed(2),
        comp.ceData.volume,
        comp.ceData.oi,
        comp.ceData.candleType,
        comp.ceData.returnPercent.toFixed(2),
        comp.ceData.bodySize.toFixed(2),
        comp.peData.open.toFixed(2),
        comp.peData.high.toFixed(2),
        comp.peData.low.toFixed(2),
        comp.peData.close.toFixed(2),
        comp.peData.volume,
        comp.peData.oi,
        comp.peData.candleType,
        comp.peData.returnPercent.toFixed(2),
        comp.peData.bodySize.toFixed(2),
        comp.comparison.volumeDifference,
        comp.comparison.volumeRatio.toFixed(2),
        comp.comparison.oiDifference,
        comp.comparison.oiRatio.toFixed(2),
        comp.comparison.returnDifference.toFixed(2),
        comp.comparison.candleComparison,
        comp.comparison.ceWon ? "Yes" : "No",
        comp.comparison.directionAgreement ? "Yes" : "No",
      ]);

      const minuteHeaders = [
        "Time",
        "Minute",
        "CE Open",
        "CE High",
        "CE Low",
        "CE Close",
        "CE Volume",
        "CE OI",
        "CE Candle",
        "CE Return %",
        "CE Body Size",
        "PE Open",
        "PE High",
        "PE Low",
        "PE Close",
        "PE Volume",
        "PE OI",
        "PE Candle",
        "PE Return %",
        "PE Body Size",
        "Vol Diff",
        "Vol Ratio",
        "OI Diff",
        "OI Ratio",
        "Return Diff %",
        "Candle Comparison",
        "CE Won",
        "Direction Agreement",
      ];

      const wsMinute = XLSX.utils.aoa_to_sheet([minuteHeaders, ...minuteData]);
      XLSX.utils.book_append_sheet(wb, wsMinute, `${analysis.date}_Minute`);
    });

    XLSX.writeFile(
      wb,
      `ce-pe-minute-comparison-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  }, [cePeMinuteAnalyses]);

  useEffect(() => {
    if (files.length > 0) {
      calculateConsolidatedData(files);
    }
  }, [files, calculateConsolidatedData]);

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(2) + "Cr";
    }
    if (num >= 100000) {
      return (num / 100000).toFixed(2) + "L";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getCandleComparisonColor = (type: string) => {
    switch (type) {
      case "CE_Bullish":
      case "Both_Bullish":
        return "bg-green-100 text-green-800 border-green-200";
      case "PE_Bullish":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CE_Bearish":
      case "Both_Bearish":
        return "bg-red-100 text-red-800 border-red-200";
      case "PE_Bearish":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Both_Doji":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Options Data Analyzer
              </h1>
              <p className="text-gray-600 mt-2">
                Analyze first 5 minutes data and compare CE vs PE options minute
                by minute
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
                  onClick={() => setActiveTab("first5min")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "first5min"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  First 5 Min
                </button>

                <button
                  onClick={() => {
                    setActiveTab("cepe");
                    if (
                      cePeMinuteAnalyses.length > 0 &&
                      !selectedMinuteAnalysis
                    ) {
                      setSelectedMinuteAnalysis(cePeMinuteAnalyses[0]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "cepe"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  CE vs PE
                </button>

                <button
                  onClick={() => {
                    setActiveTab("minutecomparison");
                    if (
                      cePeMinuteAnalyses.length > 0 &&
                      !selectedMinuteAnalysis
                    ) {
                      setSelectedMinuteAnalysis(cePeMinuteAnalyses[0]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "minutecomparison"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Minute Analysis
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

                <button
                  onClick={() => setActiveTab("consolidated")}
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    activeTab === "consolidated"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Consolidated
                </button>
              </>
            )}
          </div>
        </header>

        <main>
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
                    analyzed and consolidated. CE/PE detection via filename.
                  </p>
                </div>

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

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    File Naming Convention for CE/PE Detection
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Include{" "}
                        <span className="font-mono font-semibold">"CE"</span> in
                        filename for Call options
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Include{" "}
                        <span className="font-mono font-semibold">"PE"</span> in
                        filename for Put options
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Include strike price in filename (e.g., 18000, 42000)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">
                        Examples: NIFTY_CE_18000.csv, BANKNIFTY_PE_42000.csv
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "files" && files.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Uploaded Files
                  </h2>
                  <p className="text-gray-600">
                    {files.length} files • {consolidatedData.length} total
                    candles • {first5MinConsolidatedData.length} first 5 min
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

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
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
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                              {file.first5MinData.length} first 5 min
                            </span>
                            {file.data[0]?.optionType && (
                              <span
                                className={`px-3 py-1 rounded-full text-sm ${
                                  file.data[0].optionType === "CE"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {file.data[0].optionType}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <div className="text-sm text-gray-600">
                                Total Volume
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCompactNumber(file.summary.totalVolume)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                Total OI
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCompactNumber(file.summary.totalOI)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                First 5 Min Volume
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCompactNumber(
                                  file.first5MinSummary.totalVolume,
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">
                                First 5 Min Return
                              </div>
                              <div
                                className={`font-semibold ${
                                  file.first5MinSummary.avgReturn >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {file.first5MinSummary.avgReturn.toFixed(2)}%
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

          {activeTab === "first5min" && first5MinConsolidatedSummary && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    First 5 Minutes Data (9:15 - 9:20)
                  </h2>
                  <p className="text-gray-600">
                    {filteredFirst5MinData.length} candles from {files.length}{" "}
                    files
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={exportFirst5MinCSV}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-sm text-blue-600 font-medium">
                    Total Candles
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {first5MinConsolidatedSummary.totalCandles}
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-sm text-green-600 font-medium">
                    Bullish %
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {first5MinConsolidatedSummary.bullishPercentage}%
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="text-sm text-red-600 font-medium">
                    Bearish %
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {first5MinConsolidatedSummary.bearishPercentage}%
                  </div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-purple-600 font-medium">
                    Avg Return
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      first5MinConsolidatedSummary.avgReturn >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {first5MinConsolidatedSummary.avgReturn.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
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
                        Candle Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Return %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFirst5MinData.slice(0, 30).map((candle, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {candle.fileName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              candle.optionType === "CE"
                                ? "bg-blue-100 text-blue-800"
                                : candle.optionType === "PE"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {candle.optionType || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {candle.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`w-20 h-10 rounded flex flex-col items-center justify-center ${
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCompactNumber(candle.volume)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCompactNumber(candle.oi)}
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
              </div>
            </div>
          )}

          {activeTab === "cepe" && cePeComparisons.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    CE vs PE Comparison (First 5 Minutes)
                  </h2>
                  <p className="text-gray-600">
                    {cePeComparisons.length} date comparisons available
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={exportCEPEComparison}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Summary
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("minutecomparison");
                      if (cePeMinuteAnalyses.length > 0) {
                        setSelectedMinuteAnalysis(cePeMinuteAnalyses[0]);
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Minute Analysis
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CE Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PE Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comparison
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cePeComparisons.map((comparison, index) => {
                      const minuteAnalysis = cePeMinuteAnalyses.find(
                        (ma) => ma.date === comparison.date,
                      );
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {comparison.date}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium">File:</span>{" "}
                                {comparison.ceData.fileName}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  Volume:{" "}
                                  {formatCompactNumber(
                                    comparison.ceData.totalVolume,
                                  )}
                                </div>
                                <div>
                                  OI:{" "}
                                  {formatCompactNumber(
                                    comparison.ceData.totalOI,
                                  )}
                                </div>
                                <div>
                                  Bullish: {comparison.ceData.bullishCandles}
                                </div>
                                <div>
                                  Bearish: {comparison.ceData.bearishCandles}
                                </div>
                                <div className="col-span-2">
                                  Return:{" "}
                                  <span
                                    className={
                                      comparison.ceData.avgReturn >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {comparison.ceData.avgReturn.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                              {minuteAnalysis && (
                                <button
                                  onClick={() => {
                                    setSelectedMinuteAnalysis(minuteAnalysis);
                                    setActiveTab("minutecomparison");
                                  }}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Activity className="w-3 h-3" />
                                  View Minute Details
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="font-medium">File:</span>{" "}
                                {comparison.peData.fileName}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  Volume:{" "}
                                  {formatCompactNumber(
                                    comparison.peData.totalVolume,
                                  )}
                                </div>
                                <div>
                                  OI:{" "}
                                  {formatCompactNumber(
                                    comparison.peData.totalOI,
                                  )}
                                </div>
                                <div>
                                  Bullish: {comparison.peData.bullishCandles}
                                </div>
                                <div>
                                  Bearish: {comparison.peData.bearishCandles}
                                </div>
                                <div className="col-span-2">
                                  Return:{" "}
                                  <span
                                    className={
                                      comparison.peData.avgReturn >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {comparison.peData.avgReturn.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span>Volume Diff:</span>
                                <span
                                  className={`font-medium ${
                                    comparison.comparison.volumeDifference >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {comparison.comparison.volumeDifference >= 0
                                    ? "+"
                                    : ""}
                                  {formatCompactNumber(
                                    comparison.comparison.volumeDifference,
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>OI Diff:</span>
                                <span
                                  className={`font-medium ${
                                    comparison.comparison.oiDifference >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {comparison.comparison.oiDifference >= 0
                                    ? "+"
                                    : ""}
                                  {formatCompactNumber(
                                    comparison.comparison.oiDifference,
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Sentiment:</span>
                                <span
                                  className={`font-medium ${
                                    comparison.comparison.sentimentDifference >=
                                    0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {comparison.comparison.sentimentDifference >=
                                  0
                                    ? "+"
                                    : ""}
                                  {comparison.comparison.sentimentDifference}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>Return Diff:</span>
                                <span
                                  className={`font-medium ${
                                    comparison.comparison.returnDifference >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {comparison.comparison.returnDifference >= 0
                                    ? "+"
                                    : ""}
                                  {comparison.comparison.returnDifference.toFixed(
                                    2,
                                  )}
                                  %
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "minutecomparison" &&
            cePeMinuteAnalyses.length > 0 && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        CE vs PE - Minute by Minute Analysis
                      </h2>
                      <p className="text-gray-600">
                        Compare volume, OI, and candle types for each minute
                        (9:15-9:20)
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <select
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                        value={selectedMinuteAnalysis?.date || ""}
                        onChange={(e) => {
                          const analysis = cePeMinuteAnalyses.find(
                            (a) => a.date === e.target.value,
                          );
                          setSelectedMinuteAnalysis(analysis || null);
                        }}
                      >
                        {cePeMinuteAnalyses.map((analysis) => (
                          <option key={analysis.date} value={analysis.date}>
                            {analysis.date} - {analysis.ceFileName} vs{" "}
                            {analysis.peFileName}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={exportCEPE_MinuteAnalysis}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export CSV
                      </button>
                      <button
                        onClick={exportMinuteComparisonExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <FileDown className="w-4 h-4" />
                        Export Excel
                      </button>
                    </div>
                  </div>

                  {selectedMinuteAnalysis && (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                          <div className="text-sm text-blue-600 font-medium mb-1">
                            CE Performance
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedMinuteAnalysis.summary.ceWins} /{" "}
                            {selectedMinuteAnalysis.summary.totalMinutes}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Wins:{" "}
                            {(
                              (selectedMinuteAnalysis.summary.ceWins /
                                selectedMinuteAnalysis.summary.totalMinutes) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                          <div className="text-sm text-red-600 font-medium mb-1">
                            PE Performance
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedMinuteAnalysis.summary.peWins} /{" "}
                            {selectedMinuteAnalysis.summary.totalMinutes}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Wins:{" "}
                            {(
                              (selectedMinuteAnalysis.summary.peWins /
                                selectedMinuteAnalysis.summary.totalMinutes) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                          <div className="text-sm text-purple-600 font-medium mb-1">
                            Direction Agreement
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {selectedMinuteAnalysis.summary.directionAgreement}{" "}
                            / {selectedMinuteAnalysis.summary.totalMinutes}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {(
                              (selectedMinuteAnalysis.summary
                                .directionAgreement /
                                selectedMinuteAnalysis.summary.totalMinutes) *
                              100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                          <div className="text-sm text-green-600 font-medium mb-1">
                            Avg Return Diff
                          </div>
                          <div
                            className={`text-2xl font-bold ${selectedMinuteAnalysis.summary.ceAverageReturn - selectedMinuteAnalysis.summary.peAverageReturn >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {(
                              selectedMinuteAnalysis.summary.ceAverageReturn -
                              selectedMinuteAnalysis.summary.peAverageReturn
                            ).toFixed(2)}
                            %
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            CE:{" "}
                            {selectedMinuteAnalysis.summary.ceAverageReturn.toFixed(
                              2,
                            )}
                            % | PE:{" "}
                            {selectedMinuteAnalysis.summary.peAverageReturn.toFixed(
                              2,
                            )}
                            %
                          </div>
                        </div>
                      </div>

                      {/* Volume & OI Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Volume Analysis
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                CE Total Volume:
                              </span>
                              <span className="font-medium">
                                {formatCompactNumber(
                                  selectedMinuteAnalysis.summary.ceTotalVolume,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                PE Total Volume:
                              </span>
                              <span className="font-medium">
                                {formatCompactNumber(
                                  selectedMinuteAnalysis.summary.peTotalVolume,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Minutes with CE Higher:
                              </span>
                              <span className="font-medium text-green-600">
                                {
                                  selectedMinuteAnalysis.summary
                                    .minutesWithCEHigherVolume
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Minutes with PE Higher:
                              </span>
                              <span className="font-medium text-red-600">
                                {
                                  selectedMinuteAnalysis.summary
                                    .minutesWithPEHigherVolume
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Open Interest Analysis
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                CE Total OI:
                              </span>
                              <span className="font-medium">
                                {formatCompactNumber(
                                  selectedMinuteAnalysis.summary.ceTotalOI,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                PE Total OI:
                              </span>
                              <span className="font-medium">
                                {formatCompactNumber(
                                  selectedMinuteAnalysis.summary.peTotalOI,
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Minutes with CE Higher:
                              </span>
                              <span className="font-medium text-green-600">
                                {
                                  selectedMinuteAnalysis.summary
                                    .minutesWithCEHigherOI
                                }
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Minutes with PE Higher:
                              </span>
                              <span className="font-medium text-red-600">
                                {
                                  selectedMinuteAnalysis.summary
                                    .minutesWithPEHigherOI
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Best Performers */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {selectedMinuteAnalysis.summary.bestCEMinute && (
                          <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-green-700 mb-2">
                              Best CE Minute
                            </h4>
                            <div className="text-2xl font-bold text-gray-900">
                              {selectedMinuteAnalysis.summary.bestCEMinute.time}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              Return:{" "}
                              <span className="font-semibold text-green-600">
                                +
                                {selectedMinuteAnalysis.summary.bestCEMinute.ceData.returnPercent.toFixed(
                                  2,
                                )}
                                %
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Volume:{" "}
                              {formatCompactNumber(
                                selectedMinuteAnalysis.summary.bestCEMinute
                                  .ceData.volume,
                              )}
                            </div>
                          </div>
                        )}
                        {selectedMinuteAnalysis.summary.bestPEMinute && (
                          <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-red-700 mb-2">
                              Best PE Minute
                            </h4>
                            <div className="text-2xl font-bold text-gray-900">
                              {selectedMinuteAnalysis.summary.bestPEMinute.time}
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              Return:{" "}
                              <span
                                className={`font-semibold ${selectedMinuteAnalysis.summary.bestPEMinute.peData.returnPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {selectedMinuteAnalysis.summary.bestPEMinute
                                  .peData.returnPercent >= 0
                                  ? "+"
                                  : ""}
                                {selectedMinuteAnalysis.summary.bestPEMinute.peData.returnPercent.toFixed(
                                  2,
                                )}
                                %
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Volume:{" "}
                              {formatCompactNumber(
                                selectedMinuteAnalysis.summary.bestPEMinute
                                  .peData.volume,
                              )}
                            </div>
                          </div>
                        )}
                        {selectedMinuteAnalysis.summary.highestVolumeMinute && (
                          <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-purple-700 mb-2">
                              Highest Volume Minute
                            </h4>
                            <div className="text-2xl font-bold text-gray-900">
                              {
                                selectedMinuteAnalysis.summary
                                  .highestVolumeMinute.time
                              }
                            </div>
                            <div className="text-sm text-gray-700 mt-1">
                              CE Vol:{" "}
                              {formatCompactNumber(
                                selectedMinuteAnalysis.summary
                                  .highestVolumeMinute.ceData.volume,
                              )}{" "}
                              | PE Vol:{" "}
                              {formatCompactNumber(
                                selectedMinuteAnalysis.summary
                                  .highestVolumeMinute.peData.volume,
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Total:{" "}
                              {formatCompactNumber(
                                selectedMinuteAnalysis.summary
                                  .highestVolumeMinute.ceData.volume +
                                  selectedMinuteAnalysis.summary
                                    .highestVolumeMinute.peData.volume,
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Minute-by-Minute Table */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Minute-by-Minute Comparison
                      </h3>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Time
                              </th>
                              <th
                                colSpan={5}
                                className="px-4 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider border-r border-l"
                              >
                                CE Data
                              </th>
                              <th
                                colSpan={5}
                                className="px-4 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider"
                              >
                                PE Data
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comparison
                              </th>
                            </tr>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500"></th>
                              {/* CE headers */}
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                OHLC
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Volume
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                OI
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 border-r">
                                Return
                              </th>
                              {/* PE headers */}
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                OHLC
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Volume
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                OI
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Return
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                Diff
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedMinuteAnalysis.minuteComparisons.map(
                              (comp, idx) => (
                                <tr
                                  key={idx}
                                  className={`hover:bg-gray-50 ${comp.comparison.ceWon ? "bg-green-50/30" : "bg-red-50/30"}`}
                                >
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {comp.time}
                                  </td>
                                  {/* CE Data */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-xs">
                                      <span className="font-medium">
                                        {comp.ceData.open.toFixed(1)}
                                      </span>{" "}
                                      →
                                      <span
                                        className={`font-semibold ml-1 ${
                                          comp.ceData.candleType === "Bullish"
                                            ? "text-green-600"
                                            : comp.ceData.candleType ===
                                                "Bearish"
                                              ? "text-red-600"
                                              : "text-gray-600"
                                        }`}
                                      >
                                        {comp.ceData.close.toFixed(1)}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      H:{comp.ceData.high.toFixed(1)} L:
                                      {comp.ceData.low.toFixed(1)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {formatCompactNumber(comp.ceData.volume)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {formatCompactNumber(comp.ceData.oi)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        comp.ceData.candleType === "Bullish"
                                          ? "bg-green-100 text-green-800"
                                          : comp.ceData.candleType === "Bearish"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {comp.ceData.candleType}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm border-r">
                                    <span
                                      className={`font-medium ${
                                        comp.ceData.returnPercent >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {comp.ceData.returnPercent >= 0
                                        ? "+"
                                        : ""}
                                      {comp.ceData.returnPercent.toFixed(2)}%
                                    </span>
                                  </td>
                                  {/* PE Data */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-xs">
                                      <span className="font-medium">
                                        {comp.peData.open.toFixed(1)}
                                      </span>{" "}
                                      →
                                      <span
                                        className={`font-semibold ml-1 ${
                                          comp.peData.candleType === "Bullish"
                                            ? "text-green-600"
                                            : comp.peData.candleType ===
                                                "Bearish"
                                              ? "text-red-600"
                                              : "text-gray-600"
                                        }`}
                                      >
                                        {comp.peData.close.toFixed(1)}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      H:{comp.peData.high.toFixed(1)} L:
                                      {comp.peData.low.toFixed(1)}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {formatCompactNumber(comp.peData.volume)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {formatCompactNumber(comp.peData.oi)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        comp.peData.candleType === "Bullish"
                                          ? "bg-green-100 text-green-800"
                                          : comp.peData.candleType === "Bearish"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {comp.peData.candleType}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span
                                      className={`font-medium ${
                                        comp.peData.returnPercent >= 0
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    >
                                      {comp.peData.returnPercent >= 0
                                        ? "+"
                                        : ""}
                                      {comp.peData.returnPercent.toFixed(2)}%
                                    </span>
                                  </td>
                                  {/* Comparison */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="space-y-1">
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium ${getCandleComparisonColor(comp.comparison.candleComparison)}`}
                                      >
                                        {comp.comparison.candleComparison}
                                      </span>
                                      <div className="text-xs">
                                        <span className="text-gray-600">
                                          Vol:{" "}
                                        </span>
                                        <span
                                          className={
                                            comp.comparison.volumeDifference >=
                                            0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }
                                        >
                                          {comp.comparison.volumeDifference >= 0
                                            ? "+"
                                            : ""}
                                          {formatCompactNumber(
                                            comp.comparison.volumeDifference,
                                          )}
                                        </span>
                                      </div>
                                      <div className="text-xs">
                                        <span className="text-gray-600">
                                          Return:{" "}
                                        </span>
                                        <span
                                          className={
                                            comp.comparison.returnDifference >=
                                            0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }
                                        >
                                          {comp.comparison.returnDifference >= 0
                                            ? "+"
                                            : ""}
                                          {comp.comparison.returnDifference.toFixed(
                                            2,
                                          )}
                                          %
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

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

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Option Type
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                candle.optionType === "CE"
                                  ? "bg-blue-100 text-blue-800"
                                  : candle.optionType === "PE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {candle.optionType || "N/A"}
                            </span>
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
                                className={`w-20 h-10 rounded flex flex-col items-center justify-center ${
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
                            {formatCompactNumber(candle.volume)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCompactNumber(candle.oi)}
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

          {activeTab === "analysis" && consolidatedSummary && (
            <div className="space-y-6">
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
                      <TrendingDown className="w-6 h-6 text-red-600" />
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Volume & Open Interest Analysis
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">
                        {formatCompactNumber(consolidatedSummary.totalVolume)}
                      </div>
                      <div className="text-sm text-blue-600 font-medium mt-1">
                        Total Volume
                      </div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">
                        {formatCompactNumber(consolidatedSummary.totalOI)}
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
                        {formatCompactNumber(consolidatedSummary.maxVolume)}
                      </div>
                      <div className="text-sm text-red-600 font-medium mt-1">
                        Max Volume
                      </div>
                    </div>

                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">
                        {formatCompactNumber(consolidatedSummary.maxOI)}
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
              Total Data: {consolidatedData.length} candles (
              {first5MinConsolidatedData.length} first 5 min) from{" "}
              {files.length} files
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CSVConsolidator2;
