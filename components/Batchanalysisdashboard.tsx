"use client";
import React, { useState, useCallback, useRef, useMemo } from "react";
import * as XLSX from "xlsx";

// ==================== INTERFACES ====================
interface CandleData {
  date: string;
  time: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  oi: number;
  optionType?: "CE" | "PE";
  strikePrice?: number;
  returnPercent: number;
  timestamp: string;
  candleType: "Bullish" | "Bearish" | "Doji";
}

interface ParsedFile {
  name: string;
  data: CandleData[];
}

interface AnalysisResult {
  date: string;
  ceFile: string;
  peFile: string;
  ceStrike: number | string;
  peStrike: number | string;

  // Price Leader
  priceLeaderSide: "CE" | "PE" | null;
  priceLeaderChange: number;
  priceLeaderStrength: string;
  priceLeaderConsistency: number;

  // OI/Vol stats
  avgCEOIVol: string;
  avgPEOIVol: string;
  oiVolConsistency: number;

  // Entry details
  entryTime: string;
  entryPrice: string;
  entryStrike: number | string;
  entryFile: string;

  // Target/SL (UPDATED: Target=30, SL=30)
  target: string;
  sl: string;

  // Both sides for reference
  ceEntry: string;
  ceTarget: string;
  ceSL: string;
  peEntry: string;
  peTarget: string;
  peSL: string;

  // Hit results
  leaderHit: "TARGET" | "SL" | "NONE" | null;
  leaderHitTime: string;
  leaderMaxPts: string;

  // Other side results
  otherHit: "TARGET" | "SL" | "NONE" | null;
  otherHitTime: string;
  otherMaxPts: string;

  // Outcome
  outcome: string;

  // Observation window price moves
  cePriceMove: string;
  pePriceMove: string;
  obsMinutes: number;

  // P&L Fields (65 quantity = 1 lot)
  pnlPerPoint: number; // 65 * points
  targetPnl: number; // 65 * 30
  slPnl: number; // 65 * (-30)
  actualPnl: number; // Actual P&L based on hit
  actualPnlPerLot: string; // Formatted P&L string
}

interface Stats {
  total: number;
  targetHit: number;
  slHit: number;
  noHit: number;
  ceLeader: number;
  peLeader: number;
  winRate: string;
  totalPnl: number; // Total P&L across all trades
  avgPnlPerTrade: string; // Average P&L per trade
  bestTrade: number; // Best trade P&L
  worstTrade: number; // Worst trade P&L
}

// ==================== CONSTANTS ====================
const IST_OFFSET_SECONDS = 5.5 * 60 * 60;
const LOT_SIZE = 65; // 1 lot = 65 quantity
const TARGET_POINTS = 60; // UPDATED: 30 points target
const SL_POINTS = 15; // UPDATED: 30 points stop loss

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
  } catch {
    return 0;
  }
};

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

const formatCompactNumber = (num: number): string => {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
  if (num >= 100000) return (num / 100000).toFixed(2) + "L";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

const formatCurrency = (num: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// ==================== CSV PARSER ====================
const parseCSVContent = (text: string, fileName: string): CandleData[] => {
  const lines = text.split("\n").filter((l) => l.trim());
  if (!lines.length) return [];
  const firstLine = lines[0];
  let delimiter = ",";
  if (firstLine.includes("\t")) delimiter = "\t";
  if (firstLine.includes(";")) delimiter = ";";
  const headers = firstLine
    .split(delimiter)
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));

  let optionType: "CE" | "PE" | undefined;
  const fu = fileName.toUpperCase();
  if (fu.includes("CE") && !fu.includes("PEACE")) optionType = "CE";
  else if (fu.includes("PE")) optionType = "PE";

  let strikePrice: number | undefined;
  const strikeMatch = fileName.match(/(\d+)/g);
  if (strikeMatch) {
    const possible = strikeMatch
      .map(Number)
      .filter((n) => n > 1000 && n < 100000);
    if (possible.length) strikePrice = possible[0];
  }

  const idx = (names: string[]): number =>
    headers.findIndex((h) => names.includes(h));

  const openIdx = idx(["open", "o"]);
  const highIdx = idx(["high", "h"]);
  const lowIdx = idx(["low", "l"]);
  const closeIdx = idx(["close", "c"]);
  const volumeIdx = idx(["volume", "vol", "volumne"]);
  const oiIdx = idx(["oi", "open interest", "openinterest", "open_int"]);
  const dateIdx = idx(["date", "datetime", "timestamp"]);
  const timeIdx = idx(["time"]);

  const data: CandleData[] = [];
  let prevClose: number | null = null;

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i]
      .trim()
      .split(delimiter)
      .map((v) => v.trim().replace(/"/g, ""));

    const g = (index: number, def: string = "0"): string =>
      index >= 0 && vals[index] !== undefined ? vals[index] : def;

    let dateStr = "",
      timeStr = "09:15";
    if (dateIdx >= 0) {
      const dv = g(dateIdx, "");
      if (dv) {
        if (dv.includes(" ") || dv.includes("T")) {
          const parts = dv.split(/[\sT]/);
          dateStr = parts[0];
          if (parts[1]) timeStr = parts[1].substring(0, 5);
        } else {
          dateStr = dv;
          if (timeIdx >= 0) timeStr = g(timeIdx, "09:15").substring(0, 5);
        }
      }
    }

    const open = parseFloat(g(openIdx));
    const high = parseFloat(g(highIdx));
    const low = parseFloat(g(lowIdx));
    const close = parseFloat(g(closeIdx));
    const volume = parseFloat(g(volumeIdx));
    const oi = parseFloat(g(oiIdx));

    if (!isNaN(open) && !isNaN(high) && !isNaN(low) && !isNaN(close)) {
      const returnPercent =
        prevClose && prevClose !== 0
          ? ((close - prevClose) / prevClose) * 100
          : 0;
      prevClose = close;

      data.push({
        date: dateStr,
        time: parseDateString(`${dateStr} ${timeStr}`),
        timeStr,
        open,
        high,
        low,
        close,
        volume: volume || 0,
        oi: oi || 0,
        optionType,
        strikePrice,
        returnPercent,
        timestamp: `${dateStr} ${timeStr}`,
        candleType:
          close > open ? "Bullish" : close < open ? "Bearish" : "Doji",
      });
    }
  }
  return data;
};

// ==================== CORE ANALYSIS ENGINE ====================
const runBatchAnalysis = (allFiles: ParsedFile[]): AnalysisResult[] => {
  // Group by date and option type
  const groups: Record<
    string,
    { ce: ParsedFile | null; pe: ParsedFile | null }
  > = {};

  for (const f of allFiles) {
    if (!f.data.length) continue;
    const date = f.data[0].date;
    if (!date) continue;
    if (!groups[date]) groups[date] = { ce: null, pe: null };
    if (f.data[0].optionType === "CE") groups[date].ce = f;
    else if (f.data[0].optionType === "PE") groups[date].pe = f;
  }

  const results: AnalysisResult[] = [];

  for (const [date, { ce, pe }] of Object.entries(groups)) {
    if (!ce || !pe) continue;

    // Build minute maps
    const ceMap: Record<string, CandleData> = {};
    const peMap: Record<string, CandleData> = {};

    for (const c of ce.data) {
      if (c.timeStr) ceMap[c.timeStr] = c;
    }
    for (const c of pe.data) {
      if (c.timeStr) peMap[c.timeStr] = c;
    }

    // Observation window: 9:15 to 9:27
    type ObsMinute = { time: string; c: CandleData; p: CandleData };
    const obsMinutes: ObsMinute[] = [];

    for (const time of Object.keys({ ...ceMap, ...peMap }).sort()) {
      if (time < "09:15" || time > "09:27") continue;
      const c = ceMap[time];
      const p = peMap[time];
      if (!c || !p) continue;
      obsMinutes.push({ time, c, p });
    }

    if (!obsMinutes.length) continue;

    // ===== PRICE LEADER ANALYSIS =====
    let ceBullishMinutes = 0;
    let peBullishMinutes = 0;

    for (let i = 1; i < obsMinutes.length; i++) {
      const prev = obsMinutes[i - 1];
      const curr = obsMinutes[i];

      if (curr.c.close > prev.c.close) ceBullishMinutes++;
      if (curr.p.close > prev.p.close) peBullishMinutes++;
    }

    // Overall price change from start to end
    const firstMinute = obsMinutes[0];
    const lastMinute = obsMinutes[obsMinutes.length - 1];

    const cePriceMove = lastMinute.c.close - firstMinute.c.open;
    const pePriceMove = lastMinute.p.close - firstMinute.p.open;

    // Determine price leader
    let priceLeaderSide: "CE" | "PE" | null = null;
    let priceLeaderChange = 0;
    let priceLeaderStrength = "0%";

    if (Math.abs(cePriceMove) > Math.abs(pePriceMove)) {
      priceLeaderSide = cePriceMove > 0 ? "CE" : null;
      priceLeaderChange = cePriceMove;
      priceLeaderStrength =
        ((cePriceMove / firstMinute.c.open) * 100).toFixed(2) + "%";
    } else if (Math.abs(pePriceMove) > Math.abs(cePriceMove)) {
      priceLeaderSide = pePriceMove > 0 ? "PE" : null;
      priceLeaderChange = pePriceMove;
      priceLeaderStrength =
        ((pePriceMove / firstMinute.p.open) * 100).toFixed(2) + "%";
    }

    if (!priceLeaderSide) {
      if (cePriceMove > pePriceMove) {
        priceLeaderSide = "CE";
        priceLeaderChange = cePriceMove;
      } else {
        priceLeaderSide = "PE";
        priceLeaderChange = pePriceMove;
      }
    }

    const priceLeaderConsistency =
      priceLeaderSide === "CE"
        ? Math.round((ceBullishMinutes / (obsMinutes.length - 1)) * 100)
        : Math.round((peBullishMinutes / (obsMinutes.length - 1)) * 100);

    // OI/Vol stats
    let ceOIVolSum = 0,
      peOIVolSum = 0,
      n = 0;
    for (const { c, p } of obsMinutes) {
      const ceR = c.volume > 0 ? c.oi / c.volume : 0;
      const peR = p.volume > 0 ? p.oi / p.volume : 0;
      ceOIVolSum += ceR;
      peOIVolSum += peR;
      n++;
    }
    const avgCEOIVol = n > 0 ? ceOIVolSum / n : 0;
    const avgPEOIVol = n > 0 ? peOIVolSum / n : 0;

    let ceLower = 0;
    for (const { c, p } of obsMinutes) {
      const ceR = c.volume > 0 ? c.oi / c.volume : 0;
      const peR = p.volume > 0 ? p.oi / p.volume : 0;
      if (ceR <= peR) ceLower++;
    }
    const oiVolConsistency =
      avgCEOIVol <= avgPEOIVol
        ? Math.round((ceLower / obsMinutes.length) * 100)
        : Math.round(((obsMinutes.length - ceLower) / obsMinutes.length) * 100);

    // ===== ENTRY AT 9:30 =====
    const entry930CE = ceMap["09:26"] || ceMap["09:29"] || ceMap["09:28"];
    const entry930PE = peMap["09:26"] || peMap["09:29"] || peMap["09:28"];
    if (!entry930CE || !entry930PE) continue;

    const entryPriceCE = entry930CE.open;
    const entryPricePE = entry930PE.open;

    // UPDATED: Target=30, SL=30
    const targetCE = entryPriceCE + TARGET_POINTS;
    const slCE = entryPriceCE - SL_POINTS;
    const targetPE = entryPricePE + TARGET_POINTS;
    const slPE = entryPricePE - SL_POINTS;

    // Entry using price leader's side
    const entryPrice = priceLeaderSide === "CE" ? entryPriceCE : entryPricePE;
    const target = entryPrice + TARGET_POINTS;
    const sl = entryPrice - SL_POINTS;

    const entryStrike =
      priceLeaderSide === "CE"
        ? ce.data[0]?.strikePrice || ""
        : pe.data[0]?.strikePrice || "";
    const entryFile = priceLeaderSide === "CE" ? ce.name : pe.name;

    const otherEntryPrice =
      priceLeaderSide === "CE" ? entryPricePE : entryPriceCE;
    const otherTarget = otherEntryPrice + TARGET_POINTS;
    const otherSl = otherEntryPrice - SL_POINTS;

    // ===== CHECK HITS FROM 9:30 TO 10:15 =====
    const execTimes = Object.keys({ ...ceMap, ...peMap })
      .sort()
      .filter((t) => t >= "09:26" && t <= "13:15");

    let leaderHit: "TARGET" | "SL" | null = null;
    let leaderHitTime: string | null = null;
    let leaderMaxPts = 0;

    let otherHit: "TARGET" | "SL" | null = null;
    let otherHitTime: string | null = null;
    let otherMaxPts = 0;

    for (const time of execTimes) {
      const leaderCandle = priceLeaderSide === "CE" ? ceMap[time] : peMap[time];
      const otherCandle = priceLeaderSide === "CE" ? peMap[time] : ceMap[time];

      if (leaderCandle) {
        const pts = leaderCandle.close - entryPrice;
        if (pts > leaderMaxPts) leaderMaxPts = pts;

        if (!leaderHit) {
          if (leaderCandle.high >= target) {
            leaderHit = "TARGET";
            leaderHitTime = time;
          } else if (leaderCandle.low <= sl) {
            leaderHit = "SL";
            leaderHitTime = time;
          }
        }
      }

      if (otherCandle) {
        const pts = otherCandle.close - otherEntryPrice;
        if (pts > otherMaxPts) otherMaxPts = pts;

        if (!otherHit) {
          if (otherCandle.high >= otherTarget) {
            otherHit = "TARGET";
            otherHitTime = time;
          } else if (otherCandle.low <= otherSl) {
            otherHit = "SL";
            otherHitTime = time;
          }
        }
      }
    }

    // Calculate P&L
    const pnlPerPoint = LOT_SIZE; // 1 point = ₹65
    const targetPnl = LOT_SIZE * TARGET_POINTS; // ₹65 * 30 = ₹1,950
    const slPnl = LOT_SIZE * -SL_POINTS; // ₹65 * (-30) = -₹1,950

    let actualPnl = 0;
    if (leaderHit === "TARGET") actualPnl = targetPnl;
    else if (leaderHit === "SL") actualPnl = slPnl;
    else actualPnl = 0; // No hit = 0 P&L (no trade taken)

    // Determine outcome
    let outcome = "NO HIT";
    if (leaderHit === "TARGET") outcome = "✅ TARGET HIT (30 pts)";
    else if (leaderHit === "SL") outcome = "❌ SL HIT (30 pts loss)";
    else if (!leaderHit && otherHit === "TARGET")
      outcome = "⚠ OTHER HIT TARGET";
    else if (!leaderHit && otherHit === "SL") outcome = "⚠ OTHER HIT SL";

    results.push({
      date,
      ceFile: ce.name,
      peFile: pe.name,
      ceStrike: ce.data[0]?.strikePrice || "",
      peStrike: pe.data[0]?.strikePrice || "",

      priceLeaderSide,
      priceLeaderChange,
      priceLeaderStrength,
      priceLeaderConsistency,

      avgCEOIVol: avgCEOIVol.toFixed(3),
      avgPEOIVol: avgPEOIVol.toFixed(3),
      oiVolConsistency,

      entryTime: formatTimeStrToAmPm("09:26"),
      entryPrice: entryPrice.toFixed(2),
      entryStrike,
      entryFile,

      // UPDATED: Using new target/SL values
      target: target.toFixed(2),
      sl: sl.toFixed(2),

      ceEntry: entryPriceCE.toFixed(2),
      ceTarget: targetCE.toFixed(2),
      ceSL: slCE.toFixed(2),
      peEntry: entryPricePE.toFixed(2),
      peTarget: targetPE.toFixed(2),
      peSL: slPE.toFixed(2),

      leaderHit: leaderHit || null,
      leaderHitTime: leaderHitTime ? formatTimeStrToAmPm(leaderHitTime) : "-",
      leaderMaxPts: leaderMaxPts.toFixed(1),
      otherHit: otherHit || null,
      otherHitTime: otherHitTime ? formatTimeStrToAmPm(otherHitTime) : "-",
      otherMaxPts: otherMaxPts.toFixed(1),

      outcome,
      cePriceMove: cePriceMove.toFixed(2),
      pePriceMove: pePriceMove.toFixed(2),
      obsMinutes: obsMinutes.length,

      // P&L fields with updated values
      pnlPerPoint,
      targetPnl,
      slPnl,
      actualPnl,
      actualPnlPerLot: formatCurrency(actualPnl),
    });
  }

  return results.sort((a, b) => b.date.localeCompare(a.date));
};

// ==================== EXCEL EXPORT ====================
const exportToExcel = (results: AnalysisResult[]): void => {
  const rows = results.map((r) => ({
    Date: r.date,
    "Price Leader": r.priceLeaderSide,
    "Leader Change": r.priceLeaderChange.toFixed(2),
    "Leader Strength": r.priceLeaderStrength,
    "Leader Consistency %": r.priceLeaderConsistency,
    "CE File": r.ceFile,
    "PE File": r.peFile,
    "CE Strike": r.ceStrike,
    "PE Strike": r.peStrike,
    "CE OI/Vol": r.avgCEOIVol,
    "PE OI/Vol": r.avgPEOIVol,
    "Entry Time": r.entryTime,
    "Entry Price": r.entryPrice,
    "Entry Strike": r.entryStrike,
    "Target (30 pts)": r.target,
    "SL (30 pts)": r.sl,
    "Leader Hit": r.leaderHit || "NONE",
    "Leader Hit Time": r.leaderHitTime,
    "Leader Max Points": r.leaderMaxPts,
    "Other Hit": r.otherHit || "NONE",
    "Other Hit Time": r.otherHitTime,
    "CE Price Move": r.cePriceMove,
    "PE Price Move": r.pePriceMove,
    // P&L columns
    "P&L per Point (₹)": r.pnlPerPoint,
    "Target P&L (₹)": r.targetPnl,
    "SL P&L (₹)": r.slPnl,
    "Actual P&L (₹)": r.actualPnl,
    "Actual P&L Formatted": r.actualPnlPerLot,
    Outcome: r.outcome,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  ws["!cols"] = Object.keys(rows[0] || {}).map((k) => ({
    wch: Math.max(k.length, 14),
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Price Leader Analysis");

  // Calculate totals for summary
  const total = results.length;
  const targetHits = results.filter((r) => r.leaderHit === "TARGET").length;
  const slHits = results.filter((r) => r.leaderHit === "SL").length;
  const noHits = results.filter((r) => r.leaderHit === null).length;
  const ceLeader = results.filter((r) => r.priceLeaderSide === "CE").length;
  const peLeader = results.filter((r) => r.priceLeaderSide === "PE").length;

  // Calculate total P&L
  const totalPnl = results.reduce((sum, r) => sum + r.actualPnl, 0);
  const avgPnl = total > 0 ? totalPnl / total : 0;
  const bestTrade = Math.max(...results.map((r) => r.actualPnl));
  const worstTrade = Math.min(...results.map((r) => r.actualPnl));

  const winRate = total > 0 ? ((targetHits / total) * 100).toFixed(1) : "0.0";

  const summaryRows = [
    { Metric: "Total Dates", Value: total },
    { Metric: "Target Hit (30 pts)", Value: targetHits },
    { Metric: "SL Hit (30 pts)", Value: slHits },
    { Metric: "No Hit by 10:15", Value: noHits },
    { Metric: "Win Rate %", Value: winRate + "%" },
    { Metric: "CE Leader Days", Value: ceLeader },
    { Metric: "PE Leader Days", Value: peLeader },
    // P&L Summary
    { Metric: "Total P&L (1 lot)", Value: formatCurrency(totalPnl) },
    { Metric: "Avg P&L per Trade", Value: formatCurrency(avgPnl) },
    { Metric: "Best Trade", Value: formatCurrency(bestTrade) },
    { Metric: "Worst Trade", Value: formatCurrency(worstTrade) },
    {
      Metric: "CE Win Rate",
      Value:
        ceLeader > 0
          ? (
              (results.filter(
                (r) => r.priceLeaderSide === "CE" && r.leaderHit === "TARGET",
              ).length /
                ceLeader) *
              100
            ).toFixed(1) + "%"
          : "0%",
    },
    {
      Metric: "PE Win Rate",
      Value:
        peLeader > 0
          ? (
              (results.filter(
                (r) => r.priceLeaderSide === "PE" && r.leaderHit === "TARGET",
              ).length /
                peLeader) *
              100
            ).toFixed(1) + "%"
          : "0%",
    },
    { Metric: "Risk:Reward Ratio", Value: "1:4" },
  ];

  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(
    wb,
    `Price_Leader_Target30_SL30_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
};

// ==================== MAIN COMPONENT ====================
export default function PriceLeaderDashboard() {
  const [files, setFiles] = useState<ParsedFile[]>([]);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [filterOutcome, setFilterOutcome] = useState<string>("ALL");
  const [filterLeader, setFilterLeader] = useState<string>("ALL");
  const [sortField, setSortField] = useState<keyof AnalysisResult | "date">(
    "date",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: File[]) => {
      setIsProcessing(true);
      const parsed: ParsedFile[] = [];
      for (const file of fileList) {
        try {
          const text = await file.text();
          const data = parseCSVContent(text, file.name);
          if (data.length) {
            parsed.push({ name: file.name.replace(".csv", ""), data });
          }
        } catch (e) {
          console.error(e);
        }
      }
      const allFiles = [...files, ...parsed];
      setFiles(allFiles);
      const res = runBatchAnalysis(allFiles);
      setResults(res);
      setIsProcessing(false);
    },
    [files],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const f = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith(".csv"),
      );
      if (f.length) handleFiles(f);
    },
    [handleFiles],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFiles(Array.from(e.target.files));
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const clearAll = (): void => {
    setFiles([]);
    setResults([]);
  };

  const sort = (field: keyof AnalysisResult | "date"): void => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let r = [...results];
    if (filterOutcome !== "ALL") {
      if (filterOutcome === "TARGET")
        r = r.filter((x) => x.leaderHit === "TARGET");
      else if (filterOutcome === "SL")
        r = r.filter((x) => x.leaderHit === "SL");
      else if (filterOutcome === "NONE")
        r = r.filter((x) => x.leaderHit === null);
    }
    if (filterLeader !== "ALL")
      r = r.filter((x) => x.priceLeaderSide === filterLeader);

    r.sort((a, b) => {
      let av = a[sortField as keyof AnalysisResult] ?? "";
      let bv = b[sortField as keyof AnalysisResult] ?? "";

      if (typeof av === "string" && typeof bv === "string") {
        if (!isNaN(parseFloat(av)) && !isNaN(parseFloat(bv))) {
          av = parseFloat(av);
          bv = parseFloat(bv);
        }
      }

      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return r;
  }, [results, filterOutcome, filterLeader, sortField, sortDir]);

  // Stats with P&L
  const stats: Stats = useMemo(() => {
    const total = results.length;
    const targetHit = results.filter((r) => r.leaderHit === "TARGET").length;
    const slHit = results.filter((r) => r.leaderHit === "SL").length;
    const noHit = results.filter((r) => r.leaderHit === null).length;
    const ceLeader = results.filter((r) => r.priceLeaderSide === "CE").length;
    const peLeader = results.filter((r) => r.priceLeaderSide === "PE").length;
    const winRate = total > 0 ? ((targetHit / total) * 100).toFixed(1) : "0.0";

    // P&L calculations
    const totalPnl = results.reduce((sum, r) => sum + r.actualPnl, 0);
    const avgPnlPerTrade = total > 0 ? (totalPnl / total).toFixed(0) : "0";
    const bestTrade = Math.max(...results.map((r) => r.actualPnl));
    const worstTrade = Math.min(...results.map((r) => r.actualPnl));

    return {
      total,
      targetHit,
      slHit,
      noHit,
      ceLeader,
      peLeader,
      winRate,
      totalPnl,
      avgPnlPerTrade,
      bestTrade,
      worstTrade,
    };
  }, [results]);

  const Th = ({
    field,
    label,
    cls = "",
  }: {
    field: keyof AnalysisResult | "date";
    label: string;
    cls?: string;
  }) => (
    <th
      onClick={() => sort(field)}
      className={`px-2 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-100 whitespace-nowrap select-none ${cls}`}
    >
      {label} {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  const outcomeColor = (outcome: "TARGET" | "SL" | "NONE" | null): string => {
    if (outcome === "TARGET") return "bg-emerald-100 text-emerald-800";
    if (outcome === "SL") return "bg-rose-100 text-rose-800";
    return "bg-gray-100 text-gray-600";
  };

  const pnlColor = (pnl: number): string => {
    if (pnl > 0) return "text-emerald-600 font-bold";
    if (pnl < 0) return "text-rose-600 font-bold";
    return "text-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">P</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-sm">
              Price Leader Analysis (Target: 60 pts | SL: 15 pts | 1:4
              Risk/Reward)
            </h1>
            <p className="text-xs text-gray-400">
              1 Lot = 65 Quantity | P&L: +₹3,900 on Target / -₹975 on SL
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {results.length > 0 && (
            <>
              <button
                onClick={() => exportToExcel(results)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                ⬇ Export Excel
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-lg text-xs font-medium transition-colors"
              >
                Clear
              </button>
            </>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            + Upload CSVs
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv"
            onChange={handleInput}
            className="hidden"
          />
        </div>
      </div>

      {/* UPLOAD ZONE */}
      {!results.length && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <div
            onDragEnter={(e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
              e.preventDefault()
            }
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all
              ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30"}
              ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">
                  Processing {files.length} files…
                </p>
              </div>
            ) : (
              <>
                <div className="text-5xl mb-4">📊</div>
                <p className="font-bold text-gray-700 mb-1 text-lg">
                  Drop CE & PE CSV files
                </p>
                <p className="text-sm text-gray-400 mb-3">or click to browse</p>
                <p className="text-xs text-indigo-500 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 inline-block">
                  Target: 30 pts (₹1,950) | SL: 30 pts (-₹1,950) | 1 Lot = 65
                  Qty | 1:4 Risk/Reward
                </p>
              </>
            )}
          </div>
          <div className="mt-6 max-w-xl w-full bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">
              How it works (1:4 Risk/Reward Strategy):
            </p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li>
                ✅ <strong>Price Leader</strong>: Side with strongest positive
                move 9:15-9:27 AM
              </li>
              <li>
                ✅ <strong>Entry</strong>: Leader side at 9:30 AM open
              </li>
              <li>
                ✅ <strong>Target</strong>: +30 points (₹1,950 per lot)
              </li>
              <li>
                ✅ <strong>SL</strong>: -30 points (-₹1,950 per lot) - 1:4
                risk/reward
              </li>
              <li>
                ✅ <strong>Monitor</strong>: 9:26-10:15 AM for hit/miss
              </li>
              <li>
                ✅ <strong>P&L</strong>: Calculated for 1 lot (65 quantity) -
                ₹65 per point
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {results.length > 0 && (
        <div className="px-4 py-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
            {[
              {
                label: "Total Dates",
                val: stats.total,
                cls: "bg-white border-gray-200 text-gray-700",
              },
              {
                label: "Files Loaded",
                val: files.length,
                cls: "bg-white border-gray-200 text-gray-500",
              },
              {
                label: "✅ Target Hit",
                val: stats.targetHit,
                cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
              },
              {
                label: "❌ SL Hit",
                val: stats.slHit,
                cls: "bg-rose-50 border-rose-200 text-rose-700",
              },
              {
                label: "Win Rate",
                val: stats.winRate + "%",
                cls: "bg-indigo-50 border-indigo-200 text-indigo-700",
              },
              {
                label: "CE/PE Leaders",
                val: `${stats.ceLeader}/${stats.peLeader}`,
                cls: "bg-violet-50 border-violet-200 text-violet-700",
              },
              {
                label: "Total P&L",
                val: formatCurrency(stats.totalPnl),
                cls:
                  stats.totalPnl >= 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-rose-50 border-rose-200 text-rose-700",
              },
              {
                label: "Avg/Trade",
                val: formatCurrency(parseFloat(stats.avgPnlPerTrade)),
                cls: "bg-amber-50 border-amber-200 text-amber-700",
              },
            ].map((s, i) => (
              <div
                key={i}
                className={`rounded-xl border p-3 text-center ${s.cls}`}
              >
                <div className="text-lg font-black">{s.val}</div>
                <div className="text-[9px] font-semibold mt-0.5 opacity-70">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-3 items-center">
            <span className="text-xs text-gray-500 font-semibold">Filter:</span>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
              {["ALL", "TARGET", "SL", "NONE"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterOutcome(v)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    filterOutcome === v
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v === "TARGET"
                    ? "✅ Target"
                    : v === "SL"
                      ? "❌ SL"
                      : v === "NONE"
                        ? "⏳ No Hit"
                        : "All Outcomes"}
                </button>
              ))}
            </div>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
              {["ALL", "CE", "PE"].map((v) => (
                <button
                  key={v}
                  onClick={() => setFilterLeader(v)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    filterLeader === v
                      ? "bg-violet-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v === "ALL" ? "All Leaders" : `${v} Leader`}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-gray-400">
              {filtered.length} rows
            </span>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[65vh] overflow-y-auto">
                <table className="min-w-full text-xs border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <Th field="date" label="Date" />
                      <Th field="priceLeaderSide" label="Leader" />
                      <Th field="priceLeaderStrength" label="Strength" />
                      <Th field="priceLeaderConsistency" label="Consistency" />
                      <Th field="entryPrice" label="Entry(9:26)" />
                      <Th field="target" label="Target(60)" />
                      <Th field="sl" label="SL(15)" />
                      <Th field="leaderHit" label="Hit" />
                      <Th field="leaderHitTime" label="Hit Time" />
                      <Th field="leaderMaxPts" label="Max Pts" />
                      <Th
                        field="actualPnl"
                        label="P&L (1 Lot)"
                        cls="border-l-2 border-gray-200 bg-amber-50"
                      />
                      <Th
                        field="outcome"
                        label="Outcome"
                        cls="border-l border-gray-200"
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((r, idx) => {
                      const isTargetHit = r.leaderHit === "TARGET";
                      const isSLHit = r.leaderHit === "SL";
                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-blue-50/20 transition-colors
                            ${isTargetHit ? "bg-emerald-50/30" : isSLHit ? "bg-rose-50/20" : ""}`}
                        >
                          <td className="px-2 py-2 font-mono font-semibold text-gray-800">
                            {r.date}
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                r.priceLeaderSide === "CE"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {r.priceLeaderSide}
                            </span>
                          </td>
                          <td className="px-2 py-2 font-mono font-semibold text-emerald-600">
                            {r.priceLeaderStrength}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    r.priceLeaderConsistency >= 70
                                      ? "bg-emerald-500"
                                      : r.priceLeaderConsistency >= 50
                                        ? "bg-amber-400"
                                        : "bg-rose-400"
                                  }`}
                                  style={{
                                    width: `${r.priceLeaderConsistency}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="font-mono text-gray-600">
                                {r.priceLeaderConsistency}%
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2 font-mono font-bold text-gray-700">
                            ₹{r.entryPrice}
                          </td>
                          <td className="px-2 py-2 font-mono text-emerald-600 font-semibold">
                            ₹{r.target}
                          </td>
                          <td className="px-2 py-2 font-mono text-rose-500 font-semibold">
                            ₹{r.sl}
                          </td>
                          <td className="px-2 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${outcomeColor(r.leaderHit)}`}
                            >
                              {r.leaderHit === "TARGET"
                                ? "✅"
                                : r.leaderHit === "SL"
                                  ? "❌"
                                  : "—"}
                            </span>
                          </td>
                          <td className="px-2 py-2 font-mono text-gray-600">
                            {r.leaderHitTime}
                          </td>
                          <td
                            className={`px-2 py-2 font-mono font-semibold ${parseFloat(r.leaderMaxPts) >= 30 ? "text-emerald-600" : "text-gray-500"}`}
                          >
                            +{r.leaderMaxPts}
                          </td>
                          <td
                            className={`px-2 py-2 font-mono font-bold border-l-2 border-gray-200 bg-amber-50/30 ${pnlColor(r.actualPnl)}`}
                          >
                            {r.actualPnlPerLot}
                          </td>
                          <td className="px-2 py-2 border-l border-gray-100">
                            <span
                              className={`px-2 py-1 rounded-lg font-bold text-[11px] ${
                                isTargetHit
                                  ? "bg-emerald-100 text-emerald-700"
                                  : isSLHit
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {r.outcome.split(" ")[0]}{" "}
                              {r.outcome.split(" ")[1]}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={12}
                          className="text-center py-10 text-gray-400"
                        >
                          No results match filter
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 text-[10px] text-gray-400 flex flex-wrap gap-4">
            <span>Leader: Strongest price mover 9:15–9:27 AM</span>
            <span>
              Entry: 9:26 AM | Target: +60 pts (₹3,900) | SL: -15 pts (-₹975)
            </span>
            <span>
              1 Lot = 65 Quantity | P&L: ₹65 per point | 1:4 Risk/Reward
            </span>
            <span>Click headers to sort</span>
          </div>
        </div>
      )}
    </div>
  );
}
