// "use client";

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import * as LightweightCharts from "lightweight-charts";
// import {
//   IconCoinRupeeFilled,
//   IconTargetArrow,
//   IconTargetOff,
//   IconUpload,
//   IconRefresh,
//   IconChartCandle,
//   IconChartLine,
//   IconChartAreaLine,
// } from "@tabler/icons-react";

// const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

// // ==================== CONSTANTS & HELPER FUNCTIONS ====================

// const timeframeOptions = [
//   { label: "1 Minute", value: "1min" },
//   { label: "3 Minutes", value: "3min" },
//   { label: "5 Minutes", value: "5min" },
//   { label: "10 Minutes", value: "10min" },
//   { label: "15 Minutes", value: "15min" },
//   { label: "30 Minutes", value: "30min" },
//   { label: "1 Hour", value: "1hour" },
// ];

// // Helper function to parse date
// const parseDateString = (dateStr: string): number => {
//   try {
//     const cleanStr = dateStr.trim();
//     let date: Date;

//     const match1 = cleanStr.match(
//       /(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s+(\d{1,2}):(\d{1,2})/,
//     );
//     if (match1) {
//       const [, day, month, year, hour, minute] = match1;
//       date = new Date(
//         parseInt(year),
//         parseInt(month) - 1,
//         parseInt(day),
//         parseInt(hour),
//         parseInt(minute),
//         0,
//       );
//     } else if (cleanStr.match(/\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2}/)) {
//       date = new Date(cleanStr.replace(" ", "T"));
//     } else {
//       date = new Date(cleanStr);
//     }

//     if (isNaN(date.getTime())) return 0;
//     return Math.floor(date.getTime() / 1000) - IST_OFFSET_SECONDS;
//   } catch (error) {
//     console.error("Error parsing date:", dateStr, error);
//     return 0;
//   }
// };

// // Format time to IST
// const formatToIST = (timestamp: number): string => {
//   const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
//   return date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// };

// // Format date with time for hover display
// const formatDateWithTime = (timestamp: number): string => {
//   const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
//   const day = date.getDate().toString().padStart(2, "0");
//   const monthNames = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const month = monthNames[date.getMonth()];
//   const year = date.getFullYear();
//   const time = date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
//   return `${day}-${month}-${year} ${time}`;
// };

// // Format date only for x-axis
// const formatDateOnly = (timestamp: number): string => {
//   const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
//   const day = date.getDate().toString().padStart(2, "0");
//   const monthNames = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];
//   const month = monthNames[date.getMonth()];
//   const year = date.getFullYear();
//   return `${day}-${month}-${year}`;
// };

// // Format large numbers with K, M, B suffixes
// const formatLargeNumber = (value: number): string => {
//   if (value >= 1000000000) return (value / 1000000000).toFixed(2) + "B";
//   else if (value >= 1000000) return (value / 1000000).toFixed(2) + "M";
//   else if (value >= 1000) return (value / 1000).toFixed(1) + "K";
//   else return value.toString();
// };

// // Calculate duration between two times
// const calculateDuration = (entryTime: string, exitTime: string): string => {
//   if (!entryTime || !exitTime) return "";
//   try {
//     const [entryHour, entryMinute] = entryTime.split(":").map(Number);
//     const [exitHour, exitMinute] = exitTime.split(":").map(Number);
//     let totalMinutes =
//       exitHour * 60 + exitMinute - (entryHour * 60 + entryMinute);
//     if (totalMinutes < 0) totalMinutes += 24 * 60;
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
//   } catch (error) {
//     console.error("Error calculating duration:", error);
//     return "";
//   }
// };

// // Aggregate data by timeframe
// const aggregateDataByTimeframe = (
//   data: CandleData[],
//   timeframe: string,
// ): CandleData[] => {
//   if (!data.length) return [];

//   let timeframeMinutes = 1;
//   switch (timeframe) {
//     case "1min":
//       timeframeMinutes = 1;
//       break;
//     case "3min":
//       timeframeMinutes = 3;
//       break;
//     case "5min":
//       timeframeMinutes = 5;
//       break;
//     case "10min":
//       timeframeMinutes = 10;
//       break;
//     case "15min":
//       timeframeMinutes = 15;
//       break;
//     case "30min":
//       timeframeMinutes = 30;
//       break;
//     case "1hour":
//       timeframeMinutes = 60;
//       break;
//     default:
//       timeframeMinutes = 1;
//   }

//   const aggregatedData: CandleData[] = [];
//   let currentGroup: CandleData[] = [];
//   let currentGroupEndTime = 0;
//   const sortedData = [...data].sort((a, b) => a.time - b.time);

//   for (const candle of sortedData) {
//     const candleDate = new Date((candle.time + IST_OFFSET_SECONDS) * 1000);
//     const minutes = candleDate.getMinutes();
//     const bucketMinutes =
//       Math.floor(minutes / timeframeMinutes) * timeframeMinutes;
//     const bucketTime = new Date(candleDate);
//     bucketTime.setMinutes(bucketMinutes, 0, 0);
//     const bucketTimestamp =
//       Math.floor(bucketTime.getTime() / 1000) - IST_OFFSET_SECONDS;

//     if (bucketTimestamp !== currentGroupEndTime) {
//       if (currentGroup.length > 0) {
//         aggregatedData.push({
//           time: currentGroupEndTime,
//           open: currentGroup[0].open,
//           high: Math.max(...currentGroup.map((c) => c.high)),
//           low: Math.min(...currentGroup.map((c) => c.low)),
//           close: currentGroup[currentGroup.length - 1].close,
//           volume: currentGroup.reduce((sum, c) => sum + (c.volume || 0), 0),
//           oi: currentGroup.reduce((sum, c) => sum + (c.oi || 0), 0),
//         });
//       }
//       currentGroup = [candle];
//       currentGroupEndTime = bucketTimestamp;
//     } else {
//       currentGroup.push(candle);
//     }
//   }

//   if (currentGroup.length > 0) {
//     aggregatedData.push({
//       time: currentGroupEndTime,
//       open: currentGroup[0].open,
//       high: Math.max(...currentGroup.map((c) => c.high)),
//       low: Math.min(...currentGroup.map((c) => c.low)),
//       close: currentGroup[currentGroup.length - 1].close,
//       volume: currentGroup.reduce((sum, c) => sum + (c.volume || 0), 0),
//       oi: currentGroup.reduce((sum, c) => sum + (c.oi || 0), 0),
//     });
//   }

//   return aggregatedData;
// };

// // ==================== INTERFACES ====================

// interface CandleData {
//   time: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume?: number;
//   oi?: number;
// }

// interface OHLCValues {
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   time: any;
// }

// interface HitResult {
//   level: "SL" | "Target" | null;
//   time: string;
//   price: number;
//   index: number;
//   candleTime: number;
//   candleDetails: {
//     open: number;
//     high: number;
//     low: number;
//     close: number;
//   };
// }

// interface OptionTypeData {
//   name: string;
//   color: string;
//   bgColor: string;
//   borderColor: string;
//   data: CandleData[];
//   aggregatedData: CandleData[];
//   ltp: string;
//   sl: string;
//   target: string;
//   selectedTime: string;
//   quantity: string;
//   isEntrySet: boolean;
//   entryTimestamp: number;
//   entryDateStr: string;
//   firstHit: HitResult | null;
//   lastCandle: OHLCValues | null;
//   // results: ReturnType<typeof calculateResults> | null;
//   results: any
// }

// interface ComparisonChartProps {
//   initialData?: any[];
// }

// // ==================== MAIN COMPONENT ====================

// const CePeDualChart: React.FC<ComparisonChartProps> = ({
//   initialData = [],
// }) => {
//   // Chart refs
//   const ceChartRef = useRef<HTMLDivElement>(null);
//   const peChartRef = useRef<HTMLDivElement>(null);

//   // Chart instances
//   const ceChartInstanceRef = useRef<any>(null);
//   const peChartInstanceRef = useRef<any>(null);
//   const ceSeriesRef = useRef<any>(null);
//   const peSeriesRef = useRef<any>(null);

//   // Price line refs
//   const ceLtpLineRef = useRef<any>(null);
//   const ceSlLineRef = useRef<any>(null);
//   const ceTargetLineRef = useRef<any>(null);
//   const peLtpLineRef = useRef<any>(null);
//   const peSlLineRef = useRef<any>(null);
//   const peTargetLineRef = useRef<any>(null);

//   // Global settings
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const [chartType, setChartType] = useState<"candlestick" | "line" | "area">(
//     "candlestick",
//   );
//   const [timeframe, setTimeframe] = useState("1min");
//   const [syncCharts, setSyncCharts] = useState(true);
//   const [showVolume, setShowVolume] = useState(true);
//   const [showOI, setShowOI] = useState(true);

//   // CE Data
//   const [ceData, setCeData] = useState<OptionTypeData>({
//     name: "CE",
//     color: "#16a34a",
//     bgColor: "bg-green-50 dark:bg-green-900/20",
//     borderColor: "border-green-200 dark:border-green-800",
//     data: [],
//     aggregatedData: [],
//     ltp: "",
//     sl: "",
//     target: "",
//     selectedTime: "09:21",
//     quantity: "65",
//     isEntrySet: false,
//     entryTimestamp: 0,
//     entryDateStr: "",
//     firstHit: null,
//     lastCandle: null,
//     results: null,
//   });

//   // PE Data
//   const [peData, setPeData] = useState<OptionTypeData>({
//     name: "PE",
//     color: "#dc2626",
//     bgColor: "bg-red-50 dark:bg-red-900/20",
//     borderColor: "border-red-200 dark:border-red-800",
//     data: [],
//     aggregatedData: [],
//     ltp: "",
//     sl: "",
//     target: "",
//     selectedTime: "09:21",
//     quantity: "65",
//     isEntrySet: false,
//     entryTimestamp: 0,
//     entryDateStr: "",
//     firstHit: null,
//     lastCandle: null,
//     results: null,
//   });

//   // Hover data for each chart
//   const [ceHoverData, setCeHoverData] = useState<any>(null);
//   const [peHoverData, setPeHoverData] = useState<any>(null);

//   // File upload states
//   const [ceFileName, setCeFileName] = useState<string>("");
//   const [peFileName, setPeFileName] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   // ==================== FILE PROCESSING ====================

//   const processCSV = (text: string): CandleData[] => {
//     const lines = text.split("\n");
//     const headers = lines[0].toLowerCase().split(",");

//     const formattedData: CandleData[] = [];
//     let prevTime = 0;

//     for (let i = 1; i < lines.length; i++) {
//       if (!lines[i].trim()) continue;

//       const values = lines[i].split(",");
//       const row: any = {};

//       headers.forEach((header, index) => {
//         row[header.trim()] = values[index]?.trim() || "";
//       });

//       try {
//         const dateStr =
//           row.date || row.datetime || row.timestamp || row.time || "";
//         const time = parseDateString(dateStr);
//         if (time === 0) continue;

//         const currentTime = time <= prevTime ? prevTime + 60 : time;
//         prevTime = currentTime;

//         const open = parseFloat(row.open || row.o || 0);
//         const high = parseFloat(row.high || row.h || 0);
//         const low = parseFloat(row.low || row.l || 0);
//         const close = parseFloat(row.close || row.c || row.last || 0);
//         const volume = row.volume
//           ? parseFloat(row.volume)
//           : row.vol
//             ? parseFloat(row.vol)
//             : undefined;
//         const oi = row.oi
//           ? parseFloat(row.oi)
//           : row.openinterest
//             ? parseFloat(row.openinterest)
//             : undefined;

//         if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue;

//         formattedData.push({
//           time: currentTime,
//           open,
//           high,
//           low,
//           close,
//           volume,
//           oi,
//         });
//       } catch (error) {
//         console.error(`Error processing row ${i}:`, error);
//       }
//     }

//     return formattedData;
//   };

//   const handleFileUpload = (type: "CE" | "PE", file: File) => {
//     setIsLoading(true);
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const text = e.target?.result as string;
//       const processedData = processCSV(text);

//       if (type === "CE") {
//         setCeFileName(file.name);
//         const aggregated = aggregateDataByTimeframe(processedData, timeframe);
//         setCeData((prev) => ({
//           ...prev,
//           data: processedData,
//           aggregatedData: aggregated,
//         }));
//       } else {
//         setPeFileName(file.name);
//         const aggregated = aggregateDataByTimeframe(processedData, timeframe);
//         setPeData((prev) => ({
//           ...prev,
//           data: processedData,
//           aggregatedData: aggregated,
//         }));
//       }

//       setIsLoading(false);
//     };

//     reader.onerror = () => {
//       console.error(`Error reading ${type} file`);
//       setIsLoading(false);
//     };

//     reader.readAsText(file);
//   };

//   // ==================== DATA AGGREGATION ====================

//   useEffect(() => {
//     if (ceData.data.length > 0) {
//       const aggregated = aggregateDataByTimeframe(ceData.data, timeframe);
//       setCeData((prev) => ({ ...prev, aggregatedData: aggregated }));

//       if (aggregated.length > 0) {
//         const last = aggregated[aggregated.length - 1];
//         setCeData((prev) => ({
//           ...prev,
//           lastCandle: {
//             open: last.open,
//             high: last.high,
//             low: last.low,
//             close: last.close,
//             time: formatDateWithTime(last.time),
//           },
//         }));
//       }
//     }
//   }, [ceData.data, timeframe]);

//   useEffect(() => {
//     if (peData.data.length > 0) {
//       const aggregated = aggregateDataByTimeframe(peData.data, timeframe);
//       setPeData((prev) => ({ ...prev, aggregatedData: aggregated }));

//       if (aggregated.length > 0) {
//         const last = aggregated[aggregated.length - 1];
//         setPeData((prev) => ({
//           ...prev,
//           lastCandle: {
//             open: last.open,
//             high: last.high,
//             low: last.low,
//             close: last.close,
//             time: formatDateWithTime(last.time),
//           },
//         }));
//       }
//     }
//   }, [peData.data, timeframe]);

//   // ==================== CALCULATIONS ====================

//   const calculateResults: any = useCallback(
//     (ltp: string, sl: string, target: string, quantity: string) => {
//       if (!ltp || !sl || !target || !quantity) return null;

//       const ltpNum = parseFloat(ltp);
//       const slNum = parseFloat(sl);
//       const targetNum = parseFloat(target);
//       const quantityNum = parseFloat(quantity);

//       if (
//         isNaN(ltpNum) ||
//         isNaN(slNum) ||
//         isNaN(targetNum) ||
//         isNaN(quantityNum)
//       ) {
//         return null;
//       }

//       const profitPerUnit = targetNum - ltpNum;
//       const totalProfit = profitPerUnit * quantityNum;
//       const profitPercentage = ((profitPerUnit / ltpNum) * 100).toFixed(2);

//       const lossPerUnit = slNum - ltpNum;
//       const totalLoss = lossPerUnit * quantityNum;
//       const lossPercentage = ((lossPerUnit / ltpNum) * 100).toFixed(2);

//       const totalMargin = ltpNum * quantityNum;

//       return {
//         profitPerUnit,
//         totalProfit,
//         profitPercentage,
//         lossPerUnit,
//         totalLoss,
//         lossPercentage,
//         totalMargin,
//         quantity: quantityNum,
//         ltp: ltpNum,
//         sl: slNum,
//         target: targetNum,
//       };
//     },
//     [],
//   );

//   // Update results when inputs change
//   useEffect(() => {
//     setCeData((prev) => ({
//       ...prev,
//       results: calculateResults(prev.ltp, prev.sl, prev.target, prev.quantity),
//     }));
//   }, [ceData.ltp, ceData.sl, ceData.target, ceData.quantity, calculateResults]);

//   useEffect(() => {
//     setPeData((prev) => ({
//       ...prev,
//       results: calculateResults(prev.ltp, prev.sl, prev.target, prev.quantity),
//     }));
//   }, [peData.ltp, peData.sl, peData.target, peData.quantity, calculateResults]);

//   // ==================== ENTRY TIME PARSING ====================

//   const parseEntryTime = useCallback(
//     (timeStr: string, chartData: CandleData[]) => {
//       if (!timeStr || !chartData.length) return { timestamp: 0, dateStr: "" };

//       try {
//         const firstCandleTime = chartData[0].time;
//         const firstCandleDate = new Date(
//           (firstCandleTime + IST_OFFSET_SECONDS) * 1000,
//         );
//         const [hours, minutes] = timeStr.split(":").map(Number);
//         const entryDate = new Date(
//           firstCandleDate.getFullYear(),
//           firstCandleDate.getMonth(),
//           firstCandleDate.getDate(),
//           hours,
//           minutes,
//           0,
//         );
//         const timestamp =
//           Math.floor(entryDate.getTime() / 1000) - IST_OFFSET_SECONDS;
//         return { timestamp, dateStr: formatDateWithTime(timestamp) };
//       } catch (error) {
//         console.error("Error parsing entry time:", error);
//         return { timestamp: 0, dateStr: "" };
//       }
//     },
//     [],
//   );

//   // Update entry timestamps
//   useEffect(() => {
//     if (ceData.selectedTime && ceData.aggregatedData.length > 0) {
//       const { timestamp, dateStr } = parseEntryTime(
//         ceData.selectedTime,
//         ceData.aggregatedData,
//       );
//       setCeData((prev) => ({
//         ...prev,
//         entryTimestamp: timestamp,
//         entryDateStr: dateStr,
//       }));
//     }
//   }, [ceData.selectedTime, ceData.aggregatedData, parseEntryTime]);

//   useEffect(() => {
//     if (peData.selectedTime && peData.aggregatedData.length > 0) {
//       const { timestamp, dateStr } = parseEntryTime(
//         peData.selectedTime,
//         peData.aggregatedData,
//       );
//       setPeData((prev) => ({
//         ...prev,
//         entryTimestamp: timestamp,
//         entryDateStr: dateStr,
//       }));
//     }
//   }, [peData.selectedTime, peData.aggregatedData, parseEntryTime]);

//   // ==================== FIRST HIT CHECK ====================

//   const checkFirstHit = useCallback(
//     (optionData: OptionTypeData): HitResult | null => {
//       if (
//         !optionData.aggregatedData.length ||
//         !optionData.results ||
//         !optionData.isEntrySet
//       )
//         return null;

//       let hitResult: HitResult | null = null;
//       const ltpNum = optionData.results.ltp;
//       const slNum = optionData.results.sl;
//       const targetNum = optionData.results.target;
//       const isLong = ltpNum < targetNum;

//       let startIndex = 0;
//       if (optionData.entryTimestamp > 0) {
//         for (let i = 0; i < optionData.aggregatedData.length; i++) {
//           if (optionData.aggregatedData[i].time > optionData.entryTimestamp) {
//             startIndex = i;
//             break;
//           } else if (
//             optionData.aggregatedData[i].time === optionData.entryTimestamp
//           ) {
//             startIndex = i + 1;
//             break;
//           }
//         }
//       }

//       for (let i = startIndex; i < optionData.aggregatedData.length; i++) {
//         const candle = optionData.aggregatedData[i];
//         const candleTimeStr = formatDateWithTime(candle.time);

//         if (isLong) {
//           if (candle.low <= slNum) {
//             hitResult = {
//               level: "SL",
//               time: candleTimeStr,
//               price: Math.min(slNum, candle.low),
//               index: i,
//               candleTime: candle.time,
//               candleDetails: {
//                 open: candle.open,
//                 high: candle.high,
//                 low: candle.low,
//                 close: candle.close,
//               },
//             };
//             break;
//           }
//           if (candle.high >= targetNum) {
//             hitResult = {
//               level: "Target",
//               time: candleTimeStr,
//               price: Math.max(targetNum, candle.high),
//               index: i,
//               candleTime: candle.time,
//               candleDetails: {
//                 open: candle.open,
//                 high: candle.high,
//                 low: candle.low,
//                 close: candle.close,
//               },
//             };
//             break;
//           }
//         } else {
//           if (candle.high >= slNum) {
//             hitResult = {
//               level: "SL",
//               time: candleTimeStr,
//               price: Math.max(slNum, candle.high),
//               index: i,
//               candleTime: candle.time,
//               candleDetails: {
//                 open: candle.open,
//                 high: candle.high,
//                 low: candle.low,
//                 close: candle.close,
//               },
//             };
//             break;
//           }
//           if (candle.low <= targetNum) {
//             hitResult = {
//               level: "Target",
//               time: candleTimeStr,
//               price: Math.min(targetNum, candle.low),
//               index: i,
//               candleTime: candle.time,
//               candleDetails: {
//                 open: candle.open,
//                 high: candle.high,
//                 low: candle.low,
//                 close: candle.close,
//               },
//             };
//             break;
//           }
//         }
//       }

//       return hitResult;
//     },
//     [],
//   );

//   // Check hits when entry is set
//   useEffect(() => {
//     if (ceData.isEntrySet && ceData.results) {
//       const hit = checkFirstHit(ceData);
//       setCeData((prev) => ({ ...prev, firstHit: hit }));
//     }
//   }, [
//     ceData.isEntrySet,
//     ceData.results,
//     ceData.entryTimestamp,
//     ceData.aggregatedData,
//     checkFirstHit,
//   ]);

//   useEffect(() => {
//     if (peData.isEntrySet && peData.results) {
//       const hit = checkFirstHit(peData);
//       setPeData((prev) => ({ ...prev, firstHit: hit }));
//     }
//   }, [
//     peData.isEntrySet,
//     peData.results,
//     peData.entryTimestamp,
//     peData.aggregatedData,
//     checkFirstHit,
//   ]);

//   // ==================== DRAW LINES ====================

//   const drawAllLines = useCallback(
//     (type: "CE" | "PE") => {
//       const isCE = type === "CE";
//       const seriesRef = isCE ? ceSeriesRef : peSeriesRef;
//       const ltpLineRef = isCE ? ceLtpLineRef : peLtpLineRef;
//       const slLineRef = isCE ? ceSlLineRef : peSlLineRef;
//       const targetLineRef = isCE ? ceTargetLineRef : peTargetLineRef;
//       const optionData = isCE ? ceData : peData;
//       const setOptionData = isCE ? setCeData : setPeData;

//       if (!seriesRef.current) return;

//       if (ltpLineRef.current)
//         seriesRef.current.removePriceLine(ltpLineRef.current);
//       if (slLineRef.current)
//         seriesRef.current.removePriceLine(slLineRef.current);
//       if (targetLineRef.current)
//         seriesRef.current.removePriceLine(targetLineRef.current);

//       if (optionData.ltp && !isNaN(Number(optionData.ltp))) {
//         ltpLineRef.current = seriesRef.current.createPriceLine({
//           price: Number(optionData.ltp),
//           color: "#00BFFF",
//           lineWidth: 1,
//           lineStyle: LightweightCharts.LineStyle.Solid,
//           axisLabelVisible: true,
//           title: `Entry @ ${optionData.selectedTime}`,
//           axisLabelColor: "#00BFFF",
//         });
//       }

//       if (optionData.sl && !isNaN(Number(optionData.sl))) {
//         slLineRef.current = seriesRef.current.createPriceLine({
//           price: Number(optionData.sl),
//           color: theme === "light" ? "#dc2626" : "#ef4444",
//           lineWidth: 1,
//           lineStyle: LightweightCharts.LineStyle.Solid,
//           axisLabelVisible: true,
//           title: `SL @ ${optionData.selectedTime}`,
//         });
//       }

//       if (optionData.target && !isNaN(Number(optionData.target))) {
//         targetLineRef.current = seriesRef.current.createPriceLine({
//           price: Number(optionData.target),
//           color: theme === "light" ? "#16a34a" : "#22c55e",
//           lineWidth: 1,
//           lineStyle: LightweightCharts.LineStyle.Solid,
//           axisLabelVisible: true,
//           title: `Target @ ${optionData.selectedTime}`,
//         });
//       }

//       setOptionData((prev) => ({ ...prev, isEntrySet: true }));
//     },
//     [ceData, peData, theme],
//   );

//   // ==================== CLEAR LINES ====================

//   const handleClearLines = (type: "CE" | "PE") => {
//     const isCE = type === "CE";
//     const seriesRef = isCE ? ceSeriesRef : peSeriesRef;
//     const ltpLineRef = isCE ? ceLtpLineRef : peLtpLineRef;
//     const slLineRef = isCE ? ceSlLineRef : peSlLineRef;
//     const targetLineRef = isCE ? ceTargetLineRef : peTargetLineRef;
//     const setOptionData = isCE ? setCeData : setPeData;

//     setOptionData((prev) => ({
//       ...prev,
//       ltp: "",
//       sl: "",
//       target: "",
//       selectedTime: "09:21",
//       quantity: "65",
//       isEntrySet: false,
//       firstHit: null,
//       entryTimestamp: 0,
//       entryDateStr: "",
//     }));

//     if (!seriesRef.current) return;

//     if (ltpLineRef.current) {
//       seriesRef.current.removePriceLine(ltpLineRef.current);
//       ltpLineRef.current = null;
//     }
//     if (slLineRef.current) {
//       seriesRef.current.removePriceLine(slLineRef.current);
//       slLineRef.current = null;
//     }
//     if (targetLineRef.current) {
//       seriesRef.current.removePriceLine(targetLineRef.current);
//       targetLineRef.current = null;
//     }
//   };

//   // ==================== CHART INITIALIZATION ====================

//   const initializeChart = useCallback(
//     (
//       containerRef: React.RefObject<HTMLDivElement>,
//       chartData: CandleData[],
//       chartInstanceRef: React.MutableRefObject<any>,
//       seriesRef: React.MutableRefObject<any>,
//       hoverDataSetter: (data: any) => void,
//       optionName: string,
//       optionColor: string,
//     ) => {
//       if (!containerRef.current || chartData.length === 0) return;

//       const chart = LightweightCharts.createChart(containerRef.current, {
//         width: containerRef.current.clientWidth,
//         height: containerRef.current.clientHeight,
//         layout: {
//           background: { color: theme === "light" ? "#ffffff" : "#1a1a1a" },
//           textColor: theme === "light" ? "#333" : "#d1d5db",
//         },
//         grid: {
//           vertLines: { color: theme === "light" ? "#eee" : "#374151" },
//           horzLines: { color: theme === "light" ? "#eee" : "#374151" },
//         },
//         crosshair: {
//           mode: LightweightCharts.CrosshairMode.Normal,
//           vertLine: {
//             width: 1,
//             color: theme === "light" ? "#9CA3AF" : "#6B7280",
//             style: LightweightCharts.LineStyle.LargeDashed,
//             labelBackgroundColor: theme === "light" ? "#000" : "#374151",
//           },
//           horzLine: {
//             width: 1,
//             color: theme === "light" ? "#9CA3AF" : "#6B7280",
//             style: LightweightCharts.LineStyle.LargeDashed,
//             labelBackgroundColor: theme === "light" ? "#000" : "#374151",
//           },
//         },
//         timeScale: {
//           timeVisible: true,
//           secondsVisible: false,
//           borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
//           rightOffset: 0,
//           barSpacing: 6,
//           minBarSpacing: 1,
//           fixLeftEdge: true,
//           fixRightEdge: true,
//           tickMarkFormatter: (time: number) => {
//             const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
//             const hours = date.getHours();
//             const minutes = date.getMinutes();
//             if ((hours === 0 && minutes === 0) || chartData.length < 50) {
//               return formatDateOnly(time);
//             }
//             return formatToIST(time);
//           },
//         },
//         rightPriceScale: {
//           borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
//           scaleMargins: { top: 0.1, bottom: 0.1 },
//         },
//         leftPriceScale: { visible: false },
//         localization: {
//           timeFormatter: (time: number) => formatDateWithTime(time),
//           dateFormat: "dd-MMM-yyyy",
//         },
//       });

//       chartInstanceRef.current = chart;

//       let series: any;
//       if (chartType === "candlestick") {
//         series = chart.addCandlestickSeries({
//           upColor: theme === "light" ? "#16a34a" : "#22c55e",
//           downColor: theme === "light" ? "#dc2626" : "#ef4444",
//           borderUpColor: theme === "light" ? "#16a34a" : "#22c55e",
//           borderDownColor: theme === "light" ? "#dc2626" : "#ef4444",
//           wickUpColor: theme === "light" ? "#16a34a" : "#22c55e",
//           wickDownColor: theme === "light" ? "#dc2626" : "#ef4444",
//           priceLineVisible: false,
//           priceScaleId: "right",
//         });
//         series.setData(
//           chartData.map((d) => ({
//             time: d.time,
//             open: d.open,
//             high: d.high,
//             low: d.low,
//             close: d.close,
//           })),
//         );
//       } else if (chartType === "line" || chartType === "area") {
//         const seriesOptions: any = {
//           color: optionColor,
//           lineWidth: 1,
//           priceLineVisible: false,
//           priceScaleId: "right",
//         };
//         if (chartType === "area") {
//           seriesOptions.lineType = LightweightCharts.LineType.WithSteps;
//           seriesOptions.topColor =
//             theme === "light" ? `${optionColor}66` : `${optionColor}66`;
//           seriesOptions.bottomColor =
//             theme === "light" ? `${optionColor}00` : `${optionColor}00`;
//         }
//         series = chart.addLineSeries(seriesOptions);
//         series.setData(
//           chartData.map((d) => ({ time: d.time, value: d.close })),
//         );
//       }

//       seriesRef.current = series;

//       if (chartData.length > 0) {
//         chart.timeScale().setVisibleRange({
//           from: chartData[0].time,
//           to: chartData[chartData.length - 1].time,
//         });
//         setTimeout(() => chart.timeScale().fitContent(), 100);
//       }

//       // Create OHLC overlay
//       const overlay = document.createElement("div");
//       overlay.style.position = "absolute";
//       overlay.style.top = "10px";
//       overlay.style.left = "10px";
//       overlay.style.zIndex = "1000";
//       overlay.style.pointerEvents = "none";
//       overlay.style.backgroundColor =
//         theme === "light" ? "rgba(255,255,255,0.95)" : "rgba(26,26,26,0.95)";
//       overlay.style.border = `1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"}`;
//       overlay.style.borderRadius = "6px";
//       overlay.style.padding = "6px 10px";
//       overlay.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
//       overlay.style.minWidth = "45%";
//       overlay.style.fontFamily = "'Roboto Mono', monospace, sans-serif";

//       const chartContainer = containerRef.current;
//       chartContainer.style.position = "relative";
//       chartContainer.appendChild(overlay);

//       // Set initial hover data
//       if (chartData.length > 0) {
//         const lastCandle = chartData[chartData.length - 1];
//         const lastTimeStr = formatDateWithTime(lastCandle.time);
//         const timePart =
//           lastTimeStr.split(" ")[1] + " " + lastTimeStr.split(" ")[2];
//         const change = lastCandle.close - lastCandle.open;
//         const changePercent = (change / lastCandle.open) * 100;

//         hoverDataSetter({
//           time: lastTimeStr,
//           o: lastCandle.open,
//           h: lastCandle.high,
//           l: lastCandle.low,
//           c: lastCandle.close,
//           volume: lastCandle.volume,
//           oi: lastCandle.oi,
//           change,
//           changePercent,
//         });

//         overlay.innerHTML = getOHLCHTML(
//           optionName,
//           timeframe,
//           lastCandle,
//           timePart,
//           theme,
//           change,
//           changePercent,
//         );
//       }

//       // Crosshair move handler
//       chart.subscribeCrosshairMove((param: any) => {
//         if (!param.time || param.seriesData.size === 0) {
//           if (chartData.length > 0) {
//             const lastCandle = chartData[chartData.length - 1];
//             const lastTimeStr = formatDateWithTime(lastCandle.time);
//             const timePart =
//               lastTimeStr.split(" ")[1] + " " + lastTimeStr.split(" ")[2];
//             const change = lastCandle.close - lastCandle.open;
//             const changePercent = (change / lastCandle.open) * 100;

//             hoverDataSetter({
//               time: lastTimeStr,
//               o: lastCandle.open,
//               h: lastCandle.high,
//               l: lastCandle.low,
//               c: lastCandle.close,
//               volume: lastCandle.volume,
//               oi: lastCandle.oi,
//               change,
//               changePercent,
//             });

//             overlay.innerHTML = getOHLCHTML(
//               optionName,
//               timeframe,
//               lastCandle,
//               timePart,
//               theme,
//               change,
//               changePercent,
//             );
//           }
//           return;
//         }

//         const candleData = param.seriesData.get(series);
//         if (!candleData) return;

//         let open = 0,
//           high = 0,
//           low = 0,
//           close = 0;
//         if (chartType === "candlestick") {
//           ({ open, high, low, close } = candleData);
//         } else {
//           const value = candleData.value;
//           open = high = low = close = value;
//         }

//         let volume = 0,
//           oi = 0;
//         for (const candle of chartData) {
//           if (candle.time === param.time) {
//             volume = candle.volume || 0;
//             oi = candle.oi || 0;
//             break;
//           }
//         }

//         const timeStr = formatDateWithTime(param.time);
//         const timePart = timeStr.split(" ")[1] + " " + timeStr.split(" ")[2];
//         const change = close - open;
//         const changePercent = (change / open) * 100;

//         hoverDataSetter({
//           time: timeStr,
//           o: open,
//           h: high,
//           l: low,
//           c: close,
//           volume,
//           oi,
//           change,
//           changePercent,
//         });

//         overlay.innerHTML = getOHLCHTML(
//           optionName,
//           timeframe,
//           { open, high, low, close, volume, oi },
//           timePart,
//           theme,
//           change,
//           changePercent,
//         );
//       });

//       // Resize observer
//       const resizeObserver = new ResizeObserver(() => {
//         if (containerRef.current) {
//           chart.applyOptions({
//             width: containerRef.current.clientWidth,
//             height: containerRef.current.clientHeight,
//           });
//           setTimeout(() => chart.timeScale().fitContent(), 50);
//         }
//       });
//       resizeObserver.observe(containerRef.current);

//       return () => {
//         resizeObserver.disconnect();
//         if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
//         chart.remove();
//       };
//     },
//     [theme, chartType, timeframe],
//   );

//   const getOHLCHTML = (
//     name: string,
//     tf: string,
//     candle: any,
//     timePart: string,
//     theme: "light" | "dark",
//     change: number,
//     changePercent: number,
//   ) => {
//     return `
//       <div style="font-size: 12px;">
//         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
//           <span style="font-weight: bold; font-size: 13px; color: ${theme === "light" ? "#000" : "#fff"}">${name} (${tf})</span>
//           <span style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">${timePart}</span>
//         </div>
//         <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 4px;">
//           <div>
//             <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">O</div>
//             <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">${candle.open.toFixed(2)}</div>
//           </div>
//           <div>
//             <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">H</div>
//             <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">${candle.high.toFixed(2)}</div>
//           </div>
//           <div>
//             <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">L</div>
//             <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">${candle.low.toFixed(2)}</div>
//           </div>
//           <div>
//             <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">C</div>
//             <div style="color: ${candle.close >= candle.open ? (theme === "light" ? "#16a34a" : "#22c55e") : theme === "light" ? "#dc2626" : "#ef4444"}; font-weight: bold;">${candle.close.toFixed(2)}</div>
//           </div>
//           <div>
//             <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">Volume</div>
//             <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">
//               ${candle.volume ? formatLargeNumber(candle.volume) : "N/A"}
//             </div>
//           </div>
//           <div>
//             <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">OI</div>
//             <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">
//               ${candle.oi !== undefined ? formatLargeNumber(candle.oi) : "N/A"}
//             </div>
//           </div>
//         </div>
//       </div>
//     `;
//   };

//   // Initialize CE chart
//   useEffect(() => {
//     if (!ceChartRef.current || ceData.aggregatedData.length === 0) return;
//     const cleanup = initializeChart(
//       ceChartRef,
//       ceData.aggregatedData,
//       ceChartInstanceRef,
//       ceSeriesRef,
//       setCeHoverData,
//       "CE",
//       "#16a34a",
//     );
//     return cleanup;
//   }, [ceData.aggregatedData, initializeChart]);

//   // Initialize PE chart
//   useEffect(() => {
//     if (!peChartRef.current || peData.aggregatedData.length === 0) return;
//     const cleanup = initializeChart(
//       peChartRef,
//       peData.aggregatedData,
//       peChartInstanceRef,
//       peSeriesRef,
//       setPeHoverData,
//       "PE",
//       "#dc2626",
//     );
//     return cleanup;
//   }, [peData.aggregatedData, initializeChart]);

//   // Redraw lines when series or data changes
//   useEffect(() => {
//     if (ceSeriesRef.current && ceData.isEntrySet) {
//       setTimeout(() => drawAllLines("CE"), 200);
//     }
//   }, [ceData.aggregatedData, ceData.isEntrySet, drawAllLines]);

//   useEffect(() => {
//     if (peSeriesRef.current && peData.isEntrySet) {
//       setTimeout(() => drawAllLines("PE"), 200);
//     }
//   }, [peData.aggregatedData, peData.isEntrySet, drawAllLines]);

//   // ==================== SYNC CHARTS ====================

//   useEffect(() => {
//     if (
//       syncCharts &&
//       ceChartInstanceRef.current &&
//       peChartInstanceRef.current
//     ) {
//       const syncTimeScale = () => {
//         const ceVisibleRange = ceChartInstanceRef.current
//           .timeScale()
//           .getVisibleRange();
//         if (ceVisibleRange) {
//           peChartInstanceRef.current
//             .timeScale()
//             .setVisibleRange(ceVisibleRange);
//         }
//       };

//       ceChartInstanceRef.current
//         .timeScale()
//         .subscribeVisibleTimeRangeChange(syncTimeScale);
//       return () => {
//         if (ceChartInstanceRef.current) {
//           ceChartInstanceRef.current
//             .timeScale()
//             .unsubscribeVisibleTimeRangeChange(syncTimeScale);
//         }
//       };
//     }
//   }, [syncCharts, ceChartInstanceRef.current, peChartInstanceRef.current]);

//   // ==================== RENDER ====================

//   const renderUploadSection = (type: "CE" | "PE") => {
//     const isCE = type === "CE";
//     const fileName = isCE ? ceFileName : peFileName;
//     const optionData = isCE ? ceData : peData;
//     const setOptionData = isCE ? setCeData : setPeData;
//     const bgColor = isCE
//       ? "bg-green-50 dark:bg-green-900/20"
//       : "bg-red-50 dark:bg-red-900/20";
//     const borderColor = isCE ? "border-green-500" : "border-red-500";
//     const textColor = isCE
//       ? "text-green-600 dark:text-green-400"
//       : "text-red-600 dark:text-red-400";

//     return (
//       <div
//         className={`${bgColor} p-4 rounded-lg border ${borderColor} border-opacity-30`}
//       >
//         <div className="flex items-center justify-between mb-3">
//           <h3 className={`font-bold ${textColor}`}>{type} Data</h3>
//           {fileName && (
//             <span className="text-xs text-gray-500 truncate max-w-[150px]">
//               {fileName}
//             </span>
//           )}
//         </div>

//         <div className="flex flex-wrap gap-3 items-center">
//           <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//             <IconUpload size={18} className="text-gray-500" />
//             <span className="text-sm">Upload {type} CSV</span>
//             <input
//               type="file"
//               accept=".csv"
//               className="hidden"
//               onChange={(e) => {
//                 const file = e.target.files?.[0];
//                 if (file) handleFileUpload(type, file);
//               }}
//             />
//           </label>

//           {optionData.aggregatedData.length > 0 && (
//             <>
//               <div className="flex gap-2 items-center">
//                 <input
//                   type="number"
//                   placeholder="Entry Price"
//                   value={optionData.ltp}
//                   onChange={(e) =>
//                     setOptionData((prev) => ({ ...prev, ltp: e.target.value }))
//                   }
//                   className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-24 text-sm"
//                   step="0.01"
//                 />
//                 <input
//                   type="number"
//                   placeholder="SL"
//                   value={optionData.sl}
//                   onChange={(e) =>
//                     setOptionData((prev) => ({ ...prev, sl: e.target.value }))
//                   }
//                   className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-20 text-sm"
//                   step="0.01"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Target"
//                   value={optionData.target}
//                   onChange={(e) =>
//                     setOptionData((prev) => ({
//                       ...prev,
//                       target: e.target.value,
//                     }))
//                   }
//                   className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-20 text-sm"
//                   step="0.01"
//                 />
//                 <input
//                   type="time"
//                   value={optionData.selectedTime}
//                   onChange={(e) =>
//                     setOptionData((prev) => ({
//                       ...prev,
//                       selectedTime: e.target.value,
//                     }))
//                   }
//                   className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-24 text-sm"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Qty"
//                   value={optionData.quantity}
//                   onChange={(e) =>
//                     setOptionData((prev) => ({
//                       ...prev,
//                       quantity: e.target.value,
//                     }))
//                   }
//                   className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded w-16 text-sm"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => drawAllLines(type)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium"
//                 >
//                   Analyze
//                 </button>
//                 <button
//                   onClick={() => handleClearLines(type)}
//                   className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1.5 rounded text-sm"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </>
//           )}
//         </div>

//         {optionData.results && (
//           <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
//             <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
//               <span className="text-gray-500">Margin</span>
//               <div className="font-bold">
//                 ₹
//                 {optionData.results.totalMargin.toLocaleString("en-IN", {
//                   minimumFractionDigits: 2,
//                 })}
//               </div>
//             </div>
//             <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
//               <span className="text-green-600 dark:text-green-400">Target</span>
//               <div className="font-bold text-green-600 dark:text-green-400">
//                 +₹
//                 {optionData.results.totalProfit.toLocaleString("en-IN", {
//                   minimumFractionDigits: 2,
//                 })}
//               </div>
//             </div>
//             <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
//               <span className="text-red-600 dark:text-red-400">SL</span>
//               <div className="font-bold text-red-600 dark:text-red-400">
//                 -₹
//                 {Math.abs(optionData.results.totalLoss).toLocaleString(
//                   "en-IN",
//                   { minimumFractionDigits: 2 },
//                 )}
//               </div>
//             </div>
//             <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded border border-purple-200 dark:border-purple-800">
//               <span className="text-purple-600 dark:text-purple-400">
//                 Position
//               </span>
//               <div className="font-bold">
//                 {optionData.results.ltp < optionData.results.target
//                   ? "LONG"
//                   : "SHORT"}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderChartContainer = (type: "CE" | "PE") => {
//     const isCE = type === "CE";
//     const chartRef = isCE ? ceChartRef : peChartRef;
//     const optionData = isCE ? ceData : peData;
//     const hoverData = isCE ? ceHoverData : peHoverData;

//     return (
//       <div className="flex-1 flex flex-col">
//         <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
//           <div className="flex items-center gap-3">
//             <div
//               className={`w-3 h-3 rounded-full ${isCE ? "bg-green-500" : "bg-red-500"}`}
//             ></div>
//             <span className="font-bold">{type}</span>
//             <span className="text-xs text-gray-500">
//               {optionData.aggregatedData.length} candles
//             </span>
//           </div>
//           {optionData.firstHit && (
//             <div className="flex items-center gap-2">
//               <span
//                 className={`text-xs font-medium ${isCE ? "text-green-600" : "text-red-600"}`}
//               >
//                 Hit: {optionData.firstHit.level} at{" "}
//                 {optionData.firstHit.time.split(" ")[1]}
//               </span>
//             </div>
//           )}
//         </div>
//         <div ref={chartRef} className="w-full h-[300px] md:h-[400px]" />
//       </div>
//     );
//   };

//   return (
//     <div className="relative w-full bg-white dark:bg-gray-900">
//       {/* Global Controls */}
//       <div className="flex flex-wrap justify-between items-center p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600 dark:text-gray-400">
//               Timeframe:
//             </span>
//             <select
//               value={timeframe}
//               onChange={(e) => setTimeframe(e.target.value)}
//               className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded text-sm"
//             >
//               {timeframeOptions.map((opt) => (
//                 <option key={opt.value} value={opt.value}>
//                   {opt.label}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-sm text-gray-600 dark:text-gray-400">
//               Chart Type:
//             </span>
//             <div className="flex border rounded-lg overflow-hidden">
//               <button
//                 onClick={() => setChartType("candlestick")}
//                 className={`p-1.5 ${chartType === "candlestick" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
//               >
//                 <IconChartCandle size={18} />
//               </button>
//               <button
//                 onClick={() => setChartType("line")}
//                 className={`p-1.5 ${chartType === "line" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
//               >
//                 <IconChartLine size={18} />
//               </button>
//               <button
//                 onClick={() => setChartType("area")}
//                 className={`p-1.5 ${chartType === "area" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
//               >
//                 <IconChartAreaLine size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <label className="flex items-center gap-1 text-sm">
//               <input
//                 type="checkbox"
//                 checked={syncCharts}
//                 onChange={(e) => setSyncCharts(e.target.checked)}
//                 className="rounded"
//               />
//               Sync Charts
//             </label>
//           </div>
//         </div>

//         <button
//           onClick={() => {
//             handleClearLines("CE");
//             handleClearLines("PE");
//           }}
//           className="flex items-center gap-2 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
//         >
//           <IconRefresh size={16} />
//           Clear All
//         </button>
//       </div>

//       {/* File Upload Sections */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
//         {renderUploadSection("CE")}
//         {renderUploadSection("PE")}
//       </div>

//       {/* Charts Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
//         {renderChartContainer("CE")}
//         {renderChartContainer("PE")}
//       </div>

//       {/* Legend */}
//       <div className="flex justify-center gap-6 p-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-0.5 bg-[#00BFFF]"></div>
//           <span className="text-sm dark:text-white">Entry Price</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-0.5 bg-red-500"></div>
//           <span className="text-sm dark:text-white">Stop Loss</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-0.5 bg-green-500"></div>
//           <span className="text-sm dark:text-white">Target</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 rounded-full bg-green-500"></div>
//           <span className="text-sm dark:text-white">CE</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 rounded-full bg-red-500"></div>
//           <span className="text-sm dark:text-white">PE</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CePeDualChart;

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  oi?: number;
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

interface ComparisonChartProps {
  initialData?: any[];
}

// ==================== MAIN COMPONENT ====================

const CePeDualChart: React.FC<ComparisonChartProps> = ({
  initialData = [],
}) => {
  // Chart refs
  const ceChartRef = useRef<any>(null);
  const peChartRef = useRef<any>(null);

  // Chart instances
  const ceChartInstanceRef = useRef<any>(null);
  const peChartInstanceRef = useRef<any>(null);
  const ceSeriesRef = useRef<any>(null);
  const peSeriesRef = useRef<any>(null);

  // Price line refs
  const ceLtpLineRef = useRef<any>(null);
  const ceSlLineRef = useRef<any>(null);
  const ceTargetLineRef = useRef<any>(null);
  const peLtpLineRef = useRef<any>(null);
  const peSlLineRef = useRef<any>(null);
  const peTargetLineRef = useRef<any>(null);

  // Global settings
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area">(
    "candlestick",
  );
  const [timeframe, setTimeframe] = useState("1min");
  const [syncCharts, setSyncCharts] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showOI, setShowOI] = useState(true);

  // CE Data
  const [ceData, setCeData] = useState<OptionTypeData>({
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

  // PE Data
  const [peData, setPeData] = useState<OptionTypeData>({
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

  // Hover data for each chart
  const [ceHoverData, setCeHoverData] = useState<any>(null);
  const [peHoverData, setPeHoverData] = useState<any>(null);

  // File upload states
  const [ceFileName, setCeFileName] = useState<string>("");
  const [peFileName, setPeFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ==================== FILE PROCESSING ====================

  const processCSV = (text: string): CandleData[] => {
    const lines = text.split("\n");
    const headers = lines[0].toLowerCase().split(",");

    const formattedData: CandleData[] = [];
    let prevTime = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",");
      const row: any = {};

      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || "";
      });

      try {
        const dateStr =
          row.date || row.datetime || row.timestamp || row.time || "";
        const time = parseDateString(dateStr);
        if (time === 0) continue;

        const currentTime = time <= prevTime ? prevTime + 60 : time;
        prevTime = currentTime;

        const open = parseFloat(row.open || row.o || 0);
        const high = parseFloat(row.high || row.h || 0);
        const low = parseFloat(row.low || row.l || 0);
        const close = parseFloat(row.close || row.c || row.last || 0);
        const volume = row.volume
          ? parseFloat(row.volume)
          : row.vol
            ? parseFloat(row.vol)
            : undefined;
        const oi = row.oi
          ? parseFloat(row.oi)
          : row.openinterest
            ? parseFloat(row.openinterest)
            : undefined;

        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue;

        formattedData.push({
          time: currentTime,
          open,
          high,
          low,
          close,
          volume,
          oi,
        });
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }
    }

    return formattedData;
  };

  const handleFileUpload = (type: "CE" | "PE", file: File) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const processedData = processCSV(text);

      if (type === "CE") {
        setCeFileName(file.name);
        const aggregated = aggregateDataByTimeframe(processedData, timeframe);
        setCeData((prev) => ({
          ...prev,
          data: processedData,
          aggregatedData: aggregated,
        }));
      } else {
        setPeFileName(file.name);
        const aggregated = aggregateDataByTimeframe(processedData, timeframe);
        setPeData((prev) => ({
          ...prev,
          data: processedData,
          aggregatedData: aggregated,
        }));
      }

      setIsLoading(false);
    };

    reader.onerror = () => {
      console.error(`Error reading ${type} file`);
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  // ==================== DATA AGGREGATION ====================

  useEffect(() => {
    if (ceData.data.length > 0) {
      const aggregated = aggregateDataByTimeframe(ceData.data, timeframe);
      setCeData((prev) => ({ ...prev, aggregatedData: aggregated }));

      if (aggregated.length > 0) {
        const last = aggregated[aggregated.length - 1];
        setCeData((prev) => ({
          ...prev,
          lastCandle: {
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            time: formatDateWithTime(last.time),
          },
        }));
      }
    }
  }, [ceData.data, timeframe]);

  useEffect(() => {
    if (peData.data.length > 0) {
      const aggregated = aggregateDataByTimeframe(peData.data, timeframe);
      setPeData((prev) => ({ ...prev, aggregatedData: aggregated }));

      if (aggregated.length > 0) {
        const last = aggregated[aggregated.length - 1];
        setPeData((prev) => ({
          ...prev,
          lastCandle: {
            open: last.open,
            high: last.high,
            low: last.low,
            close: last.close,
            time: formatDateWithTime(last.time),
          },
        }));
      }
    }
  }, [peData.data, timeframe]);

  // ==================== UPDATE RESULTS ====================

  // Update results when inputs change
  useEffect(() => {
    setCeData((prev) => ({
      ...prev,
      results: calculateResults(prev.ltp, prev.sl, prev.target, prev.quantity),
    }));
  }, [ceData.ltp, ceData.sl, ceData.target, ceData.quantity]);

  useEffect(() => {
    setPeData((prev) => ({
      ...prev,
      results: calculateResults(prev.ltp, prev.sl, prev.target, prev.quantity),
    }));
  }, [peData.ltp, peData.sl, peData.target, peData.quantity]);

  // ==================== ENTRY TIME PARSING ====================

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

  // Update entry timestamps
  useEffect(() => {
    if (ceData.selectedTime && ceData.aggregatedData.length > 0) {
      const { timestamp, dateStr } = parseEntryTime(
        ceData.selectedTime,
        ceData.aggregatedData,
      );
      setCeData((prev) => ({
        ...prev,
        entryTimestamp: timestamp,
        entryDateStr: dateStr,
      }));
    }
  }, [ceData.selectedTime, ceData.aggregatedData, parseEntryTime]);

  useEffect(() => {
    if (peData.selectedTime && peData.aggregatedData.length > 0) {
      const { timestamp, dateStr } = parseEntryTime(
        peData.selectedTime,
        peData.aggregatedData,
      );
      setPeData((prev) => ({
        ...prev,
        entryTimestamp: timestamp,
        entryDateStr: dateStr,
      }));
    }
  }, [peData.selectedTime, peData.aggregatedData, parseEntryTime]);

  // ==================== FIRST HIT CHECK ====================

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

  // Check hits when entry is set
  useEffect(() => {
    if (ceData.isEntrySet && ceData.results) {
      const hit = checkFirstHit(ceData);
      setCeData((prev) => ({ ...prev, firstHit: hit }));
    }
  }, [
    ceData.isEntrySet,
    ceData.results,
    ceData.entryTimestamp,
    ceData.aggregatedData,
    checkFirstHit,
  ]);

  useEffect(() => {
    if (peData.isEntrySet && peData.results) {
      const hit = checkFirstHit(peData);
      setPeData((prev) => ({ ...prev, firstHit: hit }));
    }
  }, [
    peData.isEntrySet,
    peData.results,
    peData.entryTimestamp,
    peData.aggregatedData,
    checkFirstHit,
  ]);

  // ==================== DRAW LINES ====================

  const drawAllLines = useCallback(
    (type: "CE" | "PE") => {
      const isCE = type === "CE";
      const seriesRef = isCE ? ceSeriesRef : peSeriesRef;
      const ltpLineRef = isCE ? ceLtpLineRef : peLtpLineRef;
      const slLineRef = isCE ? ceSlLineRef : peSlLineRef;
      const targetLineRef = isCE ? ceTargetLineRef : peTargetLineRef;
      const optionData = isCE ? ceData : peData;
      const setOptionData = isCE ? setCeData : setPeData;

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
    [ceData, peData, theme],
  );

  // ==================== CLEAR LINES ====================

  const handleClearLines = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const seriesRef = isCE ? ceSeriesRef : peSeriesRef;
    const ltpLineRef = isCE ? ceLtpLineRef : peLtpLineRef;
    const slLineRef = isCE ? ceSlLineRef : peSlLineRef;
    const targetLineRef = isCE ? ceTargetLineRef : peTargetLineRef;
    const setOptionData = isCE ? setCeData : setPeData;

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

  // ==================== CHART INITIALIZATION ====================

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
          <span style="font-weight: bold; font-size: 13px; color: ${theme === "light" ? "#000" : "#fff"}">${name} (${tf})</span>
          <span style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">${timePart}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 4px;">
          <div>
            <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">O</div>
            <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">${candle.open.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">H</div>
            <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">${candle.high.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">L</div>
            <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">${candle.low.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">C</div>
            <div style="color: ${candle.close >= candle.open ? (theme === "light" ? "#16a34a" : "#22c55e") : theme === "light" ? "#dc2626" : "#ef4444"}; font-weight: bold;">${candle.close.toFixed(2)}</div>
          </div>
          <div>
            <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">Volume</div>
            <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">
              ${candle.volume ? formatLargeNumber(candle.volume) : "N/A"}
            </div>
          </div>
          <div>
            <div style="color: ${theme === "light" ? "#666" : "#9ca3af"}; font-size: 11px;">OI</div>
            <div style="color: ${theme === "light" ? "#333" : "#fff"}; font-weight: bold;">
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
      overlay.style.border = `1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"}`;
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

  // Initialize CE chart
  useEffect(() => {
    if (!ceChartRef.current || ceData.aggregatedData.length === 0) return;
    const cleanup = initializeChart(
      ceChartRef,
      ceData.aggregatedData,
      ceChartInstanceRef,
      ceSeriesRef,
      setCeHoverData,
      "CE",
      "#16a34a",
    );
    return cleanup;
  }, [ceData.aggregatedData, initializeChart]);

  // Initialize PE chart
  useEffect(() => {
    if (!peChartRef.current || peData.aggregatedData.length === 0) return;
    const cleanup = initializeChart(
      peChartRef,
      peData.aggregatedData,
      peChartInstanceRef,
      peSeriesRef,
      setPeHoverData,
      "PE",
      "#dc2626",
    );
    return cleanup;
  }, [peData.aggregatedData, initializeChart]);

  // Redraw lines when series or data changes
  useEffect(() => {
    if (ceSeriesRef.current && ceData.isEntrySet) {
      setTimeout(() => drawAllLines("CE"), 200);
    }
  }, [ceData.aggregatedData, ceData.isEntrySet, drawAllLines]);

  useEffect(() => {
    if (peSeriesRef.current && peData.isEntrySet) {
      setTimeout(() => drawAllLines("PE"), 200);
    }
  }, [peData.aggregatedData, peData.isEntrySet, drawAllLines]);

  // ==================== SYNC CHARTS ====================

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

  // ==================== RENDER ====================

  const renderUploadSection = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const fileName = isCE ? ceFileName : peFileName;
    const optionData = isCE ? ceData : peData;
    const setOptionData = isCE ? setCeData : setPeData;
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
          <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <IconUpload size={18} className="text-gray-500" />
            <span className="text-sm">Upload {type} CSV</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(type, file);
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
    const optionData = isCE ? ceData : peData;
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
    <div className="relative w-full bg-white dark:bg-gray-900">
      {/* Global Controls */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700">
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

      {/* File Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {renderUploadSection("CE")}
        {renderUploadSection("PE")}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {renderChartContainer("CE")}
        {renderChartContainer("PE")}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 p-3 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#00BFFF]"></div>
          <span className="text-sm dark:text-white">Entry Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="text-sm dark:text-white">Stop Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="text-sm dark:text-white">Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm dark:text-white">CE</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm dark:text-white">PE</span>
        </div>
      </div>
    </div>
  );
};

export default CePeDualChart;
