import http from "@/api";
const baseURL = import.meta.env.VITE_BASE_URL;

export interface ITradingHistoryProps {
  start_time: number;
  period: "daily" | "weekly" | "monthly";
  symbol: string;
  adjust?: "qfq" | "hfq";
  end_time?: number;
}

export const getTradingHistoryData = (
  params: ITradingHistoryProps,
): Promise<ResultData<BaseAkShareData[]>> => {
  return http.get(`${baseURL}/trading/history`, params);
};
