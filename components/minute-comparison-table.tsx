"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
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
} from "lucide-react";
import * as XLSX from "xlsx";

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
  minuteKey?: string;
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

const MinuteAnalysisAllInOne: React.FC = () => {
  // State management
  const [files, setFiles] = useState<FileAnalysis[]>([]);
  const [analyses, setAnalyses] = useState<Map<string, CEPE_MinuteAnalysis>>(
    new Map(),
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [activeCard, setActiveCard] = useState<"cumulative" | "thirtyPoint">(
    "cumulative",
  );
  const [exportProgress, setExportProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current analysis based on selected date
  const currentAnalysis = useMemo(() => {
    if (!selectedDate) return null;
    return analyses.get(selectedDate) || null;
  }, [analyses, selectedDate]);

  // Get available dates for dropdown
  const availableDates = useMemo<DateOption[]>(() => {
    const dates: DateOption[] = [];
    analyses.forEach((analysis, date) => {
      // Extract short file names for display
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
        display: `${date} | CE:${analysis.ceStrikePrice} (${ceShortName}) vs PE:${analysis.peStrikePrice} (${peShortName})`,
        ceFile: analysis.ceFileName,
        peFile: analysis.peFileName,
        ceStrike: analysis.ceStrikePrice,
        peStrike: analysis.peStrikePrice,
      });
    });
    return dates.sort((a, b) => b.date.localeCompare(a.date)); // Sort descending by date
  }, [analyses]);

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
        // Find the most likely strike price (usually 5 digits)
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

      // Store previous close for return calculation
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

  // Extract first hour data (9:15 to 10:15)
  const extractFirstHourData = useCallback(
    (data: CandleData[]): CandleData[] => {
      return data.filter((candle) => {
        const time = candle.time;
        return time >= "09:15" && time <= "10:15";
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

  const calculateFirstHourSummary = useCallback(
    (data: CandleData[]): FirstHourSummary | null => {
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

        // Calculate volume to OI ratios
        const ceVolumeToOIRatio = ceData.oi > 0 ? ceData.volume / ceData.oi : 0;
        const peVolumeToOIRatio = peData.oi > 0 ? peData.volume / peData.oi : 0;

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
        const volumeToOIRatioDifference = ceVolumeToOIRatio - peVolumeToOIRatio;
        const returnDifference =
          (ceData.returnPercent || 0) - (peData.returnPercent || 0);
        const bodySizeDifference =
          (ceData.bodySize || 0) - (peData.bodySize || 0);

        // Determine candle comparison
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
            volumeToOIRatio: ceVolumeToOIRatio,
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

        // Aggregate statistics
        ceTotalVolume += ceData.volume;
        peTotalVolume += peData.volume;
        ceTotalOI += ceData.oi;
        peTotalOI += peData.oi;
        ceTotalVolumeToOIRatio += ceVolumeToOIRatio;
        peTotalVolumeToOIRatio += peVolumeToOIRatio;

        if (ceData.candleType === "Bullish") ceBullishMinutes++;
        if (ceData.candleType === "Bearish") ceBearishMinutes++;
        if (peData.candleType === "Bullish") peBullishMinutes++;
        if (peData.candleType === "Bearish") peBearishMinutes++;

        if (ceData.volume > peData.volume) minutesWithCEHigherVolume++;
        else if (peData.volume > ceData.volume) minutesWithPEHigherVolume++;

        if (ceData.oi > peData.oi) minutesWithCEHigherOI++;
        else if (peData.oi > ceData.oi) minutesWithPEHigherOI++;

        if (ceVolumeToOIRatio > peVolumeToOIRatio)
          minutesWithCEHigherVolumeToOIRatio++;
        else if (peVolumeToOIRatio > ceVolumeToOIRatio)
          minutesWithPEHigherVolumeToOIRatio++;

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

      const newAnalyses = new Map<string, CEPE_MinuteAnalysis>();

      // Find all dates with both CE and PE files
      for (const [date, dateFiles] of Object.entries(fileGroups)) {
        const ceFile = dateFiles.find((f) => f.data[0]?.optionType === "CE");
        const peFile = dateFiles.find((f) => f.data[0]?.optionType === "PE");

        if (ceFile && peFile) {
          const analysis = calculateCEPE_MinuteAnalysis(ceFile, peFile, date);
          if (analysis) {
            newAnalyses.set(date, analysis);
          }
        }
      }

      setAnalyses(newAnalyses);

      // Set selected date to the most recent one
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
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
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

      const newSelected = new Set(selectedFiles);
      newFiles.forEach((file) => newSelected.add(file.id));
      setSelectedFiles(newSelected);

      processFiles(updatedFiles);
      setIsProcessing(false);
    },
    [
      files,
      selectedFiles,
      parseCSVContent,
      calculateFileSummary,
      calculateFirstHourSummary,
      extractFirstHourData,
      processFiles,
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
      const newFiles = files.filter((file) => file.id !== id);
      setFiles(newFiles);

      const newSelected = new Set(selectedFiles);
      newSelected.delete(id);
      setSelectedFiles(newSelected);

      if (newFiles.length > 0) {
        processFiles(newFiles);
      } else {
        setAnalyses(new Map());
        setSelectedDate("");
      }
    },
    [files, selectedFiles, processFiles],
  );

  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setSelectedFiles(new Set());
    setAnalyses(new Map());
    setSelectedDate("");
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

  // Calculate cumulative data for 9:15 to 9:27
  const cumulativeData = useMemo(() => {
    if (!currentAnalysis) return null;

    const startTime = "09:15";
    const endTime = "09:27";

    const relevantMinutes = currentAnalysis.minuteComparisons.filter(
      (comp) => comp.time >= startTime && comp.time <= endTime,
    );

    if (relevantMinutes.length === 0) return null;

    // Get first minute for start prices
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

    // Modified to never show "Equal" - always pick CE or PE (default to CE if exactly equal)
    const volumeLeader = ceCumulativeVolume >= peCumulativeVolume ? "CE" : "PE";

    const oiLeader = ceCumulativeOI >= peCumulativeOI ? "CE" : "PE";

    const priceLeader = cePriceChange >= pePriceChange ? "CE" : "PE"; // Fixed: now correctly compares CE vs PE

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
      // CE 30-point check (price increase)
      const cePoints = comp.ceData.close - ceStartPrice;
      if (!ceReached && cePoints >= targetPoints) {
        ceReached = true;
        ceReachedAtTime = comp.time;
        ceMinutesToReach = index + 1; // Minutes from 9:30
      }
      if (cePoints > ceMaxPoints) {
        ceMaxPoints = cePoints;
        ceMaxTime = comp.time;
      }

      // PE 30-point check (price increase for PE)
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

    // Summary sheet
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

    // Minute-by-minute data
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

            {/* Upload Section - Always Visible */}
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

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
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
        {files.length > 0 && (
          <div className="rounded-4 p-4 bg-white">
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
                    selectedFiles.has(file.id)
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
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
        {/* Date Selection Dropdown */}
        {availableDates.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">
                  Select Comparison:
                </span>
              </div>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 min-w-[400px] px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {availableDates.map((option) => (
                  <option key={option.date} value={option.date}>
                    {option.display}
                  </option>
                ))}
              </select>
              <div className="text-sm text-gray-500">
                {availableDates.length} comparison
                {availableDates.length > 1 ? "s" : ""} available
              </div>
            </div>
          </div>
        )}

        {/* Analysis Section - Shows only when a date is selected */}
        {currentAnalysis && (
          <div className="space-y-6">
            {/* Table Header with File Names */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentAnalysis.date} - CE vs PE Analysis
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Strike Price: CE {currentAnalysis.ceStrikePrice} | PE{" "}
                      {currentAnalysis.peStrikePrice}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
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
            </div>

            {/* Export Buttons */}
            <div className="bg-white rounded-xl shadow-lg p-4 flex flex-wrap gap-3 justify-end">
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
                        <span
                          className={`font-semibold ${
                            cumulativeData.priceLeader === "CE"
                              ? "text-blue-600"
                              : cumulativeData.priceLeader === "PE"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          {cumulativeData.priceLeader}
                        </span>
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

            {/* Best Performers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentAnalysis.summary.bestCEMinute && (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-green-700 mb-2">
                    Best CE Minute
                  </h4>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentAnalysis.summary.bestCEMinute.time}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Return:{" "}
                    <span className="font-semibold text-green-600">
                      +
                      {currentAnalysis.summary.bestCEMinute.ceData.returnPercent.toFixed(
                        2,
                      )}
                      %
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Volume:{" "}
                    {formatCompactNumber(
                      currentAnalysis.summary.bestCEMinute.ceData.volume,
                    )}{" "}
                    | Vol/OI:{" "}
                    {formatRatio(
                      currentAnalysis.summary.bestCEMinute.ceData
                        .volumeToOIRatio,
                    )}
                  </div>
                </div>
              )}
              {currentAnalysis.summary.bestPEMinute && (
                <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-red-700 mb-2">
                    Best PE Minute
                  </h4>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentAnalysis.summary.bestPEMinute.time}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    Return:{" "}
                    <span
                      className={`font-semibold ${
                        currentAnalysis.summary.bestPEMinute.peData
                          .returnPercent >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {currentAnalysis.summary.bestPEMinute.peData
                        .returnPercent >= 0
                        ? "+"
                        : ""}
                      {currentAnalysis.summary.bestPEMinute.peData.returnPercent.toFixed(
                        2,
                      )}
                      %
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Volume:{" "}
                    {formatCompactNumber(
                      currentAnalysis.summary.bestPEMinute.peData.volume,
                    )}{" "}
                    | Vol/OI:{" "}
                    {formatRatio(
                      currentAnalysis.summary.bestPEMinute.peData
                        .volumeToOIRatio,
                    )}
                  </div>
                </div>
              )}
              {currentAnalysis.summary.highestVolumeMinute && (
                <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-purple-700 mb-2">
                    Highest Volume Minute
                  </h4>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentAnalysis.summary.highestVolumeMinute.time}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    CE Vol:{" "}
                    {formatCompactNumber(
                      currentAnalysis.summary.highestVolumeMinute.ceData.volume,
                    )}{" "}
                    | PE Vol:{" "}
                    {formatCompactNumber(
                      currentAnalysis.summary.highestVolumeMinute.peData.volume,
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    CE Vol/OI:{" "}
                    {formatRatio(
                      currentAnalysis.summary.highestVolumeMinute.ceData
                        .volumeToOIRatio,
                    )}{" "}
                    | PE Vol/OI:{" "}
                    {formatRatio(
                      currentAnalysis.summary.highestVolumeMinute.peData
                        .volumeToOIRatio,
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Minute-by-Minute Table with Volume/OI Ratio */}
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
                      {/* CE headers */}
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
                      {/* PE headers */}
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
                        {/* Comparison */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MinuteAnalysisAllInOne;
