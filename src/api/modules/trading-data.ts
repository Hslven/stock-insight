import { alovaInstance } from "@/api";

const baseURL = import.meta.env.VITE_BASE_URL;

export interface ITradingHistoryProps {
  /**
   * 开始时间
   */
  start_time: number;
  /**
   * 时间段
   */
  period: "daily" | "weekly" | "monthly";
  symbol: string;
  /**
   * 复权
   */
  adjust?: "qfq" | "hfq";
  end_time?: number;
}

export const getTradingHistoryData = (
  params: ITradingHistoryProps,
): Promise<ResultData<BaseAkShareData[]>> => {
  return alovaInstance.Get(`${baseURL}/trading/history`, { params });
};

export const getTradingRealTimeData = (params: {
  symbol: string;
}): Promise<ResultData<any[]>> => {
  return alovaInstance.Get(`${baseURL}/trading/realtime`, { params });
};
