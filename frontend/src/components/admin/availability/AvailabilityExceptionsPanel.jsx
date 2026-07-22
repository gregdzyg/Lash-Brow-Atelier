import {
    AlertCircle,
    CalendarOff,
    ChevronLeft,
    ChevronRight,
    Clock3,
    LoaderCircle,
    Plus,
    RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
    archiveAvailabilityException,
    getAvailabilityExceptions,
} from "../../../api/apiAvailability";
import AvailabilityExceptionForm from "./AvailabilityExceptionForm";

const typeLabels = {
    CLOSED_DAY: "Dzień wolny",
    BLOCKED: "Blokada godzin",
    EXTRA_OPEN: "Dodatkowe godziny",
};

const monthFormatter = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
});

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
});

const normalizeTime = (value) => value?.slice(0, 5) || "";

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

const getExceptionsRange = (selectedMonth) => {
    const today = new Date();
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    const isCurrentMonth = selectedMonth.getFullYear() === today.getFullYear()
        && selectedMonth.getMonth() === today.getMonth();

    return {
        start: isCurrentMonth ? today : monthStart,
        end: monthEnd,
    };
};

const sortExceptions = (exceptions) => [...exceptions].sort((first, second) => {
    const dateComparison = first.date.localeCompare(second.date);

    if (dateComparison !== 0) {
        return dateComparison;
    }

    const firstIsWholeDay = first.type === "CLOSED_DAY";
    const secondIsWholeDay = second.type === "CLOSED_DAY";

    if (firstIsWholeDay !== secondIsWholeDay) {
        return firstIsWholeDay ? -1 : 1;
    }

    return normalizeTime(first.startTime).localeCompare(normalizeTime(second.startTime));
});

const AvailabilityExceptionsPanel = () => {
    const [selectedMonth, setSelectedMonth] = useState(
        () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
    const [exceptions, setExceptions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [formException, setFormException] = useState(undefined);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [archivingId, setArchivingId] = useState(null);
    const [archiveError, setArchiveError] = useState("");
    const [refreshError, setRefreshError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const fetchExceptions = useCallback(async () => {
        const { start, end } = getExceptionsRange(selectedMonth);
        const response = await getAvailabilityExceptions(
            formatLocalDate(start),
            formatLocalDate(end),
        );
        setExceptions(sortExceptions(Array.isArray(response) ? response : []));
    }, [selectedMonth]);

    useEffect(() => {
        let isMounted = true;

        const loadExceptions = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const { start, end } = getExceptionsRange(selectedMonth);
                const response = await getAvailabilityExceptions(
                    formatLocalDate(start),
                    formatLocalDate(end),
                );

                if (isMounted) {
                    setExceptions(sortExceptions(Array.isArray(response) ? response : []));
                }
            } catch {
                if (isMounted) {
                    setLoadError("Nie udało się pobrać wyjątków dla wybranego miesiąca.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadExceptions();

        return () => {
            isMounted = false;
        };
    }, [selectedMonth, reloadKey]);

    const changeMonth = (offset) => {
        setSelectedMonth((current) => new Date(
            current.getFullYear(),
            current.getMonth() + offset,
            1,
        ));
        setIsFormOpen(false);
        setFormException(undefined);
        setArchiveError("");
        setRefreshError("");
        setSuccessMessage("");
    };

    const goToCurrentMonth = () => {
        const today = new Date();
        setSelectedMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        setIsFormOpen(false);
        setFormException(undefined);
        setArchiveError("");
        setRefreshError("");
        setSuccessMessage("");
    };

    const openCreateForm = () => {
        setFormException(undefined);
        setIsFormOpen(true);
        setArchiveError("");
        setRefreshError("");
        setSuccessMessage("");
    };

    const openEditForm = (exception) => {
        setFormException(exception);
        setIsFormOpen(true);
        setArchiveError("");
        setRefreshError("");
        setSuccessMessage("");
    };

    const handleFormSuccess = async (isEditMode) => {
        try {
            await fetchExceptions();
            setRefreshError("");
        } catch {
            setRefreshError(
                "Zmiana została zapisana, ale nie udało się odświeżyć listy. Spróbuj ponownie.",
            );
        }

        setIsFormOpen(false);
        setFormException(undefined);
        setSuccessMessage(
            isEditMode
                ? "Wyjątek został zaktualizowany."
                : "Wyjątek został dodany.",
        );
    };

    const handleArchive = async (exceptionId) => {
        if (archivingId !== null) {
            return;
        }

        setArchivingId(exceptionId);
        setArchiveError("");
        setSuccessMessage("");

        try {
            await archiveAvailabilityException(exceptionId);
            setExceptions((current) => current.filter((item) => item.id !== exceptionId));
            setSuccessMessage("Wyjątek został zarchiwizowany.");

            if (formException?.id === exceptionId) {
                setIsFormOpen(false);
                setFormException(undefined);
            }
        } catch {
            setArchiveError("Nie udało się zarchiwizować wyjątku. Spróbuj ponownie.");
        } finally {
            setArchivingId(null);
        }
    };

    const isCurrentMonth = (() => {
        const today = new Date();
        return selectedMonth.getFullYear() === today.getFullYear()
            && selectedMonth.getMonth() === today.getMonth();
    })();

    return (
        <div>
            <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">Wyjątki dostępności</h2>
                    <p className="mt-1 text-sm leading-6 text-white/50">
                        Zamknięcia, blokady i dodatkowe godziny dla konkretnych dat.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateForm}
                    disabled={isFormOpen || archivingId !== null}
                    className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus aria-hidden="true" size={16} />
                    Dodaj wyjątek
                </button>
            </div>

            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[var(--gold)]/20 bg-white/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between gap-2 sm:justify-start">
                    <button
                        type="button"
                        onClick={() => changeMonth(-1)}
                        disabled={isCurrentMonth || isFormOpen || archivingId !== null}
                        aria-label="Poprzedni miesiąc"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 text-white/65 transition hover:border-[var(--gold)]/50 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        <ChevronLeft aria-hidden="true" size={19} />
                    </button>
                    <h3 className="min-w-48 text-center font-semibold capitalize text-white sm:text-left">
                        {monthFormatter.format(selectedMonth)}
                    </h3>
                    <button
                        type="button"
                        onClick={() => changeMonth(1)}
                        disabled={isFormOpen || archivingId !== null}
                        aria-label="Następny miesiąc"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/15 text-white/65 transition hover:border-[var(--gold)]/50 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        <ChevronRight aria-hidden="true" size={19} />
                    </button>
                </div>
                <button
                    type="button"
                    onClick={goToCurrentMonth}
                    disabled={isCurrentMonth || isFormOpen || archivingId !== null}
                    className="cursor-pointer rounded-full border border-[var(--gold)]/35 px-4 py-2 text-sm font-medium text-[var(--gold)] transition hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-default disabled:opacity-40"
                >
                    Bieżący miesiąc
                </button>
            </div>

            {isFormOpen && (
                <AvailabilityExceptionForm
                    key={formException?.id || "new"}
                    exception={formException}
                    onCancel={() => {
                        setIsFormOpen(false);
                        setFormException(undefined);
                    }}
                    onSuccess={handleFormSuccess}
                    onArchive={formException
                        ? () => handleArchive(formException.id)
                        : undefined
                    }
                    isArchiving={archivingId === formException?.id}
                    archiveError={archiveError}
                />
            )}

            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-5 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                >
                    {successMessage}
                </div>
            )}

            {archiveError && !isFormOpen && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                    {archiveError}
                </div>
            )}

            {refreshError && (
                <div
                    role="alert"
                    className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between"
                >
                    <span>{refreshError}</span>
                    <button
                        type="button"
                        onClick={() => {
                            setRefreshError("");
                            setReloadKey((value) => value + 1);
                        }}
                        className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-amber-200/35 px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                    >
                        <RotateCcw aria-hidden="true" size={14} />
                        Odśwież listę
                    </button>
                </div>
            )}

            {isLoading && (
                <div
                    role="status"
                    className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <LoaderCircle aria-hidden="true" size={32} className="animate-spin text-[var(--gold)]" />
                    <p className="mt-4 text-sm text-white/60">Pobieranie wyjątków…</p>
                </div>
            )}

            {!isLoading && loadError && (
                <div
                    role="alert"
                    className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <AlertCircle aria-hidden="true" size={32} className="text-red-300" />
                    <p className="mt-4 max-w-md text-sm leading-6 text-red-200/80">{loadError}</p>
                    <button
                        type="button"
                        onClick={() => setReloadKey((value) => value + 1)}
                        className="mt-5 flex cursor-pointer items-center gap-2 rounded-full border border-red-300/40 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                    >
                        <RotateCcw aria-hidden="true" size={16} />
                        Spróbuj ponownie
                    </button>
                </div>
            )}

            {!isLoading && !loadError && exceptions.length === 0 && (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]">
                        <CalendarOff aria-hidden="true" size={27} />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-white">Brak wyjątków</h3>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                        W tym miesiącu nie zapisano wyjątków dostępności.
                    </p>
                </div>
            )}

            {!isLoading && !loadError && exceptions.length > 0 && (
                <div className="overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl">
                    <div className="divide-y divide-[var(--gold)]/15">
                        {exceptions.map((exception) => (
                            <button
                                key={exception.id}
                                type="button"
                                onClick={() => openEditForm(exception)}
                                disabled={isFormOpen || archivingId !== null}
                                aria-label={`Edytuj wyjątek z dnia ${dateFormatter.format(parseLocalDate(exception.date))}`}
                                className="block w-full cursor-pointer px-5 py-5 text-left transition hover:bg-white/[0.045] focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-45 sm:px-7"
                            >
                                <span className="grid min-w-0 gap-3 sm:grid-cols-[minmax(11rem,1.1fr)_minmax(10rem,1fr)_minmax(8rem,0.8fr)_minmax(10rem,1.2fr)] sm:items-center">
                                    <span className="font-semibold text-white">
                                        {dateFormatter.format(parseLocalDate(exception.date))}
                                    </span>
                                    <span className="w-fit rounded-full border border-[var(--gold)]/25 bg-[var(--gold)]/[0.08] px-3 py-1 text-xs font-semibold text-[var(--gold)]">
                                        {typeLabels[exception.type] || exception.type}
                                    </span>
                                    <span className="flex items-center gap-2 text-sm text-white/65">
                                        <Clock3 aria-hidden="true" size={15} className="text-[var(--gold)]/75" />
                                        {exception.type === "CLOSED_DAY"
                                            ? "Cały dzień"
                                            : `${normalizeTime(exception.startTime)}–${normalizeTime(exception.endTime)}`
                                        }
                                    </span>
                                    <span className="break-words text-sm leading-6 text-white/50">
                                        {exception.note?.trim() || "Brak notatki"}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityExceptionsPanel;
