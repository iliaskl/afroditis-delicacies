// app/components/account/AnalyticsView.tsx
import { useState, useEffect } from "react";
import { getAnalytics } from "../../services/analyticsService";
import type { AnalyticsData } from "../../services/analyticsService";

const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  if (analyticsLoading)
    return <p className="empty-state">Loading analytics...</p>;
  if (!analytics)
    return <p className="empty-state">Could not load analytics.</p>;

  return (
    <div className="analytics-view">
      <div className="analytics-grid-2">
        <div className="analytics-card analytics-card-green">
          <span className="analytics-label">Revenue This Month</span>
          <span className="analytics-value">
            ${analytics.revenueThisMonth.toFixed(2)}
          </span>
        </div>
        <div className="analytics-card analytics-card-blue">
          <span className="analytics-label">Avg Order Value</span>
          <span className="analytics-value">
            ${analytics.averageOrderValue.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="analytics-card analytics-card-gold">
        <span className="analytics-label">Orders This Month</span>
        <span className="analytics-value">{analytics.ordersThisMonth}</span>
        <span className="analytics-sublabel">
          vs {analytics.ordersLastMonth} last month
          {analytics.ordersLastMonth > 0 && (
            <span
              className={
                analytics.ordersThisMonth >= analytics.ordersLastMonth
                  ? "analytics-up"
                  : "analytics-down"
              }
            >
              {" "}
              {analytics.ordersThisMonth >= analytics.ordersLastMonth
                ? "▲"
                : "▼"}{" "}
              {Math.abs(analytics.ordersThisMonth - analytics.ordersLastMonth)}
            </span>
          )}
        </span>
      </div>

      <div className="analytics-section">
        <h4 className="analytics-section-title">Order Status Breakdown</h4>
        <div className="analytics-status-grid">
          {(["pending", "active", "delivered", "declined"] as const).map(
            (s) => (
              <div
                key={s}
                className={`analytics-status-pill analytics-status-${s}`}
              >
                <span className="analytics-status-count">
                  {analytics.statusBreakdown[s]}
                </span>
                <span className="analytics-status-name">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      {analytics.topDishes.length > 0 && (
        <div className="analytics-section">
          <h4 className="analytics-section-title">Most Popular Dishes</h4>
          <div className="analytics-bar-list">
            {analytics.topDishes.map((d, i) => (
              <div key={d.name} className="analytics-bar-row">
                <span className="analytics-bar-rank">#{i + 1}</span>
                <span className="analytics-bar-label">{d.name}</span>
                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill"
                    style={{
                      width: `${(d.count / analytics.topDishes[0].count) * 100}%`,
                    }}
                  />
                </div>
                <span className="analytics-bar-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.busiestDays.length > 0 && (
        <div className="analytics-section">
          <h4 className="analytics-section-title">Busiest Delivery Days</h4>
          <div className="analytics-bar-list">
            {analytics.busiestDays.map((d, i) => (
              <div key={d.day} className="analytics-bar-row">
                <span className="analytics-bar-rank">#{i + 1}</span>
                <span className="analytics-bar-label">{d.day}</span>
                <div className="analytics-bar-track">
                  <div
                    className="analytics-bar-fill"
                    style={{
                      width: `${(d.count / analytics.busiestDays[0].count) * 100}%`,
                    }}
                  />
                </div>
                <span className="analytics-bar-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
