import {
    AlertCircle,
    CheckCircle2,
    ImageUp,
    LoaderCircle,
    Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import aboutImage from "../../assets/head-images/about.jpg";
import {
    getAboutPortrait,
    replaceAboutPortrait,
} from "../../api/apiAbout";

const AboutManagementPage = () => {
    const [currentPortraitUrl, setCurrentPortraitUrl] = useState(aboutImage);
    const [usesCustomPortrait, setUsesCustomPortrait] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const fileInputRef = useRef(null);
    const submissionInProgress = useRef(false);

    const previewUrl = useMemo(
        () => selectedImage ? URL.createObjectURL(selectedImage) : "",
        [selectedImage],
    );

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    useEffect(() => {
        let isMounted = true;

        const fetchPortrait = async () => {
            try {
                const portrait = await getAboutPortrait();

                if (isMounted && portrait?.imageUrl) {
                    setCurrentPortraitUrl(portrait.imageUrl);
                    setUsesCustomPortrait(true);
                }
            } catch {
                if (isMounted) {
                    setLoadError(
                        "Nie udało się sprawdzić portretu w R2. Wyświetlane jest zdjęcie domyślne.",
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchPortrait();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFileChange = (event) => {
        setSelectedImage(event.target.files?.[0] ?? null);
        setSubmitError("");
        setSuccessMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedImage || submissionInProgress.current) {
            return;
        }

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setSubmitError("");
        setSuccessMessage("");

        try {
            const portrait = await replaceAboutPortrait(selectedImage);
            setCurrentPortraitUrl(portrait.imageUrl);
            setUsesCustomPortrait(true);
            setSelectedImage(null);
            setSuccessMessage("Portret na stronie „O mnie” został zaktualizowany.");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch {
            setSubmitError(
                "Nie udało się zmienić portretu. Sprawdź plik i spróbuj ponownie.",
            );
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
                    O mnie
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Zarządzaj zdjęciem prezentowanym w publicznej sekcji „O mnie”.
                </p>
            </div>

            {loadError && (
                <div
                    role="alert"
                    className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.08] px-5 py-4 text-sm text-amber-100/80"
                >
                    <AlertCircle aria-hidden="true" size={20} />
                    {loadError}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl"
            >
                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:p-10">
                    <div>
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Obecny portret
                                </h2>
                                <p className="mt-1 text-sm text-white/45">
                                    Zdjęcie widoczne teraz na stronie publicznej.
                                </p>
                            </div>
                            {!isLoading && (
                                <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${usesCustomPortrait ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-white/20 bg-white/[0.04] text-white/50"}`}>
                                    {usesCustomPortrait ? "R2" : "Domyślne"}
                                </span>
                            )}
                        </div>

                        <div className="relative min-h-80 overflow-hidden rounded-3xl border border-[var(--gold)]/25 bg-black/20">
                            {isLoading ? (
                                <div className="flex min-h-80 items-center justify-center gap-3 text-sm text-white/45">
                                    <LoaderCircle
                                        aria-hidden="true"
                                        size={20}
                                        className="animate-spin text-[var(--gold)]"
                                    />
                                    Pobieranie portretu…
                                </div>
                            ) : (
                                <img
                                    src={currentPortraitUrl}
                                    alt="Obecny portret na stronie O mnie"
                                    className="h-[30rem] w-full object-cover"
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            {usesCustomPortrait ? "Zmień portret" : "Ustaw portret"}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-white/45">
                            Nowe zdjęcie zostanie zoptymalizowane i zapisane w R2.
                        </p>

                        <label
                            htmlFor="about-portrait-image"
                            className="mt-6 flex min-h-80 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[var(--gold)]/45 bg-black/15 text-center transition hover:border-[var(--gold)] hover:bg-[var(--gold)]/[0.06]"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Podgląd nowego portretu"
                                    className="h-[30rem] w-full object-cover"
                                />
                            ) : (
                                <>
                                    <ImageUp
                                        aria-hidden="true"
                                        size={36}
                                        className="text-[var(--gold)]"
                                    />
                                    <span className="mt-4 text-sm font-semibold text-white/75">
                                        Wybierz nowe zdjęcie
                                    </span>
                                    <span className="mt-1 text-xs text-white/35">
                                        JPG, JPEG lub PNG · maks. 10 MB
                                    </span>
                                </>
                            )}
                        </label>
                        <input
                            ref={fileInputRef}
                            id="about-portrait-image"
                            type="file"
                            accept="image/jpeg,image/png"
                            disabled={isSubmitting}
                            onChange={handleFileChange}
                            className="sr-only"
                        />

                        {selectedImage && (
                            <p className="mt-3 truncate text-xs text-white/45">
                                Wybrany plik: {selectedImage.name}
                            </p>
                        )}

                        {submitError && (
                            <div
                                role="alert"
                                className="mt-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                <AlertCircle aria-hidden="true" size={18} />
                                {submitError}
                            </div>
                        )}

                        {successMessage && (
                            <div
                                role="status"
                                className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                            >
                                <CheckCircle2 aria-hidden="true" size={18} />
                                {successMessage}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:px-8 lg:px-10">
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedImage}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <LoaderCircle
                                aria-hidden="true"
                                size={17}
                                className="animate-spin"
                            />
                        ) : (
                            <Upload aria-hidden="true" size={17} />
                        )}
                        {isSubmitting ? "Zapisywanie…" : "Zapisz portret"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default AboutManagementPage;
