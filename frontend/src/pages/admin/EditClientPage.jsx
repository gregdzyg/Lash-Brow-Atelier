import { AlertCircle, ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getClient, updateClient } from "../../api/apiClients";

const initialFormValues = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    instagramUsername: "",
    notes: "",
};

const inputClassName = `
    w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05]
    px-4 py-3 text-sm text-white outline-none transition duration-300
    placeholder:text-white/25 hover:border-[var(--gold)]/60
    focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
    disabled:cursor-not-allowed disabled:opacity-60
`;

const EditClientPage = () => {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingError, setLoadingError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const submissionInProgress = useRef(false);
    const { clientId } = useParams();
    const navigate = useNavigate();
    

    useEffect(() => {
        let isMounted = true;

        const fetchClient = async () => {
            try {
                const fetchedClient = await getClient(clientId);

                if (isMounted) {
                    setFormValues({
                        firstName: fetchedClient.firstName ?? "",
                        lastName: fetchedClient.lastName ?? "",
                        phoneNumber: fetchedClient.phoneNumber ?? "",
                        email: fetchedClient.email ?? "",
                        instagramUsername: fetchedClient.instagramUsername ?? "",
                        notes: fetchedClient.notes ?? "",
                    });
                }
            } catch {
                if (isMounted) {
                    setLoadingError("Nie udało się pobrać danych klientki. Spróbuj ponownie później.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchClient();

        return () => {
            isMounted = false;
        };
    }, [clientId]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    };

    const handleCancel = () => {
        navigate(`/admin/clients/${clientId}`);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submissionInProgress.current) {
            return;
        }

        const firstName = formValues.firstName.trim();
        const lastName = formValues.lastName.trim();
        const phoneNumber = formValues.phoneNumber.trim();
        const email = formValues.email.trim();
        const instagramUsername = formValues.instagramUsername.trim();
        const notes = formValues.notes.trim();

        if (!firstName || !lastName || !phoneNumber) {
            setUpdateError("Uzupełnij wszystkie wymagane pola.");
            return;
        }

        const clientRequest = {
            firstName,
            lastName,
            phoneNumber,
            email: email || null,
            instagramUsername: instagramUsername || null,
            notes: notes || null,
        };

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setUpdateError("");

        try {
            await updateClient(clientId, clientRequest);
            navigate(`/admin/clients/${clientId}`, {replace: true, state: {successMessage:
                "Dane klientki zostały zaktualizowane.",
            },});
        } catch {
            setUpdateError("Nie udało się zapisać zmian. Spróbuj ponownie później.");
        } finally {
            submissionInProgress.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 max-w-2xl sm:mb-12">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Panel administracyjny
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    Edytuj klientkę
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Zaktualizuj dane kontaktowe i informacje o klientce.
                </p>
            </div>


            {isLoading && (
                <div
                    role="status"
                    className="flex min-h-52 max-w-4xl flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <LoaderCircle
                        aria-hidden="true"
                        size={32}
                        className="animate-spin text-[var(--gold)]"
                    />
                    <p className="mt-4 text-sm text-white/60">Pobieranie danych klientki…</p>
                </div>
            )}

            {!isLoading && loadingError && (
                <div
                    role="alert"
                    className="flex min-h-52 max-w-4xl flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <AlertCircle aria-hidden="true" size={32} className="text-red-300" />
                    <h2 className="mt-4 text-lg font-semibold text-white">
                        Wystąpił błąd
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-red-200/75">
                        {loadingError}
                    </p>
                    <Link
                        to={`/admin/clients/${clientId}`}
                        className="group mt-6 flex items-center gap-2 rounded-full border border-[var(--gold)]/60 px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition-colors duration-300 hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                    >
                        <ArrowLeft
                            aria-hidden="true"
                            size={17}
                            className="transition-transform duration-300 group-hover:-translate-x-1"
                        />
                        Wróć do klientki
                    </Link>
                </div>
            )}

            {!isLoading && !loadingError && (
                <form
                    onSubmit={handleSubmit}
                    className="max-w-4xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl"
                >
                    <div className="space-y-8 p-6 sm:p-8 lg:p-10">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Dane klientki
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-white/45">
                                Pola oznaczone gwiazdką są wymagane.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-white/85">
                                    Imię <span className="text-[var(--gold)]">*</span>
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    autoComplete="given-name"
                                    required
                                    disabled={isSubmitting}
                                    value={formValues.firstName}
                                    onChange={handleChange}
                                    placeholder="Wpisz imię"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-white/85">
                                    Nazwisko <span className="text-[var(--gold)]">*</span>
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    autoComplete="family-name"
                                    required
                                    disabled={isSubmitting}
                                    value={formValues.lastName}
                                    onChange={handleChange}
                                    placeholder="Wpisz nazwisko"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium text-white/85">
                                    Numer telefonu <span className="text-[var(--gold)]">*</span>
                                </label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    autoComplete="tel"
                                    required
                                    disabled={isSubmitting}
                                    value={formValues.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Wpisz numer telefonu"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/85">
                                    E-mail
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    disabled={isSubmitting}
                                    value={formValues.email}
                                    onChange={handleChange}
                                    placeholder="Wpisz adres e-mail"
                                    className={inputClassName}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="instagramUsername" className="mb-2 block text-sm font-medium text-white/85">
                                    Instagram
                                </label>
                                <input
                                    id="instagramUsername"
                                    name="instagramUsername"
                                    type="text"
                                    autoComplete="off"
                                    disabled={isSubmitting}
                                    value={formValues.instagramUsername}
                                    onChange={handleChange}
                                    placeholder="Wpisz nazwę użytkownika"
                                    className={inputClassName}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="notes" className="mb-2 block text-sm font-medium text-white/85">
                                    Notatki
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={5}
                                    disabled={isSubmitting}
                                    value={formValues.notes}
                                    onChange={handleChange}
                                    placeholder="Dodaj opcjonalne informacje o klientce"
                                    className={`${inputClassName} resize-y leading-6`}
                                />
                            </div>
                        </div>

                        {updateError && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                {updateError}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 lg:px-10">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="group flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[var(--gold)]/55 px-6 py-3 text-sm font-semibold text-[var(--gold)] transition-colors duration-300 hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <ArrowLeft
                                aria-hidden="true"
                                size={17}
                                className="transition-transform duration-300 group-hover:-translate-x-1"
                            />
                            Anuluj
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:border-[var(--gold)]/50 disabled:bg-[var(--gold)]/50 disabled:text-black/65"
                        >
                            {isSubmitting ? (
                                <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />
                            ) : (
                                <Save aria-hidden="true" size={17} />
                            )}
                            {isSubmitting ? "Zapisywanie…" : "Zapisz zmiany"}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
};

export default EditClientPage;
