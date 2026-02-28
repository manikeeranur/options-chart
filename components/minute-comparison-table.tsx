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
  ArrowDown,
  ArrowUp,
  Layers,
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
  { label: "1 Min", value: "1min" },
  { label: "3 Min", value: "3min" },
  { label: "5 Min", value: "5min" },
  { label: "10 Min", value: "10min" },
  { label: "15 Min", value: "15min" },
  { label: "30 Min", value: "30min" },
  { label: "1 Hr", value: "1hour" },
];

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
    return 0;
  }
};

// Format time to IST 12hr (AM/PM)
const formatToISTAmPm = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// Format time HH:MM to 12hr AM/PM
const formatTimeStrToAmPm = (timeStr: string): string => {
  if (!timeStr) return timeStr;
  const [hourStr, minStr] = timeStr.split(":");
  let hour = parseInt(hourStr);
  const min = minStr || "00";
  const suffix = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${min} ${suffix}`;
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
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + "B";
  else if (value >= 1000000) return (value / 1000000).toFixed(2) + "M";
  else if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  else return value.toString();
};

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
  candleDetails: { open: number; high: number; low: number; close: number };
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
    oiToVolumeRatio: number;
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
    oiToVolumeRatio: number;
  };
  comparison: {
    volumeDifference: number;
    volumeRatio: number;
    oiDifference: number;
    oiRatio: number;
    oiToVolumeDifference: number;
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
  summary: { totalFolders: number; totalFiles: number };
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

interface FileDataStore {
  [date: string]: {
    ceData: CandleData[];
    peData: CandleData[];
    ceFileName: string;
    peFileName: string;
  };
}

// ==================== CALCULATE RESULTS ====================
const calculateResults = (
  ltp: string,
  sl: string,
  target: string,
  quantity: string,
): CalculationResults | null => {
  if (!ltp || !sl || !target || !quantity) return null;
  const ltpNum = parseFloat(ltp),
    slNum = parseFloat(sl),
    targetNum = parseFloat(target),
    quantityNum = parseFloat(quantity);
  if (isNaN(ltpNum) || isNaN(slNum) || isNaN(targetNum) || isNaN(quantityNum))
    return null;
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

// ==================== FOLDER TREE ====================
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
      newSet.has(folderId) ? newSet.delete(folderId) : newSet.add(folderId);
      return newSet;
    });
  };

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      newSet.has(fileId) ? newSet.delete(fileId) : newSet.add(fileId);
      return newSet;
    });
  };

  const selectAllInFolder = (
    folderFiles: GoogleDriveFile[],
    checked: boolean,
  ) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      folderFiles.forEach((file) =>
        checked ? newSet.add(file.id) : newSet.delete(file.id),
      );
      return newSet;
    });
  };

  const loadSelectedFiles = async () => {
    setLoading(true);
    try {
      const allFiles: { content: string; name: string }[] = [];
      data.files.forEach((file) => {
        if (selectedFiles.has(file.id))
          allFiles.push({ content: file.content, name: file.name });
      });
      data.folders.forEach((folder) => {
        folder.files.forEach((file) => {
          if (selectedFiles.has(file.id))
            allFiles.push({
              content: file.content,
              name: `${folder.name}/${file.name}`,
            });
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
            ({getTotalFiles()} files)
          </span>
        </div>
        <button
          onClick={loadSelectedFiles}
          disabled={getSelectedCount() === 0 || loading || isProcessing}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getSelectedCount() > 0 && !loading && !isProcessing ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            `Load (${getSelectedCount()})`
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

// ==================== MAIN COMPONENT ====================
const MinuteAnalysisAllInOne: React.FC = () => {
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
  const [activeCard, setActiveCard] = useState<
    "cumulative" | "thirtyPoint" | "oiDirection" | "oiVolSignal"
  >("oiVolSignal");
  const [exportProgress, setExportProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [driveData, setDriveData] = useState<GoogleDriveData | null>(null);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

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

  const driveOptions = [
    { label: "Upstox Drive", value: "upstox" },
    { label: "Zerodha Drive", value: "zerodha" },
  ];
  const [drive, setDrive] = useState("upstox");
  const [syncCharts, setSyncCharts] = useState(true);
  const [ceHoverData, setCeHoverData] = useState<any>(null);
  const [peHoverData, setPeHoverData] = useState<any>(null);
  const [ceFileName, setCeFileName] = useState<string>("");
  const [peFileName, setPeFileName] = useState<string>("");
  const [fileDataStore, setFileDataStore] = useState<FileDataStore>({});

  const [ceChartData, setCeChartData] = useState<OptionTypeData>({
    name: "CE",
    color: "#16a34a",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
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
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
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

  const APPS_SCRIPT_URL_Zerodha =
    "https://script.google.com/macros/s/AKfycbw50LvPAL1wNdu2KdBAlHQbh5myg7cW6xMibrB83Sp1YjLZ1_XPL6SEueOz5PTT_ktRcg/exec";
  const APPS_SCRIPT_URL_Upstox =
    "https://script.google.com/macros/s/AKfycbyMo8jk7E4twIMfAfyzFdqs5h0Nfe-01IJ4r8aeRVPu47uvrra2goU-a9lofKQZy_C8/exec";

  const currentAnalysis = useMemo(() => {
    if (!selectedDate) return null;
    return analyses.get(selectedDate) || null;
  }, [analyses, selectedDate]);

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
        display: `${date} | ${ceShortName?.split("_")?.[1] || ceShortName} vs ${peShortName?.split("_")?.[1] || peShortName}`,
        ceFile: analysis.ceFileName,
        peFile: analysis.peFileName,
        ceStrike: analysis.ceStrikePrice,
        peStrike: analysis.peStrikePrice,
      });
    });
    return dates.sort((a, b) => b.date.localeCompare(a.date));
  }, [analyses]);

  useEffect(() => {
    if (selectedDate && fileDataStore[selectedDate]) {
      const store = fileDataStore[selectedDate];
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
      } catch (e) {}
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
      } catch (e) {}
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
      let cumulativeVolume = 0,
        cumulativeValue = 0;
      let optionType: "CE" | "PE" | undefined;
      const fileNameUpper = fileName.toUpperCase();
      if (fileNameUpper.includes("CE") && !fileNameUpper.includes("PEACE"))
        optionType = "CE";
      else if (fileNameUpper.includes("PE")) optionType = "PE";
      let strikePrice: number | undefined;
      const strikeMatch = fileName.match(/(\d+)/g);
      if (strikeMatch && strikeMatch.length > 0) {
        const possibleStrikes = strikeMatch
          .map(Number)
          .filter((n) => n > 1000 && n < 100000);
        if (possibleStrikes.length > 0) strikePrice = possibleStrikes[0];
      }
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
        let dateStr = "",
          timeStr = "09:15";
        if (dateIndex >= 0) {
          const dateValue = getValue(dateIndex, "");
          if (dateValue) {
            if (dateValue.includes(" ") || dateValue.includes("T")) {
              const dateTimeParts = dateValue.split(/[\sT]/);
              dateStr = dateTimeParts[0];
              if (dateTimeParts[1]) timeStr = dateTimeParts[1].substring(0, 5);
            } else {
              dateStr = dateValue;
              if (timeIndex >= 0) {
                const timeValue = getValue(timeIndex, "09:15");
                timeStr = timeValue.substring(0, 5);
              }
            }
          }
        }
        const open = parseFloat(getValue(openIndex, "0")),
          high = parseFloat(getValue(highIndex, "0"));
        const low = parseFloat(getValue(lowIndex, "0")),
          close = parseFloat(getValue(closeIndex, "0"));
        const volume = parseFloat(getValue(volumeIndex, "0")),
          oi = parseFloat(getValue(oiIndex, "0"));
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
          if (prevClose !== null && prevClose !== 0)
            returnPercent = ((close - prevClose) / prevClose) * 100;
          prevClose = close;
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
            minuteKey: `${dateStr}_${timeStr}`,
          });
        }
      }
      return candleData;
    },
    [],
  );

  const extractFirstHourData = useCallback(
    (data: CandleData[]): CandleData[] => {
      return data.filter((candle) => {
        const date = new Date((candle.time + IST_OFFSET_SECONDS) * 1000);
        const hours = date.getHours(),
          minutes = date.getMinutes();
        const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        return timeStr >= "09:15" && timeStr <= "15:30";
      });
    },
    [],
  );

  const calculateFileSummary = useCallback(
    (data: CandleData[]): FileSummary | null => {
      if (data.length === 0) return null;
      const totalVolume = data.reduce((sum, c) => sum + (c.volume || 0), 0);
      const totalOI = data.reduce((sum, c) => sum + (c.oi || 0), 0);
      const avgBodySize =
        data.reduce((sum, c) => sum + (c.bodySize || 0), 0) / data.length;
      const avgVolume = totalVolume / data.length,
        avgOI = totalOI / data.length;
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
        data.reduce((sum, c) => sum + (c.candleSize || 0), 0) / data.length;
      const returns = data.map((candle, index) =>
        index === 0
          ? 0
          : (candle.close - (data[index - 1]?.close || 0)) /
            (data[index - 1]?.close || 1),
      );
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
      const totalVolume = data.reduce((sum, c) => sum + (c.volume || 0), 0);
      const totalOI = data.reduce((sum, c) => sum + (c.oi || 0), 0);
      const avgBodySize =
        data.reduce((sum, c) => sum + (c.bodySize || 0), 0) / data.length;
      const avgVolume = totalVolume / data.length,
        avgOI = totalOI / data.length;
      const bullishCandles = data.filter(
        (c) => c.candleType === "Bullish",
      ).length;
      const bearishCandles = data.filter(
        (c) => c.candleType === "Bearish",
      ).length;
      const dojiCandles = data.filter((c) => c.candleType === "Doji").length;
      const avgCandleSize =
        data.reduce((sum, c) => sum + (c.candleSize || 0), 0) / data.length;
      const returns = data.map((candle, index) =>
        index === 0
          ? 0
          : (candle.close - (data[index - 1]?.close || 0)) /
            (data[index - 1]?.close || 1),
      );
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

  const calculateCEPE_MinuteAnalysis = useCallback(
    (ceFile: FileAnalysis, peFile: FileAnalysis, date: string) => {
      const ceCandles = ceFile.firstHourData,
        peCandles = peFile.firstHourData;
      if (ceCandles.length === 0 || peCandles.length === 0) return null;
      const ceByMinute = new Map<string, CandleData>(),
        peByMinute = new Map<string, CandleData>();
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
      let ceTotalVolume = 0,
        peTotalVolume = 0,
        ceTotalOI = 0,
        peTotalOI = 0;
      let ceTotalVolumeToOIRatio = 0,
        peTotalVolumeToOIRatio = 0;
      let ceBullishMinutes = 0,
        ceBearishMinutes = 0,
        peBullishMinutes = 0,
        peBearishMinutes = 0;
      let minutesWithCEHigherVolume = 0,
        minutesWithPEHigherVolume = 0;
      let minutesWithCEHigherOI = 0,
        minutesWithPEHigherOI = 0;
      let minutesWithCEHigherVolumeToOIRatio = 0,
        minutesWithPEHigherVolumeToOIRatio = 0;
      let ceWins = 0,
        peWins = 0,
        directionAgreement = 0;
      let ceReturnSum = 0,
        peReturnSum = 0;
      let bestCEMinute: MinuteComparison | null = null,
        bestPEMinute: MinuteComparison | null = null;
      let highestVolumeMinute: MinuteComparison | null = null,
        highestVolume = 0;

      sortedMinutes.forEach((time) => {
        const ceCandle = ceByMinute.get(time),
          peCandle = peByMinute.get(time);
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
        const ceData = ceCandle || {
          ...defaultCandle,
          optionType: "CE" as const,
        };
        const peData = peCandle || {
          ...defaultCandle,
          optionType: "PE" as const,
        };

        const ceVolumeToOIRatio =
          (ceData.oi || 0) > 0 ? (ceData.volume || 0) / (ceData.oi || 1) : 0;
        const peVolumeToOIRatio =
          (peData.oi || 0) > 0 ? (peData.volume || 0) / (peData.oi || 1) : 0;
        // OI / Volume ratio
        const ceOiToVolumeRatio =
          (ceData.volume || 0) > 0
            ? (ceData.oi || 0) / (ceData.volume || 1)
            : 0;
        const peOiToVolumeRatio =
          (peData.volume || 0) > 0
            ? (peData.oi || 0) / (peData.volume || 1)
            : 0;

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
        const oiToVolumeDifference = ceOiToVolumeRatio - peOiToVolumeRatio;
        const returnDifference =
          (ceData.returnPercent || 0) - (peData.returnPercent || 0);
        const bodySizeDifference =
          (ceData.bodySize || 0) - (peData.bodySize || 0);

        let candleComparison: string;
        if (ceData.candleType === "Bullish" && peData.candleType === "Bullish")
          candleComparison = "Both_Bullish";
        else if (
          ceData.candleType === "Bearish" &&
          peData.candleType === "Bearish"
        )
          candleComparison = "Both_Bearish";
        else if (ceData.candleType === "Doji" && peData.candleType === "Doji")
          candleComparison = "Both_Doji";
        else if (
          ceData.candleType === "Bullish" &&
          peData.candleType !== "Bullish"
        )
          candleComparison = "CE_Bullish";
        else if (
          ceData.candleType === "Bearish" &&
          peData.candleType !== "Bearish"
        )
          candleComparison = "CE_Bearish";
        else if (
          peData.candleType === "Bullish" &&
          ceData.candleType !== "Bullish"
        )
          candleComparison = "PE_Bullish";
        else if (
          peData.candleType === "Bearish" &&
          ceData.candleType !== "Bearish"
        )
          candleComparison = "PE_Bearish";
        else candleComparison = "Mixed";

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
            oiToVolumeRatio: ceOiToVolumeRatio,
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
            oiToVolumeRatio: peOiToVolumeRatio,
          },
          comparison: {
            volumeDifference,
            volumeRatio,
            oiDifference,
            oiRatio,
            oiToVolumeDifference,
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
        )
          bestCEMinute = comparison;
        if (
          !bestPEMinute ||
          (peData.returnPercent || 0) >
            (bestPEMinute?.peData.returnPercent || -Infinity)
        )
          bestPEMinute = comparison;
        const totalVol = (ceData.volume || 0) + (peData.volume || 0);
        if (totalVol > highestVolume) {
          highestVolume = totalVol;
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
            if (!fileGroups[date]) fileGroups[date] = [];
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
      } else setSelectedDate("");
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
                firstHourData,
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

  const fetchGoogleDriveStructure = useCallback(async (broker: string) => {
    setIsLoadingDrive(true);
    try {
      const response = await fetch(
        broker === "upstox" ? APPS_SCRIPT_URL_Upstox : APPS_SCRIPT_URL_Zerodha,
      );

      const data = await response.json();
      if (data.success) {
        setDriveData(data);
        setShowDrivePicker(true);
      } else
        alert(
          "Failed to load Google Drive files: " +
            (data.error || "Unknown error"),
        );
    } catch (error) {
      alert("Failed to connect to Google Drive.");
    } finally {
      setIsLoadingDrive(false);
    }
  }, []);

  const handleGoogleDriveFiles = useCallback(
    async (driveFiles: { content: string; name: string }[]) => {
      setIsProcessing(true);
      const fileObjects = driveFiles.map(
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
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
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
        if (fileArray.length > 0) handleFileUpload(fileArray);
      }
    },
    [handleFileUpload],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileUpload(Array.from(e.target.files));
        if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (newFiles.length > 0) processFiles(newFiles);
      else {
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
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  }, []);

  // ==================== CUMULATIVE DATA (9:15 - 9:27) ====================
  const cumulativeData = useMemo(() => {
    if (!currentAnalysis) return null;
    const startTime = "09:15",
      endTime = "09:27";
    const relevantMinutes = currentAnalysis.minuteComparisons.filter(
      (comp) => comp.time >= startTime && comp.time <= endTime,
    );
    if (relevantMinutes.length === 0) return null;
    const firstMinute = relevantMinutes[0],
      lastMinute = relevantMinutes[relevantMinutes.length - 1];
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
    const ceStartPrice = firstMinute.ceData.open,
      peStartPrice = firstMinute.peData.open;
    const ceEndPrice = lastMinute.ceData.close,
      peEndPrice = lastMinute.peData.close;
    const cePriceChange = ((ceEndPrice - ceStartPrice) / ceStartPrice) * 100;
    const pePriceChange = ((peEndPrice - peStartPrice) / peStartPrice) * 100;
    const volumeLeader = ceCumulativeVolume >= peCumulativeVolume ? "CE" : "PE";
    const oiLeader = ceCumulativeOI >= peCumulativeOI ? "CE" : "PE";
    const priceLeader = cePriceChange >= pePriceChange ? "CE" : "PE";
    // OI direction: lower OI side is the bullish direction (less hedging = momentum)
    const oiDirectionSide = ceCumulativeOI <= peCumulativeOI ? "CE" : "PE";
    return {
      timeRange: `${formatTimeStrToAmPm(startTime)} - ${formatTimeStrToAmPm(endTime)}`,
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
      oiDirectionSide,
    };
  }, [currentAnalysis]);

  // ==================== OI DIRECTION ANALYSIS (9:15-9:27) ====================
  const oiDirectionData = useMemo(() => {
    if (!currentAnalysis || !cumulativeData) return null;
    const startTime = "09:15",
      // endTime = "09:27";
      endTime = "15:30";
    const relevantMinutes = currentAnalysis.minuteComparisons.filter(
      (comp) => comp.time >= startTime && comp.time <= endTime,
    );
    if (relevantMinutes.length === 0) return null;

    const ceCumulativeOI = cumulativeData.ceCumulativeOI;
    const peCumulativeOI = cumulativeData.peCumulativeOI;
    const ceCumulativeVolume = cumulativeData.ceCumulativeVolume;
    const peCumulativeVolume = cumulativeData.peCumulativeVolume;

    // Lower OI = less open positions = that side is being bought/closed = direction signal
    const lowerOISide = ceCumulativeOI <= peCumulativeOI ? "CE" : "PE";
    const lowerOIAmount =
      lowerOISide === "CE" ? ceCumulativeOI : peCumulativeOI;
    const higherOIAmount =
      lowerOISide === "CE" ? peCumulativeOI : ceCumulativeOI;
    const oiDiffPercent =
      higherOIAmount > 0
        ? ((higherOIAmount - lowerOIAmount) / higherOIAmount) * 100
        : 0;

    // CE lower OI = CE is direction (bullish market), PE lower OI = PE is direction (bearish market)
    const directionSideFile =
      lowerOISide === "CE"
        ? currentAnalysis.ceFileName
        : currentAnalysis.peFileName;
    const directionStrike =
      lowerOISide === "CE"
        ? currentAnalysis.ceStrikePrice
        : currentAnalysis.peStrikePrice;
    const directionLabel = lowerOISide === "CE" ? "Bullish" : "Bearish";
    const directionColor = lowerOISide === "CE" ? "green" : "red";

    // Volume confirmation
    const higherVolSide =
      ceCumulativeVolume >= peCumulativeVolume ? "CE" : "PE";
    const volumeConfirms = higherVolSide === lowerOISide;

    // Minute by minute OI trend
    const minuteOITrend = relevantMinutes.map((comp) => ({
      time: formatTimeStrToAmPm(comp.time),
      ceOI: comp.ceData.oi,
      peOI: comp.peData.oi,
      ceOiToVol: comp.ceData.oiToVolumeRatio,
      peOiToVol: comp.peData.oiToVolumeRatio,
      lowerOI: comp.ceData.oi <= comp.peData.oi ? "CE" : "PE",
    }));

    const ceLowerOICount = minuteOITrend.filter(
      (m) => m.lowerOI === "CE",
    ).length;
    const peLowerOICount = minuteOITrend.filter(
      (m) => m.lowerOI === "PE",
    ).length;

    return {
      lowerOISide,
      lowerOIAmount,
      higherOIAmount,
      oiDiffPercent,
      directionSideFile,
      directionStrike,
      directionLabel,
      directionColor,
      volumeConfirms,
      higherVolSide,
      minuteOITrend,
      ceLowerOICount,
      peLowerOICount,
      timeRange: `${formatTimeStrToAmPm(startTime)} - ${formatTimeStrToAmPm(endTime)}`,
    };
  }, [currentAnalysis, cumulativeData]);

  // ==================== 30-POINT ANALYSIS ====================
  const thirtyPointAnalysis: any = useMemo(() => {
    if (!currentAnalysis) return null;
    const startTime = "09:30",
      endTime = "10:15",
      targetPoints = 30;
    const minutesFrom930 = currentAnalysis.minuteComparisons.filter(
      (comp) => comp.time >= startTime && comp.time <= endTime,
    );
    if (minutesFrom930.length === 0) return null;
    const firstMinute = minutesFrom930[0];
    const ceStartPrice = firstMinute.ceData.open,
      peStartPrice = firstMinute.peData.open;
    let ceReached = false,
      peReached = false;
    let ceReachedAtTime: string | null = null,
      peReachedAtTime: string | null = null;
    let ceMinutesToReach: number | null = null,
      peMinutesToReach: number | null = null;
    let ceMaxPoints = 0,
      peMaxPoints = 0;
    let ceMaxTime: string | null = null,
      peMaxTime: string | null = null;
    minutesFrom930.forEach((comp, index) => {
      const cePoints = comp.ceData.close - ceStartPrice;
      if (!ceReached && cePoints >= targetPoints) {
        ceReached = true;
        ceReachedAtTime = formatTimeStrToAmPm(comp.time);
        ceMinutesToReach = index + 1;
      }
      if (cePoints > ceMaxPoints) {
        ceMaxPoints = cePoints;
        ceMaxTime = formatTimeStrToAmPm(comp.time);
      }
      const pePoints = comp.peData.close - peStartPrice;
      if (!peReached && pePoints >= targetPoints) {
        peReached = true;
        peReachedAtTime = formatTimeStrToAmPm(comp.time);
        peMinutesToReach = index + 1;
      }
      if (pePoints > peMaxPoints) {
        peMaxPoints = pePoints;
        peMaxTime = formatTimeStrToAmPm(comp.time);
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
      if (ceReachedAtTime && peReachedAtTime)
        firstToReach =
          ceReachedAtTime < peReachedAtTime
            ? "CE"
            : peReachedAtTime < ceReachedAtTime
              ? "PE"
              : null;
    } else if (ceReached) firstToReach = "CE";
    else if (peReached) firstToReach = "PE";
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

  // ==================== OI/VOLUME SIGNAL + 30PT OUTCOME (THE MAIN SIGNAL CARD) ====================
  // Logic:
  //  1. Compute avg OI/Volume for CE and PE during 9:15–9:27
  //  2. Lower OI/Volume = more volume per outstanding contract = higher momentum/activity = DIRECTION SIDE
  //  3. Then check: did that predicted side hit +30 pts from 9:30 open by 10:15?
  //  4. Also track: did the OTHER side hit 30pts first? (signal failure check)
  const oiVolSignalData = useMemo(() => {
    if (!currentAnalysis) return null;

    const OBS_START = "09:15",
      OBS_END = "15:30";
    const EXEC_START = "09:30",
      EXEC_END = "10:15";
    const TARGET_PTS = 30;

    // --- OBSERVATION WINDOW ---
    const obsMinutes = currentAnalysis.minuteComparisons.filter(
      (c) => c.time >= OBS_START && c.time <= OBS_END,
    );
    if (obsMinutes.length === 0) return null;

    // Per-minute OI/Volume ratios
    const minuteDetails = obsMinutes.map((comp) => {
      const ceOIVol =
        comp.ceData.volume > 0 ? comp.ceData.oi / comp.ceData.volume : 0;
      const peOIVol =
        comp.peData.volume > 0 ? comp.peData.oi / comp.peData.volume : 0;
      const lowerSide = ceOIVol <= peOIVol ? "CE" : "PE";
      return {
        time: formatTimeStrToAmPm(comp.time),
        rawTime: comp.time,
        ceOI: comp.ceData.oi,
        peOI: comp.peData.oi,
        ceVol: comp.ceData.volume,
        peVol: comp.peData.volume,
        ceOIVol,
        peOIVol,
        lowerSide,
        ceClose: comp.ceData.close,
        peClose: comp.peData.close,
      };
    });

    // Cumulative stats for observation window
    const totalCEVol = obsMinutes.reduce((s, c) => s + c.ceData.volume, 0);
    const totalPEVol = obsMinutes.reduce((s, c) => s + c.peData.volume, 0);
    const totalCEOI = obsMinutes.reduce((s, c) => s + c.ceData.oi, 0);
    const totalPEOI = obsMinutes.reduce((s, c) => s + c.peData.oi, 0);

    const avgCEOIVol = totalCEVol > 0 ? totalCEOI / totalCEVol : 0;
    const avgPEOIVol = totalPEVol > 0 ? totalPEOI / totalPEVol : 0;

    // THE SIGNAL: lower avg OI/Vol = direction
    const signalSide: "CE" | "PE" = avgCEOIVol <= avgPEOIVol ? "CE" : "PE";
    const otherSide: "CE" | "PE" = signalSide === "CE" ? "PE" : "CE";

    const signalOIVol = signalSide === "CE" ? avgCEOIVol : avgPEOIVol;
    const otherOIVol = signalSide === "CE" ? avgPEOIVol : avgCEOIVol;
    const oiVolDiffPct =
      otherOIVol > 0 ? ((otherOIVol - signalOIVol) / otherOIVol) * 100 : 0;

    // Minute-count: how many minutes each side had lower OI/Vol
    const ceLowerCount = minuteDetails.filter(
      (m) => m.lowerSide === "CE",
    ).length;
    const peLowerCount = minuteDetails.filter(
      (m) => m.lowerSide === "PE",
    ).length;
    const signalConsistency =
      signalSide === "CE"
        ? Math.round((ceLowerCount / minuteDetails.length) * 100)
        : Math.round((peLowerCount / minuteDetails.length) * 100);

    const signalFileName =
      signalSide === "CE"
        ? currentAnalysis.ceFileName
        : currentAnalysis.peFileName;
    const signalStrike =
      signalSide === "CE"
        ? currentAnalysis.ceStrikePrice
        : currentAnalysis.peStrikePrice;

    // --- EXECUTION WINDOW: 9:30 → 10:15 ---
    const execMinutes = currentAnalysis.minuteComparisons.filter(
      (c) => c.time >= EXEC_START && c.time <= EXEC_END,
    );

    let outcomeResult: "HIT" | "SL_FIRST" | "NO_HIT" = "NO_HIT";
    let outcomeTime: string | null = null;
    let outcomeMins: number | null = null;
    let signalMaxPts = 0;
    let otherMaxPts = 0;
    let otherHit = false;
    let otherHitTime: string | null = null;

    if (execMinutes.length > 0) {
      const firstExec = execMinutes[0];
      const signalStartPrice =
        signalSide === "CE" ? firstExec.ceData.open : firstExec.peData.open;
      const otherStartPrice =
        signalSide === "CE" ? firstExec.peData.open : firstExec.ceData.open;

      for (let i = 0; i < execMinutes.length; i++) {
        const comp = execMinutes[i];
        const signalClose =
          signalSide === "CE" ? comp.ceData.close : comp.peData.close;
        const otherClose =
          signalSide === "CE" ? comp.peData.close : comp.ceData.close;

        const signalPts = signalClose - signalStartPrice;
        const otherPts = otherClose - otherStartPrice;

        if (signalPts > signalMaxPts) signalMaxPts = signalPts;
        if (otherPts > otherMaxPts) otherMaxPts = otherPts;

        // Check if OTHER side hits 30 first (signal failure)
        if (!otherHit && otherPts >= TARGET_PTS) {
          otherHit = true;
          otherHitTime = formatTimeStrToAmPm(comp.time);
        }

        // Check if signal side hits 30
        if (outcomeResult === "NO_HIT" && signalPts >= TARGET_PTS) {
          outcomeResult = "HIT";
          outcomeTime = formatTimeStrToAmPm(comp.time);
          outcomeMins = i + 1;
          break;
        }
      }

      // If other side hit first, it's SL_FIRST scenario
      if (outcomeResult === "NO_HIT" && otherHit) {
        outcomeResult = "SL_FIRST";
      }
    }

    // --- PRICE MOVE DURING OBS WINDOW ---
    const obsFirst = obsMinutes[0];
    const obsLast = obsMinutes[obsMinutes.length - 1];
    const ceObsMove =
      ((obsLast.ceData.close - obsFirst.ceData.open) / obsFirst.ceData.open) *
      100;
    const peObsMove =
      ((obsLast.peData.close - obsFirst.peData.open) / obsFirst.peData.open) *
      100;

    return {
      // Observation
      obsWindow: `${formatTimeStrToAmPm(OBS_START)} – ${formatTimeStrToAmPm(OBS_END)}`,
      execWindow: `${formatTimeStrToAmPm(EXEC_START)} – ${formatTimeStrToAmPm(EXEC_END)}`,
      minuteDetails,
      totalCEVol,
      totalPEVol,
      totalCEOI,
      totalPEOI,
      avgCEOIVol,
      avgPEOIVol,
      ceLowerCount,
      peLowerCount,
      // Signal
      signalSide,
      otherSide,
      signalOIVol,
      otherOIVol,
      oiVolDiffPct,
      signalConsistency,
      signalFileName,
      signalStrike,
      // Observation price move
      ceObsMove,
      peObsMove,
      // Outcome
      outcomeResult,
      outcomeTime,
      outcomeMins,
      signalMaxPts,
      otherMaxPts,
      otherHit,
      otherHitTime,
      targetPts: TARGET_PTS,
    };
  }, [currentAnalysis]);

  const formatCompactNumber = (num: number): string => {
    if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
    if (num >= 100000) return (num / 100000).toFixed(2) + "L";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };
  const formatRatio = (num: number): string =>
    isFinite(num) ? num.toFixed(2) : "∞";

  const getCandleComparisonColor = (type: string): string => {
    switch (type) {
      case "CE_Bullish":
      case "Both_Bullish":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PE_Bullish":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "CE_Bearish":
      case "Both_Bearish":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "PE_Bearish":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Both_Doji":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-violet-100 text-violet-800 border-violet-200";
    }
  };

  // ==================== CHART FUNCTIONS ====================
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
      return `<div style="font-size:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><span style="font-weight:bold;font-size:13px;color:${theme === "light" ? "#000" : "#fff"}">${name} (${tf})</span><span style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">${timePart}</span></div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:4px;"><div><div style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">O</div><div style="color:${theme === "light" ? "#333" : "#fff"};font-weight:bold;">${candle.open?.toFixed(2)}</div></div><div><div style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">H</div><div style="color:${theme === "light" ? "#333" : "#fff"};font-weight:bold;">${candle.high?.toFixed(2)}</div></div><div><div style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">L</div><div style="color:${theme === "light" ? "#333" : "#fff"};font-weight:bold;">${candle.low?.toFixed(2)}</div></div><div><div style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">C</div><div style="color:${candle.close >= candle.open ? (theme === "light" ? "#16a34a" : "#22c55e") : theme === "light" ? "#dc2626" : "#ef4444"};font-weight:bold;">${candle.close?.toFixed(2)}</div></div><div><div style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">Volume</div><div style="color:${theme === "light" ? "#333" : "#fff"};font-weight:bold;">${candle.volume ? formatLargeNumber(candle.volume) : "N/A"}</div></div><div><div style="color:${theme === "light" ? "#666" : "#9ca3af"};font-size:11px;">OI</div><div style="color:${theme === "light" ? "#333" : "#fff"};font-weight:bold;">${candle.oi !== undefined ? formatLargeNumber(candle.oi) : "N/A"}</div></div></div></div>`;
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
            const hours = date.getHours(),
              minutes = date.getMinutes();
            if ((hours === 0 && minutes === 0) || chartData.length < 50)
              return formatDateOnly(time);
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
      } else {
        const seriesOptions: any = {
          color: optionColor,
          lineWidth: 1,
          priceLineVisible: false,
          priceScaleId: "right",
        };
        if (chartType === "area") {
          seriesOptions.topColor = `${optionColor}66`;
          seriesOptions.bottomColor = `${optionColor}00`;
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
      const overlay = document.createElement("div");
      overlay.style.cssText = `position:absolute;top:10px;left:10px;z-index:1000;pointer-events:none;background-color:${theme === "light" ? "rgba(255,255,255,0.95)" : "rgba(26,26,26,0.95)"};border:1px solid ${theme === "light" ? "#d1d5db" : "#4b5563"};border-radius:6px;padding:6px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.15);min-width:45%;font-family:'Roboto Mono',monospace,sans-serif;`;
      containerRef.current.style.position = "relative";
      containerRef.current.appendChild(overlay);
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
        const change = close - open,
          changePercent = (change / open) * 100;
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
      const ltpNum = optionData.results.ltp,
        slNum = optionData.results.sl,
        targetNum = optionData.results.target;
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

  useEffect(() => {
    if (!ceChartRef.current || ceChartData.aggregatedData.length === 0) return;
    if (ceChartInstanceRef.current) {
      try {
        ceChartInstanceRef.current.remove();
      } catch (e) {}
      ceChartInstanceRef.current = null;
      ceSeriesRef.current = null;
    }
    initializeChart(
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
        } catch (e) {}
        ceChartInstanceRef.current = null;
        ceSeriesRef.current = null;
      }
    };
  }, [ceChartData.aggregatedData, initializeChart]);

  useEffect(() => {
    if (!peChartRef.current || peChartData.aggregatedData.length === 0) return;
    if (peChartInstanceRef.current) {
      try {
        peChartInstanceRef.current.remove();
      } catch (e) {}
      peChartInstanceRef.current = null;
      peSeriesRef.current = null;
    }
    initializeChart(
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
        } catch (e) {}
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
        if (ceVisibleRange)
          peChartInstanceRef.current
            .timeScale()
            .setVisibleRange(ceVisibleRange);
      };
      ceChartInstanceRef.current
        .timeScale()
        .subscribeVisibleTimeRangeChange(syncTimeScale);
      return () => {
        if (ceChartInstanceRef.current)
          ceChartInstanceRef.current
            .timeScale()
            .unsubscribeVisibleTimeRangeChange(syncTimeScale);
      };
    }
  }, [syncCharts, ceChartInstanceRef.current, peChartInstanceRef.current]);

  useEffect(() => {
    return () => {
      if (ceChartInstanceRef.current) {
        try {
          ceChartInstanceRef.current.remove();
        } catch (e) {}
      }
      if (peChartInstanceRef.current) {
        try {
          peChartInstanceRef.current.remove();
        } catch (e) {}
      }
    };
  }, []);

  // ==================== RENDER FUNCTIONS ====================
  const renderUploadSection = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const fileName = isCE ? ceFileName : peFileName;
    const optionData = isCE ? ceChartData : peChartData;
    const setOptionData = isCE ? setCeChartData : setPeChartData;
    const accentCls = isCE
      ? "border-emerald-400 bg-emerald-50"
      : "border-rose-400 bg-rose-50";
    const labelCls = isCE ? "text-emerald-700" : "text-rose-700";

    return (
      <div className={`p-3 rounded-xl border-2 ${accentCls}`}>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-bold uppercase tracking-widest ${labelCls}`}
          >
            {type} Data
          </span>
          {fileName && (
            <span className="text-xs text-gray-400 truncate max-w-[140px]">
              {fileName}
            </span>
          )}
        </div>
        {optionData.aggregatedData.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-2">
              <input
                type="number"
                placeholder="Entry"
                value={optionData.ltp}
                onChange={(e) =>
                  setOptionData((prev) => ({ ...prev, ltp: e.target.value }))
                }
                className="border border-gray-300 px-2 py-1.5 rounded-lg w-full text-sm"
                step="0.01"
              />
              <input
                type="number"
                placeholder="SL"
                value={optionData.sl}
                onChange={(e) =>
                  setOptionData((prev) => ({ ...prev, sl: e.target.value }))
                }
                className="border border-gray-300 px-2 py-1.5 rounded-lg w-full text-sm"
                step="0.01"
              />
              <input
                type="number"
                placeholder="Target"
                value={optionData.target}
                onChange={(e) =>
                  setOptionData((prev) => ({ ...prev, target: e.target.value }))
                }
                className="border border-gray-300 px-2 py-1.5 rounded-lg w-full text-sm"
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
                className="border border-gray-300 px-2 py-1.5 rounded-lg w-full text-sm"
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
                className="border border-gray-300 px-2 py-1.5 rounded-lg w-full text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => drawAllLines(type)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Analyze
              </button>
              <button
                onClick={() => handleClearLines(type)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </>
        )}
        {optionData.results && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white p-2 rounded-lg border border-gray-200 text-center">
              <div className="text-gray-400 text-[10px] mb-1">Margin</div>
              <div className="font-bold text-gray-800">
                ₹
                {optionData.results.totalMargin.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-center">
              <div className="text-emerald-500 text-[10px] mb-1">
                Target P&L
              </div>
              <div className="font-bold text-emerald-600">
                +₹
                {optionData.results.totalProfit.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-200 text-center">
              <div className="text-rose-500 text-[10px] mb-1">SL P&L</div>
              <div className="font-bold text-rose-600">
                -₹
                {Math.abs(optionData.results.totalLoss).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 0 },
                )}
              </div>
            </div>
            <div className="bg-violet-50 p-2 rounded-lg border border-violet-200 text-center">
              <div className="text-violet-500 text-[10px] mb-1">Position</div>
              <div className="font-bold text-violet-700">
                {optionData.results.ltp < optionData.results.target
                  ? "LONG"
                  : "SHORT"}
              </div>
            </div>
          </div>
        )}
        {optionData.firstHit && (
          <div
            className={`mt-2 p-2 rounded-lg text-xs font-medium flex items-center gap-2 ${optionData.firstHit.level === "Target" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
          >
            {optionData.firstHit.level === "Target" ? (
              <Award className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {optionData.firstHit.level} hit at {optionData.firstHit.time}
          </div>
        )}
      </div>
    );
  };

  const renderChartContainer = (type: "CE" | "PE") => {
    const isCE = type === "CE";
    const chartRef = isCE ? ceChartRef : peChartRef;
    const optionData = isCE ? ceChartData : peChartData;
    const dotCls = isCE ? "bg-emerald-500" : "bg-rose-500";

    return (
      <div className="flex flex-col rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${dotCls}`}></div>
            <span className="font-bold text-sm text-gray-800">{type}</span>
            <span className="text-xs text-gray-400">
              {optionData.aggregatedData.length} candles
            </span>
          </div>
          {optionData.firstHit && (
            <span
              className={`text-xs font-semibold ${isCE ? "text-emerald-600" : "text-rose-600"}`}
            >
              {optionData.firstHit.level} @{" "}
              {optionData.firstHit.time.split(" ")[1]}{" "}
              {optionData.firstHit.time.split(" ")[2]}
            </span>
          )}
        </div>
        <div ref={chartRef} className="w-full h-[280px] md:h-[380px]" />
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Upload Screen */}
      {!files.length && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                CE vs PE Analyzer
              </h1>
              <p className="text-gray-500">
                Upload CE & PE CSV files for minute-by-minute analysis (9:15 AM
                – 10:15 AM)
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all mb-6 cursor-pointer ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"} ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
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
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">
                      Processing files…
                    </p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-indigo-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700 mb-1">
                      Drag & drop CSV files here
                    </p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </>
                )}
              </div>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-gray-400">
                    or load from
                  </span>
                </div>
              </div>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-5">
                {driveOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDrive(opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${drive === opt.value ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {!showDrivePicker ? (
                <>
                  <button
                    onClick={() =>
                      fetchGoogleDriveStructure(
                        drive === "upstox" ? "upstox" : "zerodha",
                      )
                    }
                    disabled={isLoadingDrive}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoadingDrive ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FolderOpen className="w-4 h-4" />
                    )}
                    {isLoadingDrive ? (
                      "Loading…"
                    ) : (
                      <>
                        {" "}
                        {drive === "upstox"
                          ? "Browse Google Upstox Drive"
                          : "Browse Google Zerodha Drive"}
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div>
                  {driveData && (
                    <FolderTree
                      data={driveData}
                      onSelectFiles={handleGoogleDriveFiles}
                      isProcessing={isProcessing}
                    />
                  )}
                  <button
                    onClick={() => {
                      setShowDrivePicker(false);
                      setDriveData(null);
                    }}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>
              )}
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-indigo-700">
                    File Naming
                  </span>
                </div>
                <p className="text-xs text-indigo-600">
                  Include <strong>CE</strong> or <strong>PE</strong> in
                  filename. Same-date files are auto-paired.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Screen */}
      {currentAnalysis && (
        <div className="p-3 md:p-5 max-w-[1400px] mx-auto">
          {/* Sticky Header */}
          <div className="bg-white rounded-xl shadow-md p-3 mb-4 sticky top-0 z-50 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {availableDates.length > 0 && (
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-200 px-3 py-2 rounded-lg bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 flex-shrink-0"
                >
                  {availableDates.map((option) => (
                    <option key={option.date} value={option.date}>
                      {option.date}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  CE:{" "}
                  {currentAnalysis.ceFileName.split("_")[1] ||
                    currentAnalysis.ceFileName}
                  {currentAnalysis.ceStrikePrice ? (
                    <span className="text-emerald-400">
                      @ {currentAnalysis.ceStrikePrice}
                    </span>
                  ) : null}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-medium">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  PE:{" "}
                  {currentAnalysis.peFileName.split("_")[1] ||
                    currentAnalysis.peFileName}
                  {currentAnalysis.peStrikePrice ? (
                    <span className="text-rose-400">
                      @ {currentAnalysis.peStrikePrice}
                    </span>
                  ) : null}
                </span>
                <button
                  onClick={clearAllFiles}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 rounded-lg text-xs transition-colors ml-auto sm:ml-0"
                >
                  <X className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Card Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(
              [
                {
                  id: "cumulative",
                  label: "9:15–9:27 Analysis",
                  icon: <Clock className="w-3.5 h-3.5" />,
                  activeCls: "bg-indigo-600 text-white shadow-md",
                },
                {
                  id: "oiVolSignal",
                  label: "📊 OI/Vol Signal + 30pt",
                  icon: <Target className="w-3.5 h-3.5" />,
                  activeCls: "bg-emerald-600 text-white shadow-md",
                },
                {
                  id: "oiDirection",
                  label: "OI Direction",
                  icon: <Layers className="w-3.5 h-3.5" />,
                  activeCls: "bg-amber-500 text-white shadow-md",
                },
                {
                  id: "thirtyPoint",
                  label: "30-Pt from 9:30",
                  icon: <Award className="w-3.5 h-3.5" />,
                  activeCls: "bg-violet-600 text-white shadow-md",
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCard(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeCard === tab.id ? tab.activeCls : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cumulative Card */}
          {activeCard === "cumulative" && cumulativeData && (
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-indigo-100">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-gray-800 text-sm">
                  First 12 Minutes{" "}
                  <span className="text-indigo-500 font-normal">
                    {cumulativeData.timeRange}
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Volume */}
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Volume
                  </div>
                  {[
                    {
                      label: "CE",
                      val: cumulativeData.ceCumulativeVolume,
                      total:
                        cumulativeData.ceCumulativeVolume +
                        cumulativeData.peCumulativeVolume,
                      cls: "bg-indigo-500",
                    },
                    {
                      label: "PE",
                      val: cumulativeData.peCumulativeVolume,
                      total:
                        cumulativeData.ceCumulativeVolume +
                        cumulativeData.peCumulativeVolume,
                      cls: "bg-rose-500",
                    },
                  ].map((row) => (
                    <div key={row.label} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          className={`font-bold ${row.label === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                        >
                          {row.label}
                        </span>
                        <span className="font-mono">
                          {formatCompactNumber(row.val)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${row.cls} rounded-full`}
                          style={{ width: `${(row.val / row.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    Leader:{" "}
                    <span
                      className={`font-bold ${cumulativeData.volumeLeader === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                    >
                      {cumulativeData.volumeLeader}
                    </span>
                  </div>
                </div>
                {/* OI */}
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <Activity className="w-3.5 h-3.5" />
                    Open Interest
                  </div>
                  {[
                    {
                      label: "CE",
                      val: cumulativeData.ceCumulativeOI,
                      total:
                        cumulativeData.ceCumulativeOI +
                        cumulativeData.peCumulativeOI,
                      cls: "bg-indigo-500",
                    },
                    {
                      label: "PE",
                      val: cumulativeData.peCumulativeOI,
                      total:
                        cumulativeData.ceCumulativeOI +
                        cumulativeData.peCumulativeOI,
                      cls: "bg-rose-500",
                    },
                  ].map((row) => (
                    <div key={row.label} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span
                          className={`font-bold ${row.label === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                        >
                          {row.label}
                        </span>
                        <span className="font-mono">
                          {formatCompactNumber(row.val)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${row.cls} rounded-full`}
                          style={{ width: `${(row.val / row.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                    Leader:{" "}
                    <span
                      className={`font-bold ${cumulativeData.oiLeader === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                    >
                      {cumulativeData.oiLeader}
                    </span>
                  </div>
                </div>
                {/* Price */}
                <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Price Change
                  </div>
                  {[
                    {
                      label: "CE",
                      change: cumulativeData.cePriceChange,
                      from: cumulativeData.ceStartPrice,
                      to: cumulativeData.ceEndPrice,
                    },
                    {
                      label: "PE",
                      change: cumulativeData.pePriceChange,
                      from: cumulativeData.peStartPrice,
                      to: cumulativeData.peEndPrice,
                    },
                  ].map((row) => (
                    <div key={row.label} className="mb-3">
                      <div className="flex justify-between items-center text-xs mb-0.5">
                        <span
                          className={`font-bold ${row.label === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                        >
                          {row.label}
                        </span>
                        <span
                          className={`font-mono font-bold ${row.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {row.change >= 0 ? "+" : ""}
                          {row.change.toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {row.from.toFixed(1)} → {row.to.toFixed(1)}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200 text-xs">
                    Leader:{" "}
                    <span
                      className={`font-bold ${cumulativeData.priceLeader === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                    >
                      {cumulativeData.priceLeader}{" "}
                      <span className="text-gray-400">
                        {cumulativeData.priceLeader === "CE"
                          ? currentAnalysis.ceFileName?.split("_")?.[1]
                          : currentAnalysis.peFileName?.split("_")?.[1]}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========= OI/VOL SIGNAL + 30PT OUTCOME CARD ========= */}
          {activeCard === "oiVolSignal" &&
            oiVolSignalData &&
            (() => {
              const d = oiVolSignalData;
              const isHit = d.outcomeResult === "HIT";
              const isSLFirst = d.outcomeResult === "SL_FIRST";
              const isNoHit = d.outcomeResult === "NO_HIT";
              const sigIsCE = d.signalSide === "CE";

              const outcomeGrad = isHit
                ? "from-emerald-50 to-green-50 border-emerald-200"
                : isSLFirst
                  ? "from-rose-50 to-red-50 border-rose-200"
                  : "from-gray-50 to-slate-50 border-gray-200";

              const outcomeBadgeCls = isHit
                ? "bg-emerald-500 text-white"
                : isSLFirst
                  ? "bg-rose-500 text-white"
                  : "bg-gray-400 text-white";

              const outcomeLabel = isHit
                ? "✅ TARGET HIT"
                : isSLFirst
                  ? "❌ OTHER SIDE HIT FIRST"
                  : "⏳ NO HIT BY 10:15 AM";

              return (
                <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-emerald-100">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-gray-800 text-sm">
                        OI/Volume Signal → 30-Point Outcome
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="px-2 py-1 bg-blue-50 border border-blue-100 rounded-lg text-blue-600 font-medium">
                        Signal: {d.obsWindow}
                      </span>
                      <span className="px-2 py-1 bg-purple-50 border border-purple-100 rounded-lg text-purple-600 font-medium">
                        Check: {d.execWindow}
                      </span>
                    </div>
                  </div>

                  {/* SIGNAL HERO ROW */}
                  <div
                    className={`rounded-2xl p-4 mb-4 bg-gradient-to-r border ${outcomeGrad} flex flex-col sm:flex-row gap-4 items-center sm:items-stretch`}
                  >
                    {/* Signal Side */}
                    <div
                      className={`flex-1 rounded-xl p-4 border-2 ${sigIsCE ? "border-indigo-400 bg-white" : "border-rose-400 bg-white"} flex flex-col justify-between`}
                    >
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
                        Signal Direction
                      </div>
                      <div
                        className={`text-4xl font-black mb-1 ${sigIsCE ? "text-indigo-600" : "text-rose-600"}`}
                      >
                        {d.signalSide}
                      </div>
                      <div className="text-xs font-medium text-gray-500 truncate">
                        {d.signalFileName.split("_")[1] || d.signalFileName}
                      </div>
                      {d.signalStrike > 0 && (
                        <div className="text-xs font-mono font-bold text-gray-600 mt-0.5">
                          Strike: {d.signalStrike}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${sigIsCE ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"}`}
                        >
                          OI/Vol: {d.signalOIVol.toFixed(2)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">
                          {d.oiVolDiffPct.toFixed(1)}% lower
                        </span>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400">
                        Consistent in {d.signalConsistency}% of obs minutes (
                        {d.signalSide === "CE"
                          ? d.ceLowerCount
                          : d.peLowerCount}
                        /{d.minuteDetails.length})
                      </div>
                    </div>

                    {/* Divider Arrow */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-2xl font-black text-gray-300">→</div>
                      <div className="text-xs text-gray-400 mt-1">9:30 AM</div>
                      <div className="text-xs text-gray-300">+30 pts?</div>
                    </div>

                    {/* Outcome Side */}
                    <div
                      className={`flex-1 rounded-xl p-4 border-2 ${isHit ? "border-emerald-400 bg-emerald-50" : isSLFirst ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-gray-50"} flex flex-col justify-between`}
                    >
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">
                        Outcome
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-sm mb-2 ${outcomeBadgeCls} w-fit`}
                      >
                        {outcomeLabel}
                      </div>
                      {isHit && (
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="text-gray-500">Reached at:</span>{" "}
                            <span className="font-bold text-emerald-700">
                              {d.outcomeTime}
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">
                              Minutes taken:
                            </span>{" "}
                            <span className="font-bold text-emerald-700">
                              {d.outcomeMins} min
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Max gain:</span>{" "}
                            <span className="font-bold text-emerald-700">
                              +{d.signalMaxPts.toFixed(1)} pts
                            </span>
                          </div>
                        </div>
                      )}
                      {isSLFirst && (
                        <div className="space-y-1">
                          <div className="text-xs text-rose-600 font-semibold">
                            Opposite side ({d.otherSide}) hit 30 pts first
                          </div>
                          {d.otherHitTime && (
                            <div className="text-xs">
                              <span className="text-gray-500">
                                Other side at:
                              </span>{" "}
                              <span className="font-bold text-rose-600">
                                {d.otherHitTime}
                              </span>
                            </div>
                          )}
                          <div className="text-xs">
                            <span className="text-gray-500">
                              Signal max reached:
                            </span>{" "}
                            <span className="font-mono">
                              {d.signalMaxPts.toFixed(1)} pts
                            </span>
                          </div>
                        </div>
                      )}
                      {isNoHit && (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">
                            Neither side reached 30 pts by 10:15 AM
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">Signal max:</span>{" "}
                            <span className="font-mono">
                              {d.signalMaxPts.toFixed(1)} pts
                            </span>
                          </div>
                          <div className="text-xs">
                            <span className="text-gray-500">
                              Other side max:
                            </span>{" "}
                            <span className="font-mono">
                              {d.otherMaxPts.toFixed(1)} pts
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OI/Volume Detail Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {/* Avg OI/Vol Comparison bar */}
                    <div className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Avg OI ÷ Volume (9:15–9:27)
                      </div>
                      <div className="text-[10px] text-gray-400 mb-3">
                        Lower value = more volume per contract = stronger
                        momentum
                      </div>
                      {[
                        {
                          label: "CE",
                          val: d.avgCEOIVol,
                          totalVol: d.totalCEVol,
                          totalOI: d.totalCEOI,
                          isSig: d.signalSide === "CE",
                        },
                        {
                          label: "PE",
                          val: d.avgPEOIVol,
                          totalVol: d.totalPEVol,
                          totalOI: d.totalPEOI,
                          isSig: d.signalSide === "PE",
                        },
                      ].map((row) => {
                        const maxVal = Math.max(d.avgCEOIVol, d.avgPEOIVol);
                        const pct = maxVal > 0 ? (row.val / maxVal) * 100 : 50;
                        return (
                          <div key={row.label} className="mb-3">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-bold ${row.label === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                                >
                                  {row.label}
                                </span>
                                {row.isSig && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                                    SIGNAL ↓
                                  </span>
                                )}
                              </div>
                              <span
                                className={`font-mono font-bold ${row.isSig ? "text-emerald-700" : "text-gray-500"}`}
                              >
                                {row.val.toFixed(3)}
                              </span>
                            </div>
                            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${row.isSig ? "bg-emerald-500" : "bg-gray-400"}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                              <span>
                                OI: {formatCompactNumber(row.totalOI)}
                              </span>
                              <span>
                                Vol: {formatCompactNumber(row.totalVol)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Minute-by-minute OI/Vol signal table */}
                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Min-by-Min OI/Vol Signal
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="min-w-full text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-2 py-1.5 text-left font-semibold text-gray-400">
                                Time
                              </th>
                              <th className="px-2 py-1.5 text-right font-semibold text-indigo-500">
                                CE OI/V
                              </th>
                              <th className="px-2 py-1.5 text-right font-semibold text-rose-500">
                                PE OI/V
                              </th>
                              <th className="px-2 py-1.5 text-center font-semibold text-gray-500">
                                Signal
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {d.minuteDetails.map((row, idx) => (
                              <tr
                                key={idx}
                                className={`hover:bg-gray-50 ${row.lowerSide === "CE" ? "bg-indigo-50/20" : "bg-rose-50/20"}`}
                              >
                                <td className="px-2 py-1.5 font-mono text-gray-600">
                                  {row.time}
                                </td>
                                <td
                                  className={`px-2 py-1.5 text-right font-mono ${row.lowerSide === "CE" ? "text-emerald-600 font-bold" : "text-indigo-500"}`}
                                >
                                  {row.ceOIVol.toFixed(2)}
                                </td>
                                <td
                                  className={`px-2 py-1.5 text-right font-mono ${row.lowerSide === "PE" ? "text-emerald-600 font-bold" : "text-rose-500"}`}
                                >
                                  {row.peOIVol.toFixed(2)}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.lowerSide === "CE" ? "bg-indigo-100 text-indigo-700" : "bg-rose-100 text-rose-700"}`}
                                  >
                                    {row.lowerSide}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                        <span>
                          CE lower:{" "}
                          <strong className="text-indigo-600">
                            {d.ceLowerCount}
                          </strong>{" "}
                          mins
                        </span>
                        <span>
                          PE lower:{" "}
                          <strong className="text-rose-600">
                            {d.peLowerCount}
                          </strong>{" "}
                          mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rule explanation */}
                  <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-3 text-xs text-emerald-800">
                    <strong>Signal Logic (same every day):</strong> During
                    9:15–9:27 AM, compute OI÷Volume for CE and PE each minute.
                    The side with the <strong>lower average OI/Volume</strong>{" "}
                    ratio is the signal direction — lower OI/Vol means more
                    volume is flowing per outstanding contract, indicating
                    stronger buying momentum. Then check from 9:30 AM open: did
                    this side gain <strong>+30 points</strong> before 10:15 AM?
                  </div>
                </div>
              );
            })()}

          {/* ========= OI DIRECTION CARD ========= */}
          {activeCard === "oiDirection" && oiDirectionData && (
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-gray-800 text-sm">
                  OI Direction Signal{" "}
                  <span className="text-amber-500 font-normal">
                    {oiDirectionData.timeRange}
                  </span>
                </h3>
                <span className="ml-auto text-xs text-gray-400">
                  Lower OI = Direction Side
                </span>
              </div>

              {/* Hero Direction Banner */}
              <div
                className={`rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${oiDirectionData.lowerOISide === "CE" ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}
              >
                <div className="text-center sm:text-left">
                  <div className="text-xs text-gray-500 mb-1">
                    Direction Signal (Lower OI Side)
                  </div>
                  <div
                    className={`text-3xl font-black ${oiDirectionData.lowerOISide === "CE" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {oiDirectionData.lowerOISide}
                    <span
                      className={`ml-2 text-base font-semibold px-2 py-0.5 rounded ${oiDirectionData.lowerOISide === "CE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {oiDirectionData.directionLabel}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {oiDirectionData.directionSideFile.split("_")[1] ||
                      oiDirectionData.directionSideFile}
                    {oiDirectionData.directionStrike ? (
                      <span className="ml-1 font-mono font-semibold">
                        Strike: {oiDirectionData.directionStrike}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {oiDirectionData.lowerOISide === "CE" ? (
                    <ArrowUp className="w-12 h-12 text-emerald-500 opacity-30" />
                  ) : (
                    <ArrowDown className="w-12 h-12 text-rose-500 opacity-30" />
                  )}
                </div>
              </div>

              {/* OI Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    OI Comparison
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-600 font-bold">
                          CE OI{" "}
                          {oiDirectionData.lowerOISide === "CE" && (
                            <span className="ml-1 text-emerald-600">
                              ← Lower
                            </span>
                          )}
                        </span>
                        <span className="font-mono">
                          {formatCompactNumber(cumulativeData!.ceCumulativeOI)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${(cumulativeData!.ceCumulativeOI / (cumulativeData!.ceCumulativeOI + cumulativeData!.peCumulativeOI)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-rose-600 font-bold">
                          PE OI{" "}
                          {oiDirectionData.lowerOISide === "PE" && (
                            <span className="ml-1 text-emerald-600">
                              ← Lower
                            </span>
                          )}
                        </span>
                        <span className="font-mono">
                          {formatCompactNumber(cumulativeData!.peCumulativeOI)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{
                            width: `${(cumulativeData!.peCumulativeOI / (cumulativeData!.ceCumulativeOI + cumulativeData!.peCumulativeOI)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 pt-1 border-t border-gray-200">
                      OI Difference:{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        {oiDirectionData.oiDiffPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volume Confirmation */}
                <div
                  className={`rounded-xl p-4 border ${oiDirectionData.volumeConfirms ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}
                >
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500">
                    Volume Confirmation
                  </div>
                  <div
                    className={`text-lg font-bold mb-1 ${oiDirectionData.volumeConfirms ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {oiDirectionData.volumeConfirms
                      ? "✓ Confirmed"
                      : "⚠ Divergence"}
                  </div>
                  <p className="text-xs text-gray-600">
                    Higher volume on{" "}
                    <strong
                      className={
                        oiDirectionData.higherVolSide === "CE"
                          ? "text-indigo-600"
                          : "text-rose-600"
                      }
                    >
                      {oiDirectionData.higherVolSide}
                    </strong>{" "}
                    side.
                    {oiDirectionData.volumeConfirms
                      ? " Aligns with OI direction signal."
                      : " Conflicts with OI direction signal — proceed with caution."}
                  </p>
                </div>
              </div>

              {/* Minute OI Trend Table */}
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Minute-by-Minute OI (Lower OI = Direction)
                </div>
                <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-500">
                          Time
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-indigo-600">
                          CE OI
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-rose-600">
                          PE OI
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500">
                          CE OI/Vol
                        </th>
                        <th className="px-3 py-2 text-right font-semibold text-gray-500">
                          PE OI/Vol
                        </th>
                        <th className="px-3 py-2 text-center font-semibold text-gray-500">
                          Signal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {oiDirectionData.minuteOITrend.map(
                        (row: any, idx: number) => (
                          <tr
                            key={idx}
                            className={`hover:bg-gray-50 ${row.lowerOI === "CE" ? "bg-emerald-50/30" : "bg-rose-50/30"}`}
                          >
                            <td className="px-3 py-1.5 font-medium text-gray-700">
                              {row.time}
                            </td>
                            <td
                              className={`px-3 py-1.5 text-right font-mono ${row.lowerOI === "CE" ? "text-emerald-600 font-bold" : "text-indigo-600"}`}
                            >
                              {formatCompactNumber(row.ceOI)}
                            </td>
                            <td
                              className={`px-3 py-1.5 text-right font-mono ${row.lowerOI === "PE" ? "text-emerald-600 font-bold" : "text-rose-600"}`}
                            >
                              {formatCompactNumber(row.peOI)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-500">
                              {formatRatio(row.ceOiToVol)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-500">
                              {formatRatio(row.peOiToVol)}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full font-semibold ${row.lowerOI === "CE" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                              >
                                {row.lowerOI}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex gap-4">
                  <span>
                    CE lower in{" "}
                    <strong className="text-indigo-600">
                      {oiDirectionData.ceLowerOICount}
                    </strong>{" "}
                    mins
                  </span>
                  <span>
                    PE lower in{" "}
                    <strong className="text-rose-600">
                      {oiDirectionData.peLowerOICount}
                    </strong>{" "}
                    mins
                  </span>
                  <span className="ml-auto font-semibold text-gray-700">
                    Dominant:{" "}
                    <span
                      className={
                        oiDirectionData.ceLowerOICount >=
                        oiDirectionData.peLowerOICount
                          ? "text-indigo-600"
                          : "text-rose-600"
                      }
                    >
                      {oiDirectionData.ceLowerOICount >=
                      oiDirectionData.peLowerOICount
                        ? "CE"
                        : "PE"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 30-Point Card */}
          {activeCard === "thirtyPoint" && thirtyPointAnalysis && (
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-4 h-4 text-violet-500" />
                <h3 className="font-bold text-gray-800 text-sm">
                  30-Point Analysis{" "}
                  <span className="text-violet-400 font-normal">
                    from 9:30 AM
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[
                  {
                    key: "CE",
                    reached: thirtyPointAnalysis.ceReached,
                    reachedAt: thirtyPointAnalysis.ceReachedAtTime,
                    minutesToReach: thirtyPointAnalysis.ceMinutesToReach,
                    maxPoints: thirtyPointAnalysis.ceMaxPoints,
                    maxTime: thirtyPointAnalysis.ceMaxTime,
                    strike: currentAnalysis.ceStrikePrice,
                    color: "indigo",
                  },
                  {
                    key: "PE",
                    reached: thirtyPointAnalysis.peReached,
                    reachedAt: thirtyPointAnalysis.peReachedAtTime,
                    minutesToReach: thirtyPointAnalysis.peMinutesToReach,
                    maxPoints: thirtyPointAnalysis.peMaxPoints,
                    maxTime: thirtyPointAnalysis.peMaxTime,
                    strike: currentAnalysis.peStrikePrice,
                    color: "rose",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-xl p-4 border-l-4 ${item.key === "CE" ? "border-indigo-500 bg-indigo-50/50" : "border-rose-500 bg-rose-50/50"}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`font-bold text-sm ${item.key === "CE" ? "text-indigo-700" : "text-rose-700"}`}
                      >
                        {item.key} — Strike {item.strike}
                      </span>
                      {item.reached && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                          ✓ Reached
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Max Points</span>
                        <span
                          className={`font-mono font-bold ${item.key === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                        >
                          +{item.maxPoints.toFixed(1)}
                        </span>
                      </div>
                      {item.reached ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Reached at</span>
                            <span className="font-semibold">
                              {item.reachedAt}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Minutes taken</span>
                            <span className="font-semibold text-violet-600">
                              {item.minutesToReach} min
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status</span>
                          <span className="font-semibold text-amber-600">
                            Not reached
                          </span>
                        </div>
                      )}
                      {item.maxTime && (
                        <div className="text-[10px] text-gray-400">
                          Peak at {item.maxTime}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {thirtyPointAnalysis.firstToReach && (
                <div
                  className={`rounded-xl p-3 text-center ${thirtyPointAnalysis.firstToReach === "CE" ? "bg-indigo-50 border border-indigo-200" : "bg-rose-50 border border-rose-200"}`}
                >
                  <span className="text-sm text-gray-600">
                    First to 30 pts:{" "}
                  </span>
                  <span
                    className={`font-bold text-base ${thirtyPointAnalysis.firstToReach === "CE" ? "text-indigo-600" : "text-rose-600"}`}
                  >
                    {thirtyPointAnalysis.firstToReach}
                  </span>
                  <span className="text-sm text-gray-500">
                    {" "}
                    at{" "}
                    {thirtyPointAnalysis.firstToReach === "CE"
                      ? thirtyPointAnalysis.ceReachedAtTime
                      : thirtyPointAnalysis.peReachedAtTime}
                  </span>
                </div>
              )}
              {!thirtyPointAnalysis.firstToReach && (
                <div className="rounded-xl p-3 text-center bg-gray-50 border border-gray-200">
                  <span className="text-sm text-gray-500">
                    Neither reached 30 points by 10:15 AM
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Minute-by-Minute Table */}
          <div className="bg-white rounded-2xl shadow-md mb-4 overflow-hidden border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-sm">
                Minute-by-Minute Comparison{" "}
                <span className="text-gray-400 font-normal">
                  (9:15 AM – 10:15 AM)
                </span>
              </h3>
              <span className="text-xs text-gray-400">
                {currentAnalysis.minuteComparisons.length} rows
              </span>
            </div>
            <div className="overflow-x-auto">
              <div className="max-h-[520px] overflow-y-auto">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-semibold text-gray-500 whitespace-nowrap">
                        Time
                      </th>
                      {/* CE cols */}
                      <th className="px-3 py-2.5 text-left font-semibold text-indigo-600 border-l border-indigo-100 whitespace-nowrap">
                        CE OHLC
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-indigo-600 whitespace-nowrap">
                        CE Vol
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-indigo-600 whitespace-nowrap">
                        CE OI
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-indigo-600 whitespace-nowrap">
                        CE OI/Vol
                      </th>
                      <th className="px-3 py-2.5 text-center font-semibold text-indigo-600 whitespace-nowrap">
                        CE Type
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-indigo-600 whitespace-nowrap">
                        CE Ret%
                      </th>
                      {/* PE cols */}
                      <th className="px-3 py-2.5 text-left font-semibold text-rose-600 border-l border-rose-100 whitespace-nowrap">
                        PE OHLC
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-rose-600 whitespace-nowrap">
                        PE Vol
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-rose-600 whitespace-nowrap">
                        PE OI
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-rose-600 whitespace-nowrap">
                        PE OI/Vol
                      </th>
                      <th className="px-3 py-2.5 text-center font-semibold text-rose-600 whitespace-nowrap">
                        PE Type
                      </th>
                      <th className="px-3 py-2.5 text-right font-semibold text-rose-600 whitespace-nowrap">
                        PE Ret%
                      </th>
                      {/* Comparison */}
                      <th className="px-3 py-2.5 text-center font-semibold text-gray-500 border-l border-gray-100 whitespace-nowrap">
                        Diff
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {currentAnalysis.minuteComparisons.map((comp, idx) => {
                      const isHighlighted =
                        comp.time >= "09:15" && comp.time <= "09:27";
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-blue-50/20 transition-colors ${isHighlighted ? "bg-amber-50/40" : comp.comparison.ceWon ? "bg-emerald-50/20" : "bg-rose-50/20"}`}
                        >
                          <td className="px-3 py-2 whitespace-nowrap font-mono font-semibold text-gray-700">
                            {formatTimeStrToAmPm(comp.time)}
                            {isHighlighted && (
                              <span className="ml-1 text-[9px] text-amber-500">
                                ●
                              </span>
                            )}
                          </td>
                          {/* CE OHLC */}
                          <td className="px-3 py-2 border-l border-indigo-50 whitespace-nowrap">
                            <div className="font-mono">
                              {comp.ceData.open.toFixed(1)} →{" "}
                              <span
                                className={`font-bold ${comp.ceData.candleType === "Bullish" ? "text-emerald-600" : comp.ceData.candleType === "Bearish" ? "text-rose-600" : "text-gray-500"}`}
                              >
                                {comp.ceData.close.toFixed(1)}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              H:{comp.ceData.high.toFixed(1)} L:
                              {comp.ceData.low.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-600 whitespace-nowrap">
                            {formatCompactNumber(comp.ceData.volume)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-600 whitespace-nowrap">
                            {formatCompactNumber(comp.ceData.oi)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`font-semibold ${comp.ceData.oiToVolumeRatio > comp.peData.oiToVolumeRatio ? "text-indigo-600" : "text-gray-500"}`}
                            >
                              {formatRatio(comp.ceData.oiToVolumeRatio)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${comp.ceData.candleType === "Bullish" ? "bg-emerald-100 text-emerald-700" : comp.ceData.candleType === "Bearish" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {comp.ceData.candleType.slice(0, 4)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`font-semibold ${comp.ceData.returnPercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                            >
                              {comp.ceData.returnPercent >= 0 ? "+" : ""}
                              {comp.ceData.returnPercent.toFixed(2)}%
                            </span>
                          </td>
                          {/* PE OHLC */}
                          <td className="px-3 py-2 border-l border-rose-50 whitespace-nowrap">
                            <div className="font-mono">
                              {comp.peData.open.toFixed(1)} →{" "}
                              <span
                                className={`font-bold ${comp.peData.candleType === "Bullish" ? "text-emerald-600" : comp.peData.candleType === "Bearish" ? "text-rose-600" : "text-gray-500"}`}
                              >
                                {comp.peData.close.toFixed(1)}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                              H:{comp.peData.high.toFixed(1)} L:
                              {comp.peData.low.toFixed(1)}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-600 whitespace-nowrap">
                            {formatCompactNumber(comp.peData.volume)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-gray-600 whitespace-nowrap">
                            {formatCompactNumber(comp.peData.oi)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`font-semibold ${comp.peData.oiToVolumeRatio > comp.ceData.oiToVolumeRatio ? "text-rose-600" : "text-gray-500"}`}
                            >
                              {formatRatio(comp.peData.oiToVolumeRatio)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-center whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${comp.peData.candleType === "Bullish" ? "bg-emerald-100 text-emerald-700" : comp.peData.candleType === "Bearish" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {comp.peData.candleType.slice(0, 4)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            <span
                              className={`font-semibold ${comp.peData.returnPercent >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                            >
                              {comp.peData.returnPercent >= 0 ? "+" : ""}
                              {comp.peData.returnPercent.toFixed(2)}%
                            </span>
                          </td>
                          {/* Comparison */}
                          <td className="px-3 py-2 border-l border-gray-100 whitespace-nowrap">
                            <div className="space-y-0.5">
                              <div>
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold border ${getCandleComparisonColor(comp.comparison.candleComparison)}`}
                                >
                                  {comp.comparison.candleComparison.replace(
                                    "_",
                                    " ",
                                  )}
                                </span>
                              </div>
                              <div className="font-mono text-[10px]">
                                <span className="text-gray-400">OI/V:</span>
                                <span
                                  className={
                                    comp.comparison.oiToVolumeDifference >= 0
                                      ? "text-indigo-600"
                                      : "text-rose-600"
                                  }
                                >
                                  {" "}
                                  {comp.comparison.oiToVolumeDifference >= 0
                                    ? "+"
                                    : ""}
                                  {formatRatio(
                                    comp.comparison.oiToVolumeDifference,
                                  )}
                                </span>
                              </div>
                              <div className="font-mono text-[10px]">
                                <span className="text-gray-400">Ret:</span>
                                <span
                                  className={
                                    comp.comparison.returnDifference >= 0
                                      ? "text-emerald-600"
                                      : "text-rose-600"
                                  }
                                >
                                  {" "}
                                  {comp.comparison.returnDifference >= 0
                                    ? "+"
                                    : ""}
                                  {comp.comparison.returnDifference.toFixed(2)}%
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
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 text-[10px] text-gray-400">
              <span>
                <span className="inline-block w-2 h-2 rounded-sm bg-amber-200 mr-1"></span>
                Highlighted rows = 9:15–9:27 AM window
              </span>
              <span>
                OI/Vol = Open Interest ÷ Volume (higher = more outstanding
                positions per trade)
              </span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-100">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Timeframe:
                  </span>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    {timeframeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTimeframe(opt.value)}
                        className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${timeframe === opt.value ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    Chart:
                  </span>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    {[
                      {
                        type: "candlestick",
                        icon: <IconChartCandle size={16} />,
                      },
                      { type: "line", icon: <IconChartLine size={16} /> },
                      { type: "area", icon: <IconChartAreaLine size={16} /> },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setChartType(opt.type as any)}
                        className={`p-1.5 transition-colors ${chartType === opt.type ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncCharts}
                    onChange={(e) => setSyncCharts(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  Sync Charts
                </label>
                <button
                  onClick={() => {
                    handleClearLines("CE");
                    handleClearLines("PE");
                  }}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                >
                  <IconRefresh size={14} />
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {renderUploadSection("CE")}
                  {renderChartContainer("CE")}
                </div>
                <div className="space-y-3">
                  {renderUploadSection("PE")}
                  {renderChartContainer("PE")}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                {[
                  { color: "bg-sky-400", label: "Entry Price" },
                  { color: "bg-rose-500", label: "Stop Loss" },
                  { color: "bg-emerald-500", label: "Target" },
                  { color: "bg-indigo-500 rounded-full", label: "CE" },
                  { color: "bg-rose-500 rounded-full", label: "PE" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 ${item.color}`}></div>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinuteAnalysisAllInOne;
