import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Clock3, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getClientAppointmentHistory } from "../../api/apiClients";
import { addMinutesToTime, formatLocalDate, formatLocalTime } from "../../utils/dateTime";
import { getAppointmentDisplayStatus } from "../../utils/appointmentStatus";

const statuses = {
    SCHEDULED: { label: "Zaplanowana", className: "border-[var(--gold)]/40 text-[var(--gold)]" },
    ENDED: { label: "Odbyta", className: "border-emerald-300/25 text-emerald-200" },
    CANCELLED: { label: "Anulowana", className: "border-white/20 text-white/55" },
    NO_SHOW: { label: "Nieobecność", className: "border-orange-300/25 text-orange-200" },
};
const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" });

const ClientAppointmentHistory = ({ clientId }) => {
    const [appointments, setAppointments] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        const loadHistory = async () => {
            setIsLoading(true);
            setError("");
            try {
                const response = await getClientAppointmentHistory(clientId, page);
                if (isCurrent) {
                    setAppointments((current) => page === 0 ? response.appointments : [...current, ...response.appointments]);
                    setHasMore(response.hasMore);
                }
            } catch {
                if (isCurrent) setError("Nie udało się pobrać historii wizyt.");
            } finally {
                if (isCurrent) setIsLoading(false);
            }
        };
        loadHistory();
        return () => { isCurrent = false; };
    }, [clientId, page, retry]);

    return (
        <section className="border-t border-[var(--gold)]/20 px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="flex items-center gap-3">
                <CalendarDays aria-hidden="true" size={18} className="shrink-0 text-[var(--gold)]/75" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">Historia wizyt</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/40">
                Wszystkie terminy od najnowszych — również nadchodzące, anulowane i zarchiwizowane.
            </p>

            <ol className="mt-5 space-y-3">
                {appointments.map((appointment) => {
                    const status = statuses[getAppointmentDisplayStatus(appointment)] ?? statuses.SCHEDULED;
                    return (
                        <li key={appointment.id}>
                            <Link to={`/admin/appointments/${appointment.id}`} className="group block rounded-2xl border border-white/10 bg-black/10 p-4 transition hover:border-[var(--gold)]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] sm:p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-[var(--gold)]/80">{formatLocalDate(appointment.appointmentDate)}</p>
                                        <h3 className="mt-2 break-words font-semibold text-white/85">{appointment.offerItemName}</h3>
                                    </div>
                                    <ChevronRight aria-hidden="true" size={17} className="shrink-0 text-white/30 group-hover:text-[var(--gold)]" />
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
                                    <span className="flex items-center gap-1.5"><Clock3 aria-hidden="true" size={14} />{formatLocalTime(appointment.startTime)}–{addMinutesToTime(appointment.startTime, appointment.durationMinutes)}</span>
                                    <span>{appointment.durationMinutes} min</span>
                                    <span>{currency.format(appointment.price)}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className={`rounded-full border px-2.5 py-1 text-[11px] ${status.className}`}>{status.label}</span>
                                    {!appointment.active && <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-white/50">Zarchiwizowana</span>}
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ol>

            {!isLoading && !error && appointments.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/15 px-5 py-8 text-center text-sm text-white/45">Brak zapisanych wizyt tej klientki.</p>
            )}
            {isLoading && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-white/50"><LoaderCircle aria-hidden="true" size={16} className="animate-spin" />Pobieranie historii…</p>}
            {error && <div className="mt-5 text-sm text-red-200"><p role="alert">{error}</p><button type="button" onClick={() => setRetry((current) => current + 1)} disabled={isLoading} className="mt-2 cursor-pointer underline underline-offset-4 disabled:opacity-40">Spróbuj ponownie</button></div>}
            {!error && hasMore && !isLoading && (
                <button type="button" onClick={() => { setIsLoading(true); setPage((current) => current + 1); }} className="mt-5 cursor-pointer rounded-full border border-[var(--gold)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--gold)] hover:bg-[var(--gold)]/10">Pokaż więcej</button>
            )}
        </section>
    );
};

export default ClientAppointmentHistory;
