// "use client";

// import React, { useEffect, useRef, useState, useCallback } from "react";
// import * as LightweightCharts from "lightweight-charts";

// const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

// // Helper function to parse date
// const parseDateString = (dateStr: string): number => {
//   try {
//     const cleanStr = dateStr.trim();

//     let date: Date;

//     // Try DD-MM-YYYY HH:mm format
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
//     }
//     // Try YYYY-MM-DD HH:mm format
//     else if (cleanStr.match(/\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2}/)) {
//       date = new Date(cleanStr.replace(" ", "T"));
//     }
//     // Fallback to Date constructor
//     else {
//       date = new Date(cleanStr);
//     }

//     if (isNaN(date.getTime())) {
//       return 0;
//     }

//     return Math.floor(date.getTime() / 1000) - IST_OFFSET_SECONDS;
//   } catch (error) {
//     console.error("Error parsing date:", dateStr, error);
//     return 0;
//   }
// };

// // Helper function to format time to IST (for consistent display)
// const formatToIST = (timestamp: number): string => {
//   const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
//   return date.toLocaleTimeString("en-IN", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//     timeZone: "Asia/Kolkata",
//   });
// };

// // Helper function to format date with time for hover display
// const formatDateWithTime = (timestamp: number): string => {
//   const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);

//   // Format: DD-MMM-YYYY HH:MM:SS AM/PM
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

// // Helper function to format date only for x-axis
// const formatDateOnly = (timestamp: number): string => {
//   const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);

//   // Format: DD-MMM-YYYY
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

// // Convert time string (HH:mm) to seconds since midnight
// const timeToSeconds = (timeStr: string): number => {
//   if (!timeStr) return 0;
//   const [hours, minutes] = timeStr.split(":").map(Number);
//   return hours * 3600 + minutes * 60;
// };

// // Parse selected time to timestamp - FIXED VERSION
// const parseSelectedTime = (timeStr: string): number => {
//   if (!timeStr) return 0;

//   try {
//     // Get today's date from the first candle in data
//     // We need to use the same date as the chart data
//     console.log("Parsing selected time:", timeStr);

//     // Split time
//     const [hours, minutes] = timeStr.split(":").map(Number);

//     // We'll use a reference date from the first candle
//     // This will be updated when we have actual data
//     const referenceDate = new Date();
//     const year = referenceDate.getFullYear();
//     const month = referenceDate.getMonth();
//     const day = referenceDate.getDate();

//     // Create date with reference date + selected time
//     const date = new Date(year, month, day, hours, minutes, 0);

//     // Convert to timestamp and adjust for IST
//     const timestamp = Math.floor(date.getTime() / 1000) - IST_OFFSET_SECONDS;
//     console.log("Parsed timestamp:", timestamp, "for time:", timeStr);

//     return timestamp;
//   } catch (error) {
//     console.error("Error parsing selected time:", error);
//     return 0;
//   }
// };

// interface CandleData {
//   time: number;
//   open: number;
//   high: number;
//   low: number;
//   close: number;
//   volume?: number;
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

// const MinuteChart = ({ data }: { data: any[] }) => {
//   const chartRef = useRef<HTMLDivElement>(null);
//   const chartInstanceRef = useRef<any>(null);
//   const candleSeriesRef = useRef<any>(null);
//   const volumeSeriesRef = useRef<any>(null);

//   // Refs for price lines
//   const ltpLineRef = useRef<any>(null);
//   const slLineRef = useRef<any>(null);
//   const targetLineRef = useRef<any>(null);

//   // State for input values
//   const [ltp, setLtp] = useState("");
//   const [sl, setSl] = useState("");
//   const [target, setTarget] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [quantity, setQuantity] = useState("65");

//   const [ohlcValues, setOhlcValues] = useState<OHLCValues | null>(null);
//   const [theme, setTheme] = useState<"light" | "dark">("light");
//   const [showVolume, setShowVolume] = useState(false);
//   const [chartType, setChartType] = useState<"candlestick" | "line" | "area">(
//     "candlestick",
//   );

//   // Store last candle data
//   const [lastCandle, setLastCandle] = useState<OHLCValues | null>(null);

//   // Store which level was hit first
//   const [firstHit, setFirstHit] = useState<HitResult | null>(null);
//   const [isEntrySet, setIsEntrySet] = useState(false);
//   const [formattedChartData, setFormattedChartData] = useState<CandleData[]>(
//     [],
//   );
//   const [entryTimestamp, setEntryTimestamp] = useState<number>(0);
//   const [entryDateStr, setEntryDateStr] = useState<string>("");

//   // Format data for chart
//   const formatData = useCallback(() => {
//     if (!data?.length) return [];

//     const formattedData: CandleData[] = [];
//     let prevTime = 0;

//     for (let i = 0; i < data.length; i++) {
//       const d = data[i];

//       try {
//         // Parse date
//         const dateStr = d.Date || d.date || d.DATE || "";
//         const time = parseDateString(dateStr);

//         if (time === 0) continue;

//         // Ensure ascending order
//         const currentTime = time <= prevTime ? prevTime + 60 : time;
//         prevTime = currentTime;

//         // Parse numeric values
//         const open = parseFloat(d.Open || d.open || d.O || 0);
//         const high = parseFloat(d.High || d.high || d.H || 0);
//         const low = parseFloat(d.Low || d.low || d.L || 0);
//         const close = parseFloat(d.Close || d.close || d.C || 0);
//         const volume =
//           d.Volume !== undefined ? parseFloat(d.Volume) : undefined;

//         if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
//           continue;
//         }

//         formattedData.push({
//           time: currentTime,
//           open,
//           high,
//           low,
//           close,
//           volume,
//         });

//         // Store the last candle data
//         if (i === data.length - 1) {
//           const dateStr = formatDateWithTime(currentTime);
//           setLastCandle({
//             open,
//             high,
//             low,
//             close,
//             time: dateStr,
//           });
//         }
//       } catch (error) {
//         console.error(`Error processing row ${i}:`, error);
//       }
//     }

//     console.log("Formatted data:", formattedData.length, "candles");
//     console.log("First candle:", formatDateWithTime(formattedData[0]?.time));
//     console.log(
//       "Last candle:",
//       formatDateWithTime(formattedData[formattedData.length - 1]?.time),
//     );

//     setFormattedChartData(formattedData);
//     return formattedData;
//   }, [data]);

//   // Calculate profit/loss and margin
//   const calculateResults = useCallback(() => {
//     if (!ltp || !sl || !target || !quantity) return null;

//     const ltpNum = parseFloat(ltp);
//     const slNum = parseFloat(sl);
//     const targetNum = parseFloat(target);
//     const quantityNum = parseFloat(quantity);

//     if (
//       isNaN(ltpNum) ||
//       isNaN(slNum) ||
//       isNaN(targetNum) ||
//       isNaN(quantityNum)
//     ) {
//       return null;
//     }

//     // Calculate profit if target hits
//     const profitPerUnit = targetNum - ltpNum;
//     const totalProfit = profitPerUnit * quantityNum;
//     const profitPercentage = ((profitPerUnit / ltpNum) * 100).toFixed(2);

//     // Calculate loss if SL hits
//     const lossPerUnit = slNum - ltpNum;
//     const totalLoss = lossPerUnit * quantityNum;
//     const lossPercentage = ((lossPerUnit / ltpNum) * 100).toFixed(2);

//     // Calculate total margin (LTP × Quantity)
//     const totalMargin = ltpNum * quantityNum;

//     return {
//       profitPerUnit,
//       totalProfit,
//       profitPercentage,
//       lossPerUnit,
//       totalLoss,
//       lossPercentage,
//       totalMargin,
//       quantity: quantityNum,
//       ltp: ltpNum,
//       sl: slNum,
//       target: targetNum,
//     };
//   }, [ltp, sl, target, quantity]);

//   const results = calculateResults();

//   // IMPROVED: Parse selected time with correct date from data
//   const parseEntryTime = useCallback(
//     (timeStr: string) => {
//       if (!timeStr || !formattedChartData.length) return 0;

//       try {
//         console.log("=== Parsing Entry Time ===");
//         console.log("Selected time string:", timeStr);

//         // Get the date from the first candle to use as reference
//         const firstCandleTime = formattedChartData[0].time;
//         const firstCandleDate = new Date(
//           (firstCandleTime + IST_OFFSET_SECONDS) * 1000,
//         );

//         // Extract date parts
//         const year = firstCandleDate.getFullYear();
//         const month = firstCandleDate.getMonth();
//         const day = firstCandleDate.getDate();

//         // Parse the time
//         const [hours, minutes] = timeStr.split(":").map(Number);

//         // Create date with correct date from data + selected time
//         const entryDate = new Date(year, month, day, hours, minutes, 0);
//         const timestamp =
//           Math.floor(entryDate.getTime() / 1000) - IST_OFFSET_SECONDS;

//         // Format for display
//         const formattedEntryTime = formatDateWithTime(timestamp);
//         setEntryDateStr(formattedEntryTime);

//         console.log("Using date from first candle:", {
//           year,
//           month: month + 1,
//           day,
//         });
//         console.log("Entry time:", timeStr);
//         console.log("Calculated timestamp:", timestamp);
//         console.log("Formatted entry time:", formattedEntryTime);
//         console.log("First candle time:", formatDateWithTime(firstCandleTime));

//         return timestamp;
//       } catch (error) {
//         console.error("Error parsing entry time:", error);
//         return 0;
//       }
//     },
//     [formattedChartData],
//   );

//   // Check which level gets hit first AFTER entry time
//   const checkFirstHit = useCallback(() => {
//     console.log("=== Checking first hit ===");
//     console.log("Selected time:", selectedTime);
//     console.log("Entry timestamp:", entryTimestamp);
//     console.log("Entry date string:", entryDateStr);
//     console.log("Formatted data length:", formattedChartData.length);

//     if (!formattedChartData.length || !results) {
//       console.log("No data or results, skipping hit check");
//       setFirstHit(null);
//       return;
//     }

//     let hitResult: HitResult | null = null;
//     const ltpNum = results.ltp;
//     const slNum = results.sl;
//     const targetNum = results.target;

//     console.log("Entry Price (LTP):", ltpNum);
//     console.log("SL:", slNum);
//     console.log("Target:", targetNum);

//     // Determine if we're long or short based on LTP relative to Target
//     const isLong = ltpNum < targetNum; // Buying low, expecting to sell high

//     console.log("Position type:", isLong ? "LONG" : "SHORT");

//     // Find the starting index based on entry time
//     let startIndex = 0;
//     let candlesChecked = 0;

//     if (entryTimestamp > 0) {
//       // Find the first candle STRICTLY AFTER the entry time
//       for (let i = 0; i < formattedChartData.length; i++) {
//         const candleTime = formattedChartData[i].time;
//         const candleTimeStr = formatDateWithTime(candleTime);

//         if (candleTime > entryTimestamp) {
//           startIndex = i;
//           console.log(`Starting from candle ${i} (strictly after entry)`);
//           console.log(`Candle time: ${candleTimeStr}`);
//           console.log(`Entry time: ${entryDateStr}`);
//           break;
//         } else if (candleTime === entryTimestamp) {
//           // If exact match, start from next candle
//           startIndex = i + 1;
//           console.log(`Starting from candle ${i + 1} (next after exact match)`);
//           console.log(`Candle time matches entry: ${candleTimeStr}`);
//           break;
//         }
//       }

//       // If no candle after entry time, show message
//       if (startIndex >= formattedChartData.length) {
//         console.log("No candles found after entry time");
//         setFirstHit(null);
//         return;
//       }
//     } else {
//       console.log("No entry time specified, checking all candles");
//     }

//     candlesChecked = formattedChartData.length - startIndex;
//     console.log(`Checking ${candlesChecked} candles after entry...`);

//     for (let i = startIndex; i < formattedChartData.length; i++) {
//       const candle = formattedChartData[i];
//       const candleTimeStr = formatDateWithTime(candle.time);

//       console.log(
//         `Checking candle ${i}: ${candleTimeStr}, Range: ${candle.low} - ${candle.high}`,
//       );

//       // For long position:
//       // - SL is below LTP (stop loss)
//       // - Target is above LTP (take profit)
//       if (isLong) {
//         // Check if SL is hit (price goes below SL)
//         if (candle.low <= slNum) {
//           console.log(`Candle ${i}: SL HIT!`);
//           console.log(`  Time: ${candleTimeStr}`);
//           console.log(`  Candle Low: ${candle.low} <= SL: ${slNum}`);
//           console.log(`  Candle Range: ${candle.low} - ${candle.high}`);

//           hitResult = {
//             level: "SL",
//             time: candleTimeStr,
//             price: Math.min(slNum, candle.low),
//             index: i,
//             candleTime: candle.time,
//             candleDetails: {
//               open: candle.open,
//               high: candle.high,
//               low: candle.low,
//               close: candle.close,
//             },
//           };
//           break;
//         }
//         // Check if Target is hit (price goes above Target)
//         if (candle.high >= targetNum) {
//           console.log(`Candle ${i}: TARGET HIT!`);
//           console.log(`  Time: ${candleTimeStr}`);
//           console.log(`  Candle High: ${candle.high} >= Target: ${targetNum}`);
//           console.log(`  Candle Range: ${candle.low} - ${candle.high}`);

//           hitResult = {
//             level: "Target",
//             time: candleTimeStr,
//             price: Math.max(targetNum, candle.high),
//             index: i,
//             candleTime: candle.time,
//             candleDetails: {
//               open: candle.open,
//               high: candle.high,
//               low: candle.low,
//               close: candle.close,
//             },
//           };
//           break;
//         }
//       }
//       // For short position:
//       // - SL is above LTP (stop loss)
//       // - Target is below LTP (take profit)
//       else {
//         // Check if SL is hit (price goes above SL)
//         if (candle.high >= slNum) {
//           console.log(`Candle ${i}: SL HIT!`);
//           console.log(`  Time: ${candleTimeStr}`);
//           console.log(`  Candle High: ${candle.high} >= SL: ${slNum}`);
//           console.log(`  Candle Range: ${candle.low} - ${candle.high}`);

//           hitResult = {
//             level: "SL",
//             time: candleTimeStr,
//             price: Math.max(slNum, candle.high),
//             index: i,
//             candleTime: candle.time,
//             candleDetails: {
//               open: candle.open,
//               high: candle.high,
//               low: candle.low,
//               close: candle.close,
//             },
//           };
//           break;
//         }
//         // Check if Target is hit (price goes below Target)
//         if (candle.low <= targetNum) {
//           console.log(`Candle ${i}: TARGET HIT!`);
//           console.log(`  Time: ${candleTimeStr}`);
//           console.log(`  Candle Low: ${candle.low} <= Target: ${targetNum}`);
//           console.log(`  Candle Range: ${candle.low} - ${candle.high}`);

//           hitResult = {
//             level: "Target",
//             time: candleTimeStr,
//             price: Math.min(targetNum, candle.low),
//             index: i,
//             candleTime: candle.time,
//             candleDetails: {
//               open: candle.open,
//               high: candle.high,
//               low: candle.low,
//               close: candle.close,
//             },
//           };
//           break;
//         }
//       }
//     }

//     console.log("=== Hit result ===", hitResult);
//     setFirstHit(hitResult);
//   }, [formattedChartData, results, entryTimestamp, entryDateStr, selectedTime]);

//   // Update formatted data when data changes
//   useEffect(() => {
//     formatData();
//   }, [data, formatData]);

//   // Update entry timestamp when selected time changes
//   useEffect(() => {
//     if (selectedTime && formattedChartData.length > 0) {
//       const timestamp = parseEntryTime(selectedTime);
//       setEntryTimestamp(timestamp);
//       console.log(
//         "Updated entry timestamp:",
//         timestamp,
//         "for time:",
//         selectedTime,
//       );
//     } else {
//       setEntryTimestamp(0);
//       setEntryDateStr("");
//     }
//   }, [selectedTime, formattedChartData, parseEntryTime]);

//   // Check for hits when entry is set or results change
//   useEffect(() => {
//     if (results && isEntrySet && formattedChartData.length > 0) {
//       console.log("Entry set, checking for hits...");
//       // Small delay to ensure everything is ready
//       setTimeout(() => {
//         checkFirstHit();
//       }, 200);
//     }
//   }, [results, isEntrySet, checkFirstHit, formattedChartData]);

//   // Draw all lines function
//   const drawAllLines = () => {
//     if (!candleSeriesRef.current) return;

//     console.log("=== Drawing lines ===");
//     console.log("LTP:", ltp, "SL:", sl, "Target:", target);
//     console.log("Selected Time:", selectedTime);
//     console.log("Entry Timestamp:", entryTimestamp);

//     // Remove old lines
//     if (ltpLineRef.current)
//       candleSeriesRef.current.removePriceLine(ltpLineRef.current);
//     if (slLineRef.current)
//       candleSeriesRef.current.removePriceLine(slLineRef.current);
//     if (targetLineRef.current)
//       candleSeriesRef.current.removePriceLine(targetLineRef.current);

//     // Draw LTP line
//     if (ltp && !isNaN(Number(ltp))) {
//       const labelText = selectedTime ? `Entry @ ${selectedTime}` : "LTP";
//       ltpLineRef.current = candleSeriesRef.current.createPriceLine({
//         price: Number(ltp),
//         color: "#00BFFF",
//         lineWidth: 1,
//         lineStyle: LightweightCharts.LineStyle.Solid,
//         axisLabelVisible: true,
//         title: labelText,
//         axisLabelColor: "#00BFFF",
//       });
//     }

//     // Draw SL line
//     if (sl && !isNaN(Number(sl))) {
//       const labelText = selectedTime ? `SL @ ${selectedTime}` : "SL";
//       slLineRef.current = candleSeriesRef.current.createPriceLine({
//         price: Number(sl),
//         color: theme === "light" ? "#dc2626" : "#ef4444",
//         lineWidth: 1,
//         lineStyle: LightweightCharts.LineStyle.Solid,
//         axisLabelVisible: true,
//         title: labelText,
//       });
//     }

//     // Draw Target line
//     if (target && !isNaN(Number(target))) {
//       const labelText = selectedTime ? `Target @ ${selectedTime}` : "Target";
//       targetLineRef.current = candleSeriesRef.current.createPriceLine({
//         price: Number(target),
//         color: theme === "light" ? "#16a34a" : "#22c55e",
//         lineWidth: 1,
//         lineStyle: LightweightCharts.LineStyle.Solid,
//         axisLabelVisible: true,
//         title: labelText,
//       });
//     }

//     // Mark entry as set and check for first hit
//     if (ltp && sl && target) {
//       setIsEntrySet(true);
//       console.log("Entry set to true");

//       // Small delay to ensure chart is updated
//       setTimeout(() => {
//         if (formattedChartData.length > 0) {
//           checkFirstHit();
//         }
//       }, 300);
//     }
//   };

//   // Initialize or update chart
//   useEffect(() => {
//     if (!chartRef.current) return;

//     const formattedData = formatData();

//     if (formattedData.length === 0) {
//       console.warn("No valid data to display");
//       return;
//     }

//     // Create chart
//     const chart = LightweightCharts.createChart(chartRef.current, {
//       width: chartRef.current.clientWidth,
//       height: chartRef.current.clientHeight,
//       layout: {
//         background: {
//           topColor: "solid",
//           color: theme === "light" ? "#ffffff" : "#1a1a1a",
//         },
//         textColor: theme === "light" ? "#333" : "#d1d5db",
//       },
//       grid: {
//         vertLines: { color: theme === "light" ? "#eee" : "#374151" },
//         horzLines: { color: theme === "light" ? "#eee" : "#374151" },
//       },
//       crosshair: {
//         mode: LightweightCharts.CrosshairMode.Normal,
//         vertLine: {
//           width: 1,
//           color: theme === "light" ? "#9CA3AF" : "#6B7280",
//           style: LightweightCharts.LineStyle.LargeDashed,
//           labelBackgroundColor: theme === "light" ? "#000" : "#374151",
//         },
//         horzLine: {
//           width: 1,
//           color: theme === "light" ? "#9CA3AF" : "#6B7280",
//           style: LightweightCharts.LineStyle.LargeDashed,
//           labelBackgroundColor: theme === "light" ? "#000" : "#374151",
//         },
//       },
//       timeScale: {
//         timeVisible: true,
//         secondsVisible: false,
//         borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
//         rightOffset: 0,
//         barSpacing: 6,
//         minBarSpacing: 1,
//         fixLeftEdge: true,
//         fixRightEdge: true,
//         tickMarkFormatter: (time: number, tickMarkType: any) => {
//           const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
//           const hours = date.getHours();
//           const minutes = date.getMinutes();

//           if ((hours === 0 && minutes === 0) || formattedData.length < 50) {
//             return formatDateOnly(time);
//           }
//           return formatToIST(time);
//         },
//       },
//       rightPriceScale: {
//         borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
//         scaleMargins: {
//           top: 0.1,
//           bottom: 0.1,
//         },
//       },
//       localization: {
//         timeFormatter: (time: number) => {
//           return formatDateWithTime(time);
//         },
//         dateFormat: "dd-MMM-yyyy",
//       },
//     });

//     chartInstanceRef.current = chart;

//     // Add series based on chart type
//     let series: any;

//     if (chartType === "candlestick") {
//       series = chart.addCandlestickSeries({
//         upColor: theme === "light" ? "#16a34a" : "#22c55e",
//         downColor: theme === "light" ? "#dc2626" : "#ef4444",
//         borderUpColor: theme === "light" ? "#16a34a" : "#22c55e",
//         borderDownColor: theme === "light" ? "#dc2626" : "#ef4444",
//         wickUpColor: theme === "light" ? "#16a34a" : "#22c55e",
//         wickDownColor: theme === "light" ? "#dc2626" : "#ef4444",
//         priceLineVisible: false,
//       });

//       series.setData(
//         formattedData.map((d) => ({
//           time: d.time,
//           open: d.open,
//           high: d.high,
//           low: d.low,
//           close: d.close,
//         })),
//       );
//     } else if (chartType === "line" || chartType === "area") {
//       const seriesOptions: any = {
//         color: theme === "light" ? "#3b82f6" : "#60a5fa",
//         lineWidth: 1,
//         priceLineVisible: false,
//       };

//       if (chartType === "area") {
//         seriesOptions.lineType = LightweightCharts.LineType.WithSteps;
//         seriesOptions.topColor =
//           theme === "light"
//             ? "rgba(59, 130, 246, 0.4)"
//             : "rgba(96, 165, 250, 0.4)";
//         seriesOptions.bottomColor =
//           theme === "light" ? "rgba(59, 130, 246, 0)" : "rgba(96, 165, 250, 0)";
//         seriesOptions.lineWidth = 1;
//       }

//       series = chart.addLineSeries(seriesOptions);

//       series.setData(
//         formattedData.map((d) => ({
//           time: d.time,
//           value: d.close,
//         })),
//       );
//     }

//     candleSeriesRef.current = series;

//     // Add volume series if enabled
//     if (showVolume && formattedData[0]?.volume !== undefined) {
//       volumeSeriesRef.current = chart.addHistogramSeries({
//         priceFormat: { type: "volume" },
//         priceScaleId: "volume",
//       });

//       volumeSeriesRef.current.setData(
//         formattedData.map((d: any) => ({
//           time: d.time,
//           value: d.volume ?? 0,
//           color: d.close >= d.open ? "#16a34a" : "#dc2626",
//         })),
//       );

//       chart.priceScale("volume").applyOptions({
//         scaleMargins: {
//           top: 0.8,
//           bottom: 0,
//         },
//       });
//     } else if (volumeSeriesRef.current) {
//       chart.removeSeries(volumeSeriesRef.current);
//       volumeSeriesRef.current = null;
//     }

//     if (formattedData.length > 0) {
//       const firstTime: any = formattedData[0].time;
//       const lastTime: any = formattedData[formattedData.length - 1].time;

//       chart.timeScale().setVisibleRange({
//         from: firstTime,
//         to: lastTime,
//       });

//       setTimeout(() => {
//         chart.timeScale().fitContent();
//       }, 100);
//     }

//     // Handle crosshair for OHLC display
//     chart.subscribeCrosshairMove((param: any) => {
//       if (!param.time || param.seriesData.size === 0) {
//         setOhlcValues(null);
//         return;
//       }

//       const candleData = param.seriesData.get(series);
//       if (!candleData) {
//         setOhlcValues(null);
//         return;
//       }

//       let open = 0,
//         high = 0,
//         low = 0,
//         close = 0;

//       if (chartType === "candlestick") {
//         ({ open, high, low, close } = candleData);
//       } else {
//         const value = candleData.value;
//         open = high = low = close = value;
//       }

//       const timeStr = formatDateWithTime(param.time);

//       setOhlcValues({
//         open,
//         high,
//         low,
//         close,
//         time: timeStr,
//       });
//     });

//     // Draw existing lines if they exist
//     if (ltp || sl || target) {
//       setTimeout(() => {
//         drawAllLines();
//       }, 500);
//     }

//     // Handle resize
//     const resizeObserver = new ResizeObserver(() => {
//       if (chartRef.current) {
//         chart.applyOptions({
//           width: chartRef.current.clientWidth,
//           height: chartRef.current.clientHeight,
//         });
//         setTimeout(() => {
//           chart.timeScale().fitContent();
//         }, 50);
//       }
//     });

//     resizeObserver.observe(chartRef.current);

//     return () => {
//       resizeObserver.disconnect();
//       chart.remove();
//     };
//   }, [data, theme, chartType, showVolume]);

//   // Handle Apply Lines button click
//   const handleDrawLines = () => {
//     drawAllLines();
//   };

//   // Clear all lines
//   const handleClearLines = () => {
//     setLtp("");
//     setSl("");
//     setTarget("");
//     setSelectedTime("");
//     setQuantity("65");
//     setIsEntrySet(false);
//     setFirstHit(null);
//     setEntryTimestamp(0);
//     setEntryDateStr("");

//     if (!candleSeriesRef.current) return;

//     if (ltpLineRef.current) {
//       candleSeriesRef.current.removePriceLine(ltpLineRef.current);
//       ltpLineRef.current = null;
//     }
//     if (slLineRef.current) {
//       candleSeriesRef.current.removePriceLine(slLineRef.current);
//       slLineRef.current = null;
//     }
//     if (targetLineRef.current) {
//       candleSeriesRef.current.removePriceLine(targetLineRef.current);
//       targetLineRef.current = null;
//     }
//   };

//   // Handle chart type change
//   const handleChartTypeChange = (type: "candlestick" | "line" | "area") => {
//     setChartType(type);
//   };

//   // Handle Enter key press
//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       handleDrawLines();
//     }
//   };

//   // Determine what to display
//   const displayData = ohlcValues || lastCandle;
//   const displayTime = ohlcValues
//     ? ohlcValues.time
//     : lastCandle
//       ? lastCandle.time
//       : "";

//   // Calculate candles after entry
//   const candlesAfterEntry =
//     entryTimestamp > 0
//       ? formattedChartData.filter((c) => c.time > entryTimestamp).length
//       : 0;

//   return (
//     <div className="relative w-full">
//       {/* Controls */}
//       <div className="flex flex-wrap justify-between items-start p-3 bg-white dark:bg-gray-900 shadow z-20">
//         {/* Left side: Inputs */}
//         <div className="flex flex-col gap-3">
//           {/* Inputs row */}
//           <div className="flex gap-3 items-center">
//             {/* Time Input */}
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-gray-500 dark:text-gray-400">
//                 Entry Time
//               </label>
//               <input
//                 type="time"
//                 value={selectedTime}
//                 onChange={(e) => setSelectedTime(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-blue-300"
//               />
//             </div>

//             {/* LTP Input */}
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-gray-500 dark:text-gray-400">
//                 Entry Price (LTP)
//               </label>
//               <input
//                 type="number"
//                 placeholder="Entry Price"
//                 value={ltp}
//                 onChange={(e) => setLtp(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 step="0.01"
//                 className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-blue-300"
//               />
//             </div>

//             {/* SL Input */}
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-gray-500 dark:text-gray-400">
//                 Stop Loss (SL)
//               </label>
//               <input
//                 type="number"
//                 placeholder="SL Price"
//                 value={sl}
//                 onChange={(e) => setSl(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 step="0.01"
//                 className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-red-300"
//               />
//             </div>

//             {/* Target Input */}
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-gray-500 dark:text-gray-400">
//                 Target
//               </label>
//               <input
//                 type="number"
//                 placeholder="Target Price"
//                 value={target}
//                 onChange={(e) => setTarget(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 step="0.01"
//                 className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-green-300"
//               />
//             </div>

//             {/* Quantity Input */}
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-gray-500 dark:text-gray-400">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 placeholder="Quantity"
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-yellow-300"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="flex flex-col gap-1">
//               <label className="text-xs text-gray-500 dark:text-gray-400 invisible">
//                 Actions
//               </label>
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleDrawLines}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium"
//                 >
//                   Analyze Trade
//                 </button>
//                 <button
//                   onClick={handleClearLines}
//                   className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-sm"
//                 >
//                   Clear All
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right side: Chart controls */}
//         <div className="flex items-center gap-3">
//           {/* OHLC Display */}
//           <div className="flex gap-4 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-md text-[12px]">
//             {["Open", "High", "Low", "Close"].map((label) => (
//               <div key={label} className="text-center">
//                 <div className="text-xs text-gray-500 dark:text-gray-400">
//                   {label}
//                 </div>
//                 <div className="font-bold tw-text-[10px] dark:text-white">
//                   {displayData ? (
//                     <>
//                       {displayData?.[
//                         label.toLowerCase() as keyof OHLCValues
//                       ]?.toFixed(2)}
//                     </>
//                   ) : (
//                     0
//                   )}
//                 </div>
//               </div>
//             ))}
//             <div className="text-center">
//               <div className="text-xs text-gray-500 dark:text-gray-400">
//                 Date & Time
//               </div>
//               <div className="font-bold dark:text-white uppercase">
//                 {displayTime?.split("-")?.join("  ") || "No data"}
//               </div>
//             </div>
//           </div>

//           {/* Chart Type Selector */}
//           <div className="relative">
//             <select
//               value={chartType}
//               onChange={(e) => handleChartTypeChange(e.target.value as any)}
//               className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded appearance-none cursor-pointer pr-8"
//             >
//               <option value="candlestick">Candlestick</option>
//               <option value="line">Line Chart</option>
//               <option value="area">Area Chart</option>
//             </select>
//             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
//               ▼
//             </div>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-5 mt-5">
//           <div>
//             {/* Entry Information */}
//             {results && selectedTime && (
//               <div className="hidden bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm">
//                     Entry Information
//                   </h3>
//                 </div>
//                 <div className="grid grid-cols-4 gap-4 text-sm">
//                   <div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">
//                       Entry Time
//                     </div>
//                     <div className="font-bold dark:text-white">
//                       {selectedTime}
//                     </div>
//                     {entryDateStr && (
//                       <div className="text-xs text-gray-500 dark:text-gray-400">
//                         {entryDateStr.split(" ")[0]}
//                       </div>
//                     )}
//                   </div>
//                   <div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">
//                       Entry Price
//                     </div>
//                     <div className="font-bold dark:text-white">
//                       ₹{results.ltp.toFixed(2)}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">
//                       Position
//                     </div>
//                     <div className="font-bold dark:text-white">
//                       {results.ltp < results.target ? "LONG" : "SHORT"}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">
//                       Candles to Check
//                     </div>
//                     <div className="font-bold dark:text-white">
//                       {candlesAfterEntry} candles after {selectedTime}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* First Hit Card - Always show when we have results */}
//             {results && (
//               <div
//                 className={`rounded-lg p-3 border ${
//                   firstHit?.level === "SL"
//                     ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
//                     : firstHit?.level === "Target"
//                       ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
//                       : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
//                 }`}
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   <div
//                     className={`w-3 h-3 rounded-full ${
//                       firstHit?.level === "SL"
//                         ? "bg-red-500"
//                         : firstHit?.level === "Target"
//                           ? "bg-green-500"
//                           : "bg-yellow-500"
//                     }`}
//                   ></div>
//                   <h3
//                     className={`font-bold text-sm ${
//                       firstHit?.level === "SL"
//                         ? "text-red-700 dark:text-red-300"
//                         : firstHit?.level === "Target"
//                           ? "text-green-700 dark:text-green-300"
//                           : "text-yellow-700 dark:text-yellow-300"
//                     }`}
//                   >
//                     {firstHit
//                       ? `First Hit: ${firstHit.level}`
//                       : "No Hit Detected"}
//                     <span className="ml-2 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">
//                       {results.ltp < results.target
//                         ? "LONG Position"
//                         : "SHORT Position"}
//                     </span>
//                   </h3>
//                 </div>

//                 {firstHit ? (
//                   <div className="space-y-2">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           Hit Time
//                         </div>
//                         <div className="text-lg font-bold">{firstHit.time}</div>
//                       </div>
//                       <div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           Hit Price
//                         </div>
//                         <div className="text-lg font-bold">
//                           ₹{firstHit.price.toFixed(2)}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-2">
//                       {firstHit.level === "SL"
//                         ? `Stop Loss triggered at ${firstHit.time}. Trade would have been exited with a loss.`
//                         : `Target achieved at ${firstHit.time}. Trade would have been exited with a profit.`}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <div className="text-lg font-bold">
//                       {selectedTime
//                         ? `No SL or Target hit after ${selectedTime}`
//                         : "No SL or Target hit in historical data"}
//                     </div>
//                     <div className="text-sm text-gray-600 dark:text-gray-300">
//                       {candlesAfterEntry > 0
//                         ? `Checked ${candlesAfterEntry} candles after entry, both levels remain untouched`
//                         : `Checked ${formattedChartData.length} candles, both levels remain untouched`}
//                     </div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400">
//                       Entry time: {selectedTime || "Not specified"}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Profit/Loss Cards */}
//           {results && (
//             <div className="grid grid-cols-3 gap-4">
//               {/* Loss Card (If SL hits) */}
//               <div
//                 className={`bg-red-50 dark:bg-red-900/20 border ${
//                   firstHit?.level === "SL"
//                     ? "border-red-400 dark:border-red-500 border-2"
//                     : "border-red-200 dark:border-red-800"
//                 } rounded-lg p-3`}
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
//                   <h3 className="font-bold text-red-700 dark:text-red-300 text-sm">
//                     If SL Hits {firstHit?.level === "SL" && "✓"}
//                   </h3>
//                 </div>
//                 <div className="space-y-1">
//                   <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//                     -₹
//                     {Math.abs(results.totalLoss).toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </div>
//                   <div className="text-xs text-gray-600 dark:text-gray-300">
//                     Per unit: ₹{results.lossPerUnit.toFixed(2)}
//                   </div>
//                   <div className="text-xs text-gray-600 dark:text-gray-300">
//                     {results.lossPercentage}% loss
//                   </div>
//                 </div>
//               </div>

//               {/* Margin Card */}
//               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm">
//                     Margin Required
//                   </h3>
//                 </div>
//                 <div className="space-y-1">
//                   <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                     ₹
//                     {results.totalMargin.toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </div>
//                   <div className="text-xs text-gray-600 dark:text-gray-300">
//                     Entry: ₹{results.ltp.toFixed(2)} × Qty:{" "}
//                     {results.quantity.toLocaleString("en-IN")}
//                   </div>
//                   <div className="text-xs text-gray-600 dark:text-gray-300">
//                     {results.ltp.toFixed(2)} × {results.quantity} ={" "}
//                     {results.totalMargin.toFixed(2)}
//                   </div>
//                 </div>
//               </div>

//               {/* Profit Card (If Target hits) */}
//               <div
//                 className={`bg-green-50 dark:bg-green-900/20 border ${
//                   firstHit?.level === "Target"
//                     ? "border-green-400 dark:border-green-500 border-2"
//                     : "border-green-200 dark:border-green-800"
//                 } rounded-lg p-3`}
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
//                   <h3 className="font-bold text-green-700 dark:text-green-300 text-sm">
//                     If Target Hits {firstHit?.level === "Target" && "✓"}
//                   </h3>
//                 </div>
//                 <div className="space-y-1">
//                   <div className="text-2xl font-bold text-green-600 dark:text-green-400">
//                     +₹
//                     {results.totalProfit.toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </div>
//                   <div className="text-xs text-gray-600 dark:text-gray-300">
//                     Per unit: ₹{results.profitPerUnit.toFixed(2)}
//                   </div>
//                   <div className="text-xs text-gray-600 dark:text-gray-300">
//                     {results.profitPercentage}% profit
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Chart Container */}
//       <div
//         ref={chartRef}
//         className="w-full h-[350px] md:h-[calc(100vh-200px)]"
//       />

//       {/* Legend for Lines */}
//       <div className="flex justify-center gap-6 mt-2 p-2 bg-gray-50 dark:bg-gray-900 text-sm">
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-0.5 bg-[#00BFFF]"></div>
//           <span className="dark:text-white">Entry Price (Blue)</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-0.5 bg-red-500"></div>
//           <span className="dark:text-white">SL (Red Dashed)</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-0.5 bg-green-500"></div>
//           <span className="dark:text-white">Target (Green Dashed)</span>
//         </div>
//         {firstHit && (
//           <div className="flex items-center gap-2">
//             <div
//               className="w-4 h-4 rounded-full border-2 animate-pulse"
//               style={{
//                 borderColor: firstHit.level === "SL" ? "#ef4444" : "#22c55e",
//               }}
//             ></div>
//             <span className="dark:text-white font-semibold">
//               First Hit: {firstHit.level} at {firstHit.time.split(" ")[1]}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MinuteChart;

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as LightweightCharts from "lightweight-charts";
import {
  IconCoinRupeeFilled,
  IconTargetArrow,
  IconTargetOff,
} from "@tabler/icons-react";

const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

// Helper function to parse date
const parseDateString = (dateStr: string): number => {
  try {
    const cleanStr = dateStr.trim();

    let date: Date;

    // Try DD-MM-YYYY HH:mm format
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
    }
    // Try YYYY-MM-DD HH:mm format
    else if (cleanStr.match(/\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2}/)) {
      date = new Date(cleanStr.replace(" ", "T"));
    }
    // Fallback to Date constructor
    else {
      date = new Date(cleanStr);
    }

    if (isNaN(date.getTime())) {
      return 0;
    }

    return Math.floor(date.getTime() / 1000) - IST_OFFSET_SECONDS;
  } catch (error) {
    console.error("Error parsing date:", dateStr, error);
    return 0;
  }
};

// Helper function to format time to IST (for consistent display)
const formatToIST = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// Helper function to format date with time for hover display
const formatDateWithTime = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);

  // Format: DD-MMM-YYYY HH:MM:SS AM/PM
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

// Helper function to format date only for x-axis
const formatDateOnly = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);

  // Format: DD-MMM-YYYY
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

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
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

// Calculate duration between two times in HH:mm format
const calculateDuration = (entryTime: string, exitTime: string): string => {
  if (!entryTime || !exitTime) return "";

  try {
    const [entryHour, entryMinute] = entryTime.split(":").map(Number);
    const [exitHour, exitMinute] = exitTime.split(":").map(Number);

    let totalMinutes =
      exitHour * 60 + exitMinute - (entryHour * 60 + entryMinute);

    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // Handle cross-day scenario
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "";
  }
};

const MinuteChart = ({ data }: { data: any[] }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  // Refs for price lines
  const ltpLineRef = useRef<any>(null);
  const slLineRef = useRef<any>(null);
  const targetLineRef = useRef<any>(null);

  // State for input values
  const [ltp, setLtp] = useState("");
  const [sl, setSl] = useState("");
  const [target, setTarget] = useState("");
  const [selectedTime, setSelectedTime] = useState("09:21");
  const [quantity, setQuantity] = useState("65");

  const [ohlcValues, setOhlcValues] = useState<OHLCValues | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showVolume, setShowVolume] = useState(false);
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area">(
    "candlestick",
  );

  // Store last candle data
  const [lastCandle, setLastCandle] = useState<OHLCValues | null>(null);

  // Store which level was hit first
  const [firstHit, setFirstHit] = useState<HitResult | null>(null);
  const [isEntrySet, setIsEntrySet] = useState(false);
  const [formattedChartData, setFormattedChartData] = useState<CandleData[]>(
    [],
  );
  const [entryTimestamp, setEntryTimestamp] = useState<number>(0);
  const [entryDateStr, setEntryDateStr] = useState<string>("");

  // New state for option chain style label
  const [optionLabel, setOptionLabel] = useState("NIFTY 50");
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  // Format data for chart
  const formatData = useCallback(() => {
    if (!data?.length) return [];

    const formattedData: CandleData[] = [];
    let prevTime = 0;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];

      try {
        // Parse date
        const dateStr = d.Date || d.date || d.DATE || "";
        const time = parseDateString(dateStr);

        if (time === 0) continue;

        // Ensure ascending order
        const currentTime = time <= prevTime ? prevTime + 60 : time;
        prevTime = currentTime;

        // Parse numeric values
        const open = parseFloat(d.Open || d.open || d.O || 0);
        const high = parseFloat(d.High || d.high || d.H || 0);
        const low = parseFloat(d.Low || d.low || d.L || 0);
        const close = parseFloat(d.Close || d.close || d.C || 0);
        const volume =
          d.Volume !== undefined ? parseFloat(d.Volume) : undefined;

        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
          continue;
        }

        formattedData.push({
          time: currentTime,
          open,
          high,
          low,
          close,
          volume,
        });

        // Store the last candle data
        if (i === data.length - 1) {
          const dateStr = formatDateWithTime(currentTime);
          setLastCandle({
            open,
            high,
            low,
            close,
            time: dateStr,
          });
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }
    }

    setFormattedChartData(formattedData);
    return formattedData;
  }, [data]);

  // Calculate profit/loss and margin
  const calculateResults = useCallback(() => {
    if (!ltp || !sl || !target || !quantity) return null;

    const ltpNum = parseFloat(ltp);
    const slNum = parseFloat(sl);
    const targetNum = parseFloat(target);
    const quantityNum = parseFloat(quantity);

    if (
      isNaN(ltpNum) ||
      isNaN(slNum) ||
      isNaN(targetNum) ||
      isNaN(quantityNum)
    ) {
      return null;
    }

    // Calculate profit if target hits
    const profitPerUnit = targetNum - ltpNum;
    const totalProfit = profitPerUnit * quantityNum;
    const profitPercentage = ((profitPerUnit / ltpNum) * 100).toFixed(2);

    // Calculate loss if SL hits
    const lossPerUnit = slNum - ltpNum;
    const totalLoss = lossPerUnit * quantityNum;
    const lossPercentage = ((lossPerUnit / ltpNum) * 100).toFixed(2);

    // Calculate total margin (LTP × Quantity)
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
  }, [ltp, sl, target, quantity]);

  const results = calculateResults();

  // Parse selected time with correct date from data
  const parseEntryTime = useCallback(
    (timeStr: string) => {
      if (!timeStr || !formattedChartData.length) return 0;

      try {
        // Get the date from the first candle to use as reference
        const firstCandleTime = formattedChartData[0].time;
        const firstCandleDate = new Date(
          (firstCandleTime + IST_OFFSET_SECONDS) * 1000,
        );

        // Extract date parts
        const year = firstCandleDate.getFullYear();
        const month = firstCandleDate.getMonth();
        const day = firstCandleDate.getDate();

        // Parse the time
        const [hours, minutes] = timeStr.split(":").map(Number);

        // Create date with correct date from data + selected time
        const entryDate = new Date(year, month, day, hours, minutes, 0);
        const timestamp =
          Math.floor(entryDate.getTime() / 1000) - IST_OFFSET_SECONDS;

        // Format for display
        const formattedEntryTime = formatDateWithTime(timestamp);
        setEntryDateStr(formattedEntryTime);

        return timestamp;
      } catch (error) {
        console.error("Error parsing entry time:", error);
        return 0;
      }
    },
    [formattedChartData],
  );

  // Check which level gets hit first AFTER entry time
  const checkFirstHit = useCallback(() => {
    if (!formattedChartData.length || !results) {
      setFirstHit(null);
      return;
    }

    let hitResult: HitResult | null = null;
    const ltpNum = results.ltp;
    const slNum = results.sl;
    const targetNum = results.target;

    // Determine if we're long or short based on LTP relative to Target
    const isLong = ltpNum < targetNum;

    // Find the starting index based on entry time
    let startIndex = 0;

    if (entryTimestamp > 0) {
      for (let i = 0; i < formattedChartData.length; i++) {
        const candleTime = formattedChartData[i].time;
        if (candleTime > entryTimestamp) {
          startIndex = i;
          break;
        } else if (candleTime === entryTimestamp) {
          startIndex = i + 1;
          break;
        }
      }

      if (startIndex >= formattedChartData.length) {
        setFirstHit(null);
        return;
      }
    }

    for (let i = startIndex; i < formattedChartData.length; i++) {
      const candle = formattedChartData[i];
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

    setFirstHit(hitResult);
  }, [formattedChartData, results, entryTimestamp, entryDateStr, selectedTime]);

  // Update formatted data when data changes
  useEffect(() => {
    formatData();
  }, [data, formatData]);

  // Update entry timestamp when selected time changes
  useEffect(() => {
    if (selectedTime && formattedChartData.length > 0) {
      const timestamp = parseEntryTime(selectedTime);
      setEntryTimestamp(timestamp);
    } else {
      setEntryTimestamp(0);
      setEntryDateStr("");
    }
  }, [selectedTime, formattedChartData, parseEntryTime]);

  // Check for hits when entry is set or results change
  useEffect(() => {
    if (results && isEntrySet && formattedChartData.length > 0) {
      setTimeout(() => {
        checkFirstHit();
      }, 200);
    }
  }, [results, isEntrySet, checkFirstHit, formattedChartData]);

  // Draw all lines function
  const drawAllLines = () => {
    if (!candleSeriesRef.current) return;

    // Remove old lines
    if (ltpLineRef.current)
      candleSeriesRef.current.removePriceLine(ltpLineRef.current);
    if (slLineRef.current)
      candleSeriesRef.current.removePriceLine(slLineRef.current);
    if (targetLineRef.current)
      candleSeriesRef.current.removePriceLine(targetLineRef.current);

    // Draw LTP line
    if (ltp && !isNaN(Number(ltp))) {
      const labelText = selectedTime ? `Entry @ ${selectedTime}` : "LTP";
      ltpLineRef.current = candleSeriesRef.current.createPriceLine({
        price: Number(ltp),
        color: "#00BFFF",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: labelText,
        axisLabelColor: "#00BFFF",
      });
    }

    // Draw SL line
    if (sl && !isNaN(Number(sl))) {
      const labelText = selectedTime ? `SL @ ${selectedTime}` : "SL";
      slLineRef.current = candleSeriesRef.current.createPriceLine({
        price: Number(sl),
        color: theme === "light" ? "#dc2626" : "#ef4444",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: labelText,
      });
    }

    // Draw Target line
    if (target && !isNaN(Number(target))) {
      const labelText = selectedTime ? `Target @ ${selectedTime}` : "Target";
      targetLineRef.current = candleSeriesRef.current.createPriceLine({
        price: Number(target),
        color: theme === "light" ? "#16a34a" : "#22c55e",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: labelText,
      });
    }

    // Mark entry as set and check for first hit
    if (ltp && sl && target) {
      setIsEntrySet(true);

      setTimeout(() => {
        if (formattedChartData.length > 0) {
          checkFirstHit();
        }
      }, 300);
    }
  };

  // Initialize or update chart
  useEffect(() => {
    if (!chartRef.current) return;

    const formattedData = formatData();

    if (formattedData.length === 0) {
      console.warn("No valid data to display");
      return;
    }

    // Create chart
    const chart = LightweightCharts.createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: {
        background: {
          topColor: "solid",
          color: theme === "light" ? "#ffffff" : "#1a1a1a",
        },
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
        tickMarkFormatter: (time: number, tickMarkType: any) => {
          const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
          const hours = date.getHours();
          const minutes = date.getMinutes();

          if ((hours === 0 && minutes === 0) || formattedData.length < 50) {
            return formatDateOnly(time);
          }
          return formatToIST(time);
        },
      },
      rightPriceScale: {
        borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      localization: {
        timeFormatter: (time: number) => {
          return formatDateWithTime(time);
        },
        dateFormat: "dd-MMM-yyyy",
      },
    });

    chartInstanceRef.current = chart;

    // Add series based on chart type
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
      });

      series.setData(
        formattedData.map((d) => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })),
      );
    } else if (chartType === "line" || chartType === "area") {
      const seriesOptions: any = {
        color: theme === "light" ? "#3b82f6" : "#60a5fa",
        lineWidth: 1,
        priceLineVisible: false,
      };

      if (chartType === "area") {
        seriesOptions.lineType = LightweightCharts.LineType.WithSteps;
        seriesOptions.topColor =
          theme === "light"
            ? "rgba(59, 130, 246, 0.4)"
            : "rgba(96, 165, 250, 0.4)";
        seriesOptions.bottomColor =
          theme === "light" ? "rgba(59, 130, 246, 0)" : "rgba(96, 165, 250, 0)";
        seriesOptions.lineWidth = 1;
      }

      series = chart.addLineSeries(seriesOptions);

      series.setData(
        formattedData.map((d) => ({
          time: d.time,
          value: d.close,
        })),
      );
    }

    candleSeriesRef.current = series;

    // Add volume series if enabled
    if (showVolume && formattedData[0]?.volume !== undefined) {
      volumeSeriesRef.current = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });

      volumeSeriesRef.current.setData(
        formattedData.map((d: any) => ({
          time: d.time,
          value: d.volume ?? 0,
          color: d.close >= d.open ? "#16a34a" : "#dc2626",
        })),
      );

      chart.priceScale("volume").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    } else if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    if (formattedData.length > 0) {
      const firstTime: any = formattedData[0].time;
      const lastTime: any = formattedData[formattedData.length - 1].time;

      chart.timeScale().setVisibleRange({
        from: firstTime,
        to: lastTime,
      });

      setTimeout(() => {
        chart.timeScale().fitContent();
      }, 100);
    }

    // Create permanent OHLC display overlay
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "10px";
    overlay.style.left = "10px";
    overlay.style.zIndex = "1000";
    overlay.style.pointerEvents = "none";
    overlay.style.backgroundColor =
      theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(26, 26, 26, 0.9)";
    overlay.style.border = `1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"}`;
    overlay.style.borderRadius = "4px";
    overlay.style.padding = "4px 8px";
    overlay.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";

    const chartContainer = chartRef.current;
    chartContainer.style.position = "relative";
    chartContainer.appendChild(overlay);

    // Get last candle data for default display
    const lastCandle = formattedData[formattedData.length - 1];
    if (lastCandle) {
      const lastTimeStr = formatDateWithTime(lastCandle.time);
      const timePart =
        lastTimeStr.split(" ")[1] + " " + lastTimeStr.split(" ")[2];

      overlay.innerHTML = `
        <div style="font-family: monospace; font-size: 11px; color: ${theme === "light" ? "#333" : "#d1d5db"}">
          <span style="font-weight: bold; color: ${theme === "light" ? "#000" : "#fff"}">${optionLabel}</span>
          <span style="margin: 0 4px; color: ${theme === "light" ? "#666" : "#9ca3af"}">|</span>
          <span style="color: ${theme === "light" ? "#666" : "#9ca3af"}">${timePart}</span>
          <span style="margin: 0 4px; color: ${theme === "light" ? "#666" : "#9ca3af"}">|</span>
          <span>O:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.open.toFixed(2)}</span></span>
          <span style="margin-left: 8px">H:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.high.toFixed(2)}</span></span>
          <span style="margin-left: 8px">L:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.low.toFixed(2)}</span></span>
          <span style="margin-left: 8px">C:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.close.toFixed(2)}</span></span>
        </div>
      `;
    }

    // Update OHLC display on hover
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || param.seriesData.size === 0) {
        // Show last candle data when not hovering
        if (lastCandle) {
          const lastTimeStr = formatDateWithTime(lastCandle.time);
          const timePart =
            lastTimeStr.split(" ")[1] + " " + lastTimeStr.split(" ")[2];

          overlay.innerHTML = `
            <div style="font-family: monospace; font-size: 11px; color: ${theme === "light" ? "#333" : "#d1d5db"}">
              <span style="font-weight: bold; color: ${theme === "light" ? "#000" : "#fff"}">${optionLabel}</span>
              <span style="margin: 0 4px; color: ${theme === "light" ? "#666" : "#9ca3af"}">|</span>
              <span style="color: ${theme === "light" ? "#666" : "#9ca3af"}">${timePart}</span>
              <span style="margin: 0 4px; color: ${theme === "light" ? "#666" : "#9ca3af"}">|</span>
              <span>O:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.open.toFixed(2)}</span></span>
              <span style="margin-left: 8px">H:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.high.toFixed(2)}</span></span>
              <span style="margin-left: 8px">L:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.low.toFixed(2)}</span></span>
              <span style="margin-left: 8px">C:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${lastCandle.close.toFixed(2)}</span></span>
            </div>
          `;
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

      const timeStr = formatDateWithTime(param.time);
      const timePart = timeStr.split(" ")[1] + " " + timeStr.split(" ")[2];

      // Update overlay with hover data
      overlay.innerHTML = `
        <div style="font-family: monospace; font-size: 11px; color: ${theme === "light" ? "#333" : "#d1d5db"}">
          <span style="font-weight: bold; color: ${theme === "light" ? "#000" : "#fff"}">${optionLabel}</span>
          <span style="margin: 0 4px; color: ${theme === "light" ? "#666" : "#9ca3af"}">|</span>
          <span style="color: ${theme === "light" ? "#666" : "#9ca3af"}">${timePart}</span>
          <span style="margin: 0 4px; color: ${theme === "light" ? "#666" : "#9ca3af"}">|</span>
          <span>O:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${open.toFixed(2)}</span></span>
          <span style="margin-left: 8px">H:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${high.toFixed(2)}</span></span>
          <span style="margin-left: 8px">L:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${low.toFixed(2)}</span></span>
          <span style="margin-left: 8px">C:<span style="color: ${theme === "light" ? "#333" : "#fff"}">${close.toFixed(2)}</span></span>
        </div>
      `;
    });

    // Draw existing lines if they exist
    if (ltp || sl || target) {
      setTimeout(() => {
        drawAllLines();
      }, 500);
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
        setTimeout(() => {
          chart.timeScale().fitContent();
        }, 50);
      }
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      chart.remove();
    };
  }, [data, theme, chartType, showVolume, optionLabel]);

  // Handle Apply Lines button click
  const handleDrawLines = () => {
    drawAllLines();
  };

  // Clear all lines
  const handleClearLines = () => {
    setLtp("");
    setSl("");
    setTarget("");
    setSelectedTime("09:21");
    setQuantity("65");
    setIsEntrySet(false);
    setFirstHit(null);
    setEntryTimestamp(0);
    setEntryDateStr("");

    if (!candleSeriesRef.current) return;

    if (ltpLineRef.current) {
      candleSeriesRef.current.removePriceLine(ltpLineRef.current);
      ltpLineRef.current = null;
    }
    if (slLineRef.current) {
      candleSeriesRef.current.removePriceLine(slLineRef.current);
      slLineRef.current = null;
    }
    if (targetLineRef.current) {
      candleSeriesRef.current.removePriceLine(targetLineRef.current);
      targetLineRef.current = null;
    }
  };

  // Handle chart type change
  const handleChartTypeChange = (type: "candlestick" | "line" | "area") => {
    setChartType(type);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDrawLines();
    }
  };

  // Handle option label edit
  const handleLabelSave = () => {
    setIsEditingLabel(false);
  };

  // Calculate trade duration
  const tradeDuration =
    firstHit && selectedTime
      ? calculateDuration(selectedTime, firstHit.time.split(" ")[1])
      : "";

  return (
    <div className="relative w-full">
      {/* Controls */}
      <div className="flex flex-wrap justify-between items-start p-3 bg-white dark:bg-gray-900 shadow z-20">
        {/* Left side: Inputs */}
        <div className="flex flex-col gap-3">
          {/* Option Chain Label Input */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Instrument:
            </span>
            {isEditingLabel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={optionLabel}
                  onChange={(e) => setOptionLabel(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLabelSave()}
                  className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-48"
                  autoFocus
                />
                <button
                  onClick={handleLabelSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded border border-blue-200 dark:border-blue-700">
                  {optionLabel}
                </span>
                <button
                  onClick={() => setIsEditingLabel(true)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 text-sm"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Inputs row */}
          <div className="flex gap-3 items-center">
            {/* Time Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Entry Time
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-32 focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* LTP Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Entry Price (LTP)
              </label>
              <input
                type="number"
                placeholder="Entry Price"
                value={ltp}
                onChange={(e) => setLtp(e.target.value)}
                onKeyPress={handleKeyPress}
                step="0.01"
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* SL Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Stop Loss (SL)
              </label>
              <input
                type="number"
                placeholder="SL Price"
                value={sl}
                onChange={(e) => setSl(e.target.value)}
                onKeyPress={handleKeyPress}
                step="0.01"
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-red-300"
              />
            </div>

            {/* Target Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Target
              </label>
              <input
                type="number"
                placeholder="Target Price"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyPress={handleKeyPress}
                step="0.01"
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-green-300"
              />
            </div>

            {/* Quantity Input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Quantity
              </label>
              <input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 invisible">
                Actions
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleDrawLines}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium"
                >
                  Analyze Trade
                </button>
                <button
                  onClick={handleClearLines}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Chart controls */}
        <div className="flex items-center gap-3">
          {/* Chart Type Selector */}
          <div className="relative">
            <select
              value={chartType}
              onChange={(e) => handleChartTypeChange(e.target.value as any)}
              className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded appearance-none cursor-pointer pr-8"
            >
              <option value="candlestick">Candlestick</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              ▼
            </div>
          </div>
        </div>

        {/* Trade Analysis Cards - Single Row */}
        <div className="w-full mt-5">
          {results && (
            <div className="grid grid-cols-5 gap-4">
              {/* Loss Card (If SL hits) */}
              <div
                className={`bg-red-50 dark:bg-red-900/20 border ${
                  firstHit?.level === "SL"
                    ? "border-red-400 dark:border-red-500 border-2"
                    : "border-red-200 dark:border-red-800"
                } rounded-lg p-3 flex items-center justify-between`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <h3 className="font-bold text-red-700 dark:text-red-300 text-sm">
                      If SL Hits
                    </h3>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      -₹
                      {Math.abs(results.totalLoss).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Per unit: ₹{results.lossPerUnit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {results.lossPercentage}% loss
                    </div>
                  </div>
                </div>
                {firstHit?.level === "SL" && (
                  <IconCoinRupeeFilled className="size-20 text-red-800" />
                )}
              </div>

              {/* Margin Card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                    Margin Required
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹
                    {results.totalMargin.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Entry: ₹{results.ltp.toFixed(2)} × Qty:{" "}
                    {results.quantity.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              {/* Profit Card (If Target hits) */}
              <div
                className={`bg-green-50 dark:bg-green-900/20 border ${
                  firstHit?.level === "Target"
                    ? "border-green-400 dark:border-green-500 border-2"
                    : "border-green-200 dark:border-green-800"
                } rounded-lg p-3 flex items-center justify-between`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="font-bold text-green-700 dark:text-green-300 text-sm">
                      If Target Hits
                    </h3>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +₹
                      {results.totalProfit.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      Per unit: ₹{results.profitPerUnit.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {results.profitPercentage}% profit
                    </div>
                  </div>
                </div>

                {firstHit?.level === "Target" && (
                  <IconCoinRupeeFilled className="size-20 text-green-800" />
                )}
              </div>

              {/* First Hit Card - Integrated with Duration */}
              <div
                className={`rounded-lg p-3 border flex justify-between items-center ${
                  firstHit?.level === "SL"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : firstHit?.level === "Target"
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        firstHit?.level === "SL"
                          ? "bg-red-500"
                          : firstHit?.level === "Target"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                      }`}
                    ></div>
                    <h3
                      className={`font-bold text-sm ${
                        firstHit?.level === "SL"
                          ? "text-red-700 dark:text-red-300"
                          : firstHit?.level === "Target"
                            ? "text-green-700 dark:text-green-300"
                            : "text-yellow-700 dark:text-yellow-300"
                      }`}
                    >
                      {firstHit ? `Hit: ${firstHit.level}` : "No Hit"}
                    </h3>
                  </div>

                  {firstHit ? (
                    <div className="space-y-1">
                      <div className="text-lg font-bold">
                        {firstHit.time.split(" ")[1]}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {tradeDuration && `Duration: ${tradeDuration}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Price: ₹{firstHit.price.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-lg font-bold">Not Triggered</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {selectedTime
                          ? `No hit after ${selectedTime}`
                          : "No hit in data"}
                      </div>
                    </div>
                  )}
                </div>

                {firstHit?.level === "SL" ? (
                  <IconTargetOff className="size-20 text-red-800" />
                ) : firstHit?.level === "Target" ? (
                  <IconTargetArrow className="size-20 text-green-800" />
                ) : (
                  <></>
                )}
              </div>

              {/* Position Info Card */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <h3 className="font-bold text-purple-700 dark:text-purple-300 text-sm">
                    Position Details
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {results.ltp < results.target ? "LONG" : "SHORT"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Entry: {selectedTime || "Not set"}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    Entry Price: ₹{results.ltp.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartRef}
        className="w-full h-[350px] md:h-[calc(100vh-200px)]"
      />

      {/* Legend for Lines */}
      <div className="flex justify-center gap-6 mt-2 p-2 bg-gray-50 dark:bg-gray-900 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-[#00BFFF]"></div>
          <span className="dark:text-white">Entry Price (Blue)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="dark:text-white">SL (Red)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="dark:text-white">Target (Green)</span>
        </div>
        {firstHit && (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border-2 animate-pulse"
              style={{
                borderColor: firstHit.level === "SL" ? "#ef4444" : "#22c55e",
              }}
            ></div>
            <span className="dark:text-white font-semibold">
              Hit: {firstHit.level} at {firstHit.time.split(" ")[1]} (
              {tradeDuration})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinuteChart;
