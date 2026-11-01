import { AlertCircle, CheckCircle2, ImagePlus, LoaderCircle, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAdminGalleryImages, uploadGalleryImage } from "../../api/apiGallery";

const inputClassName = `
    w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05]
    px-4 py-3 text-sm text-white outline-none transition duration-300
    placeholder:text-white/25 hover:border-[var(--gold)]/60
    focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
    disabled:cursor-not-allowed disabled:opacity-60
`;

const getImagesCountLabel = (count) => {
    if (count === 1) {
        return "1 zdjęcie";
    }

    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14)) {
        return `${count} zdjęcia`;
    }

    return `${count} zdjęć`;
};

const GalleryManagementPage = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [altText, setAltText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isGalleryLoading, setIsGalleryLoading] = useState(true);
    const [galleryError, setGalleryError] = useState("");
    const fileInputRef = useRef(null);
    const submissionInProgress = useRef(false);

    const previewUrl = useMemo(
        () => file ? URL.createObjectURL(file) : "",
        [file],
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

        const fetchGalleryImages = async () => {
            try {
                const images = await getAdminGalleryImages();

                if (isMounted) {
                    setGalleryImages(Array.isArray(images) ? images : []);
                }
            } catch {
                if (isMounted) {
                    setGalleryError("Nie udało się pobrać zdjęć galerii.");
                }
            } finally {
                if (isMounted) {
                    setIsGalleryLoading(false);
                }
            }
        };

        fetchGalleryImages();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleFileChange = (event) => {
        setFile(event.target.files?.[0] ?? null);
        setUploadedImage(null);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (submissionInProgress.current) {
            return;
        }

        if (!file) {
            setError("Wybierz zdjęcie, które chcesz dodać do galerii.");
            return;
        }

        submissionInProgress.current = true;
        setIsSubmitting(true);
        setError("");
        setUploadedImage(null);

        try {
            const createdImage = await uploadGalleryImage({
                file,
                title,
                altText,
            });

            setUploadedImage(createdImage);
            setGalleryImages((currentImages) => [
                createdImage,
                ...currentImages,
            ]);
            setFile(null);
            setTitle("");
            setAltText("");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch {
            setError("Nie udało się dodać zdjęcia. Sprawdź plik i spróbuj ponownie.");
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
                    Galeria
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Dodawaj zdjęcia prezentowane w publicznej galerii Atelier.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="max-w-5xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl"
            >
                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:p-10">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Nowe zdjęcie
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-white/45">
                            Obsługiwane formaty: JPG, PNG i WebP, maksymalnie 10 MB.
                        </p>

                        <label
                            htmlFor="gallery-file"
                            className="mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-[var(--gold)]/45 bg-black/15 text-center transition hover:border-[var(--gold)] hover:bg-[var(--gold)]/[0.06]"
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Podgląd wybranego zdjęcia"
                                    className="h-72 w-full object-cover"
                                />
                            ) : (
                                <div className="px-6 py-12">
                                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 text-[var(--gold)]">
                                        <ImagePlus aria-hidden="true" size={30} />
                                    </span>
                                    <span className="mt-5 block text-sm font-semibold text-white">
                                        Wybierz zdjęcie z komputera
                                    </span>
                                    <span className="mt-2 block text-xs text-white/45">
                                        Kliknij tutaj, aby otworzyć wybór pliku
                                    </span>
                                </div>
                            )}
                        </label>
                        <input
                            ref={fileInputRef}
                            id="gallery-file"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            required
                            disabled={isSubmitting}
                            onChange={handleFileChange}
                            className="sr-only"
                        />
                        {file && (
                            <p className="mt-3 truncate text-xs text-white/55">
                                Wybrany plik: <span className="text-white/80">{file.name}</span>
                            </p>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label
                                htmlFor="gallery-title"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Tytuł
                            </label>
                            <input
                                id="gallery-title"
                                type="text"
                                maxLength={255}
                                disabled={isSubmitting}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Opcjonalny tytuł zdjęcia"
                                className={inputClassName}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="gallery-alt-text"
                                className="mb-2 block text-sm font-medium text-white/85"
                            >
                                Tekst alternatywny
                            </label>
                            <textarea
                                id="gallery-alt-text"
                                rows={5}
                                maxLength={500}
                                disabled={isSubmitting}
                                value={altText}
                                onChange={(event) => setAltText(event.target.value)}
                                placeholder="Krótko opisz, co znajduje się na zdjęciu"
                                className={`${inputClassName} resize-y leading-6`}
                            />
                            <p className="mt-2 text-xs leading-5 text-white/40">
                                Opis pomaga osobom korzystającym z czytników ekranu i pojawi się, jeśli zdjęcie nie zostanie załadowane.
                            </p>
                        </div>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                            >
                                {error}
                            </div>
                        )}

                        {uploadedImage && (
                            <div
                                role="status"
                                className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4"
                            >
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                                    <CheckCircle2 aria-hidden="true" size={18} />
                                    Zdjęcie zostało dodane do galerii.
                                </div>
                                <img
                                    src={uploadedImage.imageUrl}
                                    alt={uploadedImage.altText || uploadedImage.title || "Dodane zdjęcie"}
                                    className="mt-4 h-36 w-full rounded-xl object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end border-t border-[var(--gold)]/20 bg-black/10 px-6 py-5 sm:px-8 lg:px-10">
                    <button
                        type="submit"
                        disabled={isSubmitting || !file}
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <LoaderCircle aria-hidden="true" size={17} className="animate-spin" />
                        ) : (
                            <Upload aria-hidden="true" size={17} />
                        )}
                        {isSubmitting ? "Dodawanie…" : "Dodaj zdjęcie"}
                    </button>
                </div>
            </form>

            <div className="mt-12">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">
                            Zdjęcia w galerii
                        </h2>
                        <p className="mt-2 text-sm text-white/50">
                            Wszystkie zdjęcia zapisane w panelu administracyjnym.
                        </p>
                    </div>
                    {!isGalleryLoading && !galleryError && (
                        <span className="shrink-0 text-sm text-white/45">
                            {getImagesCountLabel(galleryImages.length)}
                        </span>
                    )}
                </div>

                {isGalleryLoading && (
                    <div
                        role="status"
                        className="flex items-center justify-center gap-3 rounded-3xl border border-[var(--gold)]/20 bg-white/[0.035] px-6 py-12 text-sm text-white/55"
                    >
                        <LoaderCircle aria-hidden="true" size={20} className="animate-spin text-[var(--gold)]" />
                        Pobieranie zdjęć…
                    </div>
                )}

                {galleryError && (
                    <div
                        role="alert"
                        className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
                    >
                        <AlertCircle aria-hidden="true" size={20} />
                        {galleryError}
                    </div>
                )}

                {!isGalleryLoading && !galleryError && galleryImages.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-[var(--gold)]/30 bg-white/[0.025] px-6 py-12 text-center">
                        <ImagePlus aria-hidden="true" size={30} className="mx-auto text-[var(--gold)]/70" />
                        <p className="mt-4 text-sm font-medium text-white/70">
                            Galeria jest jeszcze pusta.
                        </p>
                    </div>
                )}

                {!isGalleryLoading && !galleryError && galleryImages.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {galleryImages.map((image) => (
                            <article
                                key={image.id}
                                className="overflow-hidden rounded-3xl border border-[var(--gold)]/25 bg-white/[0.045]"
                            >
                                <div className="relative">
                                    <img
                                        src={image.imageUrl}
                                        alt={image.altText || image.title || "Zdjęcie galerii"}
                                        className={`h-64 w-full object-cover ${image.isActive ? "" : "opacity-45 grayscale"}`}
                                    />
                                    <span className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${image.isActive ? "border-emerald-300/40 bg-emerald-950/70 text-emerald-200" : "border-white/25 bg-black/70 text-white/70"}`}>
                                        {image.isActive ? "Widoczne" : "Ukryte"}
                                    </span>
                                </div>
                                <div className="space-y-2 p-5">
                                    <h3 className="font-semibold text-white">
                                        {image.title || "Bez tytułu"}
                                    </h3>
                                    <p className="min-h-10 text-sm leading-5 text-white/50">
                                        {image.altText || "Brak tekstu alternatywnego"}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default GalleryManagementPage;
