import { LoaderCircle, Save, X } from "lucide-react";
import { useState } from "react";
import {
    createAvailabilityException,
    updateAvailabilityException,
} from "../../../api/apiAvailability";

const exceptionTypes = [
    { value: "CLOSED_DAY", label: "Dzień wolny" },
    { value: "BLOCKED", label: "Blokada godzin" },
    { value: "EXTRA_OPEN", label: "Dodatkowe godziny" },
];

const normalizeTime = (value) => value?.slice(0, 5) || "";

const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const inputClassName = `
    w-full rounded-xl border border-[var(--gold)]/30 bg-black/20 px-4 py-3 text-sm text-white
    outline-none transition placeholder:text-white/25 focus:border-[var(--gold)]
    focus:ring-2 focus:ring-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-50
`;

const AvailabilityExceptionForm = ({ exception, onCancel, onSuccess }) => {
    const isEditMode = Boolean(exception);
    const minimumDate = formatLocalDate(new Date());
    const [formValues, setFormValues] = useState({
        date: exception?.date || "",
        type: exception?.type || "CLOSED_DAY",
        startTime: normalizeTime(exception?.startTime),
        endTime: normalizeTime(exception?.endTime),
        note: exception?.note || "",
    });
    const [validationError, setValidationError] = useState("");
    const [apiError, setApiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormValues((current) => ({
            ...current,
            [name]: value,
            ...(name === "type" && value === "CLOSED_DAY"
                ? { startTime: "", endTime: "" }
                : {}),
        }));
        setValidationError("");
        setApiError("");
    };

    const validate = () => {
        if (!formValues.date) {
            return "Wybierz datę wyjątku.";
        }

        if (formValues.date < minimumDate) {
            return "Data wyjątku nie może być z przeszłości.";
        }

        if (!exceptionTypes.some((type) => type.value === formValues.type)) {
            return "Wybierz prawidłowy typ wyjątku.";
        }

        if (formValues.type !== "CLOSED_DAY") {
            if (!formValues.startTime || !formValues.endTime) {
                return "Podaj godzinę rozpoczęcia i zakończenia.";
            }

            if (formValues.startTime >= formValues.endTime) {
                return "Godzina rozpoczęcia musi być wcześniejsza niż godzina zakończenia.";
            }
        }

        if (formValues.note.length > 500) {
            return "Notatka może mieć maksymalnie 500 znaków.";
        }

        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const error = validate();

        if (error) {
            setValidationError(error);
            return;
        }

        const hasTimes = formValues.type !== "CLOSED_DAY";
        const trimmedNote = formValues.note.trim();
        const request = {
            date: formValues.date,
            startTime: hasTimes ? formValues.startTime : null,
            endTime: hasTimes ? formValues.endTime : null,
            type: formValues.type,
            note: trimmedNote || null,
        };

        setIsSubmitting(true);
        setApiError("");

        try {
            if (isEditMode) {
                await updateAvailabilityException(exception.id, request);
            } else {
                await createAvailabilityException(request);
            }

            await onSuccess(isEditMode);
        } catch {
            setApiError(
                isEditMode
                    ? "Nie udało się zapisać zmian wyjątku. Sprawdź dane i spróbuj ponownie."
                    : "Nie udało się dodać wyjątku. Sprawdź dane i spróbuj ponownie.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const requiresTime = formValues.type !== "CLOSED_DAY";

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-7 overflow-hidden rounded-4xl border border-[var(--gold)]/35 bg-gradient-to-br from-white/[0.09] to-white/[0.03] backdrop-blur-xl"
        >
            <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {isEditMode ? "Edytuj wyjątek" : "Nowy wyjątek"}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-white/50">
                            {isEditMode
                                ? "Zmień datę, typ lub zakres godzin."
                                : "Dodaj zmianę dostępności dla konkretnej daty."
                            }
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        aria-label="Zamknij formularz"
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white/55 transition hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X aria-hidden="true" size={17} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label>
                        <span className="mb-2 block text-sm font-medium text-white/85">
                            Data <span className="text-[var(--gold)]">*</span>
                        </span>
                        <input
                            type="date"
                            name="date"
                            required
                            min={minimumDate}
                            disabled={isSubmitting}
                            value={formValues.date}
                            onChange={handleChange}
                            className={inputClassName}
                        />
                    </label>

                    <label>
                        <span className="mb-2 block text-sm font-medium text-white/85">
                            Typ <span className="text-[var(--gold)]">*</span>
                        </span>
                        <select
                            name="type"
                            required
                            disabled={isSubmitting}
                            value={formValues.type}
                            onChange={handleChange}
                            className={inputClassName}
                        >
                            {exceptionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {requiresTime && (
                        <>
                            <label>
                                <span className="mb-2 block text-sm font-medium text-white/85">
                                    Godzina od <span className="text-[var(--gold)]">*</span>
                                </span>
                                <input
                                    type="time"
                                    name="startTime"
                                    required
                                    disabled={isSubmitting}
                                    value={formValues.startTime}
                                    onChange={handleChange}
                                    className={inputClassName}
                                />
                            </label>

                            <label>
                                <span className="mb-2 block text-sm font-medium text-white/85">
                                    Godzina do <span className="text-[var(--gold)]">*</span>
                                </span>
                                <input
                                    type="time"
                                    name="endTime"
                                    required
                                    disabled={isSubmitting}
                                    value={formValues.endTime}
                                    onChange={handleChange}
                                    className={inputClassName}
                                />
                            </label>
                        </>
                    )}

                    <label className="md:col-span-2">
                        <span className="mb-2 flex items-center justify-between gap-3 text-sm font-medium text-white/85">
                            <span>Notatka</span>
                            <span className="text-xs font-normal text-white/35">
                                {formValues.note.length}/500
                            </span>
                        </span>
                        <textarea
                            name="note"
                            rows={3}
                            maxLength={500}
                            disabled={isSubmitting}
                            value={formValues.note}
                            onChange={handleChange}
                            placeholder="Opcjonalna informacja o wyjątku"
                            className={`${inputClassName} resize-y leading-6`}
                        />
                    </label>
                </div>

                {(validationError || apiError) && (
                    <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {validationError || apiError}
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)]/50 px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <X aria-hidden="true" size={16} />
                    Anuluj
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                    ) : (
                        <Save aria-hidden="true" size={16} />
                    )}
                    {isSubmitting
                        ? "Zapisywanie…"
                        : isEditMode ? "Zapisz zmiany" : "Dodaj wyjątek"
                    }
                </button>
            </div>
        </form>
    );
};

export default AvailabilityExceptionForm;
