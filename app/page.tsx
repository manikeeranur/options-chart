import MinuteChart from "../components/minute-chart";
import { ohlcData } from "../components/data";
import ExcelChartUploader from "@/components/excel-chart-uploader";

export default function Page() {
  return (
    <div className="tw-p-6 ">
      <ExcelChartUploader />
      {/* <MinuteChart data={ohlcData} /> */}
    </div>
  );
}
