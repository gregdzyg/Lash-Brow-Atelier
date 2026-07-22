import { ChevronLeft, ChevronRight, CircleAlert, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    addDays,
    formatDateForApi,
    formatLocalDate,
    formatLocalTime,
    minutesToTime,
    timeToMinutes,
} from "../../../utils/dateTime";
import AppointmentCard from "./AppointmentCard";

const SLOT_HEIGHT = 54;
const DEFAULT_START = 8 * 60;
const DEFAULT_END = 20 * 60;
const dayKeys = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

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
        });
    }

    if (!isClosed) {
        dayExceptions
            .filter((item) => item.type === "EXTRA_OPEN")
            .forEach((item) => openRanges.push({
                start: timeToMinutes(item.startTime),
                end: timeToMinutes(item.endTime),
            }));
    }

    return {
        isClosed,
        openRanges,
        blockedRanges: dayExceptions
            .filter((item) => item.type === "BLOCKED")
            .map((item) => ({
                start: timeToMinutes(item.startTime),
                end: timeToMinutes(item.endTime),
            })),
    };
};

const isSlotAvailable = (slotStart, availability, dayAppointments) => {
    const slotEnd = slotStart + 30;
    const overlaps = (start, end) => slotStart < end && slotEnd > start;
    const isOpen = availability.openRanges.some(
        (range) => slotStart >= range.start && slotEnd <= range.end,
    );
    const isBlocked = availability.blockedRanges.some(
        (range) => overlaps(range.start, range.end),
    );
    const hasAppointment = dayAppointments.some((appointment) => {
        if (appointment.status !== "SCHEDULED") {
            return false;
        }

        const appointmentStart = timeToMinutes(appointment.startTime);
        return overlaps(
            appointmentStart,
            appointmentStart + Number(appointment.durationMinutes || 0),
        );
    });

    return !availability.isClosed && isOpen && !isBlocked && !hasAppointment;
};

const DailyCalendar = ({
    selectedDay,
    rangeStart,
    rangeEnd,
    onSelectedDayChange,
    appointments,
    workingHours,
    exceptions,
}) => {
    const navigate = useNavigate();
    const dateValue = formatDateForApi(selectedDay);
    const dayAppointments = appointments.filter(
        (appointment) => appointment.appointmentDate === dateValue,
    );
    const dayExceptions = exceptions.filter((item) => item.date === dateValue);
    const availability = getDayAvailability(selectedDay, workingHours, exceptions);
    const bounds = getCalendarBounds(workingHours, exceptions, appointments);
    const slots = Array.from(
        { length: (bounds.end - bounds.start) / 30 },
        (_, index) => bounds.start + (index * 30),
    );
    const canGoBack = dateValue > formatDateForApi(rangeStart);
    const canGoForward = dateValue < formatDateForApi(rangeEnd);

    return (
        <div className="lg:hidden">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[var(--gold)]/20 bg-white/[0.04] p-2">
                <button
                    type="button"
                    disabled={!canGoBack}
                    onClick={() => onSelectedDayChange(addDays(selectedDay, -1))}
                    aria-label="Poprzedni dzień"
                    className="cursor-pointer rounded-xl p-2.5 text-[var(--gold)] transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-25"
                >
                    <ChevronLeft aria-hidden="true" size={20} />
                </button>
                <p className="text-center text-sm font-semibold capitalize text-white">
                    {formatLocalDate(selectedDay, true)}
                </p>
                <button
                    type="button"
                    disabled={!canGoForward}
                    onClick={() => onSelectedDayChange(addDays(selectedDay, 1))}
                    aria-label="Następny dzień"
                    className="cursor-pointer rounded-xl p-2.5 text-[var(--gold)] transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-25"
                >
                    <ChevronRight aria-hidden="true" size={20} />
                </button>
            </div>

            {dayExceptions.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {dayExceptions.map((item) => (
                        <span
                            key={item.id}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] ${
                                item.type === "EXTRA_OPEN"
                                    ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
                                    : "border-red-300/25 bg-red-500/10 text-red-100/80"
                            }`}
                        >
                            {item.type === "EXTRA_OPEN" ? (
                                <Sparkles aria-hidden="true" size={12} />
                            ) : (
                                <CircleAlert aria-hidden="true" size={12} />
                            )}
                            {item.type === "CLOSED_DAY" && "Dzień zamknięty"}
                            {item.type === "BLOCKED" && `Blokada ${formatLocalTime(item.startTime)}–${formatLocalTime(item.endTime)}`}
                            {item.type === "EXTRA_OPEN" && `Dodatkowo otwarte ${formatLocalTime(item.startTime)}–${formatLocalTime(item.endTime)}`}
                        </span>
                    ))}
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-[var(--gold)]/25 bg-black/15">
                <div className="grid grid-cols-[4.5rem_minmax(0,1fr)]">
                    <div>
                        {slots.map((slot) => (
                            <div
                                key={slot}
                                style={{ height: SLOT_HEIGHT }}
                                className="border-b border-white/[0.07] pr-3 pt-2 text-right text-[11px] text-white/40"
                            >
                                {formatLocalTime(minutesToTime(slot))}
                            </div>
                        ))}
                    </div>

                    <div
                        className="relative border-l border-white/10 bg-white/[0.015]"
                        style={{ height: slots.length * SLOT_HEIGHT }}
                    >
                        {slots.map((slot) => {
                            const available = isSlotAvailable(
                                slot,
                                availability,
                                dayAppointments,
                            );
                            const isOpen = availability.openRanges.some(
                                (range) => slot >= range.start && slot + 30 <= range.end,
                            );
                            const isBlocked = availability.blockedRanges.some(
                                (range) => slot < range.end && slot + 30 > range.start,
                            );

                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    disabled={!available}
                                    onClick={() => navigate(
                                        `/admin/appointments/new?date=${dateValue}&startTime=${minutesToTime(slot)}`,
                                    )}
                                    style={{
                                        top: ((slot - bounds.start) / 30) * SLOT_HEIGHT,
                                        height: SLOT_HEIGHT,
                                    }}
                                    className={`
                                        absolute inset-x-0 z-10 border-b border-white/[0.07] text-left
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                                        focus-visible:ring-[var(--gold)]
                                        ${isBlocked || availability.isClosed
                                            ? "bg-red-500/10"
                                            : isOpen
                                                ? "bg-emerald-400/[0.06]"
                                                : "bg-black/10"
                                        }
                                        ${available
                                            ? "cursor-pointer px-3 text-[11px] text-[var(--gold)] hover:bg-[var(--gold)]/12"
                                            : "cursor-default"
                                        }
                                    `}
                                >
                                    {available && "Dodaj wizytę"}
                                </button>
                            );
                        })}

                        {dayAppointments.map((appointment) => {
                            const start = timeToMinutes(appointment.startTime);
                            return (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    style={{
                                        top: ((start - bounds.start) / 30) * SLOT_HEIGHT + 3,
                                        height: Math.max(
                                            48,
                                            (Number(appointment.durationMinutes) / 30) * SLOT_HEIGHT - 6,
                                        ),
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyCalendar;
