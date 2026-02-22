// "use client";

// import React, { useState, useCallback, useRef, useMemo } from "react";
// import {
//   Upload,
//   FileText,
//   X,
//   Check,
//   AlertCircle,
//   BarChart3,
//   Activity,
//   TrendingUp,
//   TrendingDown,
//   Clock,
//   Target,
//   Award,
//   Download,
//   FileDown,
//   Scale,
//   FolderOpen,
//   Loader,
//   ChevronDown,
//   ChevronRight,
//   Folder,
// } from "lucide-react";
// import * as XLSX from "xlsx";

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
//   minuteKey?: string;
// }

// interface FileAnalysis {
//   id: string;
//   name: string;
//   data: CandleData[];
//   firstHourData: CandleData[];
//   summary: FileSummary;
//   firstHourSummary: FirstHourSummary;
// }

// interface FileSummary {
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
//   totalCandles: number;
//   avgCandleSize: number;
//   volatility: number;
//   volumeToOIRatio: number;
//   avgReturn: number;
//   maxReturn: number;
//   minReturn: number;
// }

// interface FirstHourSummary {
//   totalVolume: number;
//   totalOI: number;
//   avgBodySize: number;
//   avgVolume: number;
//   avgOI: number;
//   bullishCandles: number;
//   bearishCandles: number;
//   dojiCandles: number;
//   totalCandles: number;
//   avgCandleSize: number;
//   avgReturn: number;
//   volumeToOIRatio?: number;
// }

// interface MinuteComparison {
//   date: string;
//   time: string;
//   minuteNumber: number;
//   ceData: {
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     volume: number;
//     oi: number;
//     candleType: "Bullish" | "Bearish" | "Doji";
//     returnPercent: number;
//     bodySize: number;
//     volumeToOIRatio: number;
//   };
//   peData: {
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//     volume: number;
//     oi: number;
//     candleType: "Bullish" | "Bearish" | "Doji";
//     returnPercent: number;
//     bodySize: number;
//     volumeToOIRatio: number;
//   };
//   comparison: {
//     volumeDifference: number;
//     volumeRatio: number;
//     oiDifference: number;
//     oiRatio: number;
//     volumeToOIRatioDifference: number;
//     candleComparison: string;
//     returnDifference: number;
//     bodySizeDifference: number;
//     ceWon: boolean;
//     directionAgreement: boolean;
//   };
// }

// interface CEPE_MinuteAnalysis {
//   date: string;
//   ceFileName: string;
//   peFileName: string;
//   ceStrikePrice: number;
//   peStrikePrice: number;
//   minuteComparisons: MinuteComparison[];
//   summary: {
//     totalMinutes: number;
//     ceTotalVolume: number;
//     peTotalVolume: number;
//     ceTotalOI: number;
//     peTotalOI: number;
//     ceAvgVolumeToOIRatio: number;
//     peAvgVolumeToOIRatio: number;
//     ceBullishMinutes: number;
//     ceBearishMinutes: number;
//     peBullishMinutes: number;
//     peBearishMinutes: number;
//     minutesWithCEHigherVolume: number;
//     minutesWithPEHigherVolume: number;
//     minutesWithCEHigherOI: number;
//     minutesWithPEHigherOI: number;
//     minutesWithCEHigherVolumeToOIRatio: number;
//     minutesWithPEHigherVolumeToOIRatio: number;
//     ceAverageReturn: number;
//     peAverageReturn: number;
//     ceWins: number;
//     peWins: number;
//     directionAgreement: number;
//     bestCEMinute: MinuteComparison | null;
//     bestPEMinute: MinuteComparison | null;
//     highestVolumeMinute: MinuteComparison | null;
//   };
// }

// interface DateOption {
//   date: string;
//   display: string;
//   ceFile: string;
//   peFile: string;
//   ceStrike: number;
//   peStrike: number;
// }

// // Google Drive interfaces
// interface GoogleDriveFile {
//   name: string;
//   id: string;
//   content: string;
//   size?: number;
//   lastUpdated?: string;
// }

// interface GoogleDriveFolder {
//   name: string;
//   id: string;
//   files: GoogleDriveFile[];
// }

// interface GoogleDriveData {
//   success: boolean;
//   mainFolderName: string;
//   mainFolderId: string;
//   folders: GoogleDriveFolder[];
//   files: GoogleDriveFile[];
//   summary: {
//     totalFolders: number;
//     totalFiles: number;
//   };
// }

// // Custom Calendar icon component
// const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg
//     {...props}
//     xmlns="http://www.w3.org/2000/svg"
//     width="24"
//     height="24"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//     <line x1="16" y1="2" x2="16" y2="6"></line>
//     <line x1="8" y1="2" x2="8" y2="6"></line>
//     <line x1="3" y1="10" x2="21" y2="10"></line>
//   </svg>
// );

// // Folder Tree Component for Google Drive
// const FolderTree: React.FC<{
//   data: GoogleDriveData;
//   onSelectFiles: (files: { content: string; name: string }[]) => void;
//   isProcessing: boolean;
// }> = ({ data, onSelectFiles, isProcessing }) => {
//   const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
//     new Set(),
//   );
//   const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
//   const [loading, setLoading] = useState(false);

//   const toggleFolder = (folderId: string) => {
//     setExpandedFolders((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(folderId)) {
//         newSet.delete(folderId);
//       } else {
//         newSet.add(folderId);
//       }
//       return newSet;
//     });
//   };

//   const toggleFile = (fileId: string) => {
//     setSelectedFiles((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(fileId)) {
//         newSet.delete(fileId);
//       } else {
//         newSet.add(fileId);
//       }
//       return newSet;
//     });
//   };

//   const selectAllInFolder = (
//     folderFiles: GoogleDriveFile[],
//     checked: boolean,
//   ) => {
//     setSelectedFiles((prev) => {
//       const newSet = new Set(prev);
//       folderFiles.forEach((file) => {
//         if (checked) {
//           newSet.add(file.id);
//         } else {
//           newSet.delete(file.id);
//         }
//       });
//       return newSet;
//     });
//   };

//   const loadSelectedFiles = async () => {
//     setLoading(true);
//     try {
//       const allFiles: { content: string; name: string }[] = [];

//       data.files.forEach((file) => {
//         if (selectedFiles.has(file.id)) {
//           allFiles.push({
//             content: file.content,
//             name: file.name,
//           });
//         }
//       });

//       data.folders.forEach((folder) => {
//         folder.files.forEach((file) => {
//           if (selectedFiles.has(file.id)) {
//             allFiles.push({
//               content: file.content,
//               name: `${folder.name}/${file.name}`,
//             });
//           }
//         });
//       });

//       onSelectFiles(allFiles);
//     } catch (error) {
//       console.error("Error loading files:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getSelectedCount = () => selectedFiles.size;
//   const getTotalFiles = () =>
//     data.files.length +
//     data.folders.reduce((acc, f) => acc + f.files.length, 0);

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-4">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <Folder className="w-5 h-5 text-blue-600" />
//           <h3 className="font-semibold text-gray-900">{data.mainFolderName}</h3>
//           <span className="text-xs text-gray-500">
//             ({getTotalFiles()} files, {data.summary.totalFolders} folders)
//           </span>
//         </div>
//         <button
//           onClick={loadSelectedFiles}
//           disabled={getSelectedCount() === 0 || loading || isProcessing}
//           className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             getSelectedCount() > 0 && !loading && !isProcessing
//               ? "bg-green-600 hover:bg-green-700 text-white"
//               : "bg-gray-100 text-gray-400 cursor-not-allowed"
//           }`}
//         >
//           {loading ? (
//             <Loader className="w-4 h-4 animate-spin" />
//           ) : (
//             `Load Selected (${getSelectedCount()})`
//           )}
//         </button>
//       </div>

//       <div className="space-y-2 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-3">
//         {data.files.length > 0 && (
//           <div className="mb-2">
//             <div className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded">
//               <Folder className="w-4 h-4 text-gray-600" />
//               <span className="text-sm font-medium text-gray-700">
//                 Main Folder
//               </span>
//               <span className="text-xs text-gray-500">
//                 ({data.files.length} files)
//               </span>
//               <button
//                 onClick={() => {
//                   const allChecked = data.files.every((f) =>
//                     selectedFiles.has(f.id),
//                   );
//                   selectAllInFolder(data.files, !allChecked);
//                 }}
//                 className="ml-auto text-xs text-blue-600 hover:text-blue-700"
//               >
//                 {data.files.every((f) => selectedFiles.has(f.id))
//                   ? "Deselect All"
//                   : "Select All"}
//               </button>
//             </div>
//             <div className="ml-4 space-y-1 mt-1">
//               {data.files.map((file) => (
//                 <div
//                   key={file.id}
//                   className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={selectedFiles.has(file.id)}
//                     onChange={() => toggleFile(file.id)}
//                     className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                   />
//                   <FileText className="w-4 h-4 text-gray-400" />
//                   <span className="text-sm text-gray-700 flex-1">
//                     {file.name}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {data.folders.map((folder) => (
//           <div key={folder.id} className="mb-2">
//             <div
//               className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
//               onClick={() => toggleFolder(folder.id)}
//             >
//               {expandedFolders.has(folder.id) ? (
//                 <ChevronDown className="w-4 h-4 text-gray-600" />
//               ) : (
//                 <ChevronRight className="w-4 h-4 text-gray-600" />
//               )}
//               <Folder className="w-4 h-4 text-yellow-600" />
//               <span className="text-sm font-medium text-gray-700">
//                 {folder.name}
//               </span>
//               <span className="text-xs text-gray-500">
//                 ({folder.files.length} files)
//               </span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   const allChecked = folder.files.every((f) =>
//                     selectedFiles.has(f.id),
//                   );
//                   selectAllInFolder(folder.files, !allChecked);
//                 }}
//                 className="ml-auto text-xs text-blue-600 hover:text-blue-700"
//               >
//                 {folder.files.every((f) => selectedFiles.has(f.id))
//                   ? "Deselect All"
//                   : "Select All"}
//               </button>
//             </div>

//             {expandedFolders.has(folder.id) && (
//               <div className="ml-6 space-y-1 mt-1">
//                 {folder.files.map((file) => (
//                   <div
//                     key={file.id}
//                     className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded"
//                   >
//                     <input
//                       type="checkbox"
//                       checked={selectedFiles.has(file.id)}
//                       onChange={() => toggleFile(file.id)}
//                       className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                     />
//                     <FileText className="w-4 h-4 text-gray-400" />
//                     <span className="text-sm text-gray-700 flex-1">
//                       {file.name}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const MinuteAnalysisAllInOne: React.FC = () => {
//   // State management
//   const [files, setFiles] = useState<FileAnalysis[]>([]);
//   const [analyses, setAnalyses] = useState<Map<string, CEPE_MinuteAnalysis>>(
//     new Map(),
//   );
//   const [selectedDate, setSelectedDate] = useState<string>("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [dragActive, setDragActive] = useState(false);
//   const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
//   const [activeCard, setActiveCard] = useState<"cumulative" | "thirtyPoint">(
//     "cumulative",
//   );
//   const [exportProgress, setExportProgress] = useState<number>(0);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Google Drive state
//   const [showDrivePicker, setShowDrivePicker] = useState(false);
//   const [driveData, setDriveData] = useState<GoogleDriveData | null>(null);
//   const [isLoadingDrive, setIsLoadingDrive] = useState(false);

//   // Your Apps Script URL
//   const APPS_SCRIPT_URL =
//     "https://script.google.com/macros/s/AKfycbz9khyBjTjf79WNHN6lo1N2BzjasBnu_vyC8auisy4mctlPRuIpO6uaDTIeo2-e0P6_/exec";

//   // Get current analysis based on selected date
//   const currentAnalysis = useMemo(() => {
//     if (!selectedDate) return null;
//     return analyses.get(selectedDate) || null;
//   }, [analyses, selectedDate]);

//   // Get available dates for dropdown
//   const availableDates = useMemo<DateOption[]>(() => {
//     const dates: DateOption[] = [];
//     analyses.forEach((analysis, date) => {
//       const ceShortName =
//         analysis.ceFileName.length > 30
//           ? analysis.ceFileName.substring(0, 20) + "..."
//           : analysis.ceFileName;
//       const peShortName =
//         analysis.peFileName.length > 30
//           ? analysis.peFileName.substring(0, 20) + "..."
//           : analysis.peFileName;

//       dates.push({
//         date,
//         // display: `${date} | CE:${analysis.ceStrikePrice} (${ceShortName}) vs PE:${analysis.peStrikePrice} (${peShortName})`,
//         display: `${date} |  ${ceShortName?.split("_")?.[1]} vs ${peShortName?.split("_")?.[1]}`,
//         ceFile: analysis.ceFileName,
//         peFile: analysis.peFileName,
//         ceStrike: analysis.ceStrikePrice,
//         peStrike: analysis.peStrikePrice,
//       });
//     });
//     return dates.sort((a, b) => b.date.localeCompare(a.date));
//   }, [analyses]);

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

//       // Detect option type from filename
//       let optionType: "CE" | "PE" | undefined;
//       const fileNameUpper = fileName.toUpperCase();
//       if (fileNameUpper.includes("CE") && !fileNameUpper.includes("PEACE")) {
//         optionType = "CE";
//       } else if (fileNameUpper.includes("PE")) {
//         optionType = "PE";
//       }

//       // Extract strike price
//       let strikePrice: number | undefined;
//       const strikeMatch = fileName.match(/(\d+)/g);
//       if (strikeMatch && strikeMatch.length > 0) {
//         const possibleStrikes = strikeMatch
//           .map(Number)
//           .filter((n) => n > 1000 && n < 100000);
//         if (possibleStrikes.length > 0) {
//           strikePrice = possibleStrikes[0];
//         }
//       }

//       // Find column indices
//       const openIndex = headers.findIndex((h) => h === "open" || h === "o");
//       const highIndex = headers.findIndex((h) => h === "high" || h === "h");
//       const lowIndex = headers.findIndex((h) => h === "low" || h === "l");
//       const closeIndex = headers.findIndex((h) => h === "close" || h === "c");
//       const volumeIndex = headers.findIndex(
//         (h) => h === "volume" || h === "vol" || h === "volumne",
//       );
//       const oiIndex = headers.findIndex(
//         (h) =>
//           h === "oi" ||
//           h === "open interest" ||
//           h === "openinterest" ||
//           h === "open_int",
//       );
//       const dateIndex = headers.findIndex(
//         (h) => h === "date" || h === "datetime" || h === "timestamp",
//       );
//       const timeIndex = headers.findIndex((h) => h === "time");

//       let prevClose: number | null = null;

//       for (let i = 1; i < lines.length; i++) {
//         const line = lines[i].trim();
//         if (!line) continue;

//         const values = line
//           .split(delimiter)
//           .map((v) => v.trim().replace(/"/g, ""));

//         const getValue = (
//           index: number,
//           defaultValue: number | string = 0,
//         ): string => {
//           return index >= 0 && values[index] !== undefined
//             ? values[index]
//             : String(defaultValue);
//         };

//         let dateStr = "";
//         let timeStr = "09:15";

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

//         const open = parseFloat(getValue(openIndex, "0"));
//         const high = parseFloat(getValue(highIndex, "0"));
//         const low = parseFloat(getValue(lowIndex, "0"));
//         const close = parseFloat(getValue(closeIndex, "0"));
//         const volume = parseFloat(getValue(volumeIndex, "0"));
//         const oi = parseFloat(getValue(oiIndex, "0"));

//         if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
//           const bodySize = Math.abs(close - open);
//           const candleType: "Bullish" | "Bearish" | "Doji" =
//             close > open ? "Bullish" : close < open ? "Bearish" : "Doji";

//           const candleSize = high - low;

//           cumulativeVolume += volume;
//           cumulativeValue += ((open + high + low + close) / 4) * volume;
//           const vwap =
//             cumulativeVolume > 0 ? cumulativeValue / cumulativeVolume : close;

//           let returnPercent = 0;
//           if (prevClose !== null && prevClose !== 0) {
//             returnPercent = ((close - prevClose) / prevClose) * 100;
//           }
//           prevClose = close;

//           const minuteKey = `${dateStr}_${timeStr}`;

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
//             minuteKey,
//           });
//         }
//       }

//       return candleData;
//     },
//     [],
//   );

//   // Extract first hour data (9:15 to 10:15)
//   const extractFirstHourData = useCallback(
//     (data: CandleData[]): CandleData[] => {
//       return data.filter((candle) => {
//         const time = candle.time;
//         return time >= "09:15" && time <= "10:15";
//       });
//     },
//     [],
//   );

//   const calculateFileSummary = useCallback(
//     (data: CandleData[]): FileSummary | null => {
//       if (data.length === 0) return null;

//       const totalVolume = data.reduce((sum, candle) => sum + candle.volume, 0);
//       const totalOI = data.reduce((sum, candle) => sum + candle.oi, 0);
//       const avgBodySize =
//         data.reduce((sum, candle) => sum + candle.bodySize, 0) / data.length;
//       const avgVolume = totalVolume / data.length;
//       const avgOI = totalOI / data.length;
//       const maxVolume = Math.max(...data.map((c) => c.volume));
//       const maxOI = Math.max(...data.map((c) => c.oi));

//       const bullishCandles = data.filter(
//         (c) => c.candleType === "Bullish",
//       ).length;
//       const bearishCandles = data.filter(
//         (c) => c.candleType === "Bearish",
//       ).length;
//       const dojiCandles = data.filter((c) => c.candleType === "Doji").length;

//       const avgCandleSize =
//         data.reduce((sum, candle) => sum + candle.candleSize, 0) / data.length;

//       const returns = data.map((candle, index) => {
//         if (index === 0) return 0;
//         return (candle.close - data[index - 1].close) / data[index - 1].close;
//       });
//       const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
//       const volatility = Math.sqrt(
//         returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) /
//           returns.length,
//       );

//       const maxReturn = Math.max(...returns.map((r) => r * 100));
//       const minReturn = Math.min(...returns.map((r) => r * 100));

//       const volumeToOIRatio = avgVolume / (avgOI || 1);

//       return {
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
//         totalCandles: data.length,
//         avgCandleSize,
//         volatility,
//         volumeToOIRatio,
//         avgReturn: avgReturn * 100,
//         maxReturn,
//         minReturn,
//       };
//     },
//     [],
//   );

//   const calculateFirstHourSummary = useCallback(
//     (data: CandleData[]): FirstHourSummary | null => {
//       if (data.length === 0) return null;

//       const totalVolume = data.reduce((sum, candle) => sum + candle.volume, 0);
//       const totalOI = data.reduce((sum, candle) => sum + candle.oi, 0);
//       const avgBodySize =
//         data.reduce((sum, candle) => sum + candle.bodySize, 0) / data.length;
//       const avgVolume = totalVolume / data.length;
//       const avgOI = totalOI / data.length;

//       const bullishCandles = data.filter(
//         (c) => c.candleType === "Bullish",
//       ).length;
//       const bearishCandles = data.filter(
//         (c) => c.candleType === "Bearish",
//       ).length;
//       const dojiCandles = data.filter((c) => c.candleType === "Doji").length;

//       const avgCandleSize =
//         data.reduce((sum, candle) => sum + candle.candleSize, 0) / data.length;

//       const returns = data.map((candle, index) => {
//         if (index === 0) return 0;
//         return (candle.close - data[index - 1].close) / data[index - 1].close;
//       });
//       const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

//       const volumeToOIRatio = avgVolume / (avgOI || 1);

//       return {
//         totalVolume,
//         totalOI,
//         avgBodySize,
//         avgVolume,
//         avgOI,
//         bullishCandles,
//         bearishCandles,
//         dojiCandles,
//         totalCandles: data.length,
//         avgCandleSize,
//         avgReturn: avgReturn * 100,
//         volumeToOIRatio,
//       };
//     },
//     [],
//   );

//   // Perform minute-by-minute CE vs PE comparison
//   const calculateCEPE_MinuteAnalysis = useCallback(
//     (ceFile: FileAnalysis, peFile: FileAnalysis, date: string) => {
//       const ceCandles = ceFile.firstHourData;
//       const peCandles = peFile.firstHourData;

//       if (ceCandles.length === 0 || peCandles.length === 0) return null;

//       const ceByMinute = new Map<string, CandleData>();
//       const peByMinute = new Map<string, CandleData>();

//       ceCandles.forEach((candle) => {
//         ceByMinute.set(candle.time, candle);
//       });

//       peCandles.forEach((candle) => {
//         peByMinute.set(candle.time, candle);
//       });

//       const allMinutes = new Set([...ceByMinute.keys(), ...peByMinute.keys()]);
//       const sortedMinutes = Array.from(allMinutes).sort();

//       const minuteComparisons: MinuteComparison[] = [];
//       let ceTotalVolume = 0;
//       let peTotalVolume = 0;
//       let ceTotalOI = 0;
//       let peTotalOI = 0;
//       let ceTotalVolumeToOIRatio = 0;
//       let peTotalVolumeToOIRatio = 0;
//       let ceBullishMinutes = 0;
//       let ceBearishMinutes = 0;
//       let peBullishMinutes = 0;
//       let peBearishMinutes = 0;
//       let minutesWithCEHigherVolume = 0;
//       let minutesWithPEHigherVolume = 0;
//       let minutesWithCEHigherOI = 0;
//       let minutesWithPEHigherOI = 0;
//       let minutesWithCEHigherVolumeToOIRatio = 0;
//       let minutesWithPEHigherVolumeToOIRatio = 0;
//       let ceWins = 0;
//       let peWins = 0;
//       let directionAgreement = 0;
//       let ceReturnSum = 0;
//       let peReturnSum = 0;
//       let bestCEMinute: MinuteComparison | null = null;
//       let bestPEMinute: MinuteComparison | null = null;
//       let highestVolumeMinute: MinuteComparison | null = null;
//       let highestVolume = 0;

//       sortedMinutes.forEach((time) => {
//         const ceCandle = ceByMinute.get(time);
//         const peCandle = peByMinute.get(time);

//         if (!ceCandle && !peCandle) return;

//         const defaultCandle: CandleData = {
//           date,
//           time,
//           open: 0,
//           high: 0,
//           low: 0,
//           close: 0,
//           volume: 0,
//           oi: 0,
//           bodySize: 0,
//           candleType: "Doji",
//           fileName: "",
//           minuteNumber: parseInt(time.split(":")[1]) || 0,
//           candleSize: 0,
//           returnPercent: 0,
//           timestamp: `${date} ${time}`,
//         };

//         const ceData = ceCandle || { ...defaultCandle, optionType: "CE" };
//         const peData = peCandle || { ...defaultCandle, optionType: "PE" };

//         const ceVolumeToOIRatio = ceData.oi > 0 ? ceData.volume / ceData.oi : 0;
//         const peVolumeToOIRatio = peData.oi > 0 ? peData.volume / peData.oi : 0;

//         const volumeDifference = ceData.volume - peData.volume;
//         const volumeRatio =
//           peData.volume > 0
//             ? ceData.volume / peData.volume
//             : ceData.volume > 0
//               ? Infinity
//               : 0;
//         const oiDifference = ceData.oi - peData.oi;
//         const oiRatio =
//           peData.oi > 0 ? ceData.oi / peData.oi : ceData.oi > 0 ? Infinity : 0;
//         const volumeToOIRatioDifference = ceVolumeToOIRatio - peVolumeToOIRatio;
//         const returnDifference =
//           (ceData.returnPercent || 0) - (peData.returnPercent || 0);
//         const bodySizeDifference =
//           (ceData.bodySize || 0) - (peData.bodySize || 0);

//         let candleComparison: string;
//         if (
//           ceData.candleType === "Bullish" &&
//           peData.candleType === "Bullish"
//         ) {
//           candleComparison = "Both_Bullish";
//         } else if (
//           ceData.candleType === "Bearish" &&
//           peData.candleType === "Bearish"
//         ) {
//           candleComparison = "Both_Bearish";
//         } else if (
//           ceData.candleType === "Doji" &&
//           peData.candleType === "Doji"
//         ) {
//           candleComparison = "Both_Doji";
//         } else if (
//           ceData.candleType === "Bullish" &&
//           peData.candleType !== "Bullish"
//         ) {
//           candleComparison = "CE_Bullish";
//         } else if (
//           ceData.candleType === "Bearish" &&
//           peData.candleType !== "Bearish"
//         ) {
//           candleComparison = "CE_Bearish";
//         } else if (
//           peData.candleType === "Bullish" &&
//           ceData.candleType !== "Bullish"
//         ) {
//           candleComparison = "PE_Bullish";
//         } else if (
//           peData.candleType === "Bearish" &&
//           ceData.candleType !== "Bearish"
//         ) {
//           candleComparison = "PE_Bearish";
//         } else {
//           candleComparison = "Mixed";
//         }

//         const ceWon = ceData.returnPercent > peData.returnPercent;

//         const sameDirection =
//           (ceData.returnPercent > 0 && peData.returnPercent > 0) ||
//           (ceData.returnPercent < 0 && peData.returnPercent < 0) ||
//           (ceData.returnPercent === 0 && peData.returnPercent === 0);

//         const comparison: MinuteComparison = {
//           date,
//           time,
//           minuteNumber: parseInt(time.split(":")[1]) || 0,
//           ceData: {
//             open: ceData.open,
//             high: ceData.high,
//             low: ceData.low,
//             close: ceData.close,
//             volume: ceData.volume,
//             oi: ceData.oi,
//             candleType: ceData.candleType,
//             returnPercent: ceData.returnPercent,
//             bodySize: ceData.bodySize,
//             volumeToOIRatio: ceVolumeToOIRatio,
//           },
//           peData: {
//             open: peData.open,
//             high: peData.high,
//             low: peData.low,
//             close: peData.close,
//             volume: peData.volume,
//             oi: peData.oi,
//             candleType: peData.candleType,
//             returnPercent: peData.returnPercent,
//             bodySize: peData.bodySize,
//             volumeToOIRatio: peVolumeToOIRatio,
//           },
//           comparison: {
//             volumeDifference,
//             volumeRatio,
//             oiDifference,
//             oiRatio,
//             volumeToOIRatioDifference,
//             candleComparison,
//             returnDifference,
//             bodySizeDifference,
//             ceWon,
//             directionAgreement: sameDirection,
//           },
//         };

//         minuteComparisons.push(comparison);

//         ceTotalVolume += ceData.volume;
//         peTotalVolume += peData.volume;
//         ceTotalOI += ceData.oi;
//         peTotalOI += peData.oi;
//         ceTotalVolumeToOIRatio += ceVolumeToOIRatio;
//         peTotalVolumeToOIRatio += peVolumeToOIRatio;

//         if (ceData.candleType === "Bullish") ceBullishMinutes++;
//         if (ceData.candleType === "Bearish") ceBearishMinutes++;
//         if (peData.candleType === "Bullish") peBullishMinutes++;
//         if (peData.candleType === "Bearish") peBearishMinutes++;

//         if (ceData.volume > peData.volume) minutesWithCEHigherVolume++;
//         else if (peData.volume > ceData.volume) minutesWithPEHigherVolume++;

//         if (ceData.oi > peData.oi) minutesWithCEHigherOI++;
//         else if (peData.oi > ceData.oi) minutesWithPEHigherOI++;

//         if (ceVolumeToOIRatio > peVolumeToOIRatio)
//           minutesWithCEHigherVolumeToOIRatio++;
//         else if (peVolumeToOIRatio > ceVolumeToOIRatio)
//           minutesWithPEHigherVolumeToOIRatio++;

//         if (ceWon) ceWins++;
//         else peWins++;

//         if (sameDirection) directionAgreement++;

//         ceReturnSum += ceData.returnPercent;
//         peReturnSum += peData.returnPercent;

//         if (
//           !bestCEMinute ||
//           ceData.returnPercent >
//             (bestCEMinute?.ceData.returnPercent || -Infinity)
//         ) {
//           bestCEMinute = comparison;
//         }
//         if (
//           !bestPEMinute ||
//           peData.returnPercent >
//             (bestPEMinute?.peData.returnPercent || -Infinity)
//         ) {
//           bestPEMinute = comparison;
//         }

//         const totalVolume = ceData.volume + peData.volume;
//         if (totalVolume > highestVolume) {
//           highestVolume = totalVolume;
//           highestVolumeMinute = comparison;
//         }
//       });

//       return {
//         date,
//         ceFileName: ceFile.name,
//         peFileName: peFile.name,
//         ceStrikePrice: ceFile.data[0]?.strikePrice || 0,
//         peStrikePrice: peFile.data[0]?.strikePrice || 0,
//         minuteComparisons,
//         summary: {
//           totalMinutes: minuteComparisons.length,
//           ceTotalVolume,
//           peTotalVolume,
//           ceTotalOI,
//           peTotalOI,
//           ceAvgVolumeToOIRatio:
//             minuteComparisons.length > 0
//               ? ceTotalVolumeToOIRatio / minuteComparisons.length
//               : 0,
//           peAvgVolumeToOIRatio:
//             minuteComparisons.length > 0
//               ? peTotalVolumeToOIRatio / minuteComparisons.length
//               : 0,
//           ceBullishMinutes,
//           ceBearishMinutes,
//           peBullishMinutes,
//           peBearishMinutes,
//           minutesWithCEHigherVolume,
//           minutesWithPEHigherVolume,
//           minutesWithCEHigherOI,
//           minutesWithPEHigherOI,
//           minutesWithCEHigherVolumeToOIRatio,
//           minutesWithPEHigherVolumeToOIRatio,
//           ceAverageReturn:
//             minuteComparisons.length > 0
//               ? ceReturnSum / minuteComparisons.length
//               : 0,
//           peAverageReturn:
//             minuteComparisons.length > 0
//               ? peReturnSum / minuteComparisons.length
//               : 0,
//           ceWins,
//           peWins,
//           directionAgreement,
//           bestCEMinute,
//           bestPEMinute,
//           highestVolumeMinute,
//         },
//       };
//     },
//     [],
//   );

//   const processFiles = useCallback(
//     (allFiles: FileAnalysis[]) => {
//       const fileGroups: { [key: string]: FileAnalysis[] } = {};

//       allFiles.forEach((file) => {
//         if (file.data.length > 0) {
//           const date = file.data[0].date;
//           if (!fileGroups[date]) {
//             fileGroups[date] = [];
//           }
//           fileGroups[date].push(file);
//         }
//       });

//       const newAnalyses = new Map<string, CEPE_MinuteAnalysis>();

//       for (const [date, dateFiles] of Object.entries(fileGroups)) {
//         const ceFile = dateFiles.find((f) => f.data[0]?.optionType === "CE");
//         const peFile = dateFiles.find((f) => f.data[0]?.optionType === "PE");

//         if (ceFile && peFile) {
//           const analysis = calculateCEPE_MinuteAnalysis(ceFile, peFile, date);
//           if (analysis) {
//             newAnalyses.set(date, analysis);
//           }
//         }
//       }

//       setAnalyses(newAnalyses);

//       if (newAnalyses.size > 0) {
//         const dates = Array.from(newAnalyses.keys()).sort();
//         setSelectedDate(dates[dates.length - 1]);
//       } else {
//         setSelectedDate("");
//       }
//     },
//     [calculateCEPE_MinuteAnalysis],
//   );

//   const handleFileUpload = useCallback(
//     async (fileList: File[]) => {
//       setIsProcessing(true);
//       const newFiles: FileAnalysis[] = [];

//       for (const file of fileList) {
//         try {
//           const text = await file.text();
//           const candleData = parseCSVContent(text, file.name);
//           const firstHourData = extractFirstHourData(candleData);

//           if (candleData.length > 0) {
//             const summary = calculateFileSummary(candleData);
//             const firstHourSummary = calculateFirstHourSummary(firstHourData);

//             if (summary && firstHourSummary) {
//               newFiles.push({
//                 id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
//                 name: file.name.replace(".csv", ""),
//                 data: candleData,
//                 firstHourData: firstHourData,
//                 summary,
//                 firstHourSummary,
//               });
//             }
//           }
//         } catch (error) {
//           console.error(`Error processing file ${file.name}:`, error);
//         }
//       }

//       const updatedFiles = [...files, ...newFiles];
//       setFiles(updatedFiles);

//       const newSelected = new Set(selectedFiles);
//       newFiles.forEach((file) => newSelected.add(file.id));
//       setSelectedFiles(newSelected);

//       processFiles(updatedFiles);
//       setIsProcessing(false);
//     },
//     [
//       files,
//       selectedFiles,
//       parseCSVContent,
//       calculateFileSummary,
//       calculateFirstHourSummary,
//       extractFirstHourData,
//       processFiles,
//     ],
//   );

//   // Google Drive functions
//   const fetchGoogleDriveStructure = useCallback(async () => {
//     setIsLoadingDrive(true);
//     try {
//       const response = await fetch(APPS_SCRIPT_URL);
//       const data = await response.json();

//       if (data.success) {
//         setDriveData(data);
//         setShowDrivePicker(true);
//       } else {
//         alert(
//           "Failed to load Google Drive files: " +
//             (data.error || "Unknown error"),
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching from Google Drive:", error);
//       alert(
//         "Failed to connect to Google Drive. Please check your Apps Script URL.",
//       );
//     } finally {
//       setIsLoadingDrive(false);
//     }
//   }, []);

//   const handleGoogleDriveFiles = useCallback(
//     async (files: { content: string; name: string }[]) => {
//       setIsProcessing(true);
//       const fileObjects = files.map(
//         (f) =>
//           new File([f.content], f.name.split("/").pop() || f.name, {
//             type: "text/csv",
//           }),
//       );
//       await handleFileUpload(fileObjects);
//       setShowDrivePicker(false);
//       setDriveData(null);
//     },
//     [handleFileUpload],
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
//       const newFiles = files.filter((file) => file.id !== id);
//       setFiles(newFiles);

//       const newSelected = new Set(selectedFiles);
//       newSelected.delete(id);
//       setSelectedFiles(newSelected);

//       if (newFiles.length > 0) {
//         processFiles(newFiles);
//       } else {
//         setAnalyses(new Map());
//         setSelectedDate("");
//       }
//     },
//     [files, selectedFiles, processFiles],
//   );

//   const clearAllFiles = useCallback(() => {
//     setFiles([]);
//     setSelectedFiles(new Set());
//     setAnalyses(new Map());
//     setSelectedDate("");
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

//   // Calculate cumulative data for 9:15 to 9:27
//   const cumulativeData = useMemo(() => {
//     if (!currentAnalysis) return null;

//     const startTime = "09:15";
//     const endTime = "09:27";

//     const relevantMinutes = currentAnalysis.minuteComparisons.filter(
//       (comp) => comp.time >= startTime && comp.time <= endTime,
//     );

//     if (relevantMinutes.length === 0) return null;

//     const firstMinute = relevantMinutes[0];
//     const lastMinute = relevantMinutes[relevantMinutes.length - 1];

//     const ceCumulativeVolume = relevantMinutes.reduce(
//       (sum, comp) => sum + comp.ceData.volume,
//       0,
//     );
//     const peCumulativeVolume = relevantMinutes.reduce(
//       (sum, comp) => sum + comp.peData.volume,
//       0,
//     );
//     const ceCumulativeOI = relevantMinutes.reduce(
//       (sum, comp) => sum + comp.ceData.oi,
//       0,
//     );
//     const peCumulativeOI = relevantMinutes.reduce(
//       (sum, comp) => sum + comp.peData.oi,
//       0,
//     );

//     const ceStartPrice = firstMinute.ceData.open;
//     const peStartPrice = firstMinute.peData.open;
//     const ceEndPrice = lastMinute.ceData.close;
//     const peEndPrice = lastMinute.peData.close;

//     const cePriceChange = ((ceEndPrice - ceStartPrice) / ceStartPrice) * 100;
//     const pePriceChange = ((peEndPrice - peStartPrice) / peStartPrice) * 100;

//     const volumeLeader = ceCumulativeVolume >= peCumulativeVolume ? "CE" : "PE";
//     const oiLeader = ceCumulativeOI >= peCumulativeOI ? "CE" : "PE";
//     const priceLeader = cePriceChange >= pePriceChange ? "CE" : "PE";

//     return {
//       timeRange: `${startTime} - ${endTime}`,
//       ceCumulativeVolume,
//       peCumulativeVolume,
//       ceCumulativeOI,
//       peCumulativeOI,
//       cePriceChange,
//       pePriceChange,
//       ceStartPrice,
//       peStartPrice,
//       ceEndPrice,
//       peEndPrice,
//       volumeLeader,
//       oiLeader,
//       priceLeader,
//     };
//   }, [currentAnalysis]);

//   // Calculate 30-point analysis from 9:30 onwards
//   const thirtyPointAnalysis: any = useMemo(() => {
//     if (!currentAnalysis) return null;

//     const startTime = "09:30";
//     const endTime = "10:15";
//     const targetPoints = 30;

//     const minutesFrom930 = currentAnalysis.minuteComparisons.filter(
//       (comp) => comp.time >= startTime && comp.time <= endTime,
//     );

//     if (minutesFrom930.length === 0) return null;

//     const firstMinute = minutesFrom930[0];
//     const ceStartPrice = firstMinute.ceData.open;
//     const peStartPrice = firstMinute.peData.open;

//     let ceReached = false;
//     let peReached = false;
//     let ceReachedAtTime: string | null = null;
//     let peReachedAtTime: string | null = null;
//     let ceMinutesToReach: number | null = null;
//     let peMinutesToReach: number | null = null;
//     let ceMaxPoints = 0;
//     let peMaxPoints = 0;
//     let ceMaxTime: string | null = null;
//     let peMaxTime: string | null = null;

//     minutesFrom930.forEach((comp, index) => {
//       const cePoints = comp.ceData.close - ceStartPrice;
//       if (!ceReached && cePoints >= targetPoints) {
//         ceReached = true;
//         ceReachedAtTime = comp.time;
//         ceMinutesToReach = index + 1;
//       }
//       if (cePoints > ceMaxPoints) {
//         ceMaxPoints = cePoints;
//         ceMaxTime = comp.time;
//       }

//       const pePoints = comp.peData.close - peStartPrice;
//       if (!peReached && pePoints >= targetPoints) {
//         peReached = true;
//         peReachedAtTime = comp.time;
//         peMinutesToReach = index + 1;
//       }
//       if (pePoints > peMaxPoints) {
//         peMaxPoints = pePoints;
//         peMaxTime = comp.time;
//       }
//     });

//     const reachedBy =
//       ceReached && peReached
//         ? "Both"
//         : ceReached
//           ? "CE"
//           : peReached
//             ? "PE"
//             : "None";

//     let firstToReach: "CE" | "PE" | null = null;
//     if (ceReached && peReached) {
//       if (ceReachedAtTime && peReachedAtTime) {
//         firstToReach =
//           ceReachedAtTime < peReachedAtTime
//             ? "CE"
//             : peReachedAtTime < ceReachedAtTime
//               ? "PE"
//               : null;
//       }
//     } else if (ceReached) {
//       firstToReach = "CE";
//     } else if (peReached) {
//       firstToReach = "PE";
//     }

//     return {
//       reachedBy,
//       firstToReach,
//       ceReached,
//       peReached,
//       ceReachedAtTime,
//       peReachedAtTime,
//       ceMinutesToReach,
//       peMinutesToReach,
//       ceMaxPoints,
//       peMaxPoints,
//       ceMaxTime,
//       peMaxTime,
//     };
//   }, [currentAnalysis]);

//   const formatCompactNumber = (num: number): string => {
//     if (num >= 10000000) {
//       return (num / 10000000).toFixed(2) + "Cr";
//     }
//     if (num >= 100000) {
//       return (num / 100000).toFixed(2) + "L";
//     }
//     if (num >= 1000) {
//       return (num / 1000).toFixed(1) + "K";
//     }
//     return num.toString();
//   };

//   const formatRatio = (num: number): string => {
//     return num.toFixed(2);
//   };

//   const getCandleComparisonColor = (type: string): string => {
//     switch (type) {
//       case "CE_Bullish":
//       case "Both_Bullish":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "PE_Bullish":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "CE_Bearish":
//       case "Both_Bearish":
//         return "bg-red-100 text-red-800 border-red-200";
//       case "PE_Bearish":
//         return "bg-orange-100 text-orange-800 border-orange-200";
//       case "Both_Doji":
//         return "bg-gray-100 text-gray-800 border-gray-200";
//       default:
//         return "bg-purple-100 text-purple-800 border-purple-200";
//     }
//   };

//   // Export functions
//   const exportMinuteAnalysisCSV = useCallback(() => {
//     if (!currentAnalysis) return;

//     setExportProgress(0);

//     const headers = [
//       "Date",
//       "Time",
//       "Minute",
//       "CE Open",
//       "CE High",
//       "CE Low",
//       "CE Close",
//       "CE Volume",
//       "CE OI",
//       "CE Vol/OI",
//       "CE Candle",
//       "CE Return %",
//       "PE Open",
//       "PE High",
//       "PE Low",
//       "PE Close",
//       "PE Volume",
//       "PE OI",
//       "PE Vol/OI",
//       "PE Candle",
//       "PE Return %",
//       "Vol Diff",
//       "Vol Ratio",
//       "OI Diff",
//       "OI Ratio",
//       "Vol/OI Diff",
//       "Return Diff %",
//       "Candle Comparison",
//       "CE Won",
//       "Direction Agreement",
//     ];

//     const rows = [headers.join(",")];

//     currentAnalysis.minuteComparisons.forEach((comp, index) => {
//       const row = [
//         comp.date,
//         comp.time,
//         comp.minuteNumber,
//         comp.ceData.open.toFixed(2),
//         comp.ceData.high.toFixed(2),
//         comp.ceData.low.toFixed(2),
//         comp.ceData.close.toFixed(2),
//         comp.ceData.volume,
//         comp.ceData.oi,
//         comp.ceData.volumeToOIRatio.toFixed(2),
//         comp.ceData.candleType,
//         comp.ceData.returnPercent.toFixed(2),
//         comp.peData.open.toFixed(2),
//         comp.peData.high.toFixed(2),
//         comp.peData.low.toFixed(2),
//         comp.peData.close.toFixed(2),
//         comp.peData.volume,
//         comp.peData.oi,
//         comp.peData.volumeToOIRatio.toFixed(2),
//         comp.peData.candleType,
//         comp.peData.returnPercent.toFixed(2),
//         comp.comparison.volumeDifference,
//         comp.comparison.volumeRatio.toFixed(2),
//         comp.comparison.oiDifference,
//         comp.comparison.oiRatio.toFixed(2),
//         comp.comparison.volumeToOIRatioDifference.toFixed(2),
//         comp.comparison.returnDifference.toFixed(2),
//         comp.comparison.candleComparison,
//         comp.comparison.ceWon ? "Yes" : "No",
//         comp.comparison.directionAgreement ? "Yes" : "No",
//       ].join(",");
//       rows.push(row);

//       setExportProgress(
//         Math.round(
//           ((index + 1) / currentAnalysis.minuteComparisons.length) * 100,
//         ),
//       );
//     });

//     const csvContent = rows.join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute(
//       "download",
//       `ce-pe-minute-analysis-${currentAnalysis.date}.csv`,
//     );
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     setTimeout(() => setExportProgress(0), 1000);
//   }, [currentAnalysis]);

//   const exportMinuteAnalysisExcel = useCallback(() => {
//     if (!currentAnalysis) return;

//     setExportProgress(0);

//     const wb = XLSX.utils.book_new();

//     const summaryData: (string | number)[][] = [
//       [
//         "Date",
//         "CE File",
//         "PE File",
//         "CE Strike",
//         "PE Strike",
//         "Total Minutes",
//         "CE Volume",
//         "PE Volume",
//         "CE OI",
//         "PE OI",
//         "CE Avg Vol/OI",
//         "PE Avg Vol/OI",
//         "CE Avg Return %",
//         "PE Avg Return %",
//         "CE Wins",
//         "PE Wins",
//         "Direction Agreement",
//         "Agreement %",
//         "CE Bullish",
//         "CE Bearish",
//         "PE Bullish",
//         "PE Bearish",
//         "CE Higher Vol",
//         "PE Higher Vol",
//         "CE Higher OI",
//         "PE Higher OI",
//         "CE Higher Vol/OI",
//         "PE Higher Vol/OI",
//       ],
//     ];

//     summaryData.push([
//       currentAnalysis.date,
//       currentAnalysis.ceFileName,
//       currentAnalysis.peFileName,
//       currentAnalysis.ceStrikePrice,
//       currentAnalysis.peStrikePrice,
//       currentAnalysis.summary.totalMinutes,
//       currentAnalysis.summary.ceTotalVolume,
//       currentAnalysis.summary.peTotalVolume,
//       currentAnalysis.summary.ceTotalOI,
//       currentAnalysis.summary.peTotalOI,
//       currentAnalysis.summary.ceAvgVolumeToOIRatio.toFixed(2),
//       currentAnalysis.summary.peAvgVolumeToOIRatio.toFixed(2),
//       currentAnalysis.summary.ceAverageReturn.toFixed(2),
//       currentAnalysis.summary.peAverageReturn.toFixed(2),
//       currentAnalysis.summary.ceWins,
//       currentAnalysis.summary.peWins,
//       currentAnalysis.summary.directionAgreement,
//       `${((currentAnalysis.summary.directionAgreement / currentAnalysis.summary.totalMinutes) * 100).toFixed(1)}%`,
//       currentAnalysis.summary.ceBullishMinutes,
//       currentAnalysis.summary.ceBearishMinutes,
//       currentAnalysis.summary.peBullishMinutes,
//       currentAnalysis.summary.peBearishMinutes,
//       currentAnalysis.summary.minutesWithCEHigherVolume,
//       currentAnalysis.summary.minutesWithPEHigherVolume,
//       currentAnalysis.summary.minutesWithCEHigherOI,
//       currentAnalysis.summary.minutesWithPEHigherOI,
//       currentAnalysis.summary.minutesWithCEHigherVolumeToOIRatio,
//       currentAnalysis.summary.minutesWithPEHigherVolumeToOIRatio,
//     ]);

//     const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
//     XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

//     const minuteData = currentAnalysis.minuteComparisons.map((comp) => [
//       comp.time,
//       comp.minuteNumber,
//       comp.ceData.open.toFixed(2),
//       comp.ceData.high.toFixed(2),
//       comp.ceData.low.toFixed(2),
//       comp.ceData.close.toFixed(2),
//       comp.ceData.volume,
//       comp.ceData.oi,
//       comp.ceData.volumeToOIRatio.toFixed(2),
//       comp.ceData.candleType,
//       comp.ceData.returnPercent.toFixed(2),
//       comp.ceData.bodySize.toFixed(2),
//       comp.peData.open.toFixed(2),
//       comp.peData.high.toFixed(2),
//       comp.peData.low.toFixed(2),
//       comp.peData.close.toFixed(2),
//       comp.peData.volume,
//       comp.peData.oi,
//       comp.peData.volumeToOIRatio.toFixed(2),
//       comp.peData.candleType,
//       comp.peData.returnPercent.toFixed(2),
//       comp.peData.bodySize.toFixed(2),
//       comp.comparison.volumeDifference,
//       comp.comparison.volumeRatio.toFixed(2),
//       comp.comparison.oiDifference,
//       comp.comparison.oiRatio.toFixed(2),
//       comp.comparison.volumeToOIRatioDifference.toFixed(2),
//       comp.comparison.returnDifference.toFixed(2),
//       comp.comparison.candleComparison,
//       comp.comparison.ceWon ? "Yes" : "No",
//       comp.comparison.directionAgreement ? "Yes" : "No",
//     ]);

//     const minuteHeaders = [
//       "Time",
//       "Minute",
//       "CE Open",
//       "CE High",
//       "CE Low",
//       "CE Close",
//       "CE Volume",
//       "CE OI",
//       "CE Vol/OI",
//       "CE Candle",
//       "CE Return %",
//       "CE Body Size",
//       "PE Open",
//       "PE High",
//       "PE Low",
//       "PE Close",
//       "PE Volume",
//       "PE OI",
//       "PE Vol/OI",
//       "PE Candle",
//       "PE Return %",
//       "PE Body Size",
//       "Vol Diff",
//       "Vol Ratio",
//       "OI Diff",
//       "OI Ratio",
//       "Vol/OI Diff",
//       "Return Diff %",
//       "Candle Comparison",
//       "CE Won",
//       "Direction Agreement",
//     ];

//     const wsMinute = XLSX.utils.aoa_to_sheet([minuteHeaders, ...minuteData]);
//     XLSX.utils.book_append_sheet(wb, wsMinute, "Minute Data");

//     XLSX.writeFile(wb, `ce-pe-minute-comparison-${currentAnalysis.date}.xlsx`);

//     setExportProgress(100);
//     setTimeout(() => setExportProgress(0), 1000);
//   }, [currentAnalysis]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {!files.length && (
//           <>
//             <header className="mb-8">
//               <h1 className="text-3xl font-bold text-gray-900">
//                 CE vs PE Minute-by-Minute Analyzer
//               </h1>
//               <p className="text-gray-600 mt-2">
//                 Upload CE and PE CSV files to analyze first hour data
//                 (9:15-10:15) minute by minute
//               </p>
//             </header>

//             {/* Upload Section */}
//             <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
//               <div className="text-center mb-6">
//                 <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
//                   <Upload className="w-8 h-8 text-blue-600" />
//                 </div>
//                 <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                   Upload CE & PE CSV Files
//                 </h2>
//                 <p className="text-gray-600">
//                   Upload multiple files - the system will automatically group
//                   them by date
//                 </p>
//               </div>

//               {/* Local Upload Area */}
//               <div
//                 className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all mb-6 ${
//                   dragActive
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-300 hover:border-gray-400"
//                 } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//                 onClick={() =>
//                   !isProcessing &&
//                   !showDrivePicker &&
//                   fileInputRef.current?.click()
//                 }
//               >
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   accept=".csv"
//                   onChange={handleFileInput}
//                   className="hidden"
//                   disabled={isProcessing}
//                 />

//                 {isProcessing ? (
//                   <div className="flex flex-col items-center">
//                     <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
//                     <p className="text-lg font-medium text-gray-700 mb-2">
//                       Processing Files...
//                     </p>
//                     <p className="text-gray-600">
//                       Please wait while we analyze your data
//                     </p>
//                   </div>
//                 ) : (
//                   <>
//                     <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <p className="text-lg font-semibold text-gray-900 mb-2">
//                       Drag & drop CSV files here
//                     </p>
//                     <p className="text-gray-600 mb-4">
//                       or click to browse files
//                     </p>
//                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
//                       <FileText className="w-4 h-4 text-gray-600" />
//                       <span className="text-sm text-gray-700">
//                         Supports multiple CSV files
//                       </span>
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Google Drive Section */}
//               <div className="mt-6">
//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-300"></div>
//                   </div>
//                   <div className="relative flex justify-center text-sm">
//                     <span className="px-4 bg-white text-gray-500">
//                       Or load from Google Drive
//                     </span>
//                   </div>
//                 </div>

//                 {!showDrivePicker ? (
//                   <div className="mt-6 text-center">
//                     <button
//                       onClick={fetchGoogleDriveStructure}
//                       disabled={isLoadingDrive || isProcessing}
//                       className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {isLoadingDrive ? (
//                         <>
//                           <Loader className="w-5 h-5 mr-2 animate-spin" />
//                           Loading Drive...
//                         </>
//                       ) : (
//                         <>
//                           <FolderOpen className="w-5 h-5 mr-2" />
//                           Browse Google Drive Folder
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="mt-6">
//                     {driveData && (
//                       <>
//                         <FolderTree
//                           data={driveData}
//                           onSelectFiles={handleGoogleDriveFiles}
//                           isProcessing={isProcessing}
//                         />
//                         <button
//                           onClick={() => {
//                             setShowDrivePicker(false);
//                             setDriveData(null);
//                           }}
//                           className="mt-4 text-sm text-gray-600 hover:text-gray-800"
//                         >
//                           ← Back to upload options
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* File Naming Requirements */}
//               <div className="bg-gray-50 rounded-xl p-4 mt-6">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-blue-600" />
//                   File Naming Requirements
//                 </h3>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
//                     <span className="text-gray-700">
//                       Include{" "}
//                       <span className="font-mono font-semibold">"CE"</span> in
//                       filename for Call options
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
//                     <span className="text-gray-700">
//                       Include{" "}
//                       <span className="font-mono font-semibold">"PE"</span> in
//                       filename for Put options
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
//                     <span className="text-gray-700">
//                       Files with same date will be automatically paired for
//                       comparison
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Analysis Section - Shows only when a date is selected */}
//         {currentAnalysis && (
//           <div className="space-y-6">
//             {/* Table Header with File Names */}
//             <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500 sticky top-0 z-50">
//               <div className="flex items-center justify-between flex-wrap gap-4">
//                 <div className="flex-1 flex items-center gap-3">
//                   {availableDates.length > 0 && (
//                     <div>
//                       <select
//                         value={selectedDate}
//                         onChange={(e) => setSelectedDate(e.target.value)}
//                         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         {availableDates.map((option) => (
//                           <option key={option.date} value={option.date}>
//                             {option.display}
//                           </option>
//                         ))}
//                       </select>
//                       {/* <div className="text-sm text-gray-500">
//                         {availableDates.length} comparison
//                         {availableDates.length > 1 ? "s" : ""} available
//                       </div> */}
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex gap-4 text-sm">
//                   <div className="bg-blue-50 px-4 py-2 rounded-lg">
//                     <span className="font-medium text-blue-700">CE File:</span>
//                     <span className="ml-2 text-gray-700">
//                       {currentAnalysis.ceFileName}
//                     </span>
//                   </div>
//                   <div className="bg-red-50 px-4 py-2 rounded-lg">
//                     <span className="font-medium text-red-700">PE File:</span>
//                     <span className="ml-2 text-gray-700">
//                       {currentAnalysis.peFileName}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Export Buttons */}
//             <div className="bg-white rounded-xl shadow-lg p-4 flex flex-wrap gap-3 justify-end !hidden">
//               <button
//                 onClick={exportMinuteAnalysisCSV}
//                 disabled={exportProgress > 0}
//                 className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
//                   exportProgress > 0
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-green-600 hover:bg-green-700 text-white"
//                 }`}
//               >
//                 {exportProgress > 0 ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     {exportProgress}%
//                   </>
//                 ) : (
//                   <>
//                     <FileDown className="w-4 h-4" />
//                     Export CSV
//                   </>
//                 )}
//               </button>
//               <button
//                 onClick={exportMinuteAnalysisExcel}
//                 disabled={exportProgress > 0}
//                 className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
//                   exportProgress > 0
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-blue-600 hover:bg-blue-700 text-white"
//                 }`}
//               >
//                 <Download className="w-4 h-4" />
//                 Export Excel
//               </button>
//             </div>

//             {/* Analysis Cards Toggle */}
//             <div className="flex gap-4">
//               <button
//                 onClick={() => setActiveCard("cumulative")}
//                 className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                   activeCard === "cumulative"
//                     ? "bg-blue-600 text-white"
//                     : "bg-white text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <BarChart3 className="w-4 h-4" />
//                 9:15-9:27 Cumulative Analysis
//               </button>
//               <button
//                 onClick={() => setActiveCard("thirtyPoint")}
//                 className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
//                   activeCard === "thirtyPoint"
//                     ? "bg-purple-600 text-white"
//                     : "bg-white text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <Target className="w-4 h-4" />
//                 30-Point Analysis (from 9:30)
//               </button>
//             </div>

//             {/* 9:15-9:27 Cumulative Card */}
//             {activeCard === "cumulative" && cumulativeData && (
//               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Clock className="w-5 h-5 text-blue-600" />
//                   First 12 Minutes Analysis (9:15 - 9:27)
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   {/* Volume Comparison */}
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
//                       <BarChart3 className="w-4 h-4" />
//                       Cumulative Volume
//                     </div>
//                     <div className="space-y-3">
//                       <div>
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-blue-600 font-medium">CE</span>
//                           <span className="font-semibold">
//                             {formatCompactNumber(
//                               cumulativeData.ceCumulativeVolume,
//                             )}
//                           </span>
//                         </div>
//                         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-blue-500"
//                             style={{
//                               width: `${(cumulativeData.ceCumulativeVolume / (cumulativeData.ceCumulativeVolume + cumulativeData.peCumulativeVolume)) * 100}%`,
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-red-600 font-medium">PE</span>
//                           <span className="font-semibold">
//                             {formatCompactNumber(
//                               cumulativeData.peCumulativeVolume,
//                             )}
//                           </span>
//                         </div>
//                         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-red-500"
//                             style={{
//                               width: `${(cumulativeData.peCumulativeVolume / (cumulativeData.ceCumulativeVolume + cumulativeData.peCumulativeVolume)) * 100}%`,
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div className="pt-2 border-t border-gray-100">
//                         <span className="text-sm text-gray-600">Leader: </span>
//                         <span
//                           className={`font-semibold ${
//                             cumulativeData.volumeLeader === "CE"
//                               ? "text-blue-600"
//                               : cumulativeData.volumeLeader === "PE"
//                                 ? "text-red-600"
//                                 : "text-gray-600"
//                           }`}
//                         >
//                           {cumulativeData.volumeLeader}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* OI Comparison */}
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
//                       <Activity className="w-4 h-4" />
//                       Cumulative OI
//                     </div>
//                     <div className="space-y-3">
//                       <div>
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-blue-600 font-medium">CE</span>
//                           <span className="font-semibold">
//                             {formatCompactNumber(cumulativeData.ceCumulativeOI)}
//                           </span>
//                         </div>
//                         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-blue-500"
//                             style={{
//                               width: `${(cumulativeData.ceCumulativeOI / (cumulativeData.ceCumulativeOI + cumulativeData.peCumulativeOI)) * 100}%`,
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex justify-between text-sm mb-1">
//                           <span className="text-red-600 font-medium">PE</span>
//                           <span className="font-semibold">
//                             {formatCompactNumber(cumulativeData.peCumulativeOI)}
//                           </span>
//                         </div>
//                         <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                           <div
//                             className="h-full bg-red-500"
//                             style={{
//                               width: `${(cumulativeData.peCumulativeOI / (cumulativeData.ceCumulativeOI + cumulativeData.peCumulativeOI)) * 100}%`,
//                             }}
//                           ></div>
//                         </div>
//                       </div>
//                       <div className="pt-2 border-t border-gray-100">
//                         <span className="text-sm text-gray-600">Leader: </span>
//                         <span
//                           className={`font-semibold ${
//                             cumulativeData.oiLeader === "CE"
//                               ? "text-blue-600"
//                               : cumulativeData.oiLeader === "PE"
//                                 ? "text-red-600"
//                                 : "text-gray-600"
//                           }`}
//                         >
//                           {cumulativeData.oiLeader}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Price Movement */}
//                   <div className="bg-white rounded-lg p-4 shadow-sm">
//                     <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
//                       <TrendingUp className="w-4 h-4" />
//                       Price Change (%)
//                     </div>
//                     <div className="space-y-4">
//                       <div>
//                         <div className="flex justify-between items-center mb-1">
//                           <span className="text-blue-600 font-medium">CE</span>
//                           <span
//                             className={`font-semibold ${
//                               cumulativeData.cePriceChange >= 0
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {cumulativeData.cePriceChange >= 0 ? "+" : ""}
//                             {cumulativeData.cePriceChange.toFixed(2)}%
//                           </span>
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {cumulativeData.ceStartPrice.toFixed(1)} →{" "}
//                           {cumulativeData.ceEndPrice.toFixed(1)}
//                         </div>
//                       </div>
//                       <div>
//                         <div className="flex justify-between items-center mb-1">
//                           <span className="text-red-600 font-medium">PE</span>
//                           <span
//                             className={`font-semibold ${
//                               cumulativeData.pePriceChange >= 0
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {cumulativeData.pePriceChange >= 0 ? "+" : ""}
//                             {cumulativeData.pePriceChange.toFixed(2)}%
//                           </span>
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {cumulativeData.peStartPrice.toFixed(1)} →{" "}
//                           {cumulativeData.peEndPrice.toFixed(1)}
//                         </div>
//                       </div>
//                       <div className="pt-2 border-t border-gray-100">
//                         <span className="text-sm text-gray-600">
//                           Price Leader:{" "}
//                         </span>
//                         <span
//                           className={`font-semibold ${
//                             cumulativeData.priceLeader === "CE"
//                               ? "text-blue-600"
//                               : cumulativeData.priceLeader === "PE"
//                                 ? "text-red-600"
//                                 : "text-gray-600"
//                           }`}
//                         >
//                           {cumulativeData.priceLeader}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* 30-Point Analysis Card */}
//             {activeCard === "thirtyPoint" && thirtyPointAnalysis && (
//               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Target className="w-5 h-5 text-purple-600" />
//                   30-Point Movement Analysis (from 9:30 AM)
//                 </h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* CE Analysis */}
//                   <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500">
//                     <div className="flex items-center justify-between mb-4">
//                       <span className="text-lg font-semibold text-blue-700">
//                         Call Option (CE) - Strike{" "}
//                         {currentAnalysis.ceStrikePrice}
//                       </span>
//                       {thirtyPointAnalysis.ceReached && (
//                         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
//                           <Award className="w-3 h-3" />
//                           Target Reached
//                         </span>
//                       )}
//                     </div>

//                     <div className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-gray-600">Max Points:</span>
//                         <span className="font-bold text-lg text-blue-600">
//                           +{thirtyPointAnalysis.ceMaxPoints.toFixed(1)}
//                         </span>
//                       </div>

//                       {thirtyPointAnalysis.ceReached ? (
//                         <>
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-600">Reached at:</span>
//                             <span className="font-semibold">
//                               {thirtyPointAnalysis.ceReachedAtTime}
//                             </span>
//                           </div>
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-600">
//                               Minutes to reach:
//                             </span>
//                             <span className="font-semibold text-purple-600">
//                               {thirtyPointAnalysis.ceMinutesToReach} minutes
//                             </span>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="flex justify-between items-center">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="font-semibold text-orange-600">
//                             Not reached 30 points
//                           </span>
//                         </div>
//                       )}

//                       {thirtyPointAnalysis.ceMaxTime && (
//                         <div className="text-xs text-gray-500 mt-2">
//                           Max at {thirtyPointAnalysis.ceMaxTime}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* PE Analysis */}
//                   <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-500">
//                     <div className="flex items-center justify-between mb-4">
//                       <span className="text-lg font-semibold text-red-700">
//                         Put Option (PE) - Strike {currentAnalysis.peStrikePrice}
//                       </span>
//                       {thirtyPointAnalysis.peReached && (
//                         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
//                           <Award className="w-3 h-3" />
//                           Target Reached
//                         </span>
//                       )}
//                     </div>

//                     <div className="space-y-3">
//                       <div className="flex justify-between items-center">
//                         <span className="text-gray-600">Max Points:</span>
//                         <span className="font-bold text-lg text-red-600">
//                           +{thirtyPointAnalysis.peMaxPoints.toFixed(1)}
//                         </span>
//                       </div>

//                       {thirtyPointAnalysis.peReached ? (
//                         <>
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-600">Reached at:</span>
//                             <span className="font-semibold">
//                               {thirtyPointAnalysis.peReachedAtTime}
//                             </span>
//                           </div>
//                           <div className="flex justify-between items-center">
//                             <span className="text-gray-600">
//                               Minutes to reach:
//                             </span>
//                             <span className="font-semibold text-purple-600">
//                               {thirtyPointAnalysis.peMinutesToReach} minutes
//                             </span>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="flex justify-between items-center">
//                           <span className="text-gray-600">Status:</span>
//                           <span className="font-semibold text-orange-600">
//                             Not reached 30 points
//                           </span>
//                         </div>
//                       )}

//                       {thirtyPointAnalysis.peMaxTime && (
//                         <div className="text-xs text-gray-500 mt-2">
//                           Max at {thirtyPointAnalysis.peMaxTime}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Winner Section */}
//                   <div className="md:col-span-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 text-center">
//                     {thirtyPointAnalysis.firstToReach ? (
//                       <div className="flex items-center justify-center gap-3 flex-wrap">
//                         <span className="text-gray-700">
//                           First to reach 30 points:
//                         </span>
//                         <span
//                           className={`px-4 py-2 rounded-lg font-bold text-lg ${
//                             thirtyPointAnalysis.firstToReach === "CE"
//                               ? "bg-blue-600 text-white"
//                               : "bg-red-600 text-white"
//                           }`}
//                         >
//                           {thirtyPointAnalysis.firstToReach === "CE"
//                             ? "CE"
//                             : "PE"}
//                         </span>
//                         {thirtyPointAnalysis.firstToReach === "CE"
//                           ? thirtyPointAnalysis.ceReachedAtTime
//                           : thirtyPointAnalysis.peReachedAtTime && (
//                               <span className="text-gray-600">
//                                 at{" "}
//                                 {thirtyPointAnalysis.firstToReach === "CE"
//                                   ? thirtyPointAnalysis.ceReachedAtTime
//                                   : thirtyPointAnalysis.peReachedAtTime}
//                               </span>
//                             )}
//                       </div>
//                     ) : (
//                       <p className="text-gray-600">
//                         Neither CE nor PE reached 30 points by 10:15 AM
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Summary Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
//                 <div className="text-sm text-blue-600 font-medium mb-1">
//                   CE Performance
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {currentAnalysis.summary.ceWins} /{" "}
//                   {currentAnalysis.summary.totalMinutes}
//                 </div>
//                 <div className="text-xs text-gray-600 mt-1">
//                   Wins:{" "}
//                   {(
//                     (currentAnalysis.summary.ceWins /
//                       currentAnalysis.summary.totalMinutes) *
//                     100
//                   ).toFixed(1)}
//                   %
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
//                 <div className="text-sm text-red-600 font-medium mb-1">
//                   PE Performance
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {currentAnalysis.summary.peWins} /{" "}
//                   {currentAnalysis.summary.totalMinutes}
//                 </div>
//                 <div className="text-xs text-gray-600 mt-1">
//                   Wins:{" "}
//                   {(
//                     (currentAnalysis.summary.peWins /
//                       currentAnalysis.summary.totalMinutes) *
//                     100
//                   ).toFixed(1)}
//                   %
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
//                 <div className="text-sm text-purple-600 font-medium mb-1">
//                   Direction Agreement
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   {currentAnalysis.summary.directionAgreement} /{" "}
//                   {currentAnalysis.summary.totalMinutes}
//                 </div>
//                 <div className="text-xs text-gray-600 mt-1">
//                   {(
//                     (currentAnalysis.summary.directionAgreement /
//                       currentAnalysis.summary.totalMinutes) *
//                     100
//                   ).toFixed(1)}
//                   %
//                 </div>
//               </div>
//               <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
//                 <div className="text-sm text-green-600 font-medium mb-1">
//                   Avg Return Diff
//                 </div>
//                 <div
//                   className={`text-2xl font-bold ${
//                     currentAnalysis.summary.ceAverageReturn -
//                       currentAnalysis.summary.peAverageReturn >=
//                     0
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }`}
//                 >
//                   {(
//                     currentAnalysis.summary.ceAverageReturn -
//                     currentAnalysis.summary.peAverageReturn
//                   ).toFixed(2)}
//                   %
//                 </div>
//                 <div className="text-xs text-gray-600 mt-1">
//                   CE: {currentAnalysis.summary.ceAverageReturn.toFixed(2)}% |
//                   PE: {currentAnalysis.summary.peAverageReturn.toFixed(2)}%
//                 </div>
//               </div>
//             </div>

//             {/* Volume, OI & Ratio Summary */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <BarChart3 className="w-4 h-4" />
//                   Volume Analysis
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       CE Total Volume:
//                     </span>
//                     <span className="font-medium">
//                       {formatCompactNumber(
//                         currentAnalysis.summary.ceTotalVolume,
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       PE Total Volume:
//                     </span>
//                     <span className="font-medium">
//                       {formatCompactNumber(
//                         currentAnalysis.summary.peTotalVolume,
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       Minutes with CE Higher:
//                     </span>
//                     <span className="font-medium text-green-600">
//                       {currentAnalysis.summary.minutesWithCEHigherVolume}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       Minutes with PE Higher:
//                     </span>
//                     <span className="font-medium text-red-600">
//                       {currentAnalysis.summary.minutesWithPEHigherVolume}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <Activity className="w-4 h-4" />
//                   Open Interest Analysis
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">CE Total OI:</span>
//                     <span className="font-medium">
//                       {formatCompactNumber(currentAnalysis.summary.ceTotalOI)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">PE Total OI:</span>
//                     <span className="font-medium">
//                       {formatCompactNumber(currentAnalysis.summary.peTotalOI)}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       Minutes with CE Higher:
//                     </span>
//                     <span className="font-medium text-green-600">
//                       {currentAnalysis.summary.minutesWithCEHigherOI}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       Minutes with PE Higher:
//                     </span>
//                     <span className="font-medium text-red-600">
//                       {currentAnalysis.summary.minutesWithPEHigherOI}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 rounded-xl p-4">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <Scale className="w-4 h-4" />
//                   Volume/OI Ratio Analysis
//                 </h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       CE Avg Vol/OI:
//                     </span>
//                     <span className="font-medium">
//                       {formatRatio(
//                         currentAnalysis.summary.ceAvgVolumeToOIRatio,
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       PE Avg Vol/OI:
//                     </span>
//                     <span className="font-medium">
//                       {formatRatio(
//                         currentAnalysis.summary.peAvgVolumeToOIRatio,
//                       )}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       Minutes with CE Higher:
//                     </span>
//                     <span className="font-medium text-green-600">
//                       {
//                         currentAnalysis.summary
//                           .minutesWithCEHigherVolumeToOIRatio
//                       }
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-sm text-gray-600">
//                       Minutes with PE Higher:
//                     </span>
//                     <span className="font-medium text-red-600">
//                       {
//                         currentAnalysis.summary
//                           .minutesWithPEHigherVolumeToOIRatio
//                       }
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Minute-by-Minute Table */}
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Minute-by-Minute Comparison (Full 60 Minutes: 9:15-10:15)
//               </h3>
//               <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50 sticky top-0">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                         Time
//                       </th>
//                       <th
//                         colSpan={6}
//                         className="px-4 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider border-r border-l bg-gray-50"
//                       >
//                         CE Data ({currentAnalysis.ceFileName})
//                       </th>
//                       <th
//                         colSpan={6}
//                         className="px-4 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider bg-gray-50"
//                       >
//                         PE Data ({currentAnalysis.peFileName})
//                       </th>
//                       <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
//                         Comparison
//                       </th>
//                     </tr>
//                     <tr>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50"></th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         OHLC
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Volume
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         OI
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Vol/OI
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Type
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 border-r bg-gray-50">
//                         Return
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         OHLC
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Volume
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         OI
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Vol/OI
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Type
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Return
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
//                         Diff
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {currentAnalysis.minuteComparisons.map((comp, idx) => (
//                       <tr
//                         key={idx}
//                         className={`hover:bg-gray-50 ${comp.comparison.ceWon ? "bg-green-50/30" : "bg-red-50/30"}`}
//                       >
//                         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {comp.time}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="text-xs">
//                             <span className="font-medium">
//                               {comp.ceData.open.toFixed(1)}
//                             </span>{" "}
//                             →
//                             <span
//                               className={`font-semibold ml-1 ${
//                                 comp.ceData.candleType === "Bullish"
//                                   ? "text-green-600"
//                                   : comp.ceData.candleType === "Bearish"
//                                     ? "text-red-600"
//                                     : "text-gray-600"
//                               }`}
//                             >
//                               {comp.ceData.close.toFixed(1)}
//                             </span>
//                           </div>
//                           <div className="text-[10px] text-gray-500">
//                             H:{comp.ceData.high.toFixed(1)} L:
//                             {comp.ceData.low.toFixed(1)}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                           {formatCompactNumber(comp.ceData.volume)}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                           {formatCompactNumber(comp.ceData.oi)}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                           {formatRatio(comp.ceData.volumeToOIRatio)}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               comp.ceData.candleType === "Bullish"
//                                 ? "bg-green-100 text-green-800"
//                                 : comp.ceData.candleType === "Bearish"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-gray-100 text-gray-800"
//                             }`}
//                           >
//                             {comp.ceData.candleType}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm border-r">
//                           <span
//                             className={`font-medium ${
//                               comp.ceData.returnPercent >= 0
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {comp.ceData.returnPercent >= 0 ? "+" : ""}
//                             {comp.ceData.returnPercent.toFixed(2)}%
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="text-xs">
//                             <span className="font-medium">
//                               {comp.peData.open.toFixed(1)}
//                             </span>{" "}
//                             →
//                             <span
//                               className={`font-semibold ml-1 ${
//                                 comp.peData.candleType === "Bullish"
//                                   ? "text-green-600"
//                                   : comp.peData.candleType === "Bearish"
//                                     ? "text-red-600"
//                                     : "text-gray-600"
//                               }`}
//                             >
//                               {comp.peData.close.toFixed(1)}
//                             </span>
//                           </div>
//                           <div className="text-[10px] text-gray-500">
//                             H:{comp.peData.high.toFixed(1)} L:
//                             {comp.peData.low.toFixed(1)}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                           {formatCompactNumber(comp.peData.volume)}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                           {formatCompactNumber(comp.peData.oi)}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
//                           {formatRatio(comp.peData.volumeToOIRatio)}
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <span
//                             className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               comp.peData.candleType === "Bullish"
//                                 ? "bg-green-100 text-green-800"
//                                 : comp.peData.candleType === "Bearish"
//                                   ? "bg-red-100 text-red-800"
//                                   : "bg-gray-100 text-gray-800"
//                             }`}
//                           >
//                             {comp.peData.candleType}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap text-sm">
//                           <span
//                             className={`font-medium ${
//                               comp.peData.returnPercent >= 0
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {comp.peData.returnPercent >= 0 ? "+" : ""}
//                             {comp.peData.returnPercent.toFixed(2)}%
//                           </span>
//                         </td>
//                         <td className="px-4 py-3 whitespace-nowrap">
//                           <div className="space-y-1">
//                             <span
//                               className={`px-2 py-0.5 rounded text-xs font-medium ${getCandleComparisonColor(
//                                 comp.comparison.candleComparison,
//                               )}`}
//                             >
//                               {comp.comparison.candleComparison}
//                             </span>
//                             <div className="text-xs">
//                               <span className="text-gray-600">Vol: </span>
//                               <span
//                                 className={
//                                   comp.comparison.volumeDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }
//                               >
//                                 {comp.comparison.volumeDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {formatCompactNumber(
//                                   comp.comparison.volumeDifference,
//                                 )}
//                               </span>
//                             </div>
//                             <div className="text-xs">
//                               <span className="text-gray-600">Vol/OI: </span>
//                               <span
//                                 className={
//                                   comp.comparison.volumeToOIRatioDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }
//                               >
//                                 {comp.comparison.volumeToOIRatioDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {formatRatio(
//                                   comp.comparison.volumeToOIRatioDifference,
//                                 )}
//                               </span>
//                             </div>
//                             <div className="text-xs">
//                               <span className="text-gray-600">Return: </span>
//                               <span
//                                 className={
//                                   comp.comparison.returnDifference >= 0
//                                     ? "text-green-600"
//                                     : "text-red-600"
//                                 }
//                               >
//                                 {comp.comparison.returnDifference >= 0
//                                   ? "+"
//                                   : ""}
//                                 {comp.comparison.returnDifference.toFixed(2)}%
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
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MinuteAnalysisAllInOne;

"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import {
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Award,
  Download,
  FileDown,
  Scale,
  FolderOpen,
  Loader,
  ChevronDown,
  ChevronRight,
  Folder,
} from "lucide-react";
import * as LightweightCharts from "lightweight-charts";
import {
  IconCoinRupeeFilled,
  IconTargetArrow,
  IconTargetOff,
  IconUpload,
  IconRefresh,
  IconChartCandle,
  IconChartLine,
  IconChartAreaLine,
} from "@tabler/icons-react";
import * as XLSX from "xlsx";

const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

// ==================== CONSTANTS & HELPER FUNCTIONS ====================

const timeframeOptions = [
  { label: "1 Minute", value: "1min" },
  { label: "3 Minutes", value: "3min" },
  { label: "5 Minutes", value: "5min" },
  { label: "10 Minutes", value: "10min" },
  { label: "15 Minutes", value: "15min" },
  { label: "30 Minutes", value: "30min" },
  { label: "1 Hour", value: "1hour" },
];

// Helper function to parse date
const parseDateString = (dateStr: string): number => {
  try {
    const cleanStr = dateStr.trim();
    let date: Date;

    const match1 = cleanStr.match(
      /(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s+(\d{1,2}):(\d{1,2})/,
    );
    if (match1) {
      const [, day, month, year, hour, minute] = match1;
      date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        0,
      );
    } else if (cleanStr.match(/\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2}/)) {
      date = new Date(cleanStr.replace(" ", "T"));
    } else {
      date = new Date(cleanStr);
    }

    if (isNaN(date.getTime())) return 0;
    return Math.floor(date.getTime() / 1000) - IST_OFFSET_SECONDS;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return 0;
  }
};

// Format time to IST
const formatToIST = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// Format date with time for hover display
const formatDateWithTime = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  return `${day}-${month}-${year} ${time}`;
};

// Format date only for x-axis
const formatDateOnly = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format large numbers with K, M, B suffixes
const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + "B";
  else if (value >= 1000000) return (value / 1000000).toFixed(2) + "M";
  else if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  else return value.toString();
};

// Calculate duration between two times
const calculateDuration = (entryTime: string, exitTime: string): string => {
  if (!entryTime || !exitTime) return "";
  try {
    const [entryHour, entryMinute] = entryTime.split(":").map(Number);
    const [exitHour, exitMinute] = exitTime.split(":").map(Number);
    let totalMinutes =
      exitHour * 60 + exitMinute - (entryHour * 60 + entryMinute);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "";
  }
};

// Aggregate data by timeframe
const aggregateDataByTimeframe = (
  data: CandleData[],
  timeframe: string,
): CandleData[] => {
  if (!data.length) return [];

  let timeframeMinutes = 1;
  switch (timeframe) {
    case "1min":
      timeframeMinutes = 1;
      break;
    case "3min":
      timeframeMinutes = 3;
      break;
    case "5min":
      timeframeMinutes = 5;
      break;
    case "10min":
      timeframeMinutes = 10;
      break;
    case "15min":
      timeframeMinutes = 15;
      break;
    case "30min":
      timeframeMinutes = 30;
      break;
    case "1hour":
      timeframeMinutes = 60;
      break;
    default:
      timeframeMinutes = 1;
  }

  const aggregatedData: CandleData[] = [];
  let currentGroup: CandleData[] = [];
  let currentGroupEndTime = 0;
  const sortedData = [...data].sort((a, b) => a.time - b.time);

  for (const candle of sortedData) {
    const candleDate = new Date((candle.time + IST_OFFSET_SECONDS) * 1000);
    const minutes = candleDate.getMinutes();
    const bucketMinutes =
      Math.floor(minutes / timeframeMinutes) * timeframeMinutes;
    const bucketTime = new Date(candleDate);
    bucketTime.setMinutes(bucketMinutes, 0, 0);
    const bucketTimestamp =
      Math.floor(bucketTime.getTime() / 1000) - IST_OFFSET_SECONDS;

    if (bucketTimestamp !== currentGroupEndTime) {
      if (currentGroup.length > 0) {
        aggregatedData.push({
          time: currentGroupEndTime,
          open: currentGroup[0].open,
          high: Math.max(...currentGroup.map((c) => c.high)),
          low: Math.min(...currentGroup.map((c) => c.low)),
          close: currentGroup[currentGroup.length - 1].close,
          volume: currentGroup.reduce((sum, c) => sum + (c.volume || 0), 0),
          oi: currentGroup.reduce((sum, c) => sum + (c.oi || 0), 0),
        });
      }
      currentGroup = [candle];
      currentGroupEndTime = bucketTimestamp;
    } else {
      currentGroup.push(candle);
    }
  }

  if (currentGroup.length > 0) {
    aggregatedData.push({
      time: currentGroupEndTime,
      open: currentGroup[0].open,
      high: Math.max(...currentGroup.map((c) => c.high)),
      low: Math.min(...currentGroup.map((c) => c.low)),
      close: currentGroup[currentGroup.length - 1].close,
      volume: currentGroup.reduce((sum, c) => sum + (c.volume || 0), 0),
      oi: currentGroup.reduce((sum, c) => sum + (c.oi || 0), 0),
    });
  }

  return aggregatedData;
};

// ==================== INTERFACES ====================

interface CandleData {
  date?: string;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  oi?: number;
  bodySize?: number;
  candleType?: "Bullish" | "Bearish" | "Doji";
  fileName?: string;
  minuteNumber?: number;
  candleSize?: number;
  returnPercent?: number;
  vwap?: number;
  timestamp?: string;
  optionType?: "CE" | "PE";
  strikePrice?: number;
  expiry?: string;
  minuteKey?: string;
}

interface OHLCValues {
  open: number;
  high: number;
  low: number;
  close: number;
  time: any;
}

interface HitResult {
  level: "SL" | "Target" | null;
  time: string;
  price: number;
  index: number;
  candleTime: number;
  candleDetails: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

interface CalculationResults {
  profitPerUnit: number;
  totalProfit: number;
  profitPercentage: string;
  lossPerUnit: number;
  totalLoss: number;
  lossPercentage: string;
  totalMargin: number;
  quantity: number;
  ltp: number;
  sl: number;
  target: number;
}

interface FileAnalysis {
  id: string;
  name: string;
  data: CandleData[];
  firstHourData: CandleData[];
  summary: FileSummary;
  firstHourSummary: FirstHourSummary;
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

interface FirstHourSummary {
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
  volumeToOIRatio?: number;
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
    volumeToOIRatio: number;
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
    volumeToOIRatio: number;
  };
  comparison: {
    volumeDifference: number;
    volumeRatio: number;
    oiDifference: number;
    oiRatio: number;
    volumeToOIRatioDifference: number;
    candleComparison: string;
    returnDifference: number;
    bodySizeDifference: number;
    ceWon: boolean;
    directionAgreement: boolean;
  };
}

interface CEPE_MinuteAnalysis {
  date: string;
  ceFileName: string;
  peFileName: string;
  ceStrikePrice: number;
  peStrikePrice: number;
  minuteComparisons: MinuteComparison[];
  summary: {
    totalMinutes: number;
    ceTotalVolume: number;
    peTotalVolume: number;
    ceTotalOI: number;
    peTotalOI: number;
    ceAvgVolumeToOIRatio: number;
    peAvgVolumeToOIRatio: number;
    ceBullishMinutes: number;
    ceBearishMinutes: number;
    peBullishMinutes: number;
    peBearishMinutes: number;
    minutesWithCEHigherVolume: number;
    minutesWithPEHigherVolume: number;
    minutesWithCEHigherOI: number;
    minutesWithPEHigherOI: number;
    minutesWithCEHigherVolumeToOIRatio: number;
    minutesWithPEHigherVolumeToOIRatio: number;
    ceAverageReturn: number;
    peAverageReturn: number;
    ceWins: number;
    peWins: number;
    directionAgreement: number;
    bestCEMinute: MinuteComparison | null;
    bestPEMinute: MinuteComparison | null;
    highestVolumeMinute: MinuteComparison | null;
  };
}

interface DateOption {
  date: string;
  display: string;
  ceFile: string;
  peFile: string;
  ceStrike: number;
  peStrike: number;
}

interface GoogleDriveFile {
  name: string;
  id: string;
  content: string;
  size?: number;
  lastUpdated?: string;
}

interface GoogleDriveFolder {
  name: string;
  id: string;
  files: GoogleDriveFile[];
}

interface GoogleDriveData {
  success: boolean;
  mainFolderName: string;
  mainFolderId: string;
  folders: GoogleDriveFolder[];
  files: GoogleDriveFile[];
  summary: {
    totalFolders: number;
    totalFiles: number;
  };
}

interface OptionTypeData {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  data: CandleData[];
  aggregatedData: CandleData[];
  ltp: string;
  sl: string;
  target: string;
  selectedTime: string;
  quantity: string;
  isEntrySet: boolean;
  entryTimestamp: number;
  entryDateStr: string;
  firstHit: HitResult | null;
  lastCandle: OHLCValues | null;
  results: CalculationResults | null;
}

// Store full file data by date for charts
interface FileDataStore {
  [date: string]: {
    ceData: CandleData[];
    peData: CandleData[];
    ceFileName: string;
    peFileName: string;
  };
}

// ==================== CALCULATE RESULTS FUNCTION ====================
const calculateResults = (
  ltp: string,
  sl: string,
  target: string,
  quantity: string,
): CalculationResults | null => {
  if (!ltp || !sl || !target || !quantity) return null;

  const ltpNum = parseFloat(ltp);
  const slNum = parseFloat(sl);
  const targetNum = parseFloat(target);
  const quantityNum = parseFloat(quantity);

  if (isNaN(ltpNum) || isNaN(slNum) || isNaN(targetNum) || isNaN(quantityNum)) {
    return null;
  }

  const profitPerUnit = targetNum - ltpNum;
  const totalProfit = profitPerUnit * quantityNum;
  const profitPercentage = ((profitPerUnit / ltpNum) * 100).toFixed(2);

  const lossPerUnit = slNum - ltpNum;
  const totalLoss = lossPerUnit * quantityNum;
  const lossPercentage = ((lossPerUnit / ltpNum) * 100).toFixed(2);

  const totalMargin = ltpNum * quantityNum;

  return {
    profitPerUnit,
    totalProfit,
    profitPercentage,
    lossPerUnit,
    totalLoss,
    lossPercentage,
    totalMargin,
    quantity: quantityNum,
    ltp: ltpNum,
    sl: slNum,
    target: targetNum,
  };
};

// Custom Calendar icon component
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Folder Tree Component for Google Drive
const FolderTree: React.FC<{
  data: GoogleDriveData;
  onSelectFiles: (files: { content: string; name: string }[]) => void;
  isProcessing: boolean;
}> = ({ data, onSelectFiles, isProcessing }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAllInFolder = (
    folderFiles: GoogleDriveFile[],
    checked: boolean,
  ) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      folderFiles.forEach((file) => {
        if (checked) {
          newSet.add(file.id);
        } else {
          newSet.delete(file.id);
        }
      });
      return newSet;
    });
  };

  const loadSelectedFiles = async () => {
    setLoading(true);
    try {
      const allFiles: { content: string; name: string }[] = [];

      data.files.forEach((file) => {
        if (selectedFiles.has(file.id)) {
          allFiles.push({
            content: file.content,
            name: file.name,
          });
        }
      });

      data.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (selectedFiles.has(file.id)) {
            allFiles.push({
              content: file.content,
              name: `${folder.name}/${file.name}`,
            });
          }
        });
      });

      onSelectFiles(allFiles);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCount = () => selectedFiles.size;
  const getTotalFiles = () =>
    data.files.length +
    data.folders.reduce((acc, f) => acc + f.files.length, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{data.mainFolderName}</h3>
          <span className="text-xs text-gray-500">
            ({getTotalFiles()} files, {data.summary.totalFolders} folders)
          </span>
        </div>
        <button
          onClick={loadSelectedFiles}
          disabled={getSelectedCount() === 0 || loading || isProcessing}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            getSelectedCount() > 0 && !loading && !isProcessing
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            `Load Selected (${getSelectedCount()})`
          )}
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-3">
        {data.files.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded">
              <Folder className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Main Folder
              </span>
              <span className="text-xs text-gray-500">
                ({data.files.length} files)
              </span>
              <button
                onClick={() => {
                  const allChecked = data.files.every((f) =>
                    selectedFiles.has(f.id),
                  );
                  selectAllInFolder(data.files, !allChecked);
                }}
                className="ml-auto text-xs text-blue-600 hover:text-blue-700"
              >
                {data.files.every((f) => selectedFiles.has(f.id))
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="ml-4 space-y-1 mt-1">
              {data.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={() => toggleFile(file.id)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 flex-1">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.folders.map((folder) => (
          <div key={folder.id} className="mb-2">
            <div
              className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => toggleFolder(folder.id)}
            >
              {expandedFolders.has(folder.id) ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
              <Folder className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">
                {folder.name}
              </span>
              <span className="text-xs text-gray-500">
                ({folder.files.length} files)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const allChecked = folder.files.every((f) =>
                    selectedFiles.has(f.id),
                  );
                  selectAllInFolder(folder.files, !allChecked);
                }}
                className="ml-auto text-xs text-blue-600 hover:text-blue-700"
              >
                {folder.files.every((f) => selectedFiles.has(f.id))
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            {expandedFolders.has(folder.id) && (
              <div className="ml-6 space-y-1 mt-1">
                {folder.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleFile(file.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 flex-1">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const MinuteAnalysisAllInOne: React.FC = () => {
  // State management
  const [files, setFiles] = useState<FileAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, CEPE_MinuteAnalysis>>(
    new Map(),
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFilesList, setSelectedFilesList] = useState<Set<string>>(
    new Set(),
  );
  const [activeCard, setActiveCard] = useState<"cumulative" | "thirtyPoint">(
    "cumulative",
  );
  const [exportProgress, setExportProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive state
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [driveData, setDriveData] = useState<GoogleDriveData | null>(null);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  // Chart state
  const ceChartRef = useRef<any>(null);
  const peChartRef = useRef<any>(null);
  const ceChartInstanceRef = useRef<any>(null);
  const peChartInstanceRef = useRef<any>(null);
  const ceSeriesRef = useRef<any>(null);
  const peSeriesRef = useRef<any>(null);
  const ceLtpLineRef = useRef<any>(null);
  const ceSlLineRef = useRef<any>(null);
  const ceTargetLineRef = useRef<any>(null);
  const peLtpLineRef = useRef<any>(null);
  const peSlLineRef = useRef<any>(null);
  const peTargetLineRef = useRef<any>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area">(
    "candlestick",
  );
  const [timeframe, setTimeframe] = useState("1min");
  const [syncCharts, setSyncCharts] = useState(true);
  const [ceHoverData, setCeHoverData] = useState<any>(null);
  const [peHoverData, setPeHoverData] = useState<any>(null);
  const [ceFileName, setCeFileName] = useState<string>("");
  const [peFileName, setPeFileName] = useState<string>("");

  // Store full file data by date
  const [fileDataStore, setFileDataStore] = useState<FileDataStore>({});

  const [ceChartData, setCeChartData] = useState<OptionTypeData>({
    name: "CE",
    color: "#16a34a",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    data: [],
    aggregatedData: [],
    ltp: "",
    sl: "",
    target: "",
    selectedTime: "09:21",
    quantity: "65",
    isEntrySet: false,
    entryTimestamp: 0,
    entryDateStr: "",
    firstHit: null,
    lastCandle: null,
    results: null,
  });

  const [peChartData, setPeChartData] = useState<OptionTypeData>({
    name: "PE",
    color: "#dc2626",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    data: [],
    aggregatedData: [],
    ltp: "",
    sl: "",
    target: "",
    selectedTime: "09:21",
    quantity: "65",
    isEntrySet: false,
    entryTimestamp: 0,
    entryDateStr: "",
    firstHit: null,
    lastCandle: null,
    results: null,
  });

  // Your Apps Script URL
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz9khyBjTjf79WNHN6lo1N2BzjasBnu_vyC8auisy4mctlPRuIpO6uaDTIeo2-e0P6_/exec";

  // Get current analysis based on selected date
  const currentAnalysis = useMemo(() => {
    if (!selectedDate) return null;
    return analyses.get(selectedDate) || null;
  }, [analyses, selectedDate]);

  // Get available dates for dropdown
  const availableDates = useMemo<DateOption[]>(() => {
    const dates: DateOption[] = [];
    analyses.forEach((analysis, date) => {
      const ceShortName =
        analysis.ceFileName.length > 30
          ? analysis.ceFileName.substring(0, 20) + "..."
          : analysis.ceFileName;
      const peShortName =
        analysis.peFileName.length > 30
          ? analysis.peFileName.substring(0, 20) + "..."
          : analysis.peFileName;

      dates.push({
        date,
        display: `${date} |  ${ceShortName?.split("_")?.[1] || ceShortName} vs ${peShortName?.split("_")?.[1] || peShortName}`,
        ceFile: analysis.ceFileName,
        peFile: analysis.peFileName,
        ceStrike: analysis.ceStrikePrice,
        peStrike: analysis.peStrikePrice,
      });
    });
    return dates.sort((a, b) => b.date.localeCompare(a.date));
  }, [analyses]);

  // Update your date change useEffect
  useEffect(() => {
    if (selectedDate && fileDataStore[selectedDate]) {
      const store = fileDataStore[selectedDate];

      // Clear existing lines safely
      try {
        if (ceSeriesRef.current) {
          if (ceLtpLineRef.current) {
            ceSeriesRef.current.removePriceLine(ceLtpLineRef.current);
            ceLtpLineRef.current = null;
          }
          if (ceSlLineRef.current) {
            ceSeriesRef.current.removePriceLine(ceSlLineRef.current);
            ceSlLineRef.current = null;
          }
          if (ceTargetLineRef.current) {
            ceSeriesRef.current.removePriceLine(ceTargetLineRef.current);
            ceTargetLineRef.current = null;
          }
        }
      } catch (e) {
        console.log("Error clearing CE lines:", e);
      }

      try {
        if (peSeriesRef.current) {
          if (peLtpLineRef.current) {
            peSeriesRef.current.removePriceLine(peLtpLineRef.current);
            peLtpLineRef.current = null;
          }
          if (peSlLineRef.current) {
            peSeriesRef.current.removePriceLine(peSlLineRef.current);
            peSlLineRef.current = null;
          }
          if (peTargetLineRef.current) {
            peSeriesRef.current.removePriceLine(peTargetLineRef.current);
            peTargetLineRef.current = null;
          }
        }
      } catch (e) {
        console.log("Error clearing PE lines:", e);
      }

      setCeFileName(store.ceFileName);
      setPeFileName(store.peFileName);

      setCeChartData((prev) => ({
        ...prev,
        data: store.ceData,
        aggregatedData: aggregateDataByTimeframe(store.ceData, timeframe),
        isEntrySet: false,
        ltp: "",
        sl: "",
        target: "",
        selectedTime: "09:21",
        firstHit: null,
      }));

      setPeChartData((prev) => ({
        ...prev,
        data: store.peData,
        aggregatedData: aggregateDataByTimeframe(store.peData, timeframe),
        isEntrySet: false,
        ltp: "",
        sl: "",
        target: "",
        selectedTime: "09:21",
        firstHit: null,
      }));

      // Set default entry at 9:30
      setTimeout(() => {
        if (currentAnalysis) {
          const ce930Candle = currentAnalysis.minuteComparisons.find(
            (comp) => comp.time === "09:30",
          );
          const pe930Candle = currentAnalysis.minuteComparisons.find(
            (comp) => comp.time === "09:30",
          );

          if (ce930Candle) {
            setCeChartData((prev) => ({
              ...prev,
              ltp: ce930Candle.ceData.open.toString(),
              sl: (ce930Candle.ceData.open - 30).toString(),
              target: (ce930Candle.ceData.open + 30).toString(),
              selectedTime: "09:30",
              isEntrySet: true,
            }));
          }

          if (pe930Candle) {
            setPeChartData((prev) => ({
              ...prev,
              ltp: pe930Candle.peData.open.toString(),
              sl: (pe930Candle.peData.open - 30).toString(),
              target: (pe930Candle.peData.open + 30).toString(),
              selectedTime: "09:30",
              isEntrySet: true,
            }));
          }

          setTimeout(() => {
            if (ceSeriesRef.current) drawAllLines("CE");
            if (peSeriesRef.current) drawAllLines("PE");
          }, 500);
        }
      }, 300);
    }
  }, [selectedDate, fileDataStore, currentAnalysis, timeframe]);
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
      const strikeMatch = fileName.match(/(\d+)/g);
      if (strikeMatch && strikeMatch.length > 0) {
        const possibleStrikes = strikeMatch
          .map(Number)
          .filter((n) => n > 1000 && n < 100000);
        if (possibleStrikes.length > 0) {
          strikePrice = possibleStrikes[0];
        }
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

      let prevClose: number | null = null;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line
          .split(delimiter)
          .map((v) => v.trim().replace(/"/g, ""));

        const getValue = (
          index: number,
          defaultValue: number | string = 0,
        ): string => {
          return index >= 0 && values[index] !== undefined
            ? values[index]
            : String(defaultValue);
        };

        let dateStr = "";
        let timeStr = "09:15";

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

        const open = parseFloat(getValue(openIndex, "0"));
        const high = parseFloat(getValue(highIndex, "0"));
        const low = parseFloat(getValue(lowIndex, "0"));
        const close = parseFloat(getValue(closeIndex, "0"));
        const volume = parseFloat(getValue(volumeIndex, "0"));
        const oi = parseFloat(getValue(oiIndex, "0"));

        if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
          const bodySize = Math.abs(close - open);
          const candleType: "Bullish" | "Bearish" | "Doji" =
            close > open ? "Bullish" : close < open ? "Bearish" : "Doji";

          const candleSize = high - low;

          cumulativeVolume += volume;
          cumulativeValue += ((open + high + low + close) / 4) * volume;
          const vwap =
            cumulativeVolume > 0 ? cumulativeValue / cumulativeVolume : close;

          let returnPercent = 0;
          if (prevClose !== null && prevClose !== 0) {
            returnPercent = ((close - prevClose) / prevClose) * 100;
          }
          prevClose = close;

          const minuteKey = `${dateStr}_${timeStr}`;

          candleData.push({
            date: dateStr,
            time: parseDateString(`${dateStr} ${timeStr}`),
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

  // Extract first hour data (9:15 to 10:15)
  const extractFirstHourData = useCallback(
    (data: CandleData[]): CandleData[] => {
      return data.filter((candle) => {
        const date = new Date((candle.time + IST_OFFSET_SECONDS) * 1000);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeStr = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        return timeStr >= "09:15" && timeStr <= "10:15";
      });
    },
    [],
  );

  const calculateFileSummary = useCallback(
    (data: CandleData[]): FileSummary | null => {
      if (data.length === 0) return null;

      const totalVolume = data.reduce(
        (sum, candle) => sum + (candle.volume || 0),
        0,
      );
      const totalOI = data.reduce((sum, candle) => sum + (candle.oi || 0), 0);
      const avgBodySize =
        data.reduce((sum, candle) => sum + (candle.bodySize || 0), 0) /
        data.length;
      const avgVolume = totalVolume / data.length;
      const avgOI = totalOI / data.length;
      const maxVolume = Math.max(...data.map((c) => c.volume || 0));
      const maxOI = Math.max(...data.map((c) => c.oi || 0));

      const bullishCandles = data.filter(
        (c) => c.candleType === "Bullish",
      ).length;
      const bearishCandles = data.filter(
        (c) => c.candleType === "Bearish",
      ).length;
      const dojiCandles = data.filter((c) => c.candleType === "Doji").length;

      const avgCandleSize =
        data.reduce((sum, candle) => sum + (candle.candleSize || 0), 0) /
        data.length;

      const returns = data.map((candle, index) => {
        if (index === 0) return 0;
        return (
          (candle.close - (data[index - 1]?.close || 0)) /
          (data[index - 1]?.close || 1)
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

  const calculateFirstHourSummary = useCallback(
    (data: CandleData[]): FirstHourSummary | null => {
      if (data.length === 0) return null;

      const totalVolume = data.reduce(
        (sum, candle) => sum + (candle.volume || 0),
        0,
      );
      const totalOI = data.reduce((sum, candle) => sum + (candle.oi || 0), 0);
      const avgBodySize =
        data.reduce((sum, candle) => sum + (candle.bodySize || 0), 0) /
        data.length;
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
        data.reduce((sum, candle) => sum + (candle.candleSize || 0), 0) /
        data.length;

      const returns = data.map((candle, index) => {
        if (index === 0) return 0;
        return (
          (candle.close - (data[index - 1]?.close || 0)) /
          (data[index - 1]?.close || 1)
        );
      });
      const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

      const volumeToOIRatio = avgVolume / (avgOI || 1);

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
        volumeToOIRatio,
      };
    },
    [],
  );

  // Perform minute-by-minute CE vs PE comparison
  const calculateCEPE_MinuteAnalysis = useCallback(
    (ceFile: FileAnalysis, peFile: FileAnalysis, date: string) => {
      const ceCandles = ceFile.firstHourData;
      const peCandles = peFile.firstHourData;

      if (ceCandles.length === 0 || peCandles.length === 0) return null;

      const ceByMinute = new Map<string, CandleData>();
      const peByMinute = new Map<string, CandleData>();

      ceCandles.forEach((candle) => {
        if (candle.timestamp) {
          const timePart = candle.timestamp.split(" ")[1];
          ceByMinute.set(timePart, candle);
        }
      });

      peCandles.forEach((candle) => {
        if (candle.timestamp) {
          const timePart = candle.timestamp.split(" ")[1];
          peByMinute.set(timePart, candle);
        }
      });

      const allMinutes = new Set([...ceByMinute.keys(), ...peByMinute.keys()]);
      const sortedMinutes = Array.from(allMinutes).sort();

      const minuteComparisons: MinuteComparison[] = [];
      let ceTotalVolume = 0;
      let peTotalVolume = 0;
      let ceTotalOI = 0;
      let peTotalOI = 0;
      let ceTotalVolumeToOIRatio = 0;
      let peTotalVolumeToOIRatio = 0;
      let ceBullishMinutes = 0;
      let ceBearishMinutes = 0;
      let peBullishMinutes = 0;
      let peBearishMinutes = 0;
      let minutesWithCEHigherVolume = 0;
      let minutesWithPEHigherVolume = 0;
      let minutesWithCEHigherOI = 0;
      let minutesWithPEHigherOI = 0;
      let minutesWithCEHigherVolumeToOIRatio = 0;
      let minutesWithPEHigherVolumeToOIRatio = 0;
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

        if (!ceCandle && !peCandle) return;

        const defaultCandle: CandleData = {
          date,
          time: 0,
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

        const ceVolumeToOIRatio =
          (ceData.oi || 0) > 0 ? (ceData.volume || 0) / (ceData.oi || 1) : 0;
        const peVolumeToOIRatio =
          (peData.oi || 0) > 0 ? (peData.volume || 0) / (peData.oi || 1) : 0;

        const volumeDifference = (ceData.volume || 0) - (peData.volume || 0);
        const volumeRatio =
          (peData.volume || 0) > 0
            ? (ceData.volume || 0) / (peData.volume || 1)
            : (ceData.volume || 0) > 0
              ? Infinity
              : 0;
        const oiDifference = (ceData.oi || 0) - (peData.oi || 0);
        const oiRatio =
          (peData.oi || 0) > 0
            ? (ceData.oi || 0) / (peData.oi || 1)
            : (ceData.oi || 0) > 0
              ? Infinity
              : 0;
        const volumeToOIRatioDifference = ceVolumeToOIRatio - peVolumeToOIRatio;
        const returnDifference =
          (ceData.returnPercent || 0) - (peData.returnPercent || 0);
        const bodySizeDifference =
          (ceData.bodySize || 0) - (peData.bodySize || 0);

        let candleComparison: string;
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

        const ceWon = (ceData.returnPercent || 0) > (peData.returnPercent || 0);

        const sameDirection =
          ((ceData.returnPercent || 0) > 0 &&
            (peData.returnPercent || 0) > 0) ||
          ((ceData.returnPercent || 0) < 0 &&
            (peData.returnPercent || 0) < 0) ||
          ((ceData.returnPercent || 0) === 0 &&
            (peData.returnPercent || 0) === 0);

        const comparison: MinuteComparison = {
          date,
          time,
          minuteNumber: parseInt(time.split(":")[1]) || 0,
          ceData: {
            open: ceData.open,
            high: ceData.high,
            low: ceData.low,
            close: ceData.close,
            volume: ceData.volume || 0,
            oi: ceData.oi || 0,
            candleType: ceData.candleType || "Doji",
            returnPercent: ceData.returnPercent || 0,
            bodySize: ceData.bodySize || 0,
            volumeToOIRatio: ceVolumeToOIRatio,
          },
          peData: {
            open: peData.open,
            high: peData.high,
            low: peData.low,
            close: peData.close,
            volume: peData.volume || 0,
            oi: peData.oi || 0,
            candleType: peData.candleType || "Doji",
            returnPercent: peData.returnPercent || 0,
            bodySize: peData.bodySize || 0,
            volumeToOIRatio: peVolumeToOIRatio,
          },
          comparison: {
            volumeDifference,
            volumeRatio,
            oiDifference,
            oiRatio,
            volumeToOIRatioDifference,
            candleComparison,
            returnDifference,
            bodySizeDifference,
            ceWon,
            directionAgreement: sameDirection,
          },
        };

        minuteComparisons.push(comparison);

        ceTotalVolume += ceData.volume || 0;
        peTotalVolume += peData.volume || 0;
        ceTotalOI += ceData.oi || 0;
        peTotalOI += peData.oi || 0;
        ceTotalVolumeToOIRatio += ceVolumeToOIRatio;
        peTotalVolumeToOIRatio += peVolumeToOIRatio;

        if (ceData.candleType === "Bullish") ceBullishMinutes++;
        if (ceData.candleType === "Bearish") ceBearishMinutes++;
        if (peData.candleType === "Bullish") peBullishMinutes++;
        if (peData.candleType === "Bearish") peBearishMinutes++;

        if ((ceData.volume || 0) > (peData.volume || 0))
          minutesWithCEHigherVolume++;
        else if ((peData.volume || 0) > (ceData.volume || 0))
          minutesWithPEHigherVolume++;

        if ((ceData.oi || 0) > (peData.oi || 0)) minutesWithCEHigherOI++;
        else if ((peData.oi || 0) > (ceData.oi || 0)) minutesWithPEHigherOI++;

        if (ceVolumeToOIRatio > peVolumeToOIRatio)
          minutesWithCEHigherVolumeToOIRatio++;
        else if (peVolumeToOIRatio > ceVolumeToOIRatio)
          minutesWithPEHigherVolumeToOIRatio++;

        if (ceWon) ceWins++;
        else peWins++;

        if (sameDirection) directionAgreement++;

        ceReturnSum += ceData.returnPercent || 0;
        peReturnSum += peData.returnPercent || 0;

        if (
          !bestCEMinute ||
          (ceData.returnPercent || 0) >
            (bestCEMinute?.ceData.returnPercent || -Infinity)
        ) {
          bestCEMinute = comparison;
        }
        if (
          !bestPEMinute ||
          (peData.returnPercent || 0) >
            (bestPEMinute?.peData.returnPercent || -Infinity)
        ) {
          bestPEMinute = comparison;
        }

        const totalVolume = (ceData.volume || 0) + (peData.volume || 0);
        if (totalVolume > highestVolume) {
          highestVolume = totalVolume;
          highestVolumeMinute = comparison;
        }
      });

      return {
        date,
        ceFileName: ceFile.name,
        peFileName: peFile.name,
        ceStrikePrice: ceFile.data[0]?.strikePrice || 0,
        peStrikePrice: peFile.data[0]?.strikePrice || 0,
        minuteComparisons,
        summary: {
          totalMinutes: minuteComparisons.length,
          ceTotalVolume,
          peTotalVolume,
          ceTotalOI,
          peTotalOI,
          ceAvgVolumeToOIRatio:
            minuteComparisons.length > 0
              ? ceTotalVolumeToOIRatio / minuteComparisons.length
              : 0,
          peAvgVolumeToOIRatio:
            minuteComparisons.length > 0
              ? peTotalVolumeToOIRatio / minuteComparisons.length
              : 0,
          ceBullishMinutes,
          ceBearishMinutes,
          peBullishMinutes,
          peBearishMinutes,
          minutesWithCEHigherVolume,
          minutesWithPEHigherVolume,
          minutesWithCEHigherOI,
          minutesWithPEHigherOI,
          minutesWithCEHigherVolumeToOIRatio,
          minutesWithPEHigherVolumeToOIRatio,
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

  const processFiles = useCallback(
    (allFiles: FileAnalysis[]) => {
      const fileGroups: { [key: string]: FileAnalysis[] } = {};
      const newFileDataStore: FileDataStore = {};

      allFiles.forEach((file) => {
        if (file.data.length > 0) {
          const date: any = file.data[0]?.date;
          if (date) {
            if (!fileGroups[date]) {
              fileGroups[date] = [];
            }
            fileGroups[date].push(file);
          }
        }
      });

      const newAnalyses = new Map<string, CEPE_MinuteAnalysis>();

      for (const [date, dateFiles] of Object.entries(fileGroups)) {
        const ceFile = dateFiles.find((f) => f.data[0]?.optionType === "CE");
        const peFile = dateFiles.find((f) => f.data[0]?.optionType === "PE");

        if (ceFile && peFile) {
          const analysis = calculateCEPE_MinuteAnalysis(ceFile, peFile, date);
          if (analysis) {
            newAnalyses.set(date, analysis);

            // Store full data for charts
            newFileDataStore[date] = {
              ceData: ceFile.data,
              peData: peFile.data,
              ceFileName: ceFile.name,
              peFileName: peFile.name,
            };
          }
        }
      }

      setFileDataStore((prev) => ({ ...prev, ...newFileDataStore }));
      setAnalyses(newAnalyses);

      if (newAnalyses.size > 0) {
        const dates = Array.from(newAnalyses.keys()).sort();
        setSelectedDate(dates[dates.length - 1]);
      } else {
        setSelectedDate("");
      }
    },
    [calculateCEPE_MinuteAnalysis],
  );

  const handleFileUpload = useCallback(
    async (fileList: File[]) => {
      setIsProcessing(true);
      const newFiles: FileAnalysis[] = [];

      for (const file of fileList) {
        try {
          const text = await file.text();
          const candleData = parseCSVContent(text, file.name);
          const firstHourData = extractFirstHourData(candleData);

          if (candleData.length > 0) {
            const summary = calculateFileSummary(candleData);
            const firstHourSummary = calculateFirstHourSummary(firstHourData);

            if (summary && firstHourSummary) {
              newFiles.push({
                id: `${file.name}-${Date.now()}-${Math.random()
                  .toString(36)
                  .substring(2, 11)}`,
                name: file.name.replace(".csv", ""),
                data: candleData,
                firstHourData: firstHourData,
                summary,
                firstHourSummary,
              });
            }
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }

      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);

      const newSelected = new Set(selectedFilesList);
      newFiles.forEach((file) => newSelected.add(file.id));
      setSelectedFilesList(newSelected);

      processFiles(updatedFiles);
      setIsProcessing(false);
    },
    [
      files,
      selectedFilesList,
      parseCSVContent,
      calculateFileSummary,
      calculateFirstHourSummary,
      extractFirstHourData,
      processFiles,
    ],
  );

  // Google Drive functions
  const fetchGoogleDriveStructure = useCallback(async () => {
    setIsLoadingDrive(true);
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      const data = await response.json();

      if (data.success) {
        setDriveData(data);
        setShowDrivePicker(true);
      } else {
        alert(
          "Failed to load Google Drive files: " +
            (data.error || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error fetching from Google Drive:", error);
      alert(
        "Failed to connect to Google Drive. Please check your Apps Script URL.",
      );
    } finally {
      setIsLoadingDrive(false);
    }
  }, []);

  const handleGoogleDriveFiles = useCallback(
    async (files: { content: string; name: string }[]) => {
      setIsProcessing(true);
      const fileObjects = files.map(
        (f) =>
          new File([f.content], f.name.split("/").pop() || f.name, {
            type: "text/csv",
          }),
      );
      await handleFileUpload(fileObjects);
      setShowDrivePicker(false);
      setDriveData(null);
    },
    [handleFileUpload],
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
      const newFiles = files.filter((file) => file.id !== id);
      setFiles(newFiles);

      const newSelected = new Set(selectedFilesList);
      newSelected.delete(id);
      setSelectedFilesList(newSelected);

      if (newFiles.length > 0) {
        processFiles(newFiles);
      } else {
        setAnalyses(new Map());
        setSelectedDate("");
      }
    },
    [files, selectedFilesList, processFiles],
  );

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setSelectedFilesList(new Set());
    setAnalyses(new Map());
    setSelectedDate("");
    setFileDataStore({});
  }, []);

  const toggleFileSelection = useCallback((id: string) => {
    setSelectedFilesList((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Calculate cumulative data for 9:15 to 9:27
  const cumulativeData = useMemo(() => {
    if (!currentAnalysis) return null;

    const startTime = "09:15";
    const endTime = "09:27";

    const relevantMinutes = currentAnalysis.minuteComparisons.filter(
      (comp) => comp.time >= startTime && comp.time <= endTime,
    );

    if (relevantMinutes.length === 0) return null;

    const firstMinute = relevantMinutes[0];
    const lastMinute = relevantMinutes[relevantMinutes.length - 1];

    const ceCumulativeVolume = relevantMinutes.reduce(
      (sum, comp) => sum + comp.ceData.volume,
      0,
    );
    const peCumulativeVolume = relevantMinutes.reduce(
      (sum, comp) => sum + comp.peData.volume,
      0,
    );
    const ceCumulativeOI = relevantMinutes.reduce(
      (sum, comp) => sum + comp.ceData.oi,
      0,
    );
    const peCumulativeOI = relevantMinutes.reduce(
      (sum, comp) => sum + comp.peData.oi,
      0,
    );

    const ceStartPrice = firstMinute.ceData.open;
    const peStartPrice = firstMinute.peData.open;
    const ceEndPrice = lastMinute.ceData.close;
    const peEndPrice = lastMinute.peData.close;

    const cePriceChange = ((ceEndPrice - ceStartPrice) / ceStartPrice) * 100;
    const pePriceChange = ((peEndPrice - peStartPrice) / peStartPrice) * 100;

    const volumeLeader = ceCumulativeVolume >= peCumulativeVolume ? "CE" : "PE";
    const oiLeader = ceCumulativeOI >= peCumulativeOI ? "CE" : "PE";
    const priceLeader = cePriceChange >= pePriceChange ? "CE" : "PE";

    return {
      timeRange: `${startTime} - ${endTime}`,
      ceCumulativeVolume,
      peCumulativeVolume,
      ceCumulativeOI,
      peCumulativeOI,
      cePriceChange,
      pePriceChange,
      ceStartPrice,
      peStartPrice,
      ceEndPrice,
      peEndPrice,
      volumeLeader,
      oiLeader,
      priceLeader,
    };
  }, [currentAnalysis]);

  // Calculate 30-point analysis from 9:30 onwards
  const thirtyPointAnalysis: any = useMemo(() => {
    if (!currentAnalysis) return null;

    const startTime = "09:30";
    const endTime = "10:15";
    const targetPoints = 30;

    const minutesFrom930 = currentAnalysis.minuteComparisons.filter(
      (comp) => comp.time >= startTime && comp.time <= endTime,
    );

    if (minutesFrom930.length === 0) return null;

    const firstMinute = minutesFrom930[0];
    const ceStartPrice = firstMinute.ceData.open;
    const peStartPrice = firstMinute.peData.open;

    let ceReached = false;
    let peReached = false;
    let ceReachedAtTime: string | null = null;
    let peReachedAtTime: string | null = null;
    let ceMinutesToReach: number | null = null;
    let peMinutesToReach: number | null = null;
    let ceMaxPoints = 0;
    let peMaxPoints = 0;
    let ceMaxTime: string | null = null;
    let peMaxTime: string | null = null;

    minutesFrom930.forEach((comp, index) => {
      const cePoints = comp.ceData.close - ceStartPrice;
      if (!ceReached && cePoints >= targetPoints) {
        ceReached = true;
        ceReachedAtTime = comp.time;
        ceMinutesToReach = index + 1;
      }
      if (cePoints > ceMaxPoints) {
        ceMaxPoints = cePoints;
        ceMaxTime = comp.time;
      }

      const pePoints = comp.peData.close - peStartPrice;
      if (!peReached && pePoints >= targetPoints) {
        peReached = true;
        peReachedAtTime = comp.time;
        peMinutesToReach = index + 1;
      }
      if (pePoints > peMaxPoints) {
        peMaxPoints = pePoints;
        peMaxTime = comp.time;
      }
    });

    const reachedBy =
      ceReached && peReached
        ? "Both"
        : ceReached
          ? "CE"
          : peReached
            ? "PE"
            : "None";

    let firstToReach: "CE" | "PE" | null = null;
    if (ceReached && peReached) {
      if (ceReachedAtTime && peReachedAtTime) {
        firstToReach =
          ceReachedAtTime < peReachedAtTime
            ? "CE"
            : peReachedAtTime < ceReachedAtTime
              ? "PE"
              : null;
      }
    } else if (ceReached) {
      firstToReach = "CE";
    } else if (peReached) {
      firstToReach = "PE";
    }

    return {
      reachedBy,
      firstToReach,
      ceReached,
      peReached,
      ceReachedAtTime,
      peReachedAtTime,
      ceMinutesToReach,
      peMinutesToReach,
      ceMaxPoints,
      peMaxPoints,
      ceMaxTime,
      peMaxTime,
    };
  }, [currentAnalysis]);

  const formatCompactNumber = (num: number): string => {
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

  const formatRatio = (num: number): string => {
    return num.toFixed(2);
  };

  const getCandleComparisonColor = (type: string): string => {
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

  // Chart functions
  const getOHLCHTML = useCallback(
    (
      name: string,
      tf: string,
      candle: any,
      timePart: string,
      theme: "light" | "dark",
      change: number,
      changePercent: number,
    ) => {
      return `
      <div style="font-size: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: bold; font-size: 13px; color: ${
            theme === "light" ? "#000" : "#fff"
          }">${name} (${tf})</span>
          <span style="color: ${
            theme === "light" ? "#666" : "#9ca3af"
          }; font-size: 11px;">${timePart}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 4px;">
          <div>
            <div style="color: ${
              theme === "light" ? "#666" : "#9ca3af"
            }; font-size: 11px;">O</div>
            <div style="color: ${
              theme === "light" ? "#333" : "#fff"
            }; font-weight: bold;">${candle.open.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${
              theme === "light" ? "#666" : "#9ca3af"
            }; font-size: 11px;">H</div>
            <div style="color: ${
              theme === "light" ? "#333" : "#fff"
            }; font-weight: bold;">${candle.high.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${
              theme === "light" ? "#666" : "#9ca3af"
            }; font-size: 11px;">L</div>
            <div style="color: ${
              theme === "light" ? "#333" : "#fff"
            }; font-weight: bold;">${candle.low.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${
              theme === "light" ? "#666" : "#9ca3af"
            }; font-size: 11px;">C</div>
            <div style="color: ${
              candle.close >= candle.open
                ? theme === "light"
                  ? "#16a34a"
                  : "#22c55e"
                : theme === "light"
                  ? "#dc2626"
                  : "#ef4444"
            }; font-weight: bold;">${candle.close.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${
              theme === "light" ? "#666" : "#9ca3af"
            }; font-size: 11px;">Volume</div>
            <div style="color: ${
              theme === "light" ? "#333" : "#fff"
            }; font-weight: bold;">
              ${candle.volume ? formatLargeNumber(candle.volume) : "N/A"}
            </div>
          </div>
          <div>
            <div style="color: ${
              theme === "light" ? "#666" : "#9ca3af"
            }; font-size: 11px;">OI</div>
            <div style="color: ${
              theme === "light" ? "#333" : "#fff"
            }; font-weight: bold;">
              ${candle.oi !== undefined ? formatLargeNumber(candle.oi) : "N/A"}
            </div>
          </div>
        </div>
      </div>
    `;
    },
    [],
  );

  const initializeChart = useCallback(
    (
      containerRef: React.RefObject<HTMLDivElement>,
      chartData: CandleData[],
      chartInstanceRef: React.MutableRefObject<any>,
      seriesRef: React.MutableRefObject<any>,
      hoverDataSetter: (data: any) => void,
      optionName: string,
      optionColor: string,
    ) => {
      if (!containerRef.current || chartData.length === 0) return;

      const chart: any = LightweightCharts.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        layout: {
          background: { color: theme === "light" ? "#ffffff" : "#1a1a1a" },
          textColor: theme === "light" ? "#333" : "#d1d5db",
        },
        grid: {
          vertLines: { color: theme === "light" ? "#eee" : "#374151" },
          horzLines: { color: theme === "light" ? "#eee" : "#374151" },
        },
        crosshair: {
          mode: LightweightCharts.CrosshairMode.Normal,
          vertLine: {
            width: 1,
            color: theme === "light" ? "#9CA3AF" : "#6B7280",
            style: LightweightCharts.LineStyle.LargeDashed,
            labelBackgroundColor: theme === "light" ? "#000" : "#374151",
          },
          horzLine: {
            width: 1,
            color: theme === "light" ? "#9CA3AF" : "#6B7280",
            style: LightweightCharts.LineStyle.LargeDashed,
            labelBackgroundColor: theme === "light" ? "#000" : "#374151",
          },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
          rightOffset: 0,
          barSpacing: 6,
          minBarSpacing: 1,
          fixLeftEdge: true,
          fixRightEdge: true,
          tickMarkFormatter: (time: number) => {
            const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            if ((hours === 0 && minutes === 0) || chartData.length < 50) {
              return formatDateOnly(time);
            }
            return formatToIST(time);
          },
        },
        rightPriceScale: {
          borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        leftPriceScale: { visible: false },
        localization: {
          timeFormatter: (time: number) => formatDateWithTime(time),
          dateFormat: "dd-MMM-yyyy",
        },
      });

      chartInstanceRef.current = chart;

      let series: any;
      if (chartType === "candlestick") {
        series = chart.addCandlestickSeries({
          upColor: theme === "light" ? "#16a34a" : "#22c55e",
          downColor: theme === "light" ? "#dc2626" : "#ef4444",
          borderUpColor: theme === "light" ? "#16a34a" : "#22c55e",
          borderDownColor: theme === "light" ? "#dc2626" : "#ef4444",
          wickUpColor: theme === "light" ? "#16a34a" : "#22c55e",
          wickDownColor: theme === "light" ? "#dc2626" : "#ef4444",
          priceLineVisible: false,
          priceScaleId: "right",
        });
        series.setData(
          chartData.map((d) => ({
            time: d.time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          })),
        );
      } else if (chartType === "line" || chartType === "area") {
        const seriesOptions: any = {
          color: optionColor,
          lineWidth: 1,
          priceLineVisible: false,
          priceScaleId: "right",
        };
        if (chartType === "area") {
          seriesOptions.lineType = LightweightCharts.LineType.WithSteps;
          seriesOptions.topColor =
            theme === "light" ? `${optionColor}66` : `${optionColor}66`;
          seriesOptions.bottomColor =
            theme === "light" ? `${optionColor}00` : `${optionColor}00`;
        }
        series = chart.addLineSeries(seriesOptions);
        series.setData(
          chartData.map((d) => ({ time: d.time, value: d.close })),
        );
      }

      seriesRef.current = series;

      if (chartData.length > 0) {
        chart.timeScale().setVisibleRange({
          from: chartData[0].time,
          to: chartData[chartData.length - 1].time,
        });
        setTimeout(() => chart.timeScale().fitContent(), 100);
      }

      // Create OHLC overlay
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "10px";
      overlay.style.left = "10px";
      overlay.style.zIndex = "1000";
      overlay.style.pointerEvents = "none";
      overlay.style.backgroundColor =
        theme === "light" ? "rgba(255,255,255,0.95)" : "rgba(26,26,26,0.95)";
      overlay.style.border = `1px solid ${
        theme === "light" ? "#d1d5db" : "#4b5563"
      }`;
      overlay.style.borderRadius = "6px";
      overlay.style.padding = "6px 10px";
      overlay.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      overlay.style.minWidth = "45%";
      overlay.style.fontFamily = "'Roboto Mono', monospace, sans-serif";

      const chartContainer = containerRef.current;
      chartContainer.style.position = "relative";
      chartContainer.appendChild(overlay);

      // Set initial hover data
      if (chartData.length > 0) {
        const lastCandle = chartData[chartData.length - 1];
        const lastTimeStr = formatDateWithTime(lastCandle.time);
        const timePart =
          lastTimeStr.split(" ")[1] + " " + lastTimeStr.split(" ")[2];
        const change = lastCandle.close - lastCandle.open;
        const changePercent = (change / lastCandle.open) * 100;

        hoverDataSetter({
          time: lastTimeStr,
          o: lastCandle.open,
          h: lastCandle.high,
          l: lastCandle.low,
          c: lastCandle.close,
          volume: lastCandle.volume,
          oi: lastCandle.oi,
          change,
          changePercent,
        });

        overlay.innerHTML = getOHLCHTML(
          optionName,
          timeframe,
          lastCandle,
          timePart,
          theme,
          change,
          changePercent,
        );
      }

      // Crosshair move handler
      chart.subscribeCrosshairMove((param: any) => {
        if (!param.time || param.seriesData.size === 0) {
          if (chartData.length > 0) {
            const lastCandle = chartData[chartData.length - 1];
            const lastTimeStr = formatDateWithTime(lastCandle.time);
            const timePart =
              lastTimeStr.split(" ")[1] + " " + lastTimeStr.split(" ")[2];
            const change = lastCandle.close - lastCandle.open;
            const changePercent = (change / lastCandle.open) * 100;

            hoverDataSetter({
              time: lastTimeStr,
              o: lastCandle.open,
              h: lastCandle.high,
              l: lastCandle.low,
              c: lastCandle.close,
              volume: lastCandle.volume,
              oi: lastCandle.oi,
              change,
              changePercent,
            });

            overlay.innerHTML = getOHLCHTML(
              optionName,
              timeframe,
              lastCandle,
              timePart,
              theme,
              change,
              changePercent,
            );
          }
          return;
        }

        const candleData = param.seriesData.get(series);
        if (!candleData) return;

        let open = 0,
          high = 0,
          low = 0,
          close = 0;
        if (chartType === "candlestick") {
          ({ open, high, low, close } = candleData);
        } else {
          const value = candleData.value;
          open = high = low = close = value;
        }

        let volume = 0,
          oi = 0;
        for (const candle of chartData) {
          if (candle.time === param.time) {
            volume = candle.volume || 0;
            oi = candle.oi || 0;
            break;
          }
        }

        const timeStr = formatDateWithTime(param.time);
        const timePart = timeStr.split(" ")[1] + " " + timeStr.split(" ")[2];
        const change = close - open;
        const changePercent = (change / open) * 100;

        hoverDataSetter({
          time: timeStr,
          o: open,
          h: high,
          l: low,
          c: close,
          volume,
          oi,
          change,
          changePercent,
        });

        overlay.innerHTML = getOHLCHTML(
          optionName,
          timeframe,
          { open, high, low, close, volume, oi },
          timePart,
          theme,
          change,
          changePercent,
        );
      });

      // Resize observer
      const resizeObserver = new ResizeObserver(() => {
        if (containerRef.current) {
          chart.applyOptions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
          setTimeout(() => chart.timeScale().fitContent(), 50);
        }
      });
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        chart.remove();
      };
    },
    [theme, chartType, timeframe, getOHLCHTML],
  );

  const parseEntryTime = useCallback(
    (timeStr: string, chartData: CandleData[]) => {
      if (!timeStr || !chartData.length) return { timestamp: 0, dateStr: "" };

      try {
        const firstCandleTime = chartData[0].time;
        const firstCandleDate = new Date(
          (firstCandleTime + IST_OFFSET_SECONDS) * 1000,
        );
        const [hours, minutes] = timeStr.split(":").map(Number);
        const entryDate = new Date(
          firstCandleDate.getFullYear(),
          firstCandleDate.getMonth(),
          firstCandleDate.getDate(),
          hours,
          minutes,
          0,
        );
        const timestamp =
          Math.floor(entryDate.getTime() / 1000) - IST_OFFSET_SECONDS;
        return { timestamp, dateStr: formatDateWithTime(timestamp) };
      } catch (error) {
        console.error("Error parsing entry time:", error);
        return { timestamp: 0, dateStr: "" };
      }
    },
    [],
  );

  const checkFirstHit = useCallback(
    (optionData: OptionTypeData): HitResult | null => {
      if (
        !optionData.aggregatedData.length ||
        !optionData.results ||
        !optionData.isEntrySet
      )
        return null;

      let hitResult: HitResult | null = null;
      const ltpNum = optionData.results.ltp;
      const slNum = optionData.results.sl;
      const targetNum = optionData.results.target;
      const isLong = ltpNum < targetNum;

      let startIndex = 0;
      if (optionData.entryTimestamp > 0) {
        for (let i = 0; i < optionData.aggregatedData.length; i++) {
          if (optionData.aggregatedData[i].time > optionData.entryTimestamp) {
            startIndex = i;
            break;
          } else if (
            optionData.aggregatedData[i].time === optionData.entryTimestamp
          ) {
            startIndex = i + 1;
            break;
          }
        }
      }

      for (let i = startIndex; i < optionData.aggregatedData.length; i++) {
        const candle = optionData.aggregatedData[i];
        const candleTimeStr = formatDateWithTime(candle.time);

        if (isLong) {
          if (candle.low <= slNum) {
            hitResult = {
              level: "SL",
              time: candleTimeStr,
              price: Math.min(slNum, candle.low),
              index: i,
              candleTime: candle.time,
              candleDetails: {
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
              },
            };
            break;
          }
          if (candle.high >= targetNum) {
            hitResult = {
              level: "Target",
              time: candleTimeStr,
              price: Math.max(targetNum, candle.high),
              index: i,
              candleTime: candle.time,
              candleDetails: {
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
              },
            };
            break;
          }
        } else {
          if (candle.high >= slNum) {
            hitResult = {
              level: "SL",
              time: candleTimeStr,
              price: Math.max(slNum, candle.high),
              index: i,
              candleTime: candle.time,
              candleDetails: {
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
              },
            };
            break;
          }
          if (candle.low <= targetNum) {
            hitResult = {
              level: "Target",
              time: candleTimeStr,
              price: Math.min(targetNum, candle.low),
              index: i,
              candleTime: candle.time,
              candleDetails: {
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
              },
            };
            break;
          }
        }
      }

      return hitResult;
    },
    [],
  );

  const drawAllLines = useCallback(
    (type: "CE" | "PE") => {
      const isCE = type === "CE";
      const seriesRef = isCE ? ceSeriesRef : peSeriesRef;
      const ltpLineRef = isCE ? ceLtpLineRef : peLtpLineRef;
      const slLineRef = isCE ? ceSlLineRef : peSlLineRef;
      const targetLineRef = isCE ? ceTargetLineRef : peTargetLineRef;
      const optionData = isCE ? ceChartData : peChartData;
      const setOptionData = isCE ? setCeChartData : setPeChartData;

      if (!seriesRef.current) return;

      if (ltpLineRef.current)
        seriesRef.current.removePriceLine(ltpLineRef.current);
      if (slLineRef.current)
        seriesRef.current.removePriceLine(slLineRef.current);
      if (targetLineRef.current)
        seriesRef.current.removePriceLine(targetLineRef.current);

      if (optionData.ltp && !isNaN(Number(optionData.ltp))) {
        ltpLineRef.current = seriesRef.current.createPriceLine({
          price: Number(optionData.ltp),
          color: "#00BFFF",
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `Entry @ ${optionData.selectedTime}`,
          axisLabelColor: "#00BFFF",
        });
      }

      if (optionData.sl && !isNaN(Number(optionData.sl))) {
        slLineRef.current = seriesRef.current.createPriceLine({
          price: Number(optionData.sl),
          color: theme === "light" ? "#dc2626" : "#ef4444",
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `SL @ ${optionData.selectedTime}`,
        });
      }

      if (optionData.target && !isNaN(Number(optionData.target))) {
        targetLineRef.current = seriesRef.current.createPriceLine({
          price: Number(optionData.target),
          color: theme === "light" ? "#16a34a" : "#22c55e",
          lineWidth: 1,
          lineStyle: LightweightCharts.LineStyle.Solid,
          axisLabelVisible: true,
          title: `Target @ ${optionData.selectedTime}`,
        });
      }

      setOptionData((prev) => ({ ...prev, isEntrySet: true }));
    },
    [ceChartData, peChartData, theme],
  );

  const handleClearLines = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const seriesRef = isCE ? ceSeriesRef : peSeriesRef;
    const ltpLineRef = isCE ? ceLtpLineRef : peLtpLineRef;
    const slLineRef = isCE ? ceSlLineRef : peSlLineRef;
    const targetLineRef = isCE ? ceTargetLineRef : peTargetLineRef;
    const setOptionData = isCE ? setCeChartData : setPeChartData;

    setOptionData((prev) => ({
      ...prev,
      ltp: "",
      sl: "",
      target: "",
      selectedTime: "09:21",
      quantity: "65",
      isEntrySet: false,
      firstHit: null,
      entryTimestamp: 0,
      entryDateStr: "",
    }));

    if (!seriesRef.current) return;

    if (ltpLineRef.current) {
      seriesRef.current.removePriceLine(ltpLineRef.current);
      ltpLineRef.current = null;
    }
    if (slLineRef.current) {
      seriesRef.current.removePriceLine(slLineRef.current);
      slLineRef.current = null;
    }
    if (targetLineRef.current) {
      seriesRef.current.removePriceLine(targetLineRef.current);
      targetLineRef.current = null;
    }
  };

  useEffect(() => {
    if (ceChartData.aggregatedData.length > 0) {
      const aggregated = aggregateDataByTimeframe(ceChartData.data, timeframe);
      setCeChartData((prev) => ({ ...prev, aggregatedData: aggregated }));
    }
  }, [ceChartData.data, timeframe]);

  useEffect(() => {
    if (peChartData.aggregatedData.length > 0) {
      const aggregated = aggregateDataByTimeframe(peChartData.data, timeframe);
      setPeChartData((prev) => ({ ...prev, aggregatedData: aggregated }));
    }
  }, [peChartData.data, timeframe]);

  useEffect(() => {
    setCeChartData((prev) => ({
      ...prev,
      results: calculateResults(prev.ltp, prev.sl, prev.target, prev.quantity),
    }));
  }, [
    ceChartData.ltp,
    ceChartData.sl,
    ceChartData.target,
    ceChartData.quantity,
  ]);

  useEffect(() => {
    setPeChartData((prev) => ({
      ...prev,
      results: calculateResults(prev.ltp, prev.sl, prev.target, prev.quantity),
    }));
  }, [
    peChartData.ltp,
    peChartData.sl,
    peChartData.target,
    peChartData.quantity,
  ]);

  useEffect(() => {
    if (ceChartData.selectedTime && ceChartData.aggregatedData.length > 0) {
      const { timestamp, dateStr } = parseEntryTime(
        ceChartData.selectedTime,
        ceChartData.aggregatedData,
      );
      setCeChartData((prev) => ({
        ...prev,
        entryTimestamp: timestamp,
        entryDateStr: dateStr,
      }));
    }
  }, [ceChartData.selectedTime, ceChartData.aggregatedData, parseEntryTime]);

  useEffect(() => {
    if (peChartData.selectedTime && peChartData.aggregatedData.length > 0) {
      const { timestamp, dateStr } = parseEntryTime(
        peChartData.selectedTime,
        peChartData.aggregatedData,
      );
      setPeChartData((prev) => ({
        ...prev,
        entryTimestamp: timestamp,
        entryDateStr: dateStr,
      }));
    }
  }, [peChartData.selectedTime, peChartData.aggregatedData, parseEntryTime]);

  useEffect(() => {
    if (ceChartData.isEntrySet && ceChartData.results) {
      const hit = checkFirstHit(ceChartData);
      setCeChartData((prev) => ({ ...prev, firstHit: hit }));
    }
  }, [
    ceChartData.isEntrySet,
    ceChartData.results,
    ceChartData.entryTimestamp,
    ceChartData.aggregatedData,
    checkFirstHit,
  ]);

  useEffect(() => {
    if (peChartData.isEntrySet && peChartData.results) {
      const hit = checkFirstHit(peChartData);
      setPeChartData((prev) => ({ ...prev, firstHit: hit }));
    }
  }, [
    peChartData.isEntrySet,
    peChartData.results,
    peChartData.entryTimestamp,
    peChartData.aggregatedData,
    checkFirstHit,
  ]);

  // Replace your existing chart initialization useEffect with this:

  useEffect(() => {
    if (!ceChartRef.current || ceChartData.aggregatedData.length === 0) return;

    // Clean up existing chart before creating new one
    if (ceChartInstanceRef.current) {
      try {
        ceChartInstanceRef.current.remove();
      } catch (e) {
        console.log("Error removing CE chart:", e);
      }
      ceChartInstanceRef.current = null;
      ceSeriesRef.current = null;
    }

    const cleanup = initializeChart(
      ceChartRef,
      ceChartData.aggregatedData,
      ceChartInstanceRef,
      ceSeriesRef,
      setCeHoverData,
      "CE",
      "#16a34a",
    );

    return () => {
      if (ceChartInstanceRef.current) {
        try {
          ceChartInstanceRef.current.remove();
        } catch (e) {
          console.log("Error in CE chart cleanup:", e);
        }
        ceChartInstanceRef.current = null;
        ceSeriesRef.current = null;
      }
    };
  }, [ceChartData.aggregatedData, initializeChart]);

  useEffect(() => {
    if (!peChartRef.current || peChartData.aggregatedData.length === 0) return;

    // Clean up existing chart before creating new one
    if (peChartInstanceRef.current) {
      try {
        peChartInstanceRef.current.remove();
      } catch (e) {
        console.log("Error removing PE chart:", e);
      }
      peChartInstanceRef.current = null;
      peSeriesRef.current = null;
    }

    const cleanup = initializeChart(
      peChartRef,
      peChartData.aggregatedData,
      peChartInstanceRef,
      peSeriesRef,
      setPeHoverData,
      "PE",
      "#dc2626",
    );

    return () => {
      if (peChartInstanceRef.current) {
        try {
          peChartInstanceRef.current.remove();
        } catch (e) {
          console.log("Error in PE chart cleanup:", e);
        }
        peChartInstanceRef.current = null;
        peSeriesRef.current = null;
      }
    };
  }, [peChartData.aggregatedData, initializeChart]);

  useEffect(() => {
    if (ceSeriesRef.current && ceChartData.isEntrySet) {
      setTimeout(() => drawAllLines("CE"), 200);
    }
  }, [ceChartData.aggregatedData, ceChartData.isEntrySet, drawAllLines]);

  useEffect(() => {
    if (peSeriesRef.current && peChartData.isEntrySet) {
      setTimeout(() => drawAllLines("PE"), 200);
    }
  }, [peChartData.aggregatedData, peChartData.isEntrySet, drawAllLines]);

  useEffect(() => {
    if (
      syncCharts &&
      ceChartInstanceRef.current &&
      peChartInstanceRef.current
    ) {
      const syncTimeScale = () => {
        const ceVisibleRange = ceChartInstanceRef.current
          .timeScale()
          .getVisibleRange();
        if (ceVisibleRange) {
          peChartInstanceRef.current
            .timeScale()
            .setVisibleRange(ceVisibleRange);
        }
      };

      ceChartInstanceRef.current
        .timeScale()
        .subscribeVisibleTimeRangeChange(syncTimeScale);
      return () => {
        if (ceChartInstanceRef.current) {
          ceChartInstanceRef.current
            .timeScale()
            .unsubscribeVisibleTimeRangeChange(syncTimeScale);
        }
      };
    }
  }, [syncCharts, ceChartInstanceRef.current, peChartInstanceRef.current]);

  // Add this cleanup effect at the end of your useEffect hooks
  useEffect(() => {
    return () => {
      // Clean up charts on component unmount
      if (ceChartInstanceRef.current) {
        try {
          ceChartInstanceRef.current.remove();
        } catch (e) {
          console.log("Error in final CE cleanup:", e);
        }
      }
      if (peChartInstanceRef.current) {
        try {
          peChartInstanceRef.current.remove();
        } catch (e) {
          console.log("Error in final PE cleanup:", e);
        }
      }
    };
  }, []);

  // Export functions
  const exportMinuteAnalysisCSV = useCallback(() => {
    if (!currentAnalysis) return;

    setExportProgress(0);

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
      "CE Vol/OI",
      "CE Candle",
      "CE Return %",
      "PE Open",
      "PE High",
      "PE Low",
      "PE Close",
      "PE Volume",
      "PE OI",
      "PE Vol/OI",
      "PE Candle",
      "PE Return %",
      "Vol Diff",
      "Vol Ratio",
      "OI Diff",
      "OI Ratio",
      "Vol/OI Diff",
      "Return Diff %",
      "Candle Comparison",
      "CE Won",
      "Direction Agreement",
    ];

    const rows = [headers.join(",")];

    currentAnalysis.minuteComparisons.forEach((comp, index) => {
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
        comp.ceData.volumeToOIRatio.toFixed(2),
        comp.ceData.candleType,
        comp.ceData.returnPercent.toFixed(2),
        comp.peData.open.toFixed(2),
        comp.peData.high.toFixed(2),
        comp.peData.low.toFixed(2),
        comp.peData.close.toFixed(2),
        comp.peData.volume,
        comp.peData.oi,
        comp.peData.volumeToOIRatio.toFixed(2),
        comp.peData.candleType,
        comp.peData.returnPercent.toFixed(2),
        comp.comparison.volumeDifference,
        comp.comparison.volumeRatio.toFixed(2),
        comp.comparison.oiDifference,
        comp.comparison.oiRatio.toFixed(2),
        comp.comparison.volumeToOIRatioDifference.toFixed(2),
        comp.comparison.returnDifference.toFixed(2),
        comp.comparison.candleComparison,
        comp.comparison.ceWon ? "Yes" : "No",
        comp.comparison.directionAgreement ? "Yes" : "No",
      ].join(",");
      rows.push(row);

      setExportProgress(
        Math.round(
          ((index + 1) / currentAnalysis.minuteComparisons.length) * 100,
        ),
      );
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `ce-pe-minute-analysis-${currentAnalysis.date}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setExportProgress(0), 1000);
  }, [currentAnalysis]);

  const exportMinuteAnalysisExcel = useCallback(() => {
    if (!currentAnalysis) return;

    setExportProgress(0);

    const wb = XLSX.utils.book_new();

    const summaryData: (string | number)[][] = [
      [
        "Date",
        "CE File",
        "PE File",
        "CE Strike",
        "PE Strike",
        "Total Minutes",
        "CE Volume",
        "PE Volume",
        "CE OI",
        "PE OI",
        "CE Avg Vol/OI",
        "PE Avg Vol/OI",
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
        "CE Higher Vol",
        "PE Higher Vol",
        "CE Higher OI",
        "PE Higher OI",
        "CE Higher Vol/OI",
        "PE Higher Vol/OI",
      ],
    ];

    summaryData.push([
      currentAnalysis.date,
      currentAnalysis.ceFileName,
      currentAnalysis.peFileName,
      currentAnalysis.ceStrikePrice,
      currentAnalysis.peStrikePrice,
      currentAnalysis.summary.totalMinutes,
      currentAnalysis.summary.ceTotalVolume,
      currentAnalysis.summary.peTotalVolume,
      currentAnalysis.summary.ceTotalOI,
      currentAnalysis.summary.peTotalOI,
      currentAnalysis.summary.ceAvgVolumeToOIRatio.toFixed(2),
      currentAnalysis.summary.peAvgVolumeToOIRatio.toFixed(2),
      currentAnalysis.summary.ceAverageReturn.toFixed(2),
      currentAnalysis.summary.peAverageReturn.toFixed(2),
      currentAnalysis.summary.ceWins,
      currentAnalysis.summary.peWins,
      currentAnalysis.summary.directionAgreement,
      `${((currentAnalysis.summary.directionAgreement / currentAnalysis.summary.totalMinutes) * 100).toFixed(1)}%`,
      currentAnalysis.summary.ceBullishMinutes,
      currentAnalysis.summary.ceBearishMinutes,
      currentAnalysis.summary.peBullishMinutes,
      currentAnalysis.summary.peBearishMinutes,
      currentAnalysis.summary.minutesWithCEHigherVolume,
      currentAnalysis.summary.minutesWithPEHigherVolume,
      currentAnalysis.summary.minutesWithCEHigherOI,
      currentAnalysis.summary.minutesWithPEHigherOI,
      currentAnalysis.summary.minutesWithCEHigherVolumeToOIRatio,
      currentAnalysis.summary.minutesWithPEHigherVolumeToOIRatio,
    ]);

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    const minuteData = currentAnalysis.minuteComparisons.map((comp) => [
      comp.time,
      comp.minuteNumber,
      comp.ceData.open.toFixed(2),
      comp.ceData.high.toFixed(2),
      comp.ceData.low.toFixed(2),
      comp.ceData.close.toFixed(2),
      comp.ceData.volume,
      comp.ceData.oi,
      comp.ceData.volumeToOIRatio.toFixed(2),
      comp.ceData.candleType,
      comp.ceData.returnPercent.toFixed(2),
      comp.ceData.bodySize.toFixed(2),
      comp.peData.open.toFixed(2),
      comp.peData.high.toFixed(2),
      comp.peData.low.toFixed(2),
      comp.peData.close.toFixed(2),
      comp.peData.volume,
      comp.peData.oi,
      comp.peData.volumeToOIRatio.toFixed(2),
      comp.peData.candleType,
      comp.peData.returnPercent.toFixed(2),
      comp.peData.bodySize.toFixed(2),
      comp.comparison.volumeDifference,
      comp.comparison.volumeRatio.toFixed(2),
      comp.comparison.oiDifference,
      comp.comparison.oiRatio.toFixed(2),
      comp.comparison.volumeToOIRatioDifference.toFixed(2),
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
      "CE Vol/OI",
      "CE Candle",
      "CE Return %",
      "CE Body Size",
      "PE Open",
      "PE High",
      "PE Low",
      "PE Close",
      "PE Volume",
      "PE OI",
      "PE Vol/OI",
      "PE Candle",
      "PE Return %",
      "PE Body Size",
      "Vol Diff",
      "Vol Ratio",
      "OI Diff",
      "OI Ratio",
      "Vol/OI Diff",
      "Return Diff %",
      "Candle Comparison",
      "CE Won",
      "Direction Agreement",
    ];

    const wsMinute = XLSX.utils.aoa_to_sheet([minuteHeaders, ...minuteData]);
    XLSX.utils.book_append_sheet(wb, wsMinute, "Minute Data");

    XLSX.writeFile(wb, `ce-pe-minute-comparison-${currentAnalysis.date}.xlsx`);

    setExportProgress(100);
    setTimeout(() => setExportProgress(0), 1000);
  }, [currentAnalysis]);

  const renderUploadSection = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const fileName = isCE ? ceFileName : peFileName;
    const optionData = isCE ? ceChartData : peChartData;
    const setOptionData = isCE ? setCeChartData : setPeChartData;
    const bgColor = isCE
      ? "bg-green-50 dark:bg-green-900/20"
      : "bg-red-50 dark:bg-red-900/20";
    const borderColor = isCE ? "border-green-500" : "border-red-500";
    const textColor = isCE
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

    return (
      <div
        className={`${bgColor} p-4 rounded-lg border ${borderColor} border-opacity-30`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold ${textColor}`}>{type} Data</h3>
          {fileName && (
            <span className="text-xs text-gray-500 truncate max-w-[150px]">
              {fileName}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <label className="!hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <IconUpload size={18} className="text-gray-500" />
            <span className="text-sm">Upload {type} CSV</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload([file]);
              }}
            />
          </label>

          {optionData.aggregatedData.length > 0 && (
            <>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Entry Price"
                  value={optionData.ltp}
                  onChange={(e) =>
                    setOptionData((prev) => ({ ...prev, ltp: e.target.value }))
                  }
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-24 text-sm"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="SL"
                  value={optionData.sl}
                  onChange={(e) =>
                    setOptionData((prev) => ({ ...prev, sl: e.target.value }))
                  }
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-20 text-sm"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Target"
                  value={optionData.target}
                  onChange={(e) =>
                    setOptionData((prev) => ({
                      ...prev,
                      target: e.target.value,
                    }))
                  }
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-20 text-sm"
                  step="0.01"
                />
                <input
                  type="time"
                  value={optionData.selectedTime}
                  onChange={(e) =>
                    setOptionData((prev) => ({
                      ...prev,
                      selectedTime: e.target.value,
                    }))
                  }
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-24 text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={optionData.quantity}
                  onChange={(e) =>
                    setOptionData((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-16 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => drawAllLines(type)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium"
                >
                  Analyze
                </button>
                <button
                  onClick={() => handleClearLines(type)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded text-sm"
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>

        {optionData.results && (
          <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
            <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
              <span className="text-gray-500">Margin</span>
              <div className="font-bold">
                ₹
                {optionData.results.totalMargin.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
              <span className="text-green-600 dark:text-green-400">Target</span>
              <div className="font-bold text-green-600 dark:text-green-400">
                +₹
                {optionData.results.totalProfit.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
              <span className="text-red-600 dark:text-red-400">SL</span>
              <div className="font-bold text-red-600 dark:text-red-400">
                -₹
                {Math.abs(optionData.results.totalLoss).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2 },
                )}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-200 dark:border-purple-800">
              <span className="text-purple-600 dark:text-purple-400">
                Position
              </span>
              <div className="font-bold">
                {optionData.results.ltp < optionData.results.target
                  ? "LONG"
                  : "SHORT"}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChartContainer = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const chartRef = isCE ? ceChartRef : peChartRef;
    const optionData = isCE ? ceChartData : peChartData;
    const hoverData = isCE ? ceHoverData : peHoverData;

    return (
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isCE ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="font-bold">{type}</span>
            <span className="text-xs text-gray-500">
              {optionData.aggregatedData.length} candles
            </span>
          </div>
          {optionData.firstHit && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${isCE ? "text-green-600" : "text-red-600"}`}
              >
                Hit: {optionData.firstHit.level} at{" "}
                {optionData.firstHit.time.split(" ")[1]}
              </span>
            </div>
          )}
        </div>
        <div ref={chartRef} className="w-full h-[300px] md:h-[400px]" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {!files.length && (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                CE vs PE Minute-by-Minute Analyzer
              </h1>
              <p className="text-gray-600 mt-2">
                Upload CE and PE CSV files to analyze first hour data
                (9:15-10:15) minute by minute
              </p>
            </header>

            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload CE & PE CSV Files
                </h2>
                <p className="text-gray-600">
                  Upload multiple files - the system will automatically group
                  them by date
                </p>
              </div>

              {/* Local Upload Area */}
              <div
                className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all mb-6 ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                  !isProcessing &&
                  !showDrivePicker &&
                  fileInputRef.current?.click()
                }
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
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Processing Files...
                    </p>
                    <p className="text-gray-600">
                      Please wait while we analyze your data
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      Drag & drop CSV files here
                    </p>
                    <p className="text-gray-600 mb-4">
                      or click to browse files
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Supports multiple CSV files
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Google Drive Section */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">
                      Or load from Google Drive
                    </span>
                  </div>
                </div>

                {!showDrivePicker ? (
                  <div className="mt-6 text-center">
                    <button
                      onClick={fetchGoogleDriveStructure}
                      disabled={isLoadingDrive || isProcessing}
                      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingDrive ? (
                        <>
                          <Loader className="w-5 h-5 mr-2 animate-spin" />
                          Loading Drive...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-5 h-5 mr-2" />
                          Browse Google Drive Folder
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    {driveData && (
                      <>
                        <FolderTree
                          data={driveData}
                          onSelectFiles={handleGoogleDriveFiles}
                          isProcessing={isProcessing}
                        />
                        <button
                          onClick={() => {
                            setShowDrivePicker(false);
                            setDriveData(null);
                          }}
                          className="mt-4 text-sm text-gray-600 hover:text-gray-800"
                        >
                          ← Back to upload options
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* File Naming Requirements */}
              <div className="bg-gray-50 rounded-xl p-4 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  File Naming Requirements
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">
                      Include{" "}
                      <span className="font-mono font-semibold">"CE"</span> in
                      filename for Call options
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">
                      Include{" "}
                      <span className="font-mono font-semibold">"PE"</span> in
                      filename for Put options
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">
                      Files with same date will be automatically paired for
                      comparison
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Uploaded Files ({files.length})
              </h3>
              <button
                onClick={clearAllFiles}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>

            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    selectedFilesList.has(file.id)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFileSelection(file.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center ${
                        selectedFilesList.has(file.id)
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {selectedFilesList.has(file.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.data[0]?.date} • {file.data.length} candles •
                          First hour: {file.firstHourData.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {file.data[0]?.optionType && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          file.data[0].optionType === "CE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {file.data[0].optionType}{" "}
                        {file.data[0]?.strikePrice || ""}
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Section - Shows only when a date is selected */}
        {currentAnalysis && (
          <div className="space-y-6">
            {/* Table Header with File Names */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500 md:sticky top-0 z-50">
              <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                {availableDates.length > 0 && (
                  <div>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {availableDates.map((option) => (
                        <option key={option.date} value={option.date}>
                          {/* {option.display} */}
                          {option.date}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="font-medium text-blue-700">CE File:</span>
                  <span className="ml-2 text-gray-700">
                    {currentAnalysis.ceFileName}
                  </span>
                </div>
                <div className="bg-red-50 px-4 py-2 rounded-lg">
                  <span className="font-medium text-red-700">PE File:</span>
                  <span className="ml-2 text-gray-700">
                    {currentAnalysis.peFileName}
                  </span>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex flex-wrap gap-3 justify-end !hidden">
              <button
                onClick={exportMinuteAnalysisCSV}
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
                onClick={exportMinuteAnalysisExcel}
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

            {/* Analysis Cards Toggle */}
            <div className="flex gap-4">
              <button
                onClick={() => setActiveCard("cumulative")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeCard === "cumulative"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                9:15-9:27 Cumulative Analysis
              </button>
              <button
                onClick={() => setActiveCard("thirtyPoint")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  activeCard === "thirtyPoint"
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Target className="w-4 h-4" />
                30-Point Analysis (from 9:30)
              </button>
            </div>

            {/* 9:15-9:27 Cumulative Card */}
            {activeCard === "cumulative" && cumulativeData && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  First 12 Minutes Analysis (9:15 - 9:27)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Volume Comparison */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Cumulative Volume
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-blue-600 font-medium">CE</span>
                          <span className="font-semibold">
                            {formatCompactNumber(
                              cumulativeData.ceCumulativeVolume,
                            )}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(cumulativeData.ceCumulativeVolume / (cumulativeData.ceCumulativeVolume + cumulativeData.peCumulativeVolume)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600 font-medium">PE</span>
                          <span className="font-semibold">
                            {formatCompactNumber(
                              cumulativeData.peCumulativeVolume,
                            )}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(cumulativeData.peCumulativeVolume / (cumulativeData.ceCumulativeVolume + cumulativeData.peCumulativeVolume)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Leader: </span>
                        <span
                          className={`font-semibold ${
                            cumulativeData.volumeLeader === "CE"
                              ? "text-blue-600"
                              : cumulativeData.volumeLeader === "PE"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {cumulativeData.volumeLeader}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* OI Comparison */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Cumulative OI
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-blue-600 font-medium">CE</span>
                          <span className="font-semibold">
                            {formatCompactNumber(cumulativeData.ceCumulativeOI)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{
                              width: `${(cumulativeData.ceCumulativeOI / (cumulativeData.ceCumulativeOI + cumulativeData.peCumulativeOI)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600 font-medium">PE</span>
                          <span className="font-semibold">
                            {formatCompactNumber(cumulativeData.peCumulativeOI)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(cumulativeData.peCumulativeOI / (cumulativeData.ceCumulativeOI + cumulativeData.peCumulativeOI)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Leader: </span>
                        <span
                          className={`font-semibold ${
                            cumulativeData.oiLeader === "CE"
                              ? "text-blue-600"
                              : cumulativeData.oiLeader === "PE"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {cumulativeData.oiLeader}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Movement */}
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Price Change (%)
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-blue-600 font-medium">CE</span>
                          <span
                            className={`font-semibold ${
                              cumulativeData.cePriceChange >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {cumulativeData.cePriceChange >= 0 ? "+" : ""}
                            {cumulativeData.cePriceChange.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {cumulativeData.ceStartPrice.toFixed(1)} →{" "}
                          {cumulativeData.ceEndPrice.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-red-600 font-medium">PE</span>
                          <span
                            className={`font-semibold ${
                              cumulativeData.pePriceChange >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {cumulativeData.pePriceChange >= 0 ? "+" : ""}
                            {cumulativeData.pePriceChange.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {cumulativeData.peStartPrice.toFixed(1)} →{" "}
                          {cumulativeData.peEndPrice.toFixed(1)}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm text-gray-600">
                          Price Leader:{" "}
                        </span>
                        <div
                          className={`font-semibold flex justify-between ${
                            cumulativeData.priceLeader === "CE"
                              ? "text-blue-600"
                              : cumulativeData.priceLeader === "PE"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {cumulativeData.priceLeader} {/* Extra Added */}
                          <div className="text-[14px]">
                            {cumulativeData.priceLeader === "CE"
                              ? currentAnalysis.ceFileName?.split("_")?.[1]
                              : cumulativeData.priceLeader === "PE"
                                ? currentAnalysis.peFileName?.split("_")?.[1]
                                : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 30-Point Analysis Card */}
            {activeCard === "thirtyPoint" && thirtyPointAnalysis && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  30-Point Movement Analysis (from 9:30 AM)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CE Analysis */}
                  <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-blue-700">
                        Call Option (CE) - Strike{" "}
                        {currentAnalysis.ceStrikePrice}
                      </span>
                      {thirtyPointAnalysis.ceReached && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Target Reached
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Max Points:</span>
                        <span className="font-bold text-lg text-blue-600">
                          +{thirtyPointAnalysis.ceMaxPoints.toFixed(1)}
                        </span>
                      </div>

                      {thirtyPointAnalysis.ceReached ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Reached at:</span>
                            <span className="font-semibold">
                              {thirtyPointAnalysis.ceReachedAtTime}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Minutes to reach:
                            </span>
                            <span className="font-semibold text-purple-600">
                              {thirtyPointAnalysis.ceMinutesToReach} minutes
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-semibold text-orange-600">
                            Not reached 30 points
                          </span>
                        </div>
                      )}

                      {thirtyPointAnalysis.ceMaxTime && (
                        <div className="text-xs text-gray-500 mt-2">
                          Max at {thirtyPointAnalysis.ceMaxTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* PE Analysis */}
                  <div className="bg-white rounded-lg p-5 shadow-sm border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-red-700">
                        Put Option (PE) - Strike {currentAnalysis.peStrikePrice}
                      </span>
                      {thirtyPointAnalysis.peReached && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Target Reached
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Max Points:</span>
                        <span className="font-bold text-lg text-red-600">
                          +{thirtyPointAnalysis.peMaxPoints.toFixed(1)}
                        </span>
                      </div>

                      {thirtyPointAnalysis.peReached ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Reached at:</span>
                            <span className="font-semibold">
                              {thirtyPointAnalysis.peReachedAtTime}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Minutes to reach:
                            </span>
                            <span className="font-semibold text-purple-600">
                              {thirtyPointAnalysis.peMinutesToReach} minutes
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-semibold text-orange-600">
                            Not reached 30 points
                          </span>
                        </div>
                      )}

                      {thirtyPointAnalysis.peMaxTime && (
                        <div className="text-xs text-gray-500 mt-2">
                          Max at {thirtyPointAnalysis.peMaxTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Winner Section */}
                  <div className="md:col-span-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 text-center">
                    {thirtyPointAnalysis.firstToReach ? (
                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <span className="text-gray-700">
                          First to reach 30 points:
                        </span>
                        <span
                          className={`px-4 py-2 rounded-lg font-bold text-lg ${
                            thirtyPointAnalysis.firstToReach === "CE"
                              ? "bg-blue-600 text-white"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {thirtyPointAnalysis.firstToReach === "CE"
                            ? "CE"
                            : "PE"}
                        </span>
                        {thirtyPointAnalysis.firstToReach === "CE"
                          ? thirtyPointAnalysis.ceReachedAtTime
                          : thirtyPointAnalysis.peReachedAtTime && (
                              <span className="text-gray-600">
                                at{" "}
                                {thirtyPointAnalysis.firstToReach === "CE"
                                  ? thirtyPointAnalysis.ceReachedAtTime
                                  : thirtyPointAnalysis.peReachedAtTime}
                              </span>
                            )}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Neither CE nor PE reached 30 points by 10:15 AM
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  CE Performance
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {currentAnalysis.summary.ceWins} /{" "}
                  {currentAnalysis.summary.totalMinutes}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Wins:{" "}
                  {(
                    (currentAnalysis.summary.ceWins /
                      currentAnalysis.summary.totalMinutes) *
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
                  {currentAnalysis.summary.peWins} /{" "}
                  {currentAnalysis.summary.totalMinutes}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Wins:{" "}
                  {(
                    (currentAnalysis.summary.peWins /
                      currentAnalysis.summary.totalMinutes) *
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
                  {currentAnalysis.summary.directionAgreement} /{" "}
                  {currentAnalysis.summary.totalMinutes}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {(
                    (currentAnalysis.summary.directionAgreement /
                      currentAnalysis.summary.totalMinutes) *
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
                  className={`text-2xl font-bold ${
                    currentAnalysis.summary.ceAverageReturn -
                      currentAnalysis.summary.peAverageReturn >=
                    0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(
                    currentAnalysis.summary.ceAverageReturn -
                    currentAnalysis.summary.peAverageReturn
                  ).toFixed(2)}
                  %
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  CE: {currentAnalysis.summary.ceAverageReturn.toFixed(2)}% |
                  PE: {currentAnalysis.summary.peAverageReturn.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Volume, OI & Ratio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        currentAnalysis.summary.ceTotalVolume,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      PE Total Volume:
                    </span>
                    <span className="font-medium">
                      {formatCompactNumber(
                        currentAnalysis.summary.peTotalVolume,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Minutes with CE Higher:
                    </span>
                    <span className="font-medium text-green-600">
                      {currentAnalysis.summary.minutesWithCEHigherVolume}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Minutes with PE Higher:
                    </span>
                    <span className="font-medium text-red-600">
                      {currentAnalysis.summary.minutesWithPEHigherVolume}
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
                    <span className="text-sm text-gray-600">CE Total OI:</span>
                    <span className="font-medium">
                      {formatCompactNumber(currentAnalysis.summary.ceTotalOI)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">PE Total OI:</span>
                    <span className="font-medium">
                      {formatCompactNumber(currentAnalysis.summary.peTotalOI)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Minutes with CE Higher:
                    </span>
                    <span className="font-medium text-green-600">
                      {currentAnalysis.summary.minutesWithCEHigherOI}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Minutes with PE Higher:
                    </span>
                    <span className="font-medium text-red-600">
                      {currentAnalysis.summary.minutesWithPEHigherOI}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Volume/OI Ratio Analysis
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      CE Avg Vol/OI:
                    </span>
                    <span className="font-medium">
                      {formatRatio(
                        currentAnalysis.summary.ceAvgVolumeToOIRatio,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      PE Avg Vol/OI:
                    </span>
                    <span className="font-medium">
                      {formatRatio(
                        currentAnalysis.summary.peAvgVolumeToOIRatio,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Minutes with CE Higher:
                    </span>
                    <span className="font-medium text-green-600">
                      {
                        currentAnalysis.summary
                          .minutesWithCEHigherVolumeToOIRatio
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Minutes with PE Higher:
                    </span>
                    <span className="font-medium text-red-600">
                      {
                        currentAnalysis.summary
                          .minutesWithPEHigherVolumeToOIRatio
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Minute-by-Minute Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Minute-by-Minute Comparison (Full 60 Minutes: 9:15-10:15)
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Time
                      </th>
                      <th
                        colSpan={6}
                        className="px-4 py-3 text-center text-xs font-medium text-blue-600 uppercase tracking-wider border-r border-l bg-gray-50"
                      >
                        CE Data ({currentAnalysis.ceFileName})
                      </th>
                      <th
                        colSpan={6}
                        className="px-4 py-3 text-center text-xs font-medium text-red-600 uppercase tracking-wider bg-gray-50"
                      >
                        PE Data ({currentAnalysis.peFileName})
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                        Comparison
                      </th>
                    </tr>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50"></th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        OHLC
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Volume
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        OI
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Vol/OI
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 border-r bg-gray-50">
                        Return
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        OHLC
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Volume
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        OI
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Vol/OI
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Return
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 bg-gray-50">
                        Diff
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentAnalysis.minuteComparisons.map((comp, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-gray-50 ${comp.comparison.ceWon ? "bg-green-50/30" : "bg-red-50/30"}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {comp.time}
                        </td>
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
                                  : comp.ceData.candleType === "Bearish"
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatRatio(comp.ceData.volumeToOIRatio)}
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
                            {comp.ceData.returnPercent >= 0 ? "+" : ""}
                            {comp.ceData.returnPercent.toFixed(2)}%
                          </span>
                        </td>
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
                                  : comp.peData.candleType === "Bearish"
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {formatRatio(comp.peData.volumeToOIRatio)}
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
                            {comp.peData.returnPercent >= 0 ? "+" : ""}
                            {comp.peData.returnPercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getCandleComparisonColor(
                                comp.comparison.candleComparison,
                              )}`}
                            >
                              {comp.comparison.candleComparison}
                            </span>
                            <div className="text-xs">
                              <span className="text-gray-600">Vol: </span>
                              <span
                                className={
                                  comp.comparison.volumeDifference >= 0
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
                              <span className="text-gray-600">Vol/OI: </span>
                              <span
                                className={
                                  comp.comparison.volumeToOIRatioDifference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {comp.comparison.volumeToOIRatioDifference >= 0
                                  ? "+"
                                  : ""}
                                {formatRatio(
                                  comp.comparison.volumeToOIRatioDifference,
                                )}
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-600">Return: </span>
                              <span
                                className={
                                  comp.comparison.returnDifference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {comp.comparison.returnDifference >= 0
                                  ? "+"
                                  : ""}
                                {comp.comparison.returnDifference.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="chart-controls space-y-5 hidden md:block">
              {/* Global Chart Controls */}
              <div className="flex flex-wrap justify-between items-center p-4 bg-white rounded-xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Timeframe:
                    </span>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded text-sm"
                    >
                      {timeframeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Chart Type:
                    </span>
                    <div className="flex border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setChartType("candlestick")}
                        className={`p-1.5 ${chartType === "candlestick" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                      >
                        <IconChartCandle size={18} />
                      </button>
                      <button
                        onClick={() => setChartType("line")}
                        className={`p-1.5 ${chartType === "line" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                      >
                        <IconChartLine size={18} />
                      </button>
                      <button
                        onClick={() => setChartType("area")}
                        className={`p-1.5 ${chartType === "area" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                      >
                        <IconChartAreaLine size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={syncCharts}
                        onChange={(e) => setSyncCharts(e.target.checked)}
                        className="rounded"
                      />
                      Sync Charts
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleClearLines("CE");
                    handleClearLines("PE");
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <IconRefresh size={16} />
                  Clear All
                </button>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-5">
                  {renderUploadSection("CE")}
                  {renderChartContainer("CE")}
                </div>
                <div className="space-y-5">
                  {renderUploadSection("PE")}
                  {renderChartContainer("PE")}
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex justify-center gap-6 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-[#00BFFF]"></div>
                  <span className="text-sm">Entry Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-red-500"></div>
                  <span className="text-sm">Stop Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-green-500"></div>
                  <span className="text-sm">Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">CE</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">PE</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinuteAnalysisAllInOne;
