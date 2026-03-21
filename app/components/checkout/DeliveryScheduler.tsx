// app/components/checkout/DeliveryScheduler.tsx
import { ALL_TIME_SLOTS, timeToMinutes } from "../../services/orderService";

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

const LEAD_TIME_NOTE: Record<string, string> = {
  small: "Minimum 24 hours notice required.",
  medium: "Minimum 72 hours notice required.",
  large: "Minimum 5 days notice required.",
};

function getLeadTimeNote(totalItems: number): string {
  if (totalItems >= 8) return LEAD_TIME_NOTE.large;
  if (totalItems >= 4) return LEAD_TIME_NOTE.medium;
  return LEAD_TIME_NOTE.small;
}

function getLeadTimeHours(totalItems: number): number {
  if (totalItems >= 8) return 336;
  if (totalItems >= 4) return 168;
  return 72;
}

export function getEarliestDeliveryDate(totalItems: number): Date {
  const cutoff = new Date(Date.now() + getLeadTimeHours(totalItems) * 3600_000);
  const cutoffMins = cutoff.getHours() * 60 + cutoff.getMinutes();

  const candidate = new Date(cutoff);
  candidate.setHours(0, 0, 0, 0);

  const LAST_SLOT_MINUTES = 22 * 60;
  if (cutoffMins >= LAST_SLOT_MINUTES)
    candidate.setDate(candidate.getDate() + 1);

  return candidate;
}

function getEarliestSlotMinutes(
  totalItems: number,
  selectedDate: Date,
): number {
  const cutoff = new Date(Date.now() + getLeadTimeHours(totalItems) * 3600_000);

  const cutoffDay = new Date(cutoff);
  cutoffDay.setHours(0, 0, 0, 0);

  const selDay = new Date(selectedDate);
  selDay.setHours(0, 0, 0, 0);

  if (selDay.getTime() === cutoffDay.getTime()) {
    return cutoff.getHours() * 60 + cutoff.getMinutes();
  }
  return 0;
}

function buildCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

interface DeliverySchedulerProps {
  totalItems: number;
  earliestDate: Date;
  blockedDays: string[];
  bookedTimes: string[];
  timesLoading: boolean;
  calendarYear: number;
  calendarMonth: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (day: Date) => void;
  onTimeSelect: (slot: string) => void;
}

export default function DeliveryScheduler({
  totalItems,
  earliestDate,
  blockedDays,
  bookedTimes,
  timesLoading,
  calendarYear,
  calendarMonth,
  selectedDate,
  selectedTime,
  onPrevMonth,
  onNextMonth,
  onDayClick,
  onTimeSelect,
}: DeliverySchedulerProps) {
  const calendarDays = buildCalendarDays(calendarYear, calendarMonth);

  const isDayAvailable = (day: Date): boolean => {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return d >= earliestDate && !blockedDays.includes(key);
  };

  const isDaySelected = (day: Date): boolean =>
    !!selectedDate &&
    day.getFullYear() === selectedDate.getFullYear() &&
    day.getMonth() === selectedDate.getMonth() &&
    day.getDate() === selectedDate.getDate();

  return (
    <section className="checkout-section">
      <h2 className="checkout-section-title">Delivery Date & Time</h2>
      <p className="checkout-section-note">{getLeadTimeNote(totalItems)}</p>

      <div className="calendar-wrapper">
        <div className="calendar-nav">
          <button onClick={onPrevMonth} className="calendar-nav-btn">
            ‹
          </button>
          <span className="calendar-month-label">
            {MONTH_NAMES[calendarMonth]} {calendarYear}
          </span>
          <button onClick={onNextMonth} className="calendar-nav-btn">
            ›
          </button>
        </div>

        <div className="calendar-grid">
          {DAY_NAMES.map((d) => (
            <div key={d} className="calendar-day-name">
              {d}
            </div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const available = isDayAvailable(day);
            const selected = isDaySelected(day);
            return (
              <button
                key={day.toISOString()}
                className={`calendar-day ${available ? "available" : "unavailable"} ${selected ? "selected" : ""}`}
                onClick={() => onDayClick(day)}
                disabled={!available}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="time-slots-wrapper">
          <p className="time-slots-label">
            Select delivery time on{" "}
            <strong>
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </strong>
            :
          </p>
          {timesLoading ? (
            <p className="times-loading">Loading available times…</p>
          ) : (
            <div className="time-slots-grid">
              {ALL_TIME_SLOTS.map((slot) => {
                const slotMins = timeToMinutes(slot);
                const minMins = getEarliestSlotMinutes(
                  totalItems,
                  selectedDate,
                );
                const blocked =
                  (minMins > 0 && slotMins <= minMins) ||
                  bookedTimes.includes(slot);
                const isSelected = !blocked && selectedTime === slot;
                return (
                  <button
                    key={slot}
                    className={`time-slot ${blocked ? "blocked" : "open"} ${isSelected ? "selected" : ""}`}
                    onClick={() => !blocked && onTimeSelect(slot)}
                    disabled={blocked}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
