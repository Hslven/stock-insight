import TradingChartRealTime from "@/pages/trading/modules/trading-chart-realtime";

export default function HiddenPage() {
  return (
    <section className="flex flex-col h-100vh w-full pb-16 relative ">
      <TradingChartRealTime symbol="002101" />
    </section>
  );
}
