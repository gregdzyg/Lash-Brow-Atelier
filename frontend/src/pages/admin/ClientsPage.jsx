import {
    AlertCircle,
    LoaderCircle,
    Search,
    UsersRound,
    UserPlus,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getClients } from "../../api/apiClients";
import { Link, useLocation } from "react-router-dom";


const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [clientSearch, setClientSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const successMessage = location.state?.successMessage;

    useEffect(() => {
        let isMounted = true;

        const fetchClients = async () => {
            try {
                const fetchedClients = await getClients();

                if (isMounted) {
                    setClients(Array.isArray(fetchedClients) ? fetchedClients : []);
                }
            } catch {
                if (isMounted) {
                    setError("Nie udało się pobrać listy klientek. Spróbuj ponownie później.");
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchClients();

        return () => {
            isMounted = false;
        };
    }, []);

    const renderContactValue = (value) => value?.trim() || "Brak danych";

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
                client.email,
                client.instagramUsername,
            ]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase("pl");

            return searchTerms.every((term) =>
                searchableClient.includes(term)
            );
        });
    }, [clients, clientSearch]);

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                    <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                        <span className="h-px w-8 bg-[var(--gold)]/70" />
                        Panel administracyjny
                    </p>

                    <h1 className="text-3xl font-bold text-white sm:text-4xl">
                        Klientki
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                        Lista klientek zapisanych w bazie Atelier.
                    </p>
                </div>

                <Link
                    to="/admin/clients/new"
                    className="flex w-fit shrink-0 items-center justify-center gap-2 rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-black transition-colors duration-300 hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                >
                    <UserPlus aria-hidden="true" size={17} />
                    Dodaj klientkę
                </Link>
            </div>

            {successMessage && (
                <div
                    role="status"
                    aria-live="polite"
                    className="mb-6 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
                >
                    {successMessage}
                </div>
            )}

            {isLoading && (
                <div
                    role="status"
                    className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl"
                >
                    <LoaderCircle
                        aria-hidden="true"
                        size={32}
                        className="animate-spin text-[var(--gold)]"
                    />
                    <p className="mt-4 text-sm text-white/60">Pobieranie listy klientek…</p>
                </div>
            )}

            {!isLoading && error && (
                <div
                    role="alert"
                    className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-red-500/30 bg-red-500/[0.08] px-6 py-12 text-center backdrop-blur-xl"
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

            {!isLoading && !error && clients.length === 0 && (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]">
                        <UsersRound aria-hidden="true" size={28} />
                    </span>
                    <h2 className="mt-5 text-xl font-semibold text-white">
                        Brak klientek
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                        W bazie nie ma jeszcze żadnych klientek.
                    </p>
                </div>
            )}

            {!isLoading && !error && clients.length > 0 && (
                <div className="mb-5 flex flex-col gap-3 rounded-3xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.07] to-white/[0.025] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="relative w-full sm:max-w-md">
                        <label htmlFor="client-search" className="sr-only">
                            Wyszukaj klientkę
                        </label>
                        <Search
                            aria-hidden="true"
                            size={18}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gold)]/70"
                        />
                        <input
                            id="client-search"
                            type="search"
                            value={clientSearch}
                            onChange={(event) => setClientSearch(event.target.value)}
                            placeholder="Szukaj po danych klientki"
                            className="w-full rounded-2xl border border-[var(--gold)]/35 bg-white/[0.05] py-3 pl-11 pr-11 text-sm text-white outline-none transition duration-300 placeholder:text-white/30 hover:border-[var(--gold)]/60 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 [&::-webkit-search-cancel-button]:appearance-none"
                        />
                        {clientSearch && (
                            <button
                                type="button"
                                onClick={() => setClientSearch("")}
                                aria-label="Wyczyść wyszukiwanie"
                                className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg p-1 text-white/45 transition hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                            >
                                <X aria-hidden="true" size={17} />
                            </button>
                        )}
                    </div>

                    <p aria-live="polite" className="shrink-0 text-xs text-white/45 sm:text-sm">
                        {filteredClients.length === clients.length
                            ? `Liczba klientek: ${clients.length}`
                            : `Znaleziono: ${filteredClients.length}`}
                    </p>
                </div>
            )}

            {!isLoading && !error && clients.length > 0 && filteredClients.length === 0 && (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-4xl border border-[var(--gold)]/25 bg-gradient-to-br from-white/[0.08] to-white/[0.025] px-6 py-12 text-center backdrop-blur-xl">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--gold)]/25 bg-black/15 text-[var(--gold)]">
                        <Search aria-hidden="true" size={28} />
                    </span>
                    <h2 className="mt-5 text-xl font-semibold text-white">
                        Brak wyników
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                        Nie znaleziono klientek pasujących do wyszukiwania.
                    </p>
                    <button
                        type="button"
                        onClick={() => setClientSearch("")}
                        className="mt-5 cursor-pointer rounded-full border border-[var(--gold)] px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition hover:bg-[var(--gold)] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                        Wyczyść wyszukiwanie
                    </button>
                </div>
            )}

            {!isLoading && !error && filteredClients.length > 0 && (
                <div className="overflow-hidden rounded-4xl border border-[var(--gold)]/30 bg-gradient-to-br from-white/[0.08] to-white/[0.025] backdrop-blur-xl">
                    <div
                        className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.9fr)] gap-6 border-b border-[var(--gold)]/25 bg-black/10 px-7 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]/75 md:grid"
                    >
                        <span>Klientka</span>
                        <span>Telefon</span>
                        <span>E-mail</span>
                        <span>Instagram</span>
                    </div>

                    <div className="divide-y divide-[var(--gold)]/15">
                        {filteredClients.map((client) => (
                            <Link
                                key={client.id}
                                to={`/admin/clients/${client.id}`}
                                aria-label={`Otwórz szczegóły klientki ${client.firstName} ${client.lastName}`}
                                 className="
                                 grid grid-cols-1 gap-4 px-5 py-5
                                transition-colors duration-300
                                hover:bg-[var(--gold)]/[0.06]
                                focus-visible:bg-[var(--gold)]/[0.06]
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-inset
                                focus-visible:ring-[var(--gold)]/50
                                sm:px-6
                                md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.9fr)]
                                md:items-center md:gap-6 md:px-7 md:py-4
                                "
                            >
                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--gold)]/65 md:hidden">
                                        Klientka
                                    </p>
                                    <h2 className="break-words text-base font-semibold text-white">
                                        {renderContactValue(client.firstName)}{" "}
                                        {renderContactValue(client.lastName)}
                                    </h2>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/35 md:hidden">
                                        Telefon
                                    </p>
                                    <p className="break-words text-sm text-white/70">
                                        {renderContactValue(client.phoneNumber)}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/35 md:hidden">
                                        E-mail
                                    </p>
                                    <p className="break-words text-sm text-white/70">
                                        {renderContactValue(client.email)}
                                    </p>
                                </div>

                                <div className="min-w-0">
                                    <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/35 md:hidden">
                                        Instagram
                                    </p>
                                    <p className="break-words text-sm text-white/70">
                                        {renderContactValue(client.instagramUsername)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default ClientsPage;
