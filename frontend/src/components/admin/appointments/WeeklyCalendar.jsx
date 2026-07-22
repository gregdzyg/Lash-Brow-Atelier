import { CalendarPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    formatDateForApi,
    formatLocalTime,
    getWeekDays,
    minutesToTime,
    timeToMinutes,
} from "../../../utils/dateTime";
import AppointmentCard from "./AppointmentCard";

const dayKeys = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

const dayShortLabels = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const SLOT_HEIGHT = 34;
const DEFAULT_START = 8 * 60;
const DEFAULT_END = 20 * 60;

const rangesOverlap = (firstStart, firstEnd, secondStart, secondEnd) => (
    firstStart < secondEnd && firstEnd > secondStart
);

const getCalendarBounds = (workingHours, exceptions, appointments) => {
    const starts = [DEFAULT_START];
    const ends = [DEFAULT_END];

    workingHours.forEach((day) => {
        if (day.isWorkingDay && day.startTime && day.endTime) {
            starts.push(timeToMinutes(day.startTime));
            ends.push(timeToMinutes(day.endTime));
        }
    });
    exceptions.forEach((item) => {
        if (item.startTime && item.endTime) {
            starts.push(timeToMinutes(item.startTime));
            ends.push(timeToMinutes(item.endTime));
        }
    });
    appointments.forEach((item) => {
        const start = timeToMinutes(item.startTime);
        starts.push(start);
        ends.push(start + Number(item.durationMinutes || 0));
    });

    return {
        start: Math.max(0, Math.floor((Math.min(...starts) - 30) / 30) * 30),
        end: Math.min(24 * 60, Math.ceil((Math.max(...ends) + 30) / 30) * 30),
    };
};

const getDayAvailability = (date, workingHours, exceptions) => {
    const dateValue = formatDateForApi(date);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
    const regularHours = workingHours.find((item) => item.dayOfWeek === dayKeys[dayIndex]);
    const dayExceptions = exceptions.filter((item) => item.date === dateValue);
    const isClosed = dayExceptions.some((item) => item.type === "CLOSED_DAY");
    const openRanges = [];

    if (!isClosed && regularHours?.isWorkingDay) {
        openRanges.push({
            start: timeToMinutes(regularHours.startTime),
            end: timeToMinutes(regularHours.endTime),
            type: "REGULAR",
        });
    }

    if (!isClosed) {
        dayExceptions
            .filter((item) => item.type === "EXTRA_OPEN")
            .forEach((item) => openRanges.push({
                start: timeToMinutes(item.startTime),
                end: timeToMinutes(item.endTime),
                type: "EXTRA_OPEN",
                note: item.note,
            }));
    }

    const blockedRanges = dayExceptions
        .filter((item) => item.type === "BLOCKED")
        .map((item) => ({
            start: timeToMinutes(item.startTime),
            end: timeToMinutes(item.endTime),
            note: item.note,
        }));

    return {
        isClosed,
        openRanges,
        blockedRanges,
        dayExceptions,
    };
};

const isSlotAvailable = (slotStart, availability, dayAppointments) => {
    const slotEnd = slotStart + 30;
    const isOpen = availability.openRanges.some((range) => (
        slotStart >= range.start && slotEnd <= range.end
    ));
    const isBlocked = availability.blockedRanges.some((range) => (
        rangesOverlap(slotStart, slotEnd, range.start, range.end)
    ));
    const hasAppointment = dayAppointments.some((appointment) => {
        if (appointment.status !== "SCHEDULED") {
            return false;
        }

        const appointmentStart = timeToMinutes(appointment.startTime);
        const appointmentEnd = appointmentStart + Number(appointment.durationMinutes || 0);
        return rangesOverlap(slotStart, slotEnd, appointmentStart, appointmentEnd);
    });

    return !availability.isClosed && isOpen && !isBlocked && !hasAppointment;
};

const AvailabilityOverlay = ({ range, calendarStart, type }) => {
    const top = ((range.start - calendarStart) / 30) * SLOT_HEIGHT;
    const height = ((range.end - range.start) / 30) * SLOT_HEIGHT;
    const className = type === "BLOCKED"
        ? "z-10 border-y border-red-300/20 bg-red-500/15"
        : "z-0 border-y border-emerald-300/15 bg-emerald-400/[0.07]";

    return (
        <div
            aria-hidden="true"
            style={{ top, height }}
            className={`pointer-events-none absolute inset-x-0 ${className}`}
        />
    );
};

const WeeklyCalendar = ({
    weekStart,
    appointments,
    workingHours,
    exceptions,
}) => {
    const navigate = useNavigate();
    const days = getWeekDays(weekStart);
    const bounds = getCalendarBounds(workingHours, exceptions, appointments);
    const slots = Array.from(
        { length: (bounds.end - bounds.start) / 30 },
        (_, index) => bounds.start + (index * 30),
    );
    const today = new Date();
    const todayValue = formatDateForApi(today);

    return (
        <div className="hidden lg:block">
            <div className="overflow-x-auto rounded-3xl border border-[var(--gold)]/25 bg-black/15 backdrop-blur-xl">
                <div className="min-w-[980px]">
                    <div className="grid grid-cols-[4.75rem_repeat(7,minmax(0,1fr))] border-b border-[var(--gold)]/20 bg-white/[0.035]">
                        <div className="p-3 text-center text-[10px] font-semibold uppercase tracking-wider text-white/30">
                            Czas
                        </div>
                        {days.map((day, index) => {
                            const dateValue = formatDateForApi(day);
                            return (
                                <div
                                    key={dateValue}
                                    className={`border-l border-white/10 px-2 py-3 text-center ${
                                        dateValue === todayValue ? "bg-[var(--gold)]/10" : ""
                                    }`}
                                >
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
                                        {dayShortLabels[index]}
                                    </p>
                                    <p className={`mt-1 text-sm font-bold ${
                                        dateValue === todayValue ? "text-[var(--gold)]" : "text-white"
                                    }`}>
                                        {day.getDate()}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-[4.75rem_repeat(7,minmax(0,1fr))]">
                        <div>
                            {slots.map((slot) => (
                                <div
                                    key={slot}
                                    style={{ height: SLOT_HEIGHT }}
                                    className="border-b border-white/[0.06] pr-3 pt-1 text-right text-[10px] text-white/35"
                                >
                                    {slot % 60 === 0 ? formatLocalTime(minutesToTime(slot)) : ""}
                                </div>
                            ))}
                        </div>

                        {days.map((day) => {
                            const dateValue = formatDateForApi(day);
                            const dayAppointments = appointments.filter(
                                (appointment) => appointment.appointmentDate === dateValue,
                            );
                            const availability = getDayAvailability(day, workingHours, exceptions);

                            return (
                                <div
                                    key={dateValue}
                                    className="relative border-l border-white/10 bg-white/[0.012]"
                                    style={{ height: slots.length * SLOT_HEIGHT }}
                                >
                                    {availability.openRanges.map((range, index) => (
                                        <AvailabilityOverlay
                                            key={`open-${range.start}-${index}`}
                                            range={range}
                                            calendarStart={bounds.start}
                                            type={range.type}
                                        />
                                    ))}
                                    {availability.blockedRanges.map((range, index) => (
                                        <AvailabilityOverlay
                                            key={`blocked-${range.start}-${index}`}
                                            range={range}
                                            calendarStart={bounds.start}
                                            type="BLOCKED"
                                        />
                                    ))}
                                    {availability.isClosed && (
                                        <div className="pointer-events-none absolute inset-0 z-10 flex justify-center bg-red-950/20 pt-4">
                                            <span className="h-fit rounded-full border border-red-300/20 bg-red-950/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-red-200/70">
                                                Zamknięte
                                            </span>
                                        </div>
                                    )}

                                    {slots.map((slot) => {
                                        const available = isSlotAvailable(
                                            slot,
                                            availability,
                                            dayAppointments,
                                        );

                                        return (
                                            <button
                                                key={slot}
                                                type="button"
                                                disabled={!available}
                                                aria-label={available
                                                    ? `Dodaj wizytę ${dateValue} o ${minutesToTime(slot)}`
                                                    : undefined
                                                }
                                                onClick={() => navigate(
                                                    `/admin/appointments/new?date=${dateValue}&startTime=${minutesToTime(slot)}`,
                                                )}
                                                style={{
                                                    top: ((slot - bounds.start) / 30) * SLOT_HEIGHT,
                                                    height: SLOT_HEIGHT,
                                                }}
                                                className={`
                                                    group absolute inset-x-0 z-10 border-b border-white/[0.07]
                                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                                                    focus-visible:ring-[var(--gold)]
                                                    ${available
                                                        ? "cursor-pointer hover:bg-[var(--gold)]/10"
                                                        : "cursor-default"
                                                    }
                                                `}
                                            >
                                                {available && (
                                                    <CalendarPlus
                                                        aria-hidden="true"
                                                        size={13}
                                                        className="mx-auto text-[var(--gold)] opacity-0 transition group-hover:opacity-70 group-focus-visible:opacity-70"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}

                                    {dayAppointments.map((appointment) => {
                                        const start = timeToMinutes(appointment.startTime);
                                        return (
                                            <AppointmentCard
                                                key={appointment.id}
                                                appointment={appointment}
                                                compact={Number(appointment.durationMinutes) < 60}
                                                style={{
                                                    top: ((start - bounds.start) / 30) * SLOT_HEIGHT + 2,
                                                    height: Math.max(
                                                        30,
                                                        (Number(appointment.durationMinutes) / 30) * SLOT_HEIGHT - 4,
                                                    ),
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/45">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/25" /> Godziny dostępne</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-red-500/25" /> Blokada / zamknięte</span>
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-white/5" /> Poza godzinami pracy</span>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
