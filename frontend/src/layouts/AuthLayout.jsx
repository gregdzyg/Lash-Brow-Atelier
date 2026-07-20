import { Link, Outlet } from "react-router-dom";
import logo from "../assets/head-images/logo.png";

const AuthLayout = () => {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-white">
            <div
                aria-hidden="true"
                className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--rose)]/10 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-[var(--gold)]/10 blur-3xl"
            />

            <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-rows-[auto_1fr] 
            lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.78fr)] lg:grid-rows-1">
                <section className="flex flex-col px-6 py-6 sm:px-10 sm:py-8 lg:px-16 lg:py-12">
                    <Link
                        to="/"
                        aria-label="Wróć na stronę główną Atelier"
                        className="flex w-fit items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]"
                    >
                        <img
                            src={logo}
                            alt=""
                            className="h-12 w-12 rounded-full border border-[var(--gold)]/40 object-cover sm:h-14 sm:w-14"
                        />
                        <span className="flex flex-col leading-tight text-[var(--rose)]">
                            <span className="text-sm font-semibold tracking-wide sm:text-base">
                                Lash&amp;Brow Atelier
                            </span>
                            <span className="text-xs italic sm:text-sm">
                                by Paulina Tarnowska
                            </span>
                        </span>
                    </Link>

                    <div className="hidden flex-1 items-center py-16 lg:flex">
                        <div className="max-w-xl">
                            <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
                                <span className="h-px w-10 bg-[var(--gold)]/70" />
                                Panel administracyjny
                            </p>
                            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                                Piękno tkwi
                                <span className="block text-[var(--gold)]">w każdym detalu.</span>
                            </h1>
                            <p className="mt-6 max-w-lg text-base leading-7 text-white/65 xl:text-lg">
                                Spokojna przestrzeń do zarządzania codziennością Atelier —
                                elegancka, przejrzysta i stworzona z dbałością o szczegóły.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/"
                        className="mt-6 hidden w-fit text-sm text-white/55 transition-colors hover:text-[var(--gold)] focus-visible:outline-none focus-visible:text-[var(--gold)] lg:block"
                    >
                        ← Wróć na stronę Atelier
                    </Link>
                </section>

                <section className="flex items-center justify-center border-t border-[var(--gold)]/20 bg-white/[0.025] px-6 py-10 sm:px-10 lg:border-l lg:border-t-0 lg:px-14">
                    <div className="w-full max-w-md">
                        <Outlet />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AuthLayout;
