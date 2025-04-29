// import { IChartApi, ISeriesApi } from "lightweight-charts";
// import { useMemo, useRef, useState } from "react";

// import { getMonthsAgoTimestamp } from "@/lib/utils";

// export default function useTradingChart(symbol: string) {
//   const [fq, setFq] = useState<"" | "qfq" | "hfq">("qfq");
//   const chartElementRef = useRef<HTMLDivElement>(null);
//   const chartRef = useRef<IChartApi>();
//   const candlestickSeries = useRef<ISeriesApi<"Candlestick">>();
//   const histogramSeries = useRef<any>(null);
//   const [targetTradingData, setTargetTradingData] = useState<any>(null);
//   const [monthAgo, setMonthAgo] = useState(3);

//   const params = useMemo(
//     () => ({
//       start_time: getMonthsAgoTimestamp(monthAgo),
//       symbol,
//       period,
//       adjust: fq || undefined,
//     }),
//     [monthAgo, symbol,period, fq],
//   );

//   const fqLabel = useMemo(() => {
//     switch (fq) {
//       case "qfq":
//         return "前复权";
//       case "hfq":
//         return "后复权";
//       case "":
//         return "不复权";
//       default:
//         return "";
//     }
//   }, [fq]);

//   return { fq, setFq, fqLabel };
// }
