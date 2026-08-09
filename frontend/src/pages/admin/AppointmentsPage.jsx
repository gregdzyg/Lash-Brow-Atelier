import {
    AlertCircle,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Plus,
    RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAppointments } from "../../api/apiAppointments";
import {
    getAdminAvailability,
    getAvailabilityExceptions,
    getWorkingHours,
} from "../../api/apiAvailability";
import DailyCalendar from "../../components/admin/appointments/DailyCalendar";
import WeeklyCalendar from "../../components/admin/appointments/WeeklyCalendar";
import {
    addDays,
    formatDateForApi,
    getMonthName,
    getWeekRange,
} from "../../utils/dateTime";

const getWeekLabel = (start, end) => {
    const sameYear = start.getFullYear() === end.getFullYear();
    const sameMonth = sameYear && start.getMonth() === end.getMonth();

    if (sameMonth) {
        return `${start.getDate()}–${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
    }

    if (sameYear) {
        return `${start.getDate()} ${getMonthName(start)} – ${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
    }

    return `${start.getDate()} ${getMonthName(start)} ${start.getFullYear()} – ${end.getDate()} ${getMonthName(end)} ${end.getFullYear()}`;
};

const AppointmentsPage = () => {
    const today = new Date();
    const initialRange = getWeekRange(today);
    const [weekStart, setWeekStart] = useState(initialRange.start);
    const [selectedDay, setSelectedDay] = useState(today);
    const [appointments, setAppointments] = useState([]);
    const [workingHours, setWorkingHours] = useState([]);
    const [exceptions, setExceptions] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const weekEnd = addDays(weekStart, 6);
    const successMessage = location.state?.successMessage || "";

    useEffect(() => {
        let isCurrent = true;
        const start = formatDateForApi(weekStart);
        const end = formatDateForApi(addDays(weekStart, 6));

        const fetchCalendarData = async () => {
            setIsLoading(true);
            setError("");

            try {
                const [
                    appointmentsResponse,
                    workingHoursResponse,
                    exceptionsResponse,
                    availabilityResponse,
                ] = await Promise.all([
                    getAppointments(start, end),
                    getWorkingHours(),
                    getAvailabilityExceptions(start, end),
                    getAdminAvailability(start, end),
                ]);

                if (isCurrent) {
                    setAppointments(Array.isArray(appointmentsResponse) ? appointmentsResponse : []);
                    setWorkingHours(Array.isArray(workingHoursResponse) ? workingHoursResponse : []);
                    setExceptions(Array.isArray(exceptionsResponse) ? exceptionsResponse : []);
                    setAvailability(Array.isArray(availabilityResponse) ? availabilityResponse : []);
                }
            } catch {
                if (isCurrent) {
                    setError("Nie udało się pobrać kalendarza wizyt. Spróbuj ponownie.");
                }
            } finally {
                if (isCurrent) {
                    setIsLoading(false);
                }
            }
        };

        fetchCalendarData();

        return () => {
            isCurrent = false;
        };
    }, [weekStart, reloadKey]);

    const changeWeek = (amount) => {
        setWeekStart((current) => addDays(current, amount * 7));
        setSelectedDay((current) => addDays(current, amount * 7));
    };

    const goToToday = () => {
        const currentToday = new Date();
        setWeekStart(getWeekRange(currentToday).start);
        setSelectedDay(currentToday);
    };

    const clearSuccessMessage = () => {
        navigate(location.pathname, {
            replace: true,
            state: null,
        });
    };

    return (
        <section className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-8 sm:py-12 lg:px-10 xl:px-14">
            <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                        <span className="h-px w-8 bg-[var(--gold)]/70" />
                        Panel administracyjny
                    </p>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">Kalendarz wizyt</h1>
                    <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                        Zarządzaj terminami i sprawdzaj dostępność Atelier.
                    </p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center xl:justify-end">
                    <Link
                        to="/admin/clients/new"
                        className="flex w-fit items-center gap-2 rounded-full border border-[var(--gold)] bg-transparent px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                        <Plus aria-hidden="true" size={17} />
                        Nowa klientka
                    </Link>

                    <Link
                        to="/admin/appointments/new"
                        className="flex w-fit items-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                        <Plus aria-hidden="true" size={17} />
                        Dodaj wizytę
                    </Link>
                </div>
            </div>

            {successMessage && (
                <div role="status" className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    <span className="flex items-center gap-2">
                        <Check aria-hidden="true" size={17} />
                        {successMessage}
                    </span>
                    <button
                        type="button"
                        onClick={clearSuccessMessage}
                        className="cursor-pointer text-xs font-semibold text-emerald-100/65 hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                    >
                        Zamknij
                    </button>
                </div>
            )}

            <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => changeWeek(-1)}
                        aria-label="Poprzedni tydzień"
                        className="cursor-pointer rounded-xl border border-white/10 p-2.5 text-white/70 transition hover:border-[var(--gold)]/40 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                        <ChevronLeft aria-hidden="true" size={19} />
                    </button>
                    <button
                        type="button"
                        onClick={() => changeWeek(1)}
                        aria-label="Następny tydzień"
                        className="cursor-pointer rounded-xl border border-white/10 p-2.5 text-white/70 transition hover:border-[var(--gold)]/40 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                        <ChevronRight aria-hidden="true" size={19} />
                    </button>
                    <button
                        type="button"
                        onClick={goToToday}
                        className="ml-1 cursor-pointer rounded-xl border border-[var(--gold)]/35 px-4 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                        Dzisiaj
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
                    <CalendarDays aria-hidden="true" size={18} className="text-[var(--gold)]" />
                    <span className="capitalize">{getWeekLabel(weekStart, weekEnd)}</span>
                </div>
            </div>

            {isLoading && (
                <div role="status" className="flex min-h-80 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-white/[0.025] px-6 text-center">
                    <LoaderCircle aria-hidden="true" size={32} className="animate-spin text-[var(--gold)]" />
                    <p className="mt-4 text-sm text-white/60">Pobieranie kalendarza…</p>
                </div>
            )}

            {!isLoading && error && (
                <div role="alert" className="flex min-h-72 flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 text-center">
                    <AlertCircle aria-hidden="true" size={32} className="text-red-300" />
                    <p className="mt-4 max-w-md text-sm leading-6 text-red-200/80">{error}</p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((current) => current + 1)}
                        className="mt-5 flex cursor-pointer items-center gap-2 rounded-full border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        <RotateCcw aria-hidden="true" size={16} />
                        Spróbuj ponownie
                    </button>
                </div>
            )}

            {!isLoading && !error && (
                <>
                    <WeeklyCalendar
                        weekStart={weekStart}
                        appointments={appointments}
                        workingHours={workingHours}
                        exceptions={exceptions}
                        availability={availability}
                    />
                    <DailyCalendar
                        selectedDay={selectedDay}
                        rangeStart={weekStart}
                        rangeEnd={weekEnd}
                        onSelectedDayChange={setSelectedDay}
                        appointments={appointments}
                        workingHours={workingHours}
                        exceptions={exceptions}
                        availability={availability}
                    />
                    <p className="mt-5 text-xs leading-5 text-white/35">
                        Widok kalendarza ma charakter pomocniczy. Dostępność i kolizje są ponownie sprawdzane podczas zapisu wizyty.
                    </p>
                </>
            )}
        </section>
    );
};

export default AppointmentsPage;
