"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as LightweightCharts from "lightweight-charts";

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

// Helper function to format time with seconds for hover display
const formatToISTWithSeconds = (timestamp: number): string => {
  const date = new Date((timestamp + IST_OFFSET_SECONDS) * 1000);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

// NEW: Helper function to format date with time for hover display
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

// NEW: Helper function to format date only for x-axis
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

  const [ohlcValues, setOhlcValues] = useState<OHLCValues | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showVolume, setShowVolume] = useState(false);
  const [chartType, setChartType] = useState<"candlestick" | "line" | "area">(
    "candlestick",
  );

  // Store last candle data
  const [lastCandle, setLastCandle] = useState<OHLCValues | null>(null);

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
            time: dateStr, // Use full date-time string for last candle
          });
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }
    }

    return formattedData;
  }, [data]);

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
        // FIX: Set right offset to show only data, not empty intervals
        rightOffset: 0,
        barSpacing: 6, // Adjust spacing between bars
        minBarSpacing: 1, // Minimum spacing
        fixLeftEdge: true,
        fixRightEdge: true,
        // X-axis labels - show IST time without seconds
        // tickMarkFormatter: (time: number) => {
        //   return formatToIST(time);
        // },
        // NEW: Show date when zoomed out
        tickMarkFormatter: (time: number, tickMarkType: any) => {
          // When zoomed out (showing multiple days), show date
          // When zoomed in (intraday), show time
          const date = new Date((time + IST_OFFSET_SECONDS) * 1000);
          const hours = date.getHours();
          const minutes = date.getMinutes();

          // If time is exactly at midnight (00:00) or we have very few bars, show date
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
      // Localization for tooltips
      localization: {
        // NEW: Show full date-time in hover tooltip
        timeFormatter: (time: number) => {
          return formatDateWithTime(time);
        },
        dateFormat: "dd-MMM-yyyy", // Date format
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

      // Set candlestick data
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
      // Create line or area series
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

      // Set line data (use close prices)
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

      console.log("Chart data range:", {
        firstCandle: formatDateWithTime(firstTime),
        lastCandle: formatDateWithTime(lastTime),
        totalCandles: formattedData.length,
      });

      // Set visible range to show all data without empty spaces
      chart.timeScale().setVisibleRange({
        from: firstTime,
        to: lastTime,
      });

      // Fit content to remove empty spaces
      setTimeout(() => {
        chart.timeScale().fitContent();
      }, 100);
    }

    // Handle crosshair for OHLC display
    chart.subscribeCrosshairMove((param: any) => {
      if (!param.time || param.seriesData.size === 0) {
        setOhlcValues(null);
        return;
      }

      const candleData = param.seriesData.get(series);
      if (!candleData) {
        setOhlcValues(null);
        return;
      }

      let open = 0,
        high = 0,
        low = 0,
        close = 0;

      if (chartType === "candlestick") {
        ({ open, high, low, close } = candleData);
      } else {
        // For line/area charts, use the value for all OHLC
        const value = candleData.value;
        open = high = low = close = value;
      }

      // Use the new date-time format for hover
      const timeStr = formatDateWithTime(param.time);

      setOhlcValues({
        open,
        high,
        low,
        close,
        time: timeStr,
      });
    });

    // Draw existing lines if they exist
    if (ltp || sl || target) {
      drawAllLines();
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
        // Fit content again on resize
        setTimeout(() => {
          chart.timeScale().fitContent();
        }, 50);
      }
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data, theme, formatData, chartType, showVolume]);

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
      ltpLineRef.current = candleSeriesRef.current.createPriceLine({
        price: Number(ltp),
        color: "#00BFFF", // Sky blue color
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: "LTP",
        axisLabelColor: "#00BFFF",
      });
    }

    // Draw SL line
    if (sl && !isNaN(Number(sl))) {
      slLineRef.current = candleSeriesRef.current.createPriceLine({
        price: Number(sl),
        color: theme === "light" ? "#dc2626" : "#ef4444",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: "SL",
      });
    }

    // Draw Target line
    if (target && !isNaN(Number(target))) {
      targetLineRef.current = candleSeriesRef.current.createPriceLine({
        price: Number(target),
        color: theme === "light" ? "#16a34a" : "#22c55e",
        lineWidth: 1,
        lineStyle: LightweightCharts.LineStyle.Solid,
        axisLabelVisible: true,
        title: "Target",
      });
    }
  };

  // Handle Apply Lines button click
  const handleDrawLines = () => {
    drawAllLines();
  };

  // Clear all lines
  const handleClearLines = () => {
    setLtp("");
    setSl("");
    setTarget("");

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

  // Handle Enter key press in input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDrawLines();
    }
  };

  // Determine what to display
  const displayData = ohlcValues || lastCandle;
  const displayTime = ohlcValues
    ? ohlcValues.time
    : lastCandle
      ? lastCandle.time
      : "";

  return (
    <div className="relative w-full">
      {/* Controls */}
      <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 shadow z-20">
        {/* Left side: LTP/SL/Target inputs */}
        <div className="flex gap-3 items-center">
          {/* LTP Input */}
          <div className="relative">
            <input
              type="number"
              placeholder="LTP"
              value={ltp}
              onChange={(e) => setLtp(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-blue-300"
            />
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-[#00BFFF]"></div>
          </div>

          {/* SL Input */}
          <div className="relative">
            <input
              type="number"
              placeholder="Stop Loss"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-red-300"
            />
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-red-500"></div>
          </div>

          {/* Target Input */}
          <div className="relative">
            <input
              type="number"
              placeholder="Target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1 rounded w-28 focus:ring-2 focus:ring-green-300"
            />
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-3 h-3 rounded-full bg-green-500"></div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleDrawLines}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded whitespace-nowrap"
            >
              Apply Lines
            </button>
            <button
              onClick={handleClearLines}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded whitespace-nowrap"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Right side: Chart controls */}
        <div className="flex items-center gap-3">
          {/* OHLC Display */}
          <div className="flex gap-4 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-md text-[12px]">
            {["Open", "High", "Low", "Close"].map((label) => (
              <div key={label} className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {label}
                </div>
                <div className="font-bold dark:text-white">
                  {displayData ? (
                    <>
                      {displayData?.[
                        label.toLowerCase() as keyof OHLCValues
                      ]?.toFixed(2)}
                    </>
                  ) : (
                    0
                  )}
                </div>
              </div>
            ))}
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Date & Time
              </div>
              <div className="font-bold dark:text-white text-[11px]">
                {displayTime || "No data"}
              </div>
            </div>
          </div>

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
          <span className="dark:text-white">LTP (Sky Blue)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-red-500"></div>
          <span className="dark:text-white">Stop Loss (Red)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-green-500"></div>
          <span className="dark:text-white">Target (Green)</span>
        </div>
      </div>
    </div>
  );
};

export default MinuteChart;
