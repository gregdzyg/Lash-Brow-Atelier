import {
    AlertCircle,
    ArrowLeft,
    Instagram,
    LoaderCircle,
    Mail,
    Pencil,
    Phone,
    StickyNote,
    Trash2,
    UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { deleteClient, getClient } from "../../api/apiClients";

const ClientDetailsPage = () => {
    const [client, setClient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const deleteInProgress = useRef(false);
    const { clientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const successMessage = location.state?.successMessage;

    useEffect(() => {
        let isMounted = true;

        const fetchClient = async () => {
            try {
                const fetchedClient = await getClient(clientId);

                if (isMounted) {
                    setClient(fetchedClient);
                }
            } catch {
                if (isMounted) {
                    setError("Nie udało się pobrać danych klientki. Spróbuj ponownie później.");
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

    const handleShowDeleteConfirmation = () => {
        setDeleteError("");
        setIsDeleteConfirmationVisible(true);
    };

    const handleCancelDelete = () => {
        if (deleteInProgress.current) {
            return;
        }

        setDeleteError("");
        setIsDeleteConfirmationVisible(false);
    };

    const handleDelete = async () => {
        if (deleteInProgress.current) {
            return;
        }

        deleteInProgress.current = true;
        setIsDeleting(true);
        setDeleteError("");

        try {
            await deleteClient(clientId);
            navigate("/admin/clients", {
                replace: true,
                state: {
                    successMessage: "Klientka została zarchiwizowana.",
                },
            });
        } catch {
            setDeleteError("Nie udało się usunąć klientki. Spróbuj ponownie później.");
        } finally {
            deleteInProgress.current = false;
            setIsDeleting(false);
        }
    };

    const renderValue = (value) => value?.trim() || "Brak danych";
    const clientName = client
        ? [client.firstName, client.lastName]
            .map((value) => value?.trim())
            .filter(Boolean)
            .join(" ") || "Brak danych"
        : "Szczegóły klientki";

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 sm:mb-12">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Profil klientki
                </p>

                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="break-words text-3xl font-bold text-white sm:text-4xl">
                            {clientName}
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                            Dane kontaktowe i informacje zapisane w bazie Atelier.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                        <Link
                            to={`/admin/clients/${clientId}/edit`}
                            className="flex w-fit shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--gold)]/65 px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition-colors duration-300 hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        >
                            <Pencil aria-hidden="true" size={16} />
                            Edytuj dane
                        </Link>

                        <Link
                            to="/admin/clients"
                            className="group flex w-fit shrink-0 items-center justify-center gap-2 rounded-full px-2 py-1 text-sm font-medium text-white/55 transition-colors duration-300 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                        >
                            <ArrowLeft
                                aria-hidden="true"
                                size={17}
                                className="transition-transform duration-300 group-hover:-translate-x-1"
                            />
                            Wróć do listy
                        </Link>
                    </div>
                </div>
            </div>


            {successMessage && (
                <div
                    role="status"
                    className="mb-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                >
                    {successMessage}
                </div>
            )}

            {isLoading && (
                <div
                    role="status"
                    className="flex min-h-52 max-w-5xl flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <LoaderCircle
                        aria-hidden="true"
                        size={32}
                        className="animate-spin text-[var(--gold)]"
                    />
                    <p className="mt-4 text-sm text-white/60">Pobieranie danych klientki…</p>
                </div>
            )}

            {!isLoading && error && (
                <div
                    role="alert"
                    className="flex min-h-52 max-w-5xl flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <AlertCircle aria-hidden="true" size={32} className="text-red-300" />
                    <h2 className="mt-4 text-lg font-semibold text-white">
                        Wystąpił błąd
                    </h2>
                    <p className="mt-2 max-w-md text-sm leading-6 text-red-200/75">
                        {error}
                    </p>
                </div>
            )}

            {!isLoading && !error && client && (
                <article className="max-w-5xl overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl">
                    <div className="flex items-center gap-4 border-b border-[var(--gold)]/20 px-6 py-6 sm:px-8 lg:px-10">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]">
                            <UserRound aria-hidden="true" size={21} />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]/70">
                                Dane klientki
                            </p>
                            <h2 className="mt-1 break-words text-lg font-semibold text-white sm:text-xl">
                                {clientName}
                            </h2>
                        </div>
                    </div>

                    <dl className="grid grid-cols-1 px-6 py-2 sm:grid-cols-3 sm:px-8 lg:px-10">
                        <div className="flex min-w-0 gap-3 border-b border-[var(--gold)]/15 py-5 sm:border-b-0 sm:border-r sm:pr-6">
                            <Phone aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--gold)]/75" />
                            <div className="min-w-0">
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Telefon
                                </dt>
                                <dd className="mt-2 break-words text-sm leading-6 text-white/75">
                                    {renderValue(client.phoneNumber)}
                                </dd>
                            </div>
                        </div>

                        <div className="flex min-w-0 gap-3 border-b border-[var(--gold)]/15 py-5 sm:border-b-0 sm:border-r sm:px-6">
                            <Mail aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--gold)]/75" />
                            <div className="min-w-0">
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                                    E-mail
                                </dt>
                                <dd className="mt-2 break-words text-sm leading-6 text-white/75">
                                    {renderValue(client.email)}
                                </dd>
                            </div>
                        </div>

                        <div className="flex min-w-0 gap-3 py-5 sm:pl-6">
                            <Instagram aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[var(--gold)]/75" />
                            <div className="min-w-0">
                                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
                                    Instagram
                                </dt>
                                <dd className="mt-2 break-words text-sm leading-6 text-white/75">
                                    {renderValue(client.instagramUsername)}
                                </dd>
                            </div>
                        </div>
                    </dl>

                    <div className="border-t border-[var(--gold)]/20 bg-black/10 px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
                        <div className="flex items-center gap-3">
                            <StickyNote aria-hidden="true" size={18} className="shrink-0 text-[var(--gold)]/75" />
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/55">
                                Notatki
                            </h2>
                        </div>
                        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-white/70">
                            {renderValue(client.notes)}
                        </p>
                    </div>

                    <div className="border-t border-red-500/20 bg-red-950/[0.08] px-6 py-6 sm:px-8 sm:py-8 lg:px-10">
                        {!isDeleteConfirmationVisible ? (
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-red-200/70">
                                        Archiwizacja klientki
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-white/45">
                                        Klientka zniknie z aktywnej listy, ale jej dane pozostaną w bazie.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleShowDeleteConfirmation}
                                    className="flex w-fit cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400/55 px-5 py-2.5 text-sm font-semibold text-red-200 transition-colors duration-300 hover:border-red-300 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                                >
                                    <Trash2 aria-hidden="true" size={16} />
                                    Zarchiwizuj klientkę
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.07] p-5 sm:p-6">
                                <h2 className="text-base font-semibold text-white">
                                    Czy na pewno chcesz zarchiwizować tę klientkę?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-white/55">
                                    Klientka zniknie z aktywnej listy. 
                                </p>

                                {deleteError && (
                                    <div
                                        role="alert"
                                        className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                                    >
                                        {deleteError}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCancelDelete}
                                        disabled={isDeleting}
                                        className="cursor-pointer rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/65 transition-colors duration-300 hover:border-white/35 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Anuluj
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-400 bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-100 transition-colors duration-300 hover:bg-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:border-red-400/40 disabled:text-red-100/50"
                                    >
                                        {isDeleting ? (
                                            <LoaderCircle
                                                aria-hidden="true"
                                                size={16}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 aria-hidden="true" size={16} />
                                        )}
                                        {isDeleting ? "Usuwanie…" : "Tak, usuń klientkę"}
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

export default ClientDetailsPage;
