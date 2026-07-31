import {
    AlertCircle,
    ArrowLeft,
    Banknote,
    CalendarDays,
    Check,
    Clock3,
    LoaderCircle,
    Pencil,
    RotateCcw,
    StickyNote,
    Trash2,
    UserRound,
    CalendarPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
    archiveAppointment,
    getAppointment,
    updateAppointmentStatus,
} from "../../api/apiAppointments";
import {
    addMinutesToTime,
    formatLocalDate,
    formatLocalTime,
} from "../../utils/dateTime";
import { getAppointmentDisplayStatus } from "../../utils/appointmentStatus";

const currencyFormatter = new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
});

const statusClassNames = {
    SCHEDULED: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    ENDED: "border-white/20 bg-white/[0.05] text-white/60",
    CANCELLED: "border-white/20 bg-white/[0.05] text-white/55",
    NO_SHOW: "border-orange-300/25 bg-orange-400/10 text-orange-100/75",
};

const appointmentStatusLabels = {
    SCHEDULED: "Zaplanowana",
    ENDED: "Odbyta",
    CANCELLED: "Anulowana",
    NO_SHOW: "Nieobecność",
};

const statusActions = {
    SCHEDULED: [
        { status: "CANCELLED", label: "Anuluj wizytę", description: "Wizyta pozostanie w kalendarzu jako anulowana." },
        { status: "NO_SHOW", label: "Oznacz nieobecność", description: "Wizyta zostanie oznaczona jako nieobecność klientki." },
    ],
};

const endedAppointmentActions = [
    {
        status: "NO_SHOW",
        label: "Oznacz nieobecność",
        description: "Wizyta zostanie oznaczona jako nieobecność klientki.",
    },
];

const DetailItem = ({ icon, label, children }) => {
    const IconComponent = icon;

    return (
        <div className="flex min-w-0 gap-3 py-5">
            <IconComponent aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--gold)]/75" />
            <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">{label}</dt>
                <dd className="mt-2 break-words text-sm leading-6 text-white/75">{children}</dd>
            </div>
        </div>
    );
};

const AppointmentDetailsPage = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [appointment, setAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
    const [pendingStatusAction, setPendingStatusAction] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [statusError, setStatusError] = useState("");
    const [isArchiveConfirmationVisible, setIsArchiveConfirmationVisible] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveError, setArchiveError] = useState("");
    const displayStatus = appointment ? getAppointmentDisplayStatus(appointment) : null;
    const availableStatusActions = displayStatus === "ENDED"
        ? endedAppointmentActions
        : statusActions[appointment?.status] || [];

    useEffect(() => {
        let isMounted = true;

        const fetchAppointment = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const response = await getAppointment(appointmentId);
                if (isMounted) {
                    setAppointment(response);
                }
            } catch {
                if (isMounted) {
                    setLoadError("Nie udało się pobrać danych wizyty.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAppointment();

        return () => {
            isMounted = false;
        };
    }, [appointmentId, reloadKey]);

    const handleStatusUpdate = async () => {
        if (!pendingStatusAction || isUpdatingStatus) {
            return;
        }

        setIsUpdatingStatus(true);
        setStatusError("");
        setSuccessMessage("");

        try {
            const response = await updateAppointmentStatus(
                appointmentId,
                pendingStatusAction.status,
            );
            const nextStatus = response?.appointmentStatus || pendingStatusAction.status;
            setAppointment((current) => ({ ...current, status: nextStatus }));
            setPendingStatusAction(null);
            setSuccessMessage("Status wizyty został zaktualizowany.");
        } catch (error) {
            setStatusError(
                error.response?.data?.message
                || "Nie udało się zmienić statusu wizyty. Spróbuj ponownie.",
            );
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleArchive = async () => {
        if (isArchiving) {
            return;
        }

        setIsArchiving(true);
        setArchiveError("");

        try {
            await archiveAppointment(appointmentId);
            navigate("/admin/appointments", {
                replace: true,
                state: {
                    successMessage: "Wizyta została zarchiwizowana.",
                },
            });
        } catch (error) {
            setArchiveError(
                error.response?.data?.message
                || "Nie udało się zarchiwizować wizyty. Spróbuj ponownie.",
            );
        } finally {
            setIsArchiving(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                        <span className="h-px w-8 bg-[var(--gold)]/70" />
                        Kalendarz wizyt
                    </p>
                    <h1 className="text-3xl font-bold text-white sm:text-4xl">Szczegóły wizyty</h1>
                </div>
                <Link
                    to="/admin/appointments"
                    className="flex w-fit items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                    <ArrowLeft aria-hidden="true" size={16} />
                    Wróć do kalendarza
                </Link>
            </div>

            {successMessage && (
                <div role="status" className="mb-6 flex max-w-5xl items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                    <Check aria-hidden="true" size={17} />
                    {successMessage}
                </div>
            )}

            {isLoading && (
                <div role="status" className="flex min-h-64 max-w-5xl flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-white/[0.025]">
                    <LoaderCircle aria-hidden="true" size={32} className="animate-spin text-[var(--gold)]" />
                    <p className="mt-4 text-sm text-white/60">Pobieranie danych wizyty…</p>
                </div>
            )}

            {!isLoading && loadError && (
                <div role="alert" className="flex min-h-64 max-w-5xl flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 text-center">
                    <AlertCircle aria-hidden="true" size={32} className="text-red-300" />
                    <p className="mt-4 text-sm text-red-200/80">{loadError}</p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((current) => current + 1)}
                        className="mt-5 flex cursor-pointer items-center gap-2 rounded-full border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        <RotateCcw aria-hidden="true" size={16} />
                        Spróbuj ponownie
                    </button>
                </div>
            )}

            {!isLoading && !loadError && appointment && (
                <article className="max-w-5xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl">
                    <div className="flex flex-col gap-5 border-b border-[var(--gold)]/20 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <div className="flex items-center gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]">
                                <CalendarDays aria-hidden="true" size={21} />
                            </span>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]/70">Wizyta</p>
                                <h2 className="mt-1 text-lg font-semibold text-white sm:text-xl">
                                    {appointment.offerItemName}
                                </h2>
                            </div>
                        </div>
                        <span className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClassNames[displayStatus]}`}>
                            {appointmentStatusLabels[displayStatus] || displayStatus}
                        </span>
                    </div>

                    <dl className="grid grid-cols-1 divide-y divide-[var(--gold)]/15 px-6 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-10">
                        <div className="sm:pr-8">
                            <DetailItem icon={UserRound} label="Klientka">
                                <Link
                                    to={`/admin/clients/${appointment.clientId}`}
                                    className="font-semibold text-[var(--gold)] underline decoration-[var(--gold)]/30 underline-offset-4 hover:decoration-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                                >
                                    {appointment.clientFirstName} {appointment.clientLastName}
                                </Link>
                            </DetailItem>
                            <DetailItem icon={CalendarDays} label="Data">
                                <span className="capitalize">{formatLocalDate(appointment.appointmentDate)}</span>
                            </DetailItem>
                            <DetailItem icon={Clock3} label="Godzina">
                                {formatLocalTime(appointment.startTime)}–{addMinutesToTime(
                                    appointment.startTime,
                                    appointment.durationMinutes,
                                )}
                            </DetailItem>
                        </div>
                        <div className="sm:pl-8">
                            <DetailItem icon={Clock3} label="Czas trwania">
                                {appointment.durationMinutes} min
                            </DetailItem>
                            <DetailItem icon={Banknote} label="Cena">
                                {currencyFormatter.format(Number(appointment.price))}
                            </DetailItem>
                            <DetailItem icon={StickyNote} label="Notatka">
                                <span className="whitespace-pre-wrap">{appointment.note || "Brak notatki"}</span>
                            </DetailItem>
                        </div>
                    </dl>

                    <div className="border-t border-[var(--gold)]/20 bg-black/10 px-6 py-6 sm:px-8 lg:px-10">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">Zarządzaj wizytą</h2>
                                <p className="mt-2 text-sm text-white/40">Edytuj dane lub zmień bieżący status.</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to={`/admin/appointments/new?clientId=${appointment.clientId}&offerItemId=${appointment.offerItemId}`}
                                    className="flex w-fit items-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#c8ad55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                                >
                                    <CalendarPlus aria-hidden="true" size={16} />
                                    Umów ponownie
                                </Link>

                                {!appointment.hasEnded && (
                                    <Link
                                        to={`/admin/appointments/${appointment.id}/edit`}
                                        className="flex w-fit items-center gap-2 rounded-full border border-[var(--gold)]/45 px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                                    >
                                        <Pencil aria-hidden="true" size={16} />
                                        Edytuj wizytę
                                    </Link>
                                )}
                            </div>
                        </div>

                        {!pendingStatusAction ? (
                            <div className="mt-5 flex flex-wrap gap-3">
                                {availableStatusActions.map((action) => (
                                    <button
                                        key={action.status}
                                        type="button"
                                        onClick={() => {
                                            setPendingStatusAction(action);
                                            setStatusError("");
                                        }}
                                        className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/65 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-orange-300/20 bg-orange-400/[0.06] p-5">
                                <h3 className="font-semibold text-white">Potwierdź zmianę statusu</h3>
                                <p className="mt-2 text-sm leading-6 text-white/55">{pendingStatusAction.description}</p>
                                {statusError && <p role="alert" className="mt-4 text-sm text-red-200">{statusError}</p>}
                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus}
                                        onClick={() => setPendingStatusAction(null)}
                                        className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/65 disabled:opacity-50"
                                    >
                                        Wróć
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isUpdatingStatus}
                                        onClick={handleStatusUpdate}
                                        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-orange-300/40 bg-orange-300/10 px-4 py-2 text-sm font-semibold text-orange-100 disabled:opacity-50"
                                    >
                                        {isUpdatingStatus && <LoaderCircle aria-hidden="true" size={15} className="animate-spin" />}
                                        {pendingStatusAction.label}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-red-500/20 bg-red-950/[0.08] px-6 py-6 sm:px-8 lg:px-10">
                        {!isArchiveConfirmationVisible ? (
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-red-200/70">Archiwizacja wizyty</h2>
                                    <p className="mt-2 text-sm leading-6 text-white/45">
                                        Wizyta zniknie z aktywnego kalendarza, ale pozostanie w bazie danych.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsArchiveConfirmationVisible(true)}
                                    className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-red-400/55 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                >
                                    <Trash2 aria-hidden="true" size={16} />
                                    Archiwizuj wizytę
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-5">
                                <h2 className="font-semibold text-white">Czy na pewno chcesz zarchiwizować tę wizytę?</h2>
                                <p className="mt-2 text-sm leading-6 text-white/55">
                                    Zniknie z aktywnego kalendarza, ale pozostanie zapisana w bazie.
                                </p>
                                {archiveError && <p role="alert" className="mt-4 text-sm text-red-200">{archiveError}</p>}
                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        disabled={isArchiving}
                                        onClick={() => setIsArchiveConfirmationVisible(false)}
                                        className="cursor-pointer rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/65 disabled:opacity-50"
                                    >
                                        Anuluj
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isArchiving}
                                        onClick={handleArchive}
                                        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400 bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-100 disabled:opacity-50"
                                    >
                                        {isArchiving ? (
                                            <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 aria-hidden="true" size={16} />
                                        )}
                                        {isArchiving ? "Archiwizowanie…" : "Tak, archiwizuj wizytę"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </article>
            )}
        </section>
    );
};

export default AppointmentDetailsPage;
