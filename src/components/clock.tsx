import { useEffect, useState } from "react";
import { useInterval } from "ahooks";
import { TimeInput } from "@heroui/react";

import { useMarket } from "@/hooks/useMarket";

/**
 * 时钟组件
 */
export default function Clock({
  showClock = true,
  onMinuteChange,
}: {
  showClock?: boolean;
  onMinuteChange?: () => void;
}) {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();

    return now.toLocaleTimeString("zh-CN", { hour12: false });
  });

  const [isPageVisibleState, setIsPageVisibleState] = useState(() => {
    return document.visibilityState === "visible";
  });
  const [activeState, setActiveState] = useState(false);

  const { isMarketOpen } = useMarket();

  useInterval(() => {
    setIsPageVisibleState(document.visibilityState === "visible");
    const now = new Date();
    const seconds = now.getSeconds();

    setActiveState(isMarketOpen());
    if (seconds === 0 && isPageVisibleState && onMinuteChange && activeState) {
      onMinuteChange();
    }

    setCurrentTime(now.toLocaleTimeString("zh-CN", { hour12: false }));
  }, 1000);

  // 当页面可见时，立即请求一次
  useEffect(() => {
    if (isPageVisibleState && onMinuteChange && activeState) {
      onMinuteChange();
    }
  }, [isPageVisibleState]);

  return (
    <>
      {showClock && (
        <div className="flex items-center gap-2">
          <div
            className={`${activeState ? "bg-green-500" : "bg-yellow-500"} h-2 w-2 rounded-full`}
          />
          <span className="min-w-16">{currentTime}</span>
        </div>
      )}
    </>
  );
}
