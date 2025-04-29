import TradingChart from "./modules/trading-chart";

export default function IndexPage() {
  return (
    <section className="flex flex-col h-full pb-16 pr-20">
      <TradingChart symbol="002101" />
    </section>
  );
}
