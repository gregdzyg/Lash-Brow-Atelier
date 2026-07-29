import {
    AlertCircle,
    Check,
    Clock3,
    LoaderCircle,
    Pencil,
    RotateCcw,
    Save,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
    getWorkingHours,
    updateWorkingHours,
} from "../../../api/apiAvailability";

const dayOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

const dayLabels = {
    MONDAY: "Poniedziałek",
    TUESDAY: "Wtorek",
    WEDNESDAY: "Środa",
    THURSDAY: "Czwartek",
    FRIDAY: "Piątek",
    SATURDAY: "Sobota",
    SUNDAY: "Niedziela",
};

const normalizeTime = (value) => value?.slice(0, 5) || "";

const sortWorkingHours = (workingHours) => [...workingHours].sort(
    (first, second) => dayOrder.indexOf(first.dayOfWeek) - dayOrder.indexOf(second.dayOfWeek),
);

const inputClassName = `
    w-full rounded-xl border border-[var(--gold)]/30 bg-black/20 px-3 py-2.5 text-sm text-white
    outline-none transition placeholder:text-white/25 focus:border-[var(--gold)]
    focus:ring-2 focus:ring-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-50
`;

const WorkingHoursPanel = () => {
    const [workingHours, setWorkingHours] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [formValues, setFormValues] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [updateError, setUpdateError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchWorkingHours = async () => {
            setIsLoading(true);
            setLoadError("");

            try {
                const response = await getWorkingHours();

                if (isMounted) {
                    setWorkingHours(sortWorkingHours(Array.isArray(response) ? response : []));
                }
            } catch {
                if (isMounted) {
                    setLoadError("Nie udało się pobrać godzin pracy. Spróbuj ponownie.");
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
    }, [reloadKey]);

    const beginEditing = (day) => {
        setEditingId(day.id);
        setFormValues({
            isWorkingDay: day.isWorkingDay,
            startTime: normalizeTime(day.startTime),
            endTime: normalizeTime(day.endTime),
            publicSlotDurationMinutes:
                String(day.publicSlotDurationMinutes || 120),
        });
        setUpdateError("");
        setSuccessMessage("");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setFormValues(null);
        setUpdateError("");
    };

    const handleWorkingDayChange = (event) => {
        const isWorkingDay = event.target.checked;

        setFormValues((current) => ({
            ...current,
            isWorkingDay,
            startTime: isWorkingDay ? current.startTime : "",
            endTime: isWorkingDay ? current.endTime : "",
        }));
        setUpdateError("");
    };

    const handleTimeChange = (event) => {
        const { name, value } = event.target;
        setFormValues((current) => ({ ...current, [name]: value }));
        setUpdateError("");
    };

    const handleSave = async (day) => {
        if (savingId !== null) {
            return;
        }

        if (formValues.isWorkingDay) {
            if (!formValues.startTime || !formValues.endTime) {
                setUpdateError("Podaj godzinę rozpoczęcia i zakończenia pracy.");
                return;
            }

            if (formValues.startTime >= formValues.endTime) {
                setUpdateError("Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia.");
                return;
            }
        }

        const publicSlotDurationMinutes =
            Number(formValues.publicSlotDurationMinutes);

        if (
            !Number.isInteger(publicSlotDurationMinutes)
            || publicSlotDurationMinutes < 15
            || publicSlotDurationMinutes > 480
        ) {
            setUpdateError(
                "Odstęp między proponowanymi terminami musi wynosić od 15 do 480 minut.",
            );
            return;
        }

        const request = {
            startTime: formValues.isWorkingDay ? formValues.startTime : null,
            endTime: formValues.isWorkingDay ? formValues.endTime : null,
            isWorkingDay: formValues.isWorkingDay,
            publicSlotDurationMinutes,
        };

        setSavingId(day.id);
        setUpdateError("");
        setSuccessMessage("");

        try {
            const updatedDay = await updateWorkingHours(day.id, request);
            setWorkingHours((current) => sortWorkingHours(
                current.map((item) => item.id === day.id ? updatedDay : item),
            ));
            setEditingId(null);
            setFormValues(null);
            setSuccessMessage(`Zapisano ustawienia: ${dayLabels[day.dayOfWeek]}.`);
        } catch {
            setUpdateError("Nie udało się zapisać zmian. Sprawdź dane i spróbuj ponownie.");
        } finally {
            setSavingId(null);
        }
    };

    if (isLoading) {
        return (
            <div
                role="status"
                className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl"
            >
                <LoaderCircle aria-hidden="true" size={32} className="animate-spin text-[var(--gold)]" />
                <p className="mt-4 text-sm text-white/60">Pobieranie godzin pracy…</p>
            </div>
        );
    }

    if (loadError) {
        return (
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
        );
    }

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Tygodniowy plan pracy</h2>
                <p className="mt-1 text-sm leading-6 text-white/50">
                    Zmiany obowiązują cyklicznie w każdym tygodniu. Pole
                    „Terminy co” określa odstęp między godzinami pokazywanymi
                    klientkom na stronie.
                </p>
            </div>

            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                >
                    <Check aria-hidden="true" size={17} />
                    {successMessage}
                </div>
            )}

            <div className="overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl">
                <div className="divide-y divide-[var(--gold)]/15">
                    {workingHours.map((day) => {
                        const isEditing = editingId === day.id;
                        const isSaving = savingId === day.id;

                        return (
                            <div key={day.id} className="px-5 py-5 sm:px-7">
                                {!isEditing ? (
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-[minmax(8.5rem,1fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(9rem,1fr)] sm:items-center">
                                            <h3 className="font-semibold text-white">
                                                {dayLabels[day.dayOfWeek] || day.dayOfWeek}
                                            </h3>
                                            <span className={day.isWorkingDay ? "text-sm text-emerald-200" : "text-sm text-white/45"}>
                                                {day.isWorkingDay ? "Dzień pracujący" : "Dzień wolny"}
                                            </span>
                                            <span className="flex items-center gap-2 text-sm text-white/65">
                                                <Clock3 aria-hidden="true" size={15} className="text-[var(--gold)]/80" />
                                                {day.isWorkingDay
                                                    ? `${normalizeTime(day.startTime)}–${normalizeTime(day.endTime)}`
                                                    : "—"
                                                }
                                            </span>
                                            <span className="text-sm text-white/55">
                                                Terminy co: {day.publicSlotDurationMinutes} min
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => beginEditing(day)}
                                            disabled={savingId !== null}
                                            className="flex w-fit cursor-pointer items-center gap-2 rounded-full border border-[var(--gold)]/45 px-4 py-2 text-sm font-semibold text-[var(--gold)] transition hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-45"
                                        >
                                            <Pencil aria-hidden="true" size={15} />
                                            Edytuj
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
                                            <div className="min-w-36 lg:pb-2.5">
                                                <h3 className="font-semibold text-white">
                                                    {dayLabels[day.dayOfWeek] || day.dayOfWeek}
                                                </h3>
                                            </div>

                                            <label className="flex cursor-pointer items-center gap-3 lg:pb-2.5">
                                                <input
                                                    type="checkbox"
                                                    checked={formValues.isWorkingDay}
                                                    onChange={handleWorkingDayChange}
                                                    disabled={isSaving}
                                                    className="h-4 w-4 accent-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                                                />
                                                <span className="text-sm font-medium text-white/80">Dzień pracujący</span>
                                            </label>

                                            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                                                <label>
                                                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
                                                        Od
                                                    </span>
                                                    <input
                                                        type="time"
                                                        name="startTime"
                                                        required={formValues.isWorkingDay}
                                                        disabled={!formValues.isWorkingDay || isSaving}
                                                        value={formValues.startTime}
                                                        onChange={handleTimeChange}
                                                        className={inputClassName}
                                                    />
                                                </label>
                                                <label>
                                                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
                                                        Do
                                                    </span>
                                                    <input
                                                        type="time"
                                                        name="endTime"
                                                        required={formValues.isWorkingDay}
                                                        disabled={!formValues.isWorkingDay || isSaving}
                                                        value={formValues.endTime}
                                                        onChange={handleTimeChange}
                                                        className={inputClassName}
                                                    />
                                                </label>
                                                <label>
                                                    <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/45">
                                                        Terminy co (min)
                                                    </span>
                                                    <input
                                                        type="number"
                                                        name="publicSlotDurationMinutes"
                                                        required
                                                        min="15"
                                                        max="480"
                                                        step="15"
                                                        disabled={isSaving}
                                                        value={formValues.publicSlotDurationMinutes}
                                                        onChange={handleTimeChange}
                                                        className={inputClassName}
                                                    />
                                                </label>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSave(day)}
                                                    disabled={isSaving}
                                                    className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {isSaving ? (
                                                        <LoaderCircle aria-hidden="true" size={15} className="animate-spin" />
                                                    ) : (
                                                        <Save aria-hidden="true" size={15} />
                                                    )}
                                                    {isSaving ? "Zapisywanie…" : "Zapisz"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditing}
                                                    disabled={isSaving}
                                                    aria-label="Anuluj edycję"
                                                    className="flex cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <X aria-hidden="true" size={15} />
                                                    Anuluj
                                                </button>
                                            </div>
                                        </div>

                                        {updateError && (
                                            <p role="alert" className="mt-4 text-sm text-red-300">
                                                {updateError}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WorkingHoursPanel;
