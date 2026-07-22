import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getPublicAvailability } from "../../api/apiPublicAvailability";

const WEEKDAY_LABELS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

const addMonthsClamped = (date, amount) => {
  const targetMonth = new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
  );
  const lastDayOfTargetMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    Math.min(date.getDate(), lastDayOfTargetMonth),
  );
};

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatTime = (value) => value?.slice(0, 5) || "";

const formatMonth = (date) =>
  new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(date);

const formatDay = (date) =>
  new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(date);

const isSameMonth = (firstDate, secondDate) =>
  firstDate.getFullYear() === secondDate.getFullYear() &&
  firstDate.getMonth() === secondDate.getMonth();

const getCalendarDays = (month) => {
  const firstDay = startOfMonth(month);
  const lastDay = endOfMonth(month);
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: lastDay.getDate() }, (_, index) =>
    new Date(month.getFullYear(), month.getMonth(), index + 1),
  );

  return [...Array(leadingEmptyDays).fill(null), ...days];
};

const AvailabilityRanges = ({ ranges, compact = false }) => {
  if (ranges.length === 0) {
    return (
      <span className="text-xs text-white/35">
        Brak wolnych godzin
      </span>
    );
  }

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "mt-3 space-y-1.5"}>
      {ranges.map((range) => (
        <span
          key={`${range.startTime}-${range.endTime}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-100"
        >
          <Clock3 aria-hidden="true" size={12} />
          {formatTime(range.startTime)}–{formatTime(range.endTime)}
        </span>
      ))}
    </div>
  );
};

const PublicAvailabilityCalendar = () => {
  const [today] = useState(() => startOfDay(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const maximumDate = useMemo(
    () => addMonthsClamped(today, 3),
    [today],
  );

  const minimumMonth = startOfMonth(today);
  const maximumMonth = startOfMonth(maximumDate);

  useEffect(() => {
    let isMounted = true;

    const fetchAvailability = async () => {
      const requestedStart = isSameMonth(selectedMonth, today)
        ? today
        : startOfMonth(selectedMonth);
      const requestedEnd = isSameMonth(selectedMonth, maximumDate)
        ? maximumDate
        : endOfMonth(selectedMonth);

      setIsLoading(true);
      setLoadError("");

      try {
        const response = await getPublicAvailability(
          formatLocalDate(requestedStart),
          formatLocalDate(requestedEnd),
        );

        if (isMounted) {
          setAvailability(Array.isArray(response) ? response : []);
        }
      } catch (error) {
        if (isMounted) {
          setAvailability([]);
          setLoadError(
            error.response?.data?.message ||
              "Nie udało się pobrać dostępnych terminów.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [maximumDate, reloadKey, selectedMonth, today]);

  const availabilityByDate = useMemo(
    () =>
      new Map(
        availability.map((day) => [day.date, day.availableRanges || []]),
      ),
    [availability],
  );

  const calendarDays = useMemo(
    () => getCalendarDays(selectedMonth),
    [selectedMonth],
  );

  const availableDays = useMemo(
    () =>
      availability
        .filter((day) => day.availableRanges?.length > 0)
        .sort((firstDay, secondDay) =>
          firstDay.date.localeCompare(secondDay.date),
        ),
    [availability],
  );

  const canGoToPreviousMonth = !isSameMonth(selectedMonth, minimumMonth);
  const canGoToNextMonth = !isSameMonth(selectedMonth, maximumMonth);

  const showPreviousMonth = () => {
    if (canGoToPreviousMonth) {
      setSelectedMonth((currentMonth) => addMonths(currentMonth, -1));
    }
  };

  const showNextMonth = () => {
    if (canGoToNextMonth) {
      setSelectedMonth((currentMonth) => addMonths(currentMonth, 1));
    }
  };

  return (
    <section className="mt-14 sm:mt-20" aria-labelledby="availability-heading">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-[var(--gold)]/60" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
            Wolne terminy
          </p>
          <span className="h-px w-8 bg-[var(--gold)]/60" />
        </div>
        <h2
          id="availability-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
        >
          Sprawdź dostępność Atelier
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
          Kalendarz ma charakter informacyjny. Wybierz dogodny termin,
          a następnie skontaktuj się ze stylistką — ostateczna godzina wizyty
          zostanie potwierdzona podczas rozmowy.
        </p>
      </div>

      <div className="mt-9 overflow-hidden rounded-[2rem] border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl sm:mt-12">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--gold)]/15 p-4 sm:p-6">
          <button
            type="button"
            onClick={showPreviousMonth}
            disabled={!canGoToPreviousMonth || isLoading}
            aria-label="Poprzedni miesiąc"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--gold)]/25 text-[var(--gold)] transition hover:border-[var(--gold)]/55 hover:bg-[var(--gold)]/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft aria-hidden="true" size={20} />
          </button>

          <div className="flex items-center gap-2 text-center">
            <CalendarDays aria-hidden="true" size={18} className="text-[var(--gold)]" />
            <h3 className="text-lg font-semibold capitalize text-white sm:text-xl">
              {formatMonth(selectedMonth)}
            </h3>
          </div>

          <button
            type="button"
            onClick={showNextMonth}
            disabled={!canGoToNextMonth || isLoading}
            aria-label="Następny miesiąc"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--gold)]/25 text-[var(--gold)] transition hover:border-[var(--gold)]/55 hover:bg-[var(--gold)]/10 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight aria-hidden="true" size={20} />
          </button>
        </div>

        {isLoading && (
          <div className="flex min-h-72 items-center justify-center gap-3 p-8 text-sm text-white/55">
            <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-[var(--gold)]" />
            Pobieranie wolnych terminów…
          </div>
        )}

        {!isLoading && loadError && (
          <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
            <AlertCircle aria-hidden="true" size={28} className="text-rose-300" />
            <p className="mt-3 text-sm text-rose-100">{loadError}</p>
            <button
              type="button"
              onClick={() => setReloadKey((currentKey) => currentKey + 1)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 px-4 py-2 text-sm font-medium text-[var(--gold)] transition hover:bg-[var(--gold)]/10"
            >
              <RefreshCw aria-hidden="true" size={15} />
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!isLoading && !loadError && (
          <>
            <div className="p-4 sm:hidden">
              <p className="mb-4 text-xs leading-5 text-white/40">
                Pokazujemy wyłącznie dni, w których pozostały wolne godziny.
              </p>
              {availableDays.length > 0 ? (
                <div className="divide-y divide-[var(--gold)]/12">
                  {availableDays.map((day) => (
                    <article key={day.date} className="py-4 first:pt-0 last:pb-0">
                      <h4 className="text-sm font-semibold capitalize text-white">
                        {formatDay(parseLocalDate(day.date))}
                      </h4>
                      <div className="mt-3">
                        <AvailabilityRanges ranges={day.availableRanges} compact />
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center text-sm text-white/45">
                  W tym miesiącu nie ma obecnie wolnych godzin.
                </div>
              )}
            </div>

            <div className="hidden p-5 sm:block lg:p-7">
              <div className="grid grid-cols-7">
                {WEEKDAY_LABELS.map((label) => (
                  <div
                    key={label}
                    className="pb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/35"
                  >
                    {label}
                  </div>
                ))}

                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} aria-hidden="true" />;
                  }

                  const isOutsideRange = date < today || date > maximumDate;
                  const ranges = availabilityByDate.get(formatLocalDate(date)) || [];

                  return (
                    <article
                      key={formatLocalDate(date)}
                      className={`min-h-32 border-l border-t border-white/[0.06] p-3 first:border-l-0 lg:min-h-36 lg:p-4 ${
                        isOutsideRange ? "bg-black/10 opacity-35" : "bg-white/[0.015]"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${
                        formatLocalDate(date) === formatLocalDate(today)
                          ? "text-[var(--gold)]"
                          : "text-white/75"
                      }`}>
                        {date.getDate()}
                      </p>
                      {!isOutsideRange && (
                        <AvailabilityRanges ranges={ranges} />
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PublicAvailabilityCalendar;
