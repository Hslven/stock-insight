import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";

import TradingChartPeriod from "./trading-chart-period";
import TradingChartRealTime from "./trading-chart-realtime";

export default function TradingView() {
  const [activePeriod, setActivePeriod] = useState<
    "realTime" | "daily" | "weekly" | "monthly"
  >("realTime");

  // const [tradingHistory, setTradingHistory] = useState<BaseTradingData[]>();
  // const tradingHistoryRef = useRef<BaseTradingData[]>();

  return (
    <>
      <div className="flex items-end justify-between whitespace-nowrap absolute right-[6rem] top-2">
        <div className="flex baseline gap-2">
          <Tabs
            aria-label="Options"
            radius="none"
            selectedKey={activePeriod}
            variant="solid"
            onSelectionChange={(key) =>
              setActivePeriod(
                key as "realTime" | "daily" | "weekly" | "monthly",
              )
            }
          >
            <Tab key="realTime" title="分时图" />
            <Tab key="daily" title="日K线" />
            <Tab key="weekly" title="周K线" />
            <Tab key="monthly" title="月K线" />
          </Tabs>
        </div>
      </div>
      {activePeriod !== "realTime" && (
        <TradingChartPeriod period={activePeriod} symbol="002101" />
      )}
      {activePeriod === "realTime" && <TradingChartRealTime symbol="002101" />}
    </>
  );
}

/* 
function DropdownContent({
  fq,
  setFq,
}: {
  fq: "" | "qfq" | "hfq";
  setFq: (key: typeof fq) => void;
  fqLabel: string;
}) {
  const fqLabel = useMemo(() => {
    switch (fq) {tradingData
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
  

*/
