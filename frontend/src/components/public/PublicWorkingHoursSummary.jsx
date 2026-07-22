import { useEffect, useMemo, useState } from "react";
import { getPublicWorkingHours } from "../../api/apiPublicContent";

const DAYS = {
  MONDAY: { index: 1, shortLabel: "Pon." },
  TUESDAY: { index: 2, shortLabel: "Wt." },
  WEDNESDAY: { index: 3, shortLabel: "Śr." },
  THURSDAY: { index: 4, shortLabel: "Czw." },
  FRIDAY: { index: 5, shortLabel: "Pt." },
  SATURDAY: { index: 6, shortLabel: "Sob." },
  SUNDAY: { index: 7, shortLabel: "Nd." },
};

const normalizeTime = (value) => value?.slice(0, 5) || "";

const groupWorkingHours = (workingHours) => {
  const workingDays = workingHours
    .filter((day) => day.isWorkingDay && day.startTime && day.endTime)
    .map((day) => ({
      ...day,
      index: DAYS[day.dayOfWeek]?.index,
    }))
    .filter((day) => day.index)
    .sort((firstDay, secondDay) => firstDay.index - secondDay.index);

  return workingDays.reduce((groups, day) => {
    const previousGroup = groups.at(-1);
    const hasSameHours = previousGroup &&
      previousGroup.startTime === day.startTime &&
      previousGroup.endTime === day.endTime;
    const isNextDay = previousGroup &&
      previousGroup.endIndex + 1 === day.index;

    if (hasSameHours && isNextDay) {
      previousGroup.endDay = day.dayOfWeek;
      previousGroup.endIndex = day.index;
      return groups;
    }

    groups.push({
      startDay: day.dayOfWeek,
      endDay: day.dayOfWeek,
      endIndex: day.index,
      startTime: day.startTime,
      endTime: day.endTime,
    });

    return groups;
  }, []);
};

const PublicWorkingHoursSummary = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkingHours = async () => {
      try {
        const response = await getPublicWorkingHours();

        if (isMounted) {
          setWorkingHours(Array.isArray(response) ? response : []);
          setHasError(false);
        }
      } catch {
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWorkingHours();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedWorkingHours = useMemo(
    () => groupWorkingHours(workingHours),
    [workingHours],
  );

  if (isLoading) {
    return <li className="text-sm text-white/40">🕒 Pobieranie godzin…</li>;
  }

  if (hasError || groupedWorkingHours.length === 0) {
    return (
      <li className="text-sm text-white/65">
        🕒 Aktualne godziny dostępne w kalendarzu
      </li>
    );
  }

  return groupedWorkingHours.map((group) => {
    const startDayLabel = DAYS[group.startDay].shortLabel;
    const endDayLabel = DAYS[group.endDay].shortLabel;
    const dayLabel = group.startDay === group.endDay
      ? startDayLabel
      : `${startDayLabel}–${endDayLabel}`;

    return (
      <li
        key={`${group.startDay}-${group.endDay}-${group.startTime}-${group.endTime}`}
        className="text-sm text-white/65"
      >
        🕒 {dayLabel} {normalizeTime(group.startTime)}–{normalizeTime(group.endTime)}
      </li>
    );
  });
};

export default PublicWorkingHoursSummary;
