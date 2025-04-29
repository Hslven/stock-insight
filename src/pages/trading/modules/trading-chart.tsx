import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";
import { Tabs, Tab } from "@heroui/react";
import { useDebounceFn, useMount, useRequest } from "ahooks";

import { getTradingHistoryData } from "@/api/modules/trading-data";
import { transformAkShareDataToTradingChart } from "@/lib/transformData";
import { getMonthsAgoTimestamp, getWeekday } from "@/lib/utils";

function DropdownContent({
  fq,
  setFq,
}: {
  fq: "" | "qfq" | "hfq";
  setFq: (key: typeof fq) => void;
  fqLabel: string;
}) {
  const fqLabel = useMemo(() => {
    switch (fq) {
      case "qfq":
        return "前复权";
      case "hfq":
        return "后复权";
      case "":
        return "不复权";
      default:
        return "";
    }
  }, [fq]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button radius="none" variant="flat">
          {fqLabel}
        </Button>
      </DropdownTrigger>
      <DropdownMenu onAction={(key) => setFq(key as "" | "qfq" | "hfq")}>
        <DropdownItem key="qfq">前复权</DropdownItem>
        <DropdownItem key="hfq">后复权</DropdownItem>
        <DropdownItem key="">不复权</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}

export default function TradingView({ symbol }: { symbol: string }) {
  const chartElementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi>();
  const candlestickSeries = useRef<ISeriesApi<"Candlestick">>();
  const histogramSeries = useRef<ISeriesApi<"Histogram">>();
  const [fq, setFq] = useState<"" | "qfq" | "hfq">("qfq");

  const [activeChart, setActiveChart] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");
  const [targetTradingData, setTargetTradingData] = useState<{
    close: number;
    high: number;
    low: number;
    open: number;
    time: string;
  }>({
    close: 0,
    high: 0,
    low: 0,
    open: 0,
    time: "",
  });
  const [tradingHistory, setTradingHistory] = useState<BaseTradingData[]>();
  // const tradingHistoryRef = useRef<BaseTradingData[]>();

  const [monthAgo, setMonthAgo] = useState(3);

  const params = useMemo(() => {
    return {
      start_time: getMonthsAgoTimestamp(monthAgo),
      period: activeChart,
      symbol: symbol,
      adjust: fq || undefined,
    };
  }, [monthAgo, activeChart, symbol, fq]);

  const { run: setMonthAgoDebounce } = useDebounceFn(
    (month: number) => {
      setMonthAgo((prev) => prev + month);
    },
    { wait: 500 },
  );

  useRequest(() => getTradingHistoryData(params), {
    refreshDeps: [monthAgo, activeChart, symbol, fq],
    debounceWait: 300,
    onSuccess: ({ data }) => {
      const akData = transformAkShareDataToTradingChart(data);

      setTradingHistory(akData);
      candlestickSeries.current?.setData(akData);
      // chartRef.current?.timeScale().fitContent();
      // chartRef.current?.timeScale().setVisibleLogicalRange(vr);
    },
  });

  const chartOptions = {
    layout: {
      textColor: "black",
      background: {
        type: ColorType.Solid,
        color: "#ffffff",
      },
    },
    autoSize: true,
    localization: {
      dateFormat: "yyyy-MM-dd",
    },
  };

  useMount(() => {
    if (chartRef.current || !chartElementRef.current) {
      return;
    }

    chartRef.current = createChart(chartElementRef.current, chartOptions);
    histogramSeries.current = chartRef.current.addSeries(HistogramSeries, {
      color: "#26a69a",
    });

    candlestickSeries.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartRef.current?.subscribeCrosshairMove((param: any) => {
      if (!param || !param.seriesData) return;

      const seriesData = param.seriesData.get(candlestickSeries.current);

      if (seriesData) {
        // console.log("当前数据点：", seriesData);
        // setTargetTradingData(seriesData);
      }
    });

    const handleRangeChange = (
      logicalRange: { from: number; to: number } | null,
    ) => {
      console.log(logicalRange);
      if (!logicalRange || logicalRange.from >= 0) return;
      const month = Math.ceil((logicalRange?.from ?? 1) / 10);

      setMonthAgoDebounce(Math.abs(month));
    };

    chartRef.current
      ?.timeScale()
      .subscribeVisibleLogicalRangeChange(handleRangeChange);
    // chartRef.current
    //   .timeScale()
    //   .subscribeVisibleLogicalRangeChange(
    //     handleRangeChange
    //   );

    return () => {
      chartRef.current
        ?.timeScale()
        ?.unsubscribeVisibleLogicalRangeChange(handleRangeChange);
    };
  });

  return (
    <>
      <div className="flex">
        <button className="cursor-pointer">{params.start_time}run</button>
        <Tabs
          aria-label="Options"
          radius="none"
          selectedKey={activeChart}
          variant="solid"
          onSelectionChange={(key) =>
            setActiveChart(key as "daily" | "weekly" | "monthly")
          }
        >
          <Tab key="realTime" title="分时图" />
          <Tab key="daily" title="日K线" />
          <Tab key="weekly" title="周K线" />
          <Tab key="monthly" title="月K线" />
        </Tabs>
        {/* {activeChart !== "realTime" && <DropdownContent />} */}
      </div>
      <div className="flex h-full relative">
        <div className="absolute z-10 text-black flex">
          {/* {activeChart !== "realTime" && (
          )} */}
          <div className="flex gap-2">
            {/* ? 这里getWeekday会很消耗性能吗，我怎么判断他消不消耗性能呢，是不是存到 map 里好一点 */}
            <span>{`${targetTradingData.time}-${getWeekday(targetTradingData.time)}`}</span>
            <span>{`O:${targetTradingData.open}`}</span>
            <span>{`H:${targetTradingData.high}`}</span>
            <span>{`L:${targetTradingData.low}`}</span>
            <span>{`C:${targetTradingData.close}`}</span>
          </div>
        </div>
        <div ref={chartElementRef} className="w-full max-h-[900px]" />
      </div>
    </>
  );
}
