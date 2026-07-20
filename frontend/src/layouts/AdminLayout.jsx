import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--background)] text-white">
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute -left-24 top-24 h-72 w-72
                    rounded-full bg-[var(--rose)]/8 blur-3xl
                "
            />
            <div
                aria-hidden="true"
                className="
                    pointer-events-none absolute -bottom-40 right-0 h-96 w-96
                    rounded-full bg-[var(--gold)]/10 blur-3xl
                "
            />

            <header className="relative z-10 border-b border-[var(--gold)]/20 bg-white/[0.025] backdrop-blur-xl">
                <div className="
                    mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5
                    sm:flex-row sm:items-center sm:justify-between sm:px-10
                    lg:px-16
                ">
                    <div>
                        <p className="text-lg font-semibold tracking-wide text-[var(--gold)] sm:text-xl">
                            AtelierByPT — Administracja
                        </p>
                        <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-white/35">
                            Panel zarządzania
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="text-sm text-white/65">
                            Witaj, <span className="font-medium text-white">Administratorze</span>
                        </p>
                        <button
                            type="button"
                            className="
                                cursor-pointer rounded-full border border-[var(--gold)]/70
                                px-4 py-2 text-sm font-medium text-[var(--gold)]

                                transition-colors
                                hover:bg-[var(--gold)] hover:text-black

                                focus-visible:outline-none
                                focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                                focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]

                                active:bg-[var(--gold)] active:text-black
                            "
                        >
                            Wyloguj się
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1">
                <Outlet />
            </main>

            <footer className="relative z-10 border-t border-[var(--gold)]/15 px-6 py-6 text-center">
                <p className="text-xs tracking-wide text-white/35">
                    Lash&amp;Brow Atelier by Paulina Tarnowska · Panel administracyjny
                </p>
            </footer>
        </div>
    );
};

export default AdminLayout;
