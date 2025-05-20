import TradingChartPeriod from "./modules/trading-chart-period";

export default function IndexPage() {
  return (
    <section className="flex flex-col h-full pb-16 pr-20">
      <TradingChartPeriod symbol="002101" />
    </section>
  );
}
