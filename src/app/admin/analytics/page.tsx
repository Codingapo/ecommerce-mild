import { salesReport } from "@/lib/analytics";
import { SalesCharts } from "@/components/sales-charts";
import { money } from "@/lib/utils";
export default async function AnalyticsPage() {
  const end = new Date();
  end.setUTCHours(24, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 30);
  const report = await salesReport(start.toISOString(), end.toISOString());
  return (
    <>
      <p className="eyebrow">LAST 30 DAYS</p>
      <h1>A clearer picture.</h1>
      <div className="stat-grid">
        <div className="stat-card">
          <span>Paid revenue</span>
          <strong>{money(report.revenue)}</strong>
        </div>
        <div className="stat-card">
          <span>Paid orders</span>
          <strong>{report.paidOrders}</strong>
        </div>
      </div>
      <SalesCharts report={report} />
    </>
  );
}
