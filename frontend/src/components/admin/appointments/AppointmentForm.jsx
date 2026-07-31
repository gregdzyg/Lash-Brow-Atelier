import { AlertCircle, ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getClients } from "../../../api/apiClients";
import { getOfferItems } from "../../../api/apiOfferItems";
import { getSuggestedOfferItems } from "../../../api/apiAppointments";
import { formatLocalTime } from "../../../utils/dateTime";

const emptyValues = {
    clientId: "",
    offerItemId: "",
    appointmentDate: "",
    startTime: "",
    durationMinutes: "",
    price: "",
    note: "",
};

const inputClassName = `
    w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05]
    px-4 py-3 text-sm text-white outline-none transition duration-300
    placeholder:text-white/25 hover:border-[var(--gold)]/60
    focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
    disabled:cursor-not-allowed disabled:opacity-60
`;

const getApiErrorMessage = (error) => {
    const response = error.response?.data;

    if (typeof response?.message === "string" && response.message.trim()) {
        return response.message;
    }

    if (Array.isArray(response?.fieldErrors) && response.fieldErrors.length > 0) {
        return response.fieldErrors.map((item) => item.message).join(" ");
    }

    return "Nie udało się zapisać wizyty. Sprawdź dane i spróbuj ponownie.";
};

const AppointmentForm = ({
    initialValues = emptyValues,
    onSubmit,
    onCancel,
    submitLabel = "Zapisz wizytę",
}) => {
    const [formValues, setFormValues] = useState({
        ...emptyValues,
        ...initialValues,
    });
    const [clients, setClients] = useState([]);
    const [offerItems, setOfferItems] = useState([]);
    const [suggestedOfferItemIds, setSuggestedOfferItemIds] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
     const [clientSearch, setClientSearch] = useState("");
    const submissionInProgress = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const fetchOptions = async () => {
            setIsLoadingOptions(true);
            setError("");

            try {
                const [clientsResponse, offerItemsResponse] = await Promise.all([
                    getClients(),
                    getOfferItems(),
                ]);

                if (isMounted) {
                    setClients(
                        (Array.isArray(clientsResponse) ? clientsResponse : [])
                            .filter((client) => client.active !== false)
                            .sort((first, second) => `${first.lastName} ${first.firstName}`.localeCompare(
                                `${second.lastName} ${second.firstName}`,
                                "pl",
                            )),
                    );
                    setOfferItems(
                        (Array.isArray(offerItemsResponse) ? offerItemsResponse : [])
                            .filter((item) => item.isActive !== false)
                            .sort((first, second) => first.name.localeCompare(second.name, "pl")),
                    );
                }
            } catch {
                if (isMounted) {
                    setError("Nie udało się pobrać listy klientek i usług. Odśwież stronę i spróbuj ponownie.");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingOptions(false);
                }
            }
        };

        fetchOptions();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
    if (!formValues.offerItemId || offerItems.length === 0) {
        return;
    }

    const selectedOfferItem = offerItems.find(
        (offerItem) => String(offerItem.id) === String(formValues.offerItemId),
    );

    if (!selectedOfferItem) {
        return;
    }

    setFormValues((current) => {
        const durationMinutes = current.durationMinutes === ""
            ? selectedOfferItem.durationMinutes
            : current.durationMinutes;

        const price = current.price === ""
            ? selectedOfferItem.basePrice
            : current.price;

        if (
            durationMinutes === current.durationMinutes
            && price === current.price
        ) {
            return current;
        }

        return {
            ...current,
            durationMinutes,
            price,
        };
    });
}, [offerItems, formValues.offerItemId]);

    useEffect(() => {
        let isMounted = true;

        const fetchSuggestedOfferItems = async () => {
            if (!formValues.clientId) {
                setSuggestedOfferItemIds([]);
                return;
            }

            try {
                const response = await getSuggestedOfferItems(formValues.clientId);

                if (isMounted) {
                    setSuggestedOfferItemIds(
                        (Array.isArray(response) ? response : [])
                            .map((item) => item.id),
                    );
                }
            } catch {
                if (isMounted) {
                    setSuggestedOfferItemIds([]);
                }
            }
        };

        fetchSuggestedOfferItems();

        return () => {
            isMounted = false;
        };
    }, [formValues.clientId]);

    const suggestedOfferItems = useMemo(
        () => suggestedOfferItemIds
            .map((suggestedId) => offerItems.find(
                (offerItem) => offerItem.id === suggestedId,
            ))
            .filter(Boolean),
        [offerItems, suggestedOfferItemIds],
    );

    const remainingOfferItems = useMemo(
        () => offerItems.filter(
            (offerItem) => !suggestedOfferItemIds.includes(offerItem.id),
        ),
        [offerItems, suggestedOfferItemIds],
    );

    const filteredClients = useMemo(() => {
        const searchTerms = clientSearch
            .trim()
            .toLocaleLowerCase("pl")
            .split(/\s+/)
            .filter(Boolean);

        if (searchTerms.length === 0) {
            return clients;
        }

        return clients.filter((client) => {
            const searchableClient = [
                client.firstName,
                client.lastName,
                client.phoneNumber,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("pl");

            return searchTerms.every((term) => searchableClient.includes(term));
        });
    }, [clients, clientSearch]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setError("");

        if (name === "offerItemId") {
            const selectedOfferItem = offerItems.find((item) => String(item.id) === value);
            setFormValues((current) => ({
                ...current,
                offerItemId: value,
                durationMinutes: selectedOfferItem?.durationMinutes ?? "",
                price: selectedOfferItem?.basePrice ?? "",
            }));
            return;
        }

        setFormValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submissionInProgress.current) {
            return;
        }

        const durationMinutes = Number(formValues.durationMinutes);
        const price = Number(formValues.price);

        if (
            !formValues.clientId
            || !formValues.offerItemId
            || !formValues.appointmentDate
            || !formValues.startTime
        ) {
            setError("Uzupełnij wszystkie wymagane pola.");
            return;
        }

        if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
            setError("Czas trwania wizyty musi być dodatnią liczbą minut.");
            return;
        }

        if (formValues.price === "" || !Number.isFinite(price) || price < 0) {
            setError("Cena wizyty nie może być ujemna.");
            return;
        }

        const trimmedNote = formValues.note.trim();
        const request = {
            clientId: Number(formValues.clientId),
            offerItemId: Number(formValues.offerItemId),
            appointmentDate: formValues.appointmentDate,
            startTime: formatLocalTime(formValues.startTime),
            durationMinutes,
            price,
            note: trimmedNote || null,
        };

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setError("");

        try {
            await onSubmit(request);
        } catch (submitError) {
            setError(getApiErrorMessage(submitError));
        } finally {
            submissionInProgress.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-4xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl"
        >
            <div className="space-y-8 p-6 sm:p-8 lg:p-10">
                <div>
                    <h2 className="text-lg font-semibold text-white">Dane wizyty</h2>
                    <p className="mt-1 text-sm leading-6 text-white/45">
                        Pola oznaczone gwiazdką są wymagane. Dostępność zostanie ostatecznie sprawdzona przy zapisie.
                    </p>
                </div>

                {isLoadingOptions ? (
                    <div role="status" className="flex min-h-32 items-center justify-center gap-3 text-sm text-white/55">
                        <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-[var(--gold)]" />
                        Pobieranie klientek i usług…
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="clientId" className="mb-2 block text-sm font-medium text-white/85">
                                Klientka <span className="text-[var(--gold)]">*</span>
                            </label>
                                <input
                                    type="search"
                                    value={clientSearch}
                                    onChange={(event) => setClientSearch(event.target.value)}
                                    placeholder="Szukaj po imieniu, nazwisku lub telefonie"
                                    aria-label="Wyszukaj klientkę"
                                    disabled={isSubmitting}
                                    className={`${inputClassName} mb-3`}
                                />

                                <select
                                    id="clientId"
                                    name="clientId"
                                    required
                                    disabled={isSubmitting}
                                    value={formValues.clientId}
                                    onChange={handleChange}
                                    className={inputClassName}
                                >
                                    <option value="" disabled>
                                        Wybierz klientkę
                                    </option>

                                    {filteredClients.length === 0 ? (
                                        <option value="" disabled>
                                            Brak pasujących klientek
                                        </option>
                                    ) : (
                                        filteredClients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.firstName} {client.lastName}
                                            </option>
                                        ))
                                    )}
                                </select>
                        </div>

                        <div>
                            <label htmlFor="offerItemId" className="mb-2 block text-sm font-medium text-white/85">
                                Usługa <span className="text-[var(--gold)]">*</span>
                            </label>
                            <select
                                id="offerItemId"
                                name="offerItemId"
                                required
                                disabled={isSubmitting}
                                value={formValues.offerItemId}
                                onChange={handleChange}
                                className={inputClassName}
                            >
                                <option value="" disabled>Wybierz usługę</option>
                                {suggestedOfferItems.length > 0 ? (
                                    <>
                                        <optgroup label="Ostatnio wybierane">
                                            {suggestedOfferItems.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                        {remainingOfferItems.length > 0 && (
                                            <optgroup label="Pozostałe usługi">
                                                {remainingOfferItems.map((item) => (
                                                    <option key={item.id} value={item.id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </>
                                ) : (
                                    offerItems.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="appointmentDate" className="mb-2 block text-sm font-medium text-white/85">
                                Data <span className="text-[var(--gold)]">*</span>
                            </label>
                            <input
                                id="appointmentDate"
                                name="appointmentDate"
                                type="date"
                                required
                                disabled={isSubmitting}
                                value={formValues.appointmentDate}
                                onChange={handleChange}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label htmlFor="startTime" className="mb-2 block text-sm font-medium text-white/85">
                                Godzina rozpoczęcia <span className="text-[var(--gold)]">*</span>
                            </label>
                            <input
                                id="startTime"
                                name="startTime"
                                type="time"
                                step="60"
                                required
                                disabled={isSubmitting}
                                value={formValues.startTime}
                                onChange={handleChange}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label htmlFor="durationMinutes" className="mb-2 block text-sm font-medium text-white/85">
                                Czas trwania (min) <span className="text-[var(--gold)]">*</span>
                            </label>
                            <input
                                id="durationMinutes"
                                name="durationMinutes"
                                type="number"
                                min="1"
                                step="1"
                                required
                                disabled={isSubmitting}
                                value={formValues.durationMinutes}
                                onChange={handleChange}
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label htmlFor="price" className="mb-2 block text-sm font-medium text-white/85">
                                Cena (PLN) <span className="text-[var(--gold)]">*</span>
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                disabled={isSubmitting}
                                value={formValues.price}
                                onChange={handleChange}
                                className={inputClassName}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="note" className="mb-2 block text-sm font-medium text-white/85">
                                Notatka
                            </label>
                            <textarea
                                id="note"
                                name="note"
                                rows={5}
                                maxLength={1000}
                                disabled={isSubmitting}
                                value={formValues.note}
                                onChange={handleChange}
                                placeholder="Opcjonalna informacja o wizycie"
                                className={`${inputClassName} resize-y leading-6`}
                            />
                            <p className="mt-2 text-right text-xs text-white/30">
                                {formValues.note.length}/1000
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div role="alert" className="flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        <AlertCircle aria-hidden="true" size={17} className="mt-0.5 shrink-0" />
                        {error}
                    </div>
                )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 lg:px-10">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/65 transition hover:border-white/35 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft aria-hidden="true" size={16} />
                    Anuluj
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || isLoadingOptions || Boolean(error && clients.length === 0)}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <LoaderCircle aria-hidden="true" size={16} className="animate-spin" />
                    ) : (
                        <Save aria-hidden="true" size={16} />
                    )}
                    {isSubmitting ? "Zapisywanie…" : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default AppointmentForm;
