import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
} from "lightweight-charts";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Tabs,
  Tab,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

import { Datafeed } from "./trading/data-feed";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef<boolean>(false);
  const [fq, setFq] = useState<"" | "qfq" | "hfq">("qfq");
  const [activeChart, setActiveChart] = useState("realTime");

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

  useEffect(() => {
    if (mounted.current) {
      return;
    }
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, chartOptions);
      const histogramSeries = chart.addSeries(HistogramSeries, {
        color: "#26a69a",
        // priceScaleId: "",
        // priceFormat: {
        //   type: "volume",
        // },
        // base: -100,
      });

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      // histogramSeries.setData([
      //   { value: 1, time: "2022-01-17" },
      //   { value: 8, time: "2022-01-18" },
      //   { value: 10, time: "2022-01-19" },
      //   { value: 20, time: "2022-01-20" },
      //   { value: 3, time: "2022-01-21", color: "red" },
      //   { value: 43, time: "2022-01-22" },
      //   { value: 41, time: "2022-01-23", color: "red" },
      //   { value: 43, time: "2022-01-24" },
      //   { value: 56, time: "2022-01-25" },
      //   { value: 46, time: "2022-01-26", color: "red" },
      // ]);

      // candlestickSeries.setData([
      //   {
      //     time: "2022-01-17",
      //     open: 75.16,
      //     high: 82.84,
      //     low: 36.16,
      //     close: 45.72,
      //   },
      //   {
      //     time: "2022-01-18",
      //     open: 45.12,
      //     high: 53.9,
      //     low: 45.12,
      //     close: 48.09,
      //   },
      //   {
      //     time: "2022-01-19",
      //     open: 60.71,
      //     high: 60.71,
      //     low: 53.39,
      //     close: 59.29,
      //   },
      //   {
      //     time: "2022-01-20",
      //     open: 68.26,
      //     high: 68.26,
      //     low: 59.04,
      //     close: 60.5,
      //   },
      //   {
      //     time: "2022-01-21",
      //     open: 67.71,
      //     high: 105.85,
      //     low: 66.67,
      //     close: 91.04,
      //   },
      //   {
      //     time: "2022-01-22",
      //     open: 91.04,
      //     high: 121.4,
      //     low: 82.7,
      //     close: 111.4,
      //   },
      //   {
      //     time: "2022-01-23",
      //     open: 111.51,
      //     high: 142.83,
      //     low: 103.34,
      //     close: 131.25,
      //   },
      //   {
      //     time: "2022-01-24",
      //     open: 131.33,
      //     high: 151.17,
      //     low: 77.68,
      //     close: 96.43,
      //   },
      //   {
      //     time: "2022-01-25",
      //     open: 106.33,
      //     high: 110.2,
      //     low: 90.39,
      //     close: 98.1,
      //   },
      //   {
      //     time: "2022-01-26",
      //     open: 109.87,
      //     high: 114.69,
      //     low: 85.66,
      //     close: 111.26,
      //   },
      // ]);

      const datafeed = new Datafeed();

      const data = datafeed.getBars(10);
      const volume = datafeed.getVolumeBars(10);

      candlestickSeries.setData(data);
      // histogramSeries.setData(volume);

      chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
        console.log("[ logicalRange ] >", logicalRange);
        if (!logicalRange) return;
        if (logicalRange.from < 10) {
          // load more data
          const numberBarsToLoad = 50 - logicalRange.from;
          const data = datafeed.getBars(numberBarsToLoad);
          // const volumeData = datafeed.getVolumeBars(numberBarsToLoad);

          setTimeout(() => {
            candlestickSeries.setData(data);
            // histogramSeries.setData(volumeData);
          }, 250); // add a loading delay
        }
      });

      chart.subscribeCrosshairMove((param) => {
        if (!param || !param.seriesData) return;

        const seriesData = param.seriesData.get(candlestickSeries);

        if (seriesData) {
          console.log("当前数据点：", seriesData);
        }
      });

      chart.timeScale().fitContent();

      return () => {
        chart.remove();
      };
    }

    mounted.current = true;
  });

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

  const DropdownContent = () => (
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

  return (
    <DefaultLayout>
      {/* <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10"> */}
      <section className="flex flex-col h-full pb-16 pr-20">
        <div className="flex">
          <Tabs
            aria-label="Options"
            radius="none"
            selectedKey={activeChart}
            variant="solid"
            onSelectionChange={(key) => setActiveChart(key as string)}
          >
            <Tab key="realTime" title="分时图" />
            <Tab key="day" title="日K线" />
            <Tab key="week" title="周K线" />
            <Tab key="month" title="月K线" />
          </Tabs>
          {activeChart !== "realTime" && <DropdownContent />}
        </div>
        <div ref={chartContainerRef} className="w-full " style={{ flex: 1 }} />
      </section>
    </DefaultLayout>
  );
}
