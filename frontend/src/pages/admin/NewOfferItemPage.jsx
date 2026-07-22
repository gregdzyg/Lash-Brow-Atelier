import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOfferItem } from "../../api/apiOfferItems";

const initialFormValues = {
    name: "",
    category: "",
    description: "",
    durationMinutes: "",
    basePrice: "",
};

const inputClassName = `
    w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05]
    px-4 py-3 text-sm text-white outline-none transition duration-300
    placeholder:text-white/25 hover:border-[var(--gold)]/60
    focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
    disabled:cursor-not-allowed disabled:opacity-60
`;

const NewOfferItemPage = () => {
    const [formValues, setFormValues] = useState(initialFormValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const submissionInProgress = useRef(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submissionInProgress.current) {
            return;
        }

        const name = formValues.name.trim();
        const description = formValues.description.trim();

        if (
            !name
            || !formValues.category
            || !formValues.durationMinutes
            || formValues.basePrice === ""
        ) {
            setError("Uzupełnij wszystkie wymagane pola.");
            return;
        }

        const offerItemRequest = {
            name,
            category: formValues.category,
            description: description || null,
            durationMinutes: Number(formValues.durationMinutes),
            basePrice: Number(formValues.basePrice),
        };

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setError("");

        try {
            await createOfferItem(offerItemRequest);
            navigate("/admin/offer", {
                replace: true,
                state: {
                    successMessage: "Usługa została dodana.",
                },
            });
        } catch {
            setError("Nie udało się dodać usługi. Sprawdź dane i spróbuj ponownie.");
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
                    Nowa usługa
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Dodaj usługę do aktywnej oferty Atelier.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="
                    max-w-4xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br
                    from-white/[0.08] to-white/[0.025] backdrop-blur-xl
                "
            >
                <div className="space-y-8 p-6 sm:p-8 lg:p-10">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Dane usługi
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-white/45">
                            Pola oznaczone gwiazdką są wymagane.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Nazwa <span className="text-[var(--gold)]">*</span>
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                disabled={isSubmitting}
                                value={formValues.name}
                                onChange={handleChange}
                                placeholder="Wpisz nazwę usługi"
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="category"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Kategoria <span className="text-[var(--gold)]">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                required
                                disabled={isSubmitting}
                                value={formValues.category}
                                onChange={handleChange}
                                className={inputClassName}
                            >
                                <option value="" disabled>
                                    Wybierz kategorię
                                </option>
                                <option value="LASHES">Rzęsy</option>
                                <option value="BROWS">Brwi</option>
                                <option value="OTHER">Inne</option>
                            </select>
                        </div>

                        <div>
                            <label
                                htmlFor="durationMinutes"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
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
                                placeholder="np. 90"
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="basePrice"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Cena podstawowa (PLN) <span className="text-[var(--gold)]">*</span>
                            </label>
                            <input
                                id="basePrice"
                                name="basePrice"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                disabled={isSubmitting}
                                value={formValues.basePrice}
                                onChange={handleChange}
                                placeholder="np. 180,00"
                                className={inputClassName}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label
                                htmlFor="description"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Opis
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                disabled={isSubmitting}
                                value={formValues.description}
                                onChange={handleChange}
                                placeholder="Dodaj opcjonalny opis usługi"
                                className={`${inputClassName} resize-y leading-6`}
                            />
                        </div>
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                        >
                            {error}
                        </div>
                    )}
                </div>

                <div className="
                    flex flex-col-reverse gap-3 border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5
                    sm:flex-row sm:justify-end sm:px-8 lg:px-10
                ">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/offer")}
                        disabled={isSubmitting}
                        className="
                            group flex cursor-pointer items-center justify-center gap-2 rounded-full border
                            border-[var(--gold)]/55 px-6 py-3 text-sm font-semibold text-[var(--gold)]
                            transition-colors hover:border-[var(--gold)] hover:bg-[var(--gold)]/10
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                            focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                            disabled:cursor-not-allowed disabled:opacity-50
                        "
                    >
                        <ArrowLeft aria-hidden="true" size={17} />
                        Anuluj
                    </button>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="
                            flex cursor-pointer items-center justify-center gap-2 rounded-full border-2
                            border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black
                            transition-colors hover:bg-transparent hover:text-[var(--gold)]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                            focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]
                            disabled:cursor-not-allowed disabled:opacity-50
                        "
                    >
                        {isSubmitting ? (
                            <LoaderCircle
                                aria-hidden="true"
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Save aria-hidden="true" size={17} />
                        )}
                        {isSubmitting ? "Dodawanie…" : "Dodaj usługę"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default NewOfferItemPage;
