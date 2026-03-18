// app/components/account/ManageCalendarView.tsx
import { useState, useEffect } from "react";
import {
  subscribeToBlockedDays,
  blockDay,
  unblockDay,
  dateKey,
} from "../../services/orderService";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

const ManageCalendarView: React.FC = () => {
  const [blockedDays, setBlockedDays] = useState<string[]>([]);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBlockedDays(setBlockedDays);
    return () => unsub();
  }, []);

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const handleToggleDay = async (day: Date) => {
    const key = dateKey(day);
    setCalendarLoading(true);
    try {
      blockedDays.includes(key) ? await unblockDay(day) : await blockDay(day);
    } catch (err) {
      console.error("Failed to toggle day:", err);
    } finally {
      setCalendarLoading(false);
    }
  };

  const calendarDays = buildCalendarDays(calendarYear, calendarMonth);

  return (
    <div className="manage-calendar-view">
      <p className="calendar-manage-note">
        Click any date to block or unblock it for deliveries. Blocked dates will
        be unavailable to customers at checkout.
      </p>

      <div className="admin-cal-header">
        <button className="admin-cal-nav-btn" onClick={prevMonth}>
          ‹
        </button>

        <div className="admin-cal-month-wrapper">
          <button
            className="admin-cal-month-label"
            onClick={() => setShowMonthPicker((v) => !v)}
          >
            {MONTH_NAMES[calendarMonth]} {calendarYear}
          </button>

          {showMonthPicker && (
            <div className="admin-cal-month-picker">
              <div className="admin-cal-year-row">
                <button onClick={() => setCalendarYear((y) => y - 1)}>‹</button>
                <span>{calendarYear}</span>
                <button onClick={() => setCalendarYear((y) => y + 1)}>›</button>
              </div>
              <div className="admin-cal-month-grid">
                {MONTH_NAMES.map((name, i) => (
                  <button
                    key={name}
                    className={`admin-cal-month-option ${i === calendarMonth ? "active" : ""}`}
                    onClick={() => {
                      setCalendarMonth(i);
                      setShowMonthPicker(false);
                    }}
                  >
                    {name.slice(0, 3)}
                  </button>
                ))}
              </div>
              <button
                className="admin-cal-today-btn"
                onClick={() => {
                  const now = new Date();
                  setCalendarYear(now.getFullYear());
                  setCalendarMonth(now.getMonth());
                  setShowMonthPicker(false);
                }}
              >
                Go to Current Month
              </button>
            </div>
          )}
        </div>

        <button className="admin-cal-nav-btn" onClick={nextMonth}>
          ›
        </button>
      </div>

      <div className="admin-cal-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="admin-cal-day-name">
            {d}
          </div>
        ))}
        {calendarDays.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const key = dateKey(day);
          const isBlocked = blockedDays.includes(key);
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
          return (
            <button
              key={day.toISOString()}
              className={`admin-cal-day ${isBlocked ? "blocked" : "open"} ${isPast ? "past" : ""}`}
              onClick={() => !isPast && handleToggleDay(day)}
              disabled={calendarLoading || isPast}
              title={isBlocked ? "Click to unblock" : "Click to block"}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>

      <div className="admin-cal-legend">
        <span className="legend-item">
          <span className="legend-dot open-dot" /> Available
        </span>
        <span className="legend-item">
          <span className="legend-dot blocked-dot" /> Blocked
        </span>
        <span className="legend-item">
          <span className="legend-dot past-dot" /> Past
        </span>
      </div>
    </div>
  );
};

export default ManageCalendarView;
