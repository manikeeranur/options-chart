// CePeFileUploaderDualChart.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as LightweightCharts from "lightweight-charts";
import {
  IconCoinRupeeFilled,
  IconTargetArrow,
  IconTargetOff,
  IconArrowNarrowRight,
  IconLink,
  IconLinkOff,
  IconUpload,
  IconFile,
  IconX,
  IconCheck,
} from "@tabler/icons-react";

const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

// ==================== HELPER FUNCTIONS ====================
const parseDateString = (dateStr: string): number => {
  try {
    const cleanStr = dateStr.trim();

    let date: Date;

    const match1 = cleanStr.match(
      /(\d{1,2})[-/](\d{1,2})[-/](\d{4})\s+(\d{1,2}):(\d{1,2})/
    );
    if (match1) {
      const [, day, month, year, hour, minute] = match1;
      date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        0
      );
    } else if (cleanStr.match(/\d{4}-\d{1,2}-\d{1,2}\s+\d{1,2}:\d{1,2}/)) {
      date = new Date(cleanStr.replace(" ", "T") + ":00");
    } else {
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

const formatToIST = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

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

const formatLargeNumber = (value: number): string => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(2) + "B";
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + "M";
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  } else {
    return value.toString();
  }
};

const calculateDuration = (entryTime: string, exitTime: string): string => {
  if (!entryTime || !exitTime) return "";

  try {
    const [entryHour, entryMinute] = entryTime.split(":").map(Number);
    const [exitHour, exitMinute] = exitTime.split(":").map(Number);

    let totalMinutes =
      exitHour * 60 + exitMinute - (entryHour * 60 + entryMinute);

    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
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

const aggregateDataByTimeframe = (
  data: CandleData[],
  timeframe: string
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
        const groupOpen = currentGroup[0].open;
        const groupHigh = Math.max(...currentGroup.map((c) => c.high));
        const groupLow = Math.min(...currentGroup.map((c) => c.low));
        const groupClose = currentGroup[currentGroup.length - 1].close;
        const groupVolume = currentGroup.reduce(
          (sum, c) => sum + (c.volume || 0),
          0
        );
        const groupOI = currentGroup.reduce((sum, c) => sum + (c.oi || 0), 0);

        aggregatedData.push({
          time: currentGroupEndTime,
          open: groupOpen,
          high: groupHigh,
          low: groupLow,
          close: groupClose,
          volume: groupVolume,
          oi: groupOI,
        });
      }

      currentGroup = [candle];
      currentGroupEndTime = bucketTimestamp;
    } else {
      currentGroup.push(candle);
    }
  }

  if (currentGroup.length > 0) {
    const groupOpen = currentGroup[0].open;
    const groupHigh = Math.max(...currentGroup.map((c) => c.high));
    const groupLow = Math.min(...currentGroup.map((c) => c.low));
    const groupClose = currentGroup[currentGroup.length - 1].close;
    const groupVolume = currentGroup.reduce(
      (sum, c) => sum + (c.volume || 0),
      0
    );
    const groupOI = currentGroup.reduce((sum, c) => sum + (c.oi || 0), 0);

    aggregatedData.push({
      time: currentGroupEndTime,
      open: groupOpen,
      high: groupHigh,
      low: groupLow,
      close: groupClose,
      volume: groupVolume,
      oi: groupOI,
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

interface FileData {
  name: string;
  data: any[];
  formattedData: CandleData[];
  aggregatedData: CandleData[];
}

const timeframeOptions = [
  { label: "1 Minute", value: "1min" },
  { label: "3 Minutes", value: "3min" },
  { label: "5 Minutes", value: "5min" },
  { label: "10 Minutes", value: "10min" },
  { label: "15 Minutes", value: "15min" },
  { label: "30 Minutes", value: "30min" },
  { label: "1 Hour", value: "1hour" },
];

// ==================== MAIN COMPONENT ====================
const CePeDualChart: React.FC = () => {
  // Refs for charts
  const ceChartRef = useRef<HTMLDivElement>(null);
  const peChartRef = useRef<HTMLDivElement>(null);
  const ceChartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
  const peChartInstanceRef = useRef<LightweightCharts.IChartApi | null>(null);
  const ceSeriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const peSeriesRef = useRef<LightweightCharts.ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const ceLtpLineRef = useRef<any>(null);
  const peLtpLineRef = useRef<any>(null);
  const ceSlLineRef = useRef<any>(null);
  const peSlLineRef = useRef<any>(null);
  const ceTargetLineRef = useRef<any>(null);
  const peTargetLineRef = useRef<any>(null);

  // File upload states
  const [ceFile, setCeFile] = useState<File | null>(null);
  const [peFile, setPeFile] = useState<File | null>(null);
  const [ceFileData, setCeFileData] = useState<FileData | null>(null);
  const [peFileData, setPeFileData] = useState<FileData | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Link state
  const [isLinked, setIsLinked] = useState(true);

  // Global linked inputs
  const [globalLtp, setGlobalLtp] = useState("");
  const [globalSl, setGlobalSl] = useState("");
  const [globalTarget, setGlobalTarget] = useState("");
  const [globalQuantity, setGlobalQuantity] = useState("65");
  const [globalTime, setGlobalTime] = useState("09:21");

  // CE states
  const [ceTimeframe, setCeTimeframe] = useState("1min");
  const [ceChartType, setCeChartType] = useState<"candlestick" | "line">("candlestick");
  const [ceLtp, setCeLtp] = useState("");
  const [ceSl, setCeSl] = useState("");
  const [ceTarget, setCeTarget] = useState("");
  const [ceQuantity, setCeQuantity] = useState("65");
  const [ceTime, setCeTime] = useState("09:21");
  const [ceIsEntrySet, setCeIsEntrySet] = useState(false);
  const [ceFirstHit, setCeFirstHit] = useState<HitResult | null>(null);
  const [ceEntryTimestamp, setCeEntryTimestamp] = useState(0);

  // PE states
  const [peTimeframe, setPeTimeframe] = useState("1min");
  const [peChartType, setPeChartType] = useState<"candlestick" | "line">("candlestick");
  const [peLtp, setPeLtp] = useState("");
  const [peSl, setPeSl] = useState("");
  const [peTarget, setPeTarget] = useState("");
  const [peQuantity, setPeQuantity] = useState("65");
  const [peTime, setPeTime] = useState("09:21");
  const [peIsEntrySet, setPeIsEntrySet] = useState(false);
  const [peFirstHit, setPeFirstHit] = useState<HitResult | null>(null);
  const [peEntryTimestamp, setPeEntryTimestamp] = useState(0);

  // CSV Parser
  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n");
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }
    
    return data;
  };

  // Format raw data to candle data
  const formatRawData = useCallback((data: any[]): CandleData[] => {
    if (!data?.length) return [];

    const formattedData: CandleData[] = [];
    let prevTime = 0;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];

      try {
        const dateStr = d.Date || d.date || d.DATE || d.Timestamp || d.timestamp || d.datetime || d.Datetime || "";
        if (!dateStr) continue;
        
        const time = parseDateString(dateStr);
        if (time === 0) continue;

        const currentTime = time <= prevTime ? prevTime + 60 : time;
        prevTime = currentTime;

        const open = parseFloat(d.Open || d.open || d.O || 0);
        const high = parseFloat(d.High || d.high || d.H || 0);
        const low = parseFloat(d.Low || d.low || d.L || 0);
        const close = parseFloat(d.Close || d.close || d.C || 0);
        const volume = d.Volume ? parseFloat(d.Volume) : d.volume ? parseFloat(d.volume) : undefined;
        const oi = d.OI ? parseFloat(d.OI) : d.oi ? parseFloat(d.oi) : d["Open Interest"] ? parseFloat(d["Open Interest"]) : undefined;

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
          oi,
        });
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }
    }

    return formattedData;
  }, []);

  // Handle CE file upload
  const handleCEUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCeFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let jsonData;
        
        if (file.name.endsWith('.csv')) {
          jsonData = parseCSV(text);
        } else {
          jsonData = JSON.parse(text);
        }
        
        const formattedData = formatRawData(jsonData);
        const aggregatedData = aggregateDataByTimeframe(formattedData, ceTimeframe);
        
        setCeFileData({
          name: file.name,
          data: jsonData,
          formattedData,
          aggregatedData,
        });
        
        setUploadError(null);
      } catch (error) {
        setUploadError(`Error parsing CE file: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  // Handle PE file upload
  const handlePEUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPeFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let jsonData;
        
        if (file.name.endsWith('.csv')) {
          jsonData = parseCSV(text);
        } else {
          jsonData = JSON.parse(text);
        }
        
        const formattedData = formatRawData(jsonData);
        const aggregatedData = aggregateDataByTimeframe(formattedData, peTimeframe);
        
        setPeFileData({
          name: file.name,
          data: jsonData,
          formattedData,
          aggregatedData,
        });
        
        setUploadError(null);
      } catch (error) {
        setUploadError(`Error parsing PE file: ${error}`);
      }
    };
    reader.readAsText(file);
  };

  // Remove CE file
  const removeCEFile = () => {
    setCeFile(null);
    setCeFileData(null);
    if (ceChartInstanceRef.current) {
      ceChartInstanceRef.current.remove();
      ceChartInstanceRef.current = null;
    }
    setCeLtp("");
    setCeSl("");
    setCeTarget("");
    setCeQuantity("65");
    setCeIsEntrySet(false);
    setCeFirstHit(null);
    setCeEntryTimestamp(0);
  };

  // Remove PE file
  const removePEFile = () => {
    setPeFile(null);
    setPeFileData(null);
    if (peChartInstanceRef.current) {
      peChartInstanceRef.current.remove();
      peChartInstanceRef.current = null;
    }
    setPeLtp("");
    setPeSl("");
    setPeTarget("");
    setPeQuantity("65");
    setPeIsEntrySet(false);
    setPeFirstHit(null);
    setPeEntryTimestamp(0);
  };

  // Update linked inputs
  useEffect(() => {
    if (isLinked) {
      setCeLtp(globalLtp);
      setCeSl(globalSl);
      setCeTarget(globalTarget);
      setCeQuantity(globalQuantity);
      setCeTime(globalTime);
      
      setPeLtp(globalLtp);
      setPeSl(globalSl);
      setPeTarget(globalTarget);
      setPeQuantity(globalQuantity);
      setPeTime(globalTime);
    }
  }, [globalLtp, globalSl, globalTarget, globalQuantity, globalTime, isLinked]);

  // Update CE aggregated data when timeframe changes
  useEffect(() => {
    if (ceFileData?.formattedData) {
      const aggregated = aggregateDataByTimeframe(ceFileData.formattedData, ceTimeframe);
      setCeFileData(prev => prev ? {
        ...prev,
        aggregatedData: aggregated,
      } : null);
    }
  }, [ceTimeframe, ceFileData?.formattedData]);

  // Update PE aggregated data when timeframe changes
  useEffect(() => {
    if (peFileData?.formattedData) {
      const aggregated = aggregateDataByTimeframe(peFileData.formattedData, peTimeframe);
      setPeFileData(prev => prev ? {
        ...prev,
        aggregatedData: aggregated,
      } : null);
    }
  }, [peTimeframe, peFileData?.formattedData]);

  // Parse entry time for CE
  const parseCEntryTime = useCallback((timeStr: string) => {
    if (!timeStr || !ceFileData?.aggregatedData.length) return 0;

    try {
      const firstCandleTime = ceFileData.aggregatedData[0].time;
      const firstCandleDate = new Date((firstCandleTime + IST_OFFSET_SECONDS) * 1000);
      const year = firstCandleDate.getFullYear();
      const month = firstCandleDate.getMonth();
      const day = firstCandleDate.getDate();
      const [hours, minutes] = timeStr.split(":").map(Number);
      const entryDate = new Date(year, month, day, hours, minutes, 0);
      return Math.floor(entryDate.getTime() / 1000) - IST_OFFSET_SECONDS;
    } catch (error) {
      console.error("Error parsing entry time:", error);
      return 0;
    }
  }, [ceFileData]);

  // Parse entry time for PE
  const parsePEntryTime = useCallback((timeStr: string) => {
    if (!timeStr || !peFileData?.aggregatedData.length) return 0;

    try {
      const firstCandleTime = peFileData.aggregatedData[0].time;
      const firstCandleDate = new Date((firstCandleTime + IST_OFFSET_SECONDS) * 1000);
      const year = firstCandleDate.getFullYear();
      const month = firstCandleDate.getMonth();
      const day = firstCandleDate.getDate();
      const [hours, minutes] = timeStr.split(":").map(Number);
      const entryDate = new Date(year, month, day, hours, minutes, 0);
      return Math.floor(entryDate.getTime() / 1000) - IST_OFFSET_SECONDS;
    } catch (error) {
      console.error("Error parsing entry time:", error);
      return 0;
    }
  }, [peFileData]);

  // Update CE entry timestamp
  useEffect(() => {
    if (ceTime && ceFileData?.aggregatedData.length) {
      setCeEntryTimestamp(parseCEntryTime(ceTime));
    }
  }, [ceTime, ceFileData, parseCEntryTime]);

  // Update PE entry timestamp
  useEffect(() => {
    if (peTime && peFileData?.aggregatedData.length) {
      setPeEntryTimestamp(parsePEntryTime(peTime));
    }
  }, [peTime, peFileData, parsePEntryTime]);

  // Calculate CE results
  const calculateCEResults = useCallback(() => {
    if (!ceLtp || !ceSl || !ceTarget || !ceQuantity) return null;

    const ltpNum = parseFloat(ceLtp);
    const slNum = parseFloat(ceSl);
    const targetNum = parseFloat(ceTarget);
    const quantityNum = parseFloat(ceQuantity);

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
  }, [ceLtp, ceSl, ceTarget, ceQuantity]);

  // Calculate PE results
  const calculatePEResults = useCallback(() => {
    if (!peLtp || !peSl || !peTarget || !peQuantity) return null;

    const ltpNum = parseFloat(peLtp);
    const slNum = parseFloat(peSl);
    const targetNum = parseFloat(peTarget);
    const quantityNum = parseFloat(peQuantity);

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
  }, [peLtp, peSl, peTarget, peQuantity]);

  const ceResults = calculateCEResults();
  const peResults = calculatePEResults();

  // Check CE first hit
  const checkCEFirstHit = useCallback(() => {
    if (!ceFileData?.aggregatedData.length || !ceResults) {
      setCeFirstHit(null);
      return;
    }

    let hitResult: HitResult | null = null;
    const ltpNum = ceResults.ltp;
    const slNum = ceResults.sl;
    const targetNum = ceResults.target;
    const isLong = ltpNum < targetNum;
    let startIndex = 0;

    if (ceEntryTimestamp > 0) {
      for (let i = 0; i < ceFileData.aggregatedData.length; i++) {
        const candleTime = ceFileData.aggregatedData[i].time;
        if (candleTime > ceEntryTimestamp) {
          startIndex = i;
          break;
        } else if (candleTime === ceEntryTimestamp) {
          startIndex = i + 1;
          break;
        }
      }

      if (startIndex >= ceFileData.aggregatedData.length) {
        setCeFirstHit(null);
        return;
      }
    }

    for (let i = startIndex; i < ceFileData.aggregatedData.length; i++) {
      const candle = ceFileData.aggregatedData[i];
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

    setCeFirstHit(hitResult);
  }, [ceFileData, ceResults, ceEntryTimestamp]);

  // Check PE first hit
  const checkPEFirstHit = useCallback(() => {
    if (!peFileData?.aggregatedData.length || !peResults) {
      setPeFirstHit(null);
      return;
    }

    let hitResult: HitResult | null = null;
    const ltpNum = peResults.ltp;
    const slNum = peResults.sl;
    const targetNum = peResults.target;
    const isLong = ltpNum < targetNum;
    let startIndex = 0;

    if (peEntryTimestamp > 0) {
      for (let i = 0; i < peFileData.aggregatedData.length; i++) {
        const candleTime = peFileData.aggregatedData[i].time;
        if (candleTime > peEntryTimestamp) {
          startIndex = i;
          break;
        } else if (candleTime === peEntryTimestamp) {
          startIndex = i + 1;
          break;
        }
      }

      if (startIndex >= peFileData.aggregatedData.length) {
        setPeFirstHit(null);
        return;
      }
    }

    for (let i = startIndex; i < peFileData.aggregatedData.length; i++) {
      const candle = peFileData.aggregatedData[i];
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

    setPeFirstHit(hitResult);
  }, [peFileData, peResults, peEntryTimestamp]);

  // Check CE hits when entry is set
  useEffect(() => {
    if (ceResults && ceIsEntrySet && ceFileData?.aggregatedData.length) {
      setTimeout(() => {
        checkCEFirstHit();
      }, 200);
    }
  }, [ceResults, ceIsEntrySet, checkCEFirstHit, ceFileData]);

  // Check PE hits when entry is set
  useEffect(() => {
    if (peResults && peIsEntrySet && peFileData?.aggregatedData.length) {
      setTimeout(() => {
        checkPEFirstHit();
      }, 200);
    }
  }, [peResults, peIsEntrySet, checkPEFirstHit, peFileData]);

  // Draw CE lines
  const drawCELines = useCallback(() => {
    if (!ceSeriesRef.current) return;

    if (ceLtpLineRef.current) ceSeriesRef.current.removePriceLine(ceLtpLineRef.current);
    if (ceSlLineRef.current) ceSeriesRef.current.removePriceLine(ceSlLineRef.current);
    if (ceTargetLineRef.current) ceSeriesRef.current.removePriceLine(ceTargetLineRef.current);

    if (ceLtp && !isNaN(Number(ceLtp))) {
      ceLtpLineRef.current = ceSeriesRef.current.createPriceLine({
        price: Number(ceLtp),
        color: "#2563eb",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `Entry @ ${ceTime}`,
        axisLabelColor: "#2563eb",
      });
    }

    if (ceSl && !isNaN(Number(ceSl))) {
      ceSlLineRef.current = ceSeriesRef.current.createPriceLine({
        price: Number(ceSl),
        color: theme === "light" ? "#dc2626" : "#ef4444",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `SL @ ${ceTime}`,
      });
    }

    if (ceTarget && !isNaN(Number(ceTarget))) {
      ceTargetLineRef.current = ceSeriesRef.current.createPriceLine({
        price: Number(ceTarget),
        color: theme === "light" ? "#16a34a" : "#22c55e",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `Target @ ${ceTime}`,
      });
    }

    if (ceLtp && ceSl && ceTarget) {
      setCeIsEntrySet(true);
      setTimeout(() => {
        if (ceFileData?.aggregatedData.length) {
          checkCEFirstHit();
        }
      }, 300);
    }
  }, [ceLtp, ceSl, ceTarget, ceTime, theme, ceFileData, checkCEFirstHit]);

  // Draw PE lines
  const drawPELines = useCallback(() => {
    if (!peSeriesRef.current) return;

    if (peLtpLineRef.current) peSeriesRef.current.removePriceLine(peLtpLineRef.current);
    if (peSlLineRef.current) peSeriesRef.current.removePriceLine(peSlLineRef.current);
    if (peTargetLineRef.current) peSeriesRef.current.removePriceLine(peTargetLineRef.current);

    if (peLtp && !isNaN(Number(peLtp))) {
      peLtpLineRef.current = peSeriesRef.current.createPriceLine({
        price: Number(peLtp),
        color: "#dc2626",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `Entry @ ${peTime}`,
        axisLabelColor: "#dc2626",
      });
    }

    if (peSl && !isNaN(Number(peSl))) {
      peSlLineRef.current = peSeriesRef.current.createPriceLine({
        price: Number(peSl),
        color: theme === "light" ? "#dc2626" : "#ef4444",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `SL @ ${peTime}`,
      });
    }

    if (peTarget && !isNaN(Number(peTarget))) {
      peTargetLineRef.current = peSeriesRef.current.createPriceLine({
        price: Number(peTarget),
        color: theme === "light" ? "#16a34a" : "#22c55e",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: `Target @ ${peTime}`,
      });
    }

    if (peLtp && peSl && peTarget) {
      setPeIsEntrySet(true);
      setTimeout(() => {
        if (peFileData?.aggregatedData.length) {
          checkPEFirstHit();
        }
      }, 300);
    }
  }, [peLtp, peSl, peTarget, peTime, theme, peFileData, checkPEFirstHit]);

  // Clear CE lines
  const clearCELines = () => {
    if (!isLinked) {
      setCeLtp("");
      setCeSl("");
      setCeTarget("");
      setCeQuantity("65");
      setCeIsEntrySet(false);
      setCeFirstHit(null);
      setCeEntryTimestamp(0);
    }

    if (!ceSeriesRef.current) return;

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
  };

  // Clear PE lines
  const clearPELines = () => {
    if (!isLinked) {
      setPeLtp("");
      setPeSl("");
      setPeTarget("");
      setPeQuantity("65");
      setPeIsEntrySet(false);
      setPeFirstHit(null);
      setPeEntryTimestamp(0);
    }

    if (!peSeriesRef.current) return;

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
  };

  // Clear global inputs
  const clearGlobalInputs = () => {
    setGlobalLtp("");
    setGlobalSl("");
    setGlobalTarget("");
    setGlobalQuantity("65");
    setGlobalTime("09:21");
  };

  // Initialize CE Chart
  useEffect(() => {
    if (!ceChartRef.current || !ceFileData?.aggregatedData.length) return;

    // Clean up existing chart
    if (ceChartInstanceRef.current) {
      ceChartInstanceRef.current.remove();
      ceChartInstanceRef.current = null;
    }

    const chart = LightweightCharts.createChart(ceChartRef.current, {
      width: ceChartRef.current.clientWidth,
      height: ceChartRef.current.clientHeight,
      layout: {
        background: { color: theme === "light" ? "#ffffff" : "#1a1a1a" },
        textColor: theme === "light" ? "#333333" : "#d1d5db",
      },
      grid: {
        vertLines: { color: theme === "light" ? "#e5e7eb" : "#374151" },
        horzLines: { color: theme === "light" ? "#e5e7eb" : "#374151" },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: theme === "light" ? "#9CA3AF" : "#6B7280",
          style: LightweightCharts.LineStyle.LargeDashed,
          labelBackgroundColor: theme === "light" ? "#000000" : "#374151",
        },
        horzLine: {
          width: 1,
          color: theme === "light" ? "#9CA3AF" : "#6B7280",
          style: LightweightCharts.LineStyle.LargeDashed,
          labelBackgroundColor: theme === "light" ? "#000000" : "#374151",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        visible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          if ((hours === 0 && minutes === 0) || ceFileData.aggregatedData.length < 50) {
            return formatDateOnly(time);
          }
          return formatToIST(time);
        },
      },
      rightPriceScale: {
        borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
        scaleMargins: { top: 0.1, bottom: 0.1 },
        borderVisible: true,
        visible: true,
        alignLabels: true,
      },
      leftPriceScale: { visible: false },
    });

    ceChartInstanceRef.current = chart;

    let series: LightweightCharts.ISeriesApi<"Candlestick" | "Line">;
    
    if (ceChartType === "candlestick") {
      series = chart.addCandlestickSeries({
        upColor: "#2563eb",
        downColor: "#2563eb",
        borderUpColor: "#2563eb",
        borderDownColor: "#2563eb",
        wickUpColor: "#2563eb",
        wickDownColor: "#2563eb",
        priceLineVisible: false,
        priceScaleId: "right",
      });

      series.setData(
        ceFileData.aggregatedData.map((d) => ({
          time: d.time as LightweightCharts.Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
    } else {
      series = chart.addLineSeries({
        color: "#2563eb",
        lineWidth: 1,
        priceLineVisible: false,
        priceScaleId: "right",
      });

      series.setData(
        ceFileData.aggregatedData.map((d) => ({
          time: d.time as LightweightCharts.Time,
          value: d.close,
        }))
      );
    }

    ceSeriesRef.current = series;

    if (ceFileData.aggregatedData.length > 0) {
      const firstTime = ceFileData.aggregatedData[0].time as LightweightCharts.Time;
      const lastTime = ceFileData.aggregatedData[ceFileData.aggregatedData.length - 1].time as LightweightCharts.Time;
      
      chart.timeScale().setVisibleRange({
        from: firstTime,
        to: lastTime,
      });
      
      setTimeout(() => {
        if (chart) {
          chart.timeScale().fitContent();
        }
      }, 100);
    }

    // Draw existing lines
    if (ceLtp || ceSl || ceTarget) {
      setTimeout(() => drawCELines(), 500);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (ceChartRef.current && chart) {
        chart.applyOptions({
          width: ceChartRef.current.clientWidth,
          height: ceChartRef.current.clientHeight,
        });
        setTimeout(() => {
          if (chart) {
            chart.timeScale().fitContent();
          }
        }, 50);
      }
    });

    resizeObserver.observe(ceChartRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chart) {
        chart.remove();
      }
    };
  }, [theme, ceChartType, ceFileData, ceLtp, ceSl, ceTarget, drawCELines]);

  // Initialize PE Chart
  useEffect(() => {
    if (!peChartRef.current || !peFileData?.aggregatedData.length) return;

    // Clean up existing chart
    if (peChartInstanceRef.current) {
      peChartInstanceRef.current.remove();
      peChartInstanceRef.current = null;
    }

    const chart = LightweightCharts.createChart(peChartRef.current, {
      width: peChartRef.current.clientWidth,
      height: peChartRef.current.clientHeight,
      layout: {
        background: { color: theme === "light" ? "#ffffff" : "#1a1a1a" },
        textColor: theme === "light" ? "#333333" : "#d1d5db",
      },
      grid: {
        vertLines: { color: theme === "light" ? "#e5e7eb" : "#374151" },
        horzLines: { color: theme === "light" ? "#e5e7eb" : "#374151" },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: theme === "light" ? "#9CA3AF" : "#6B7280",
          style: LightweightCharts.LineStyle.LargeDashed,
          labelBackgroundColor: theme === "light" ? "#000000" : "#374151",
        },
        horzLine: {
          width: 1,
          color: theme === "light" ? "#9CA3AF" : "#6B7280",
          style: LightweightCharts.LineStyle.LargeDashed,
          labelBackgroundColor: theme === "light" ? "#000000" : "#374151",
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        visible: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
          const hours = date.getHours();
          const minutes = date.getMinutes();
          if ((hours === 0 && minutes === 0) || peFileData.aggregatedData.length < 50) {
            return formatDateOnly(time);
          }
          return formatToIST(time);
        },
      },
      rightPriceScale: {
        borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
        scaleMargins: { top: 0.1, bottom: 0.1 },
        borderVisible: true,
        visible: true,
        alignLabels: true,
      },
      leftPriceScale: { visible: false },
    });

    peChartInstanceRef.current = chart;

    let series: LightweightCharts.ISeriesApi<"Candlestick" | "Line">;
    
    if (peChartType === "candlestick") {
      series = chart.addCandlestickSeries({
        upColor: "#dc2626",
        downColor: "#dc2626",
        borderUpColor: "#dc2626",
        borderDownColor: "#dc2626",
        wickUpColor: "#dc2626",
        wickDownColor: "#dc2626",
        priceLineVisible: false,
        priceScaleId: "right",
      });

      series.setData(
        peFileData.aggregatedData.map((d) => ({
          time: d.time as LightweightCharts.Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }))
      );
    } else {
      series = chart.addLineSeries({
        color: "#dc2626",
        lineWidth: 1,
        priceLineVisible: false,
        priceScaleId: "right",
      });

      series.setData(
        peFileData.aggregatedData.map((d) => ({
          time: d.time as LightweightCharts.Time,
          value: d.close,
        }))
      );
    }

    peSeriesRef.current = series;

    if (peFileData.aggregatedData.length > 0) {
      const firstTime = peFileData.aggregatedData[0].time as LightweightCharts.Time;
      const lastTime = peFileData.aggregatedData[peFileData.aggregatedData.length - 1].time as LightweightCharts.Time;
      
      chart.timeScale().setVisibleRange({
        from: firstTime,
        to: lastTime,
      });
      
      setTimeout(() => {
        if (chart) {
          chart.timeScale().fitContent();
        }
      }, 100);
    }

    // Draw existing lines
    if (peLtp || peSl || peTarget) {
      setTimeout(() => drawPELines(), 500);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (peChartRef.current && chart) {
        chart.applyOptions({
          width: peChartRef.current.clientWidth,
          height: peChartRef.current.clientHeight,
        });
        setTimeout(() => {
          if (chart) {
            chart.timeScale().fitContent();
          }
        }, 50);
      }
    });

    resizeObserver.observe(peChartRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chart) {
        chart.remove();
      }
    };
  }, [theme, peChartType, peFileData, peLtp, peSl, peTarget, drawPELines]);

  // Theme detection
  useEffect(() => {
    const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(darkMode ? "dark" : "light");

    const listener = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", listener);
    return () => {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", listener);
    };
  }, []);

  const ceTradeDuration = ceFirstHit && ceTime
    ? calculateDuration(ceTime, ceFirstHit.time.split(" ")[1])
    : "";

  const peTradeDuration = peFirstHit && peTime
    ? calculateDuration(peTime, peFirstHit.time.split(" ")[1])
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-6 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>CE vs PE Comparison</span>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  Dual Chart with File Upload
                </span>
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                Upload CE and PE CSV/JSON files for side-by-side analysis
              </p>
            </div>

            {/* Link Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsLinked(!isLinked)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${isLinked 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }
                `}
              >
                {isLinked ? <IconLink className="w-4 h-4" /> : <IconLinkOff className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isLinked ? 'Linked Mode' : 'Independent Mode'}
                </span>
              </button>
            </div>
          </div>

          {/* Global Inputs - Only show in Linked Mode */}
          {isLinked && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium">Global Trade Parameters:</span>
                
                <div className="flex items-center gap-2">
                  <label className="text-xs">Entry Time:</label>
                  <input
                    type="time"
                    value={globalTime}
                    onChange={(e) => setGlobalTime(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm w-28 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs">Entry Price:</label>
                  <input
                    type="number"
                    placeholder="LTP"
                    value={globalLtp}
                    onChange={(e) => setGlobalLtp(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm w-24 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs">SL:</label>
                  <input
                    type="number"
                    placeholder="SL"
                    value={globalSl}
                    onChange={(e) => setGlobalSl(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm w-24 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs">Target:</label>
                  <input
                    type="number"
                    placeholder="Target"
                    value={globalTarget}
                    onChange={(e) => setGlobalTarget(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm w-24 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    step="0.01"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs">Qty:</label>
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={globalQuantity}
                    onChange={(e) => setGlobalQuantity(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded px-2 py-1 text-sm w-20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>

                <button
                  onClick={clearGlobalInputs}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* CE Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  Call Option (CE)
                </h2>
              </div>
              {ceFile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                    {ceFile.name}
                  </span>
                  <button
                    onClick={removeCEFile}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!ceFile ? (
              <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="ce-upload"
                  accept=".csv,.json"
                  onChange={handleCEUpload}
                  className="hidden"
                />
                <label
                  htmlFor="ce-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <IconUpload className="w-10 h-10 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload CE file
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    CSV or JSON (Date, Open, High, Low, Close, Volume, OI)
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <IconFile className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ceFile.name}
                  </span>
                  <IconCheck className="w-4 h-4 text-green-500 ml-auto" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Records:</span> {ceFileData?.data.length || 0} rows | 
                  <span className="font-medium ml-2">Candles:</span> {ceFileData?.aggregatedData.length || 0}
                </div>
              </div>
            )}
          </div>

          {/* PE Upload */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
                  Put Option (PE)
                </h2>
              </div>
              {peFile && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-red-800 dark:text-red-200">
                    {peFile.name}
                  </span>
                  <button
                    onClick={removePEFile}
                    className="text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <IconX className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {!peFile ? (
              <div className="border-2 border-dashed border-red-200 dark:border-red-800 rounded-lg p-8 text-center hover:border-red-500 transition-colors">
                <input
                  type="file"
                  id="pe-upload"
                  accept=".csv,.json"
                  onChange={handlePEUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pe-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <IconUpload className="w-10 h-10 text-red-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload PE file
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    CSV or JSON (Date, Open, High, Low, Close, Volume, OI)
                  </span>
                </label>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <IconFile className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {peFile.name}
                  </span>
                  <IconCheck className="w-4 h-4 text-green-500 ml-auto" />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Records:</span> {peFileData?.data.length || 0} rows | 
                  <span className="font-medium ml-2">Candles:</span> {peFileData?.aggregatedData.length || 0}
                </div>
              </div>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {uploadError}
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CE Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-blue-200 dark:border-blue-800">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-b border-blue-200 dark:border-blue-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                    CE Chart
                  </h3>
                  {ceFileData && (
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-0.5 rounded-full">
                      {ceTimeframe}
                    </span>
                  )}
                </div>

                {ceFileData && (
                  <div className="flex items-center gap-2">
                    <select
                      value={ceTimeframe}
                      onChange={(e) => setCeTimeframe(e.target.value)}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isLinked}
                    >
                      {timeframeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={ceChartType}
                      onChange={(e) => setCeChartType(e.target.value as "candlestick" | "line")}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="candlestick">Candlestick</option>
                      <option value="line">Line</option>
                    </select>
                  </div>
                )}
              </div>

              {ceFileData && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Time:</label>
                    <input
                      type="time"
                      value={ceTime}
                      onChange={(e) => setCeTime(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-28 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">LTP:</label>
                    <input
                      type="number"
                      placeholder="LTP"
                      value={ceLtp}
                      onChange={(e) => setCeLtp(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">SL:</label>
                    <input
                      type="number"
                      placeholder="SL"
                      value={ceSl}
                      onChange={(e) => setCeSl(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Target:</label>
                    <input
                      type="number"
                      placeholder="Target"
                      value={ceTarget}
                      onChange={(e) => setCeTarget(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Qty:</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={ceQuantity}
                      onChange={(e) => setCeQuantity(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-16 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <button
                    onClick={drawCELines}
                    disabled={isLinked || !ceFileData}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Analyze
                  </button>

                  <button
                    onClick={clearCELines}
                    disabled={isLinked}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Chart Container */}
            <div 
              ref={ceChartRef} 
              className="w-full h-[450px] bg-white dark:bg-gray-900"
            />

            {/* CE Results */}
            {ceResults && ceFileData && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-4 gap-2">
                  <div className={`bg-red-50 dark:bg-red-900/20 border ${ceFirstHit?.level === "SL" ? "border-red-400 border-2" : "border-red-200 dark:border-red-800"} rounded-lg p-2`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-red-700 dark:text-red-300">SL Hit</h4>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          -₹{Math.abs(ceResults.totalLoss).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{ceResults.lossPercentage}%</div>
                      </div>
                      {ceFirstHit?.level === "SL" && <IconTargetOff className="w-8 h-8 text-red-800" />}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300">Margin</h4>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{ceResults.totalMargin.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Qty: {ceResults.quantity}</div>
                  </div>

                  <div className={`bg-green-50 dark:bg-green-900/20 border ${ceFirstHit?.level === "Target" ? "border-green-400 border-2" : "border-green-200 dark:border-green-800"} rounded-lg p-2`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-green-700 dark:text-green-300">Target Hit</h4>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          +₹{ceResults.totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{ceResults.profitPercentage}%</div>
                      </div>
                      {ceFirstHit?.level === "Target" && <IconTargetArrow className="w-8 h-8 text-green-800" />}
                    </div>
                  </div>

                  <div className={`rounded-lg p-2 border ${
                    ceFirstHit?.level === "SL" ? "bg-red-50 dark:bg-red-900/20 border-red-200" :
                    ceFirstHit?.level === "Target" ? "bg-green-50 dark:bg-green-900/20 border-green-200" :
                    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"
                  }`}>
                    <h4 className={`text-xs font-bold ${
                      ceFirstHit?.level === "SL" ? "text-red-700 dark:text-red-300" :
                      ceFirstHit?.level === "Target" ? "text-green-700 dark:text-green-300" :
                      "text-yellow-700 dark:text-yellow-300"
                    }`}>
                      {ceFirstHit ? `Hit: ${ceFirstHit.level}` : "No Hit"}
                    </h4>
                    {ceFirstHit ? (
                      <>
                        <div className="text-base font-bold">{ceFirstHit.time.split(" ")[1]}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{ceTradeDuration}</div>
                      </>
                    ) : (
                      <div className="text-sm">Not Triggered</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!ceFileData && (
              <div className="w-full h-[450px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <IconFile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Upload CE file to view chart</p>
                </div>
              </div>
            )}
          </div>

          {/* PE Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-red-200 dark:border-red-800">
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-b border-red-200 dark:border-red-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <h3 className="font-semibold text-red-700 dark:text-red-300">
                    PE Chart
                  </h3>
                  {peFileData && (
                    <span className="text-xs bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded-full">
                      {peTimeframe}
                    </span>
                  )}
                </div>

                {peFileData && (
                  <div className="flex items-center gap-2">
                    <select
                      value={peTimeframe}
                      onChange={(e) => setPeTimeframe(e.target.value)}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={isLinked}
                    >
                      {timeframeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={peChartType}
                      onChange={(e) => setPeChartType(e.target.value as "candlestick" | "line")}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="candlestick">Candlestick</option>
                      <option value="line">Line</option>
                    </select>
                  </div>
                )}
              </div>

              {peFileData && (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Time:</label>
                    <input
                      type="time"
                      value={peTime}
                      onChange={(e) => setPeTime(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-28 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">LTP:</label>
                    <input
                      type="number"
                      placeholder="LTP"
                      value={peLtp}
                      onChange={(e) => setPeLtp(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">SL:</label>
                    <input
                      type="number"
                      placeholder="SL"
                      value={peSl}
                      onChange={(e) => setPeSl(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Target:</label>
                    <input
                      type="number"
                      placeholder="Target"
                      value={peTarget}
                      onChange={(e) => setPeTarget(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Qty:</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={peQuantity}
                      onChange={(e) => setPeQuantity(e.target.value)}
                      disabled={isLinked}
                      className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-2 py-1 rounded text-sm w-16 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <button
                    onClick={drawPELines}
                    disabled={isLinked || !peFileData}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Analyze
                  </button>

                  <button
                    onClick={clearPELines}
                    disabled={isLinked}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {/* Chart Container */}
            <div 
              ref={peChartRef} 
              className="w-full h-[450px] bg-white dark:bg-gray-900"
            />

            {/* PE Results */}
            {peResults && peFileData && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-red-200 dark:border-red-800">
                <div className="grid grid-cols-4 gap-2">
                  <div className={`bg-red-50 dark:bg-red-900/20 border ${peFirstHit?.level === "SL" ? "border-red-400 border-2" : "border-red-200 dark:border-red-800"} rounded-lg p-2`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-red-700 dark:text-red-300">SL Hit</h4>
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          -₹{Math.abs(peResults.totalLoss).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{peResults.lossPercentage}%</div>
                      </div>
                      {peFirstHit?.level === "SL" && <IconTargetOff className="w-8 h-8 text-red-800" />}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2">
                    <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300">Margin</h4>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      ₹{peResults.totalMargin.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">Qty: {peResults.quantity}</div>
                  </div>

                  <div className={`bg-green-50 dark:bg-green-900/20 border ${peFirstHit?.level === "Target" ? "border-green-400 border-2" : "border-green-200 dark:border-green-800"} rounded-lg p-2`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-green-700 dark:text-green-300">Target Hit</h4>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          +₹{peResults.totalProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{peResults.profitPercentage}%</div>
                      </div>
                      {peFirstHit?.level === "Target" && <IconTargetArrow className="w-8 h-8 text-green-800" />}
                    </div>
                  </div>

                  <div className={`rounded-lg p-2 border ${
                    peFirstHit?.level === "SL" ? "bg-red-50 dark:bg-red-900/20 border-red-200" :
                    peFirstHit?.level === "Target" ? "bg-green-50 dark:bg-green-900/20 border-green-200" :
                    "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200"
                  }`}>
                    <h4 className={`text-xs font-bold ${
                      peFirstHit?.level === "SL" ? "text-red-700 dark:text-red-300" :
                      peFirstHit?.level === "Target" ? "text-green-700 dark:text-green-300" :
                      "text-yellow-700 dark:text-yellow-300"
                    }`}>
                      {peFirstHit ? `Hit: ${peFirstHit.level}` : "No Hit"}
                    </h4>
                    {peFirstHit ? (
                      <>
                        <div className="text-base font-bold">{peFirstHit.time.split(" ")[1]}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{peTradeDuration}</div>
                      </>
                    ) : (
                      <div className="text-sm">Not Triggered</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!peFileData && (
              <div className="w-full h-[450px] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <IconFile className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Upload PE file to view chart</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        {(ceFileData || peFileData) && (
          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center gap-6">
                {ceFileData && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      CE: {ceFile?.name || "Uploaded"}
                    </span>
                    {ceFirstHit && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ceFirstHit.level === "SL" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {ceFirstHit.level} at {ceFirstHit.time.split(" ")[1]}
                      </span>
                    )}
                  </div>
                )}
                
                {ceFileData && peFileData && (
                  <IconArrowNarrowRight className="w-4 h-4 text-gray-400" />
                )}
                
                {peFileData && (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      PE: {peFile?.name || "Uploaded"}
                    </span>
                    {peFirstHit && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        peFirstHit.level === "SL" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}>
                        {peFirstHit.level} at {peFirstHit.time.split(" ")[1]}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {isLinked ? (
                  <span className="flex items-center gap-1">
                    <IconLink className="w-3 h-3" /> Linked Mode: Same trade parameters
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <IconLinkOff className="w-3 h-3" /> Independent Mode: Separate trade parameters
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CePeDualChart;