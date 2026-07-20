import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";

const LoginPage = () => {
    return (
        <div>
            <div className="mb-8 sm:mb-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)] lg:hidden">
                    Panel administracyjny
                </p>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Witaj ponownie
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Zaloguj się, aby przejść do panelu zarządzania Atelier.
                </p>
            </div>

            <form className="space-y-8">
                <div>
                    <label
                        htmlFor="username"
                        className="mb-2 block text-sm font-medium text-white/85"
                    >
                        Login
                    </label>
                    <div className="relative">
                        <UserRound
                            aria-hidden="true"
                            size={19}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gold)]/80"
                        />
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Wpisz swój login"
                            className="w-full rounded-2xl border border-[var(--gold)]/45 bg-white/[0.06] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-white/30 hover:border-[var(--gold)]/70 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-white/85"
                    >
                        Hasło
                    </label>
                    <div className="relative">
                        <LockKeyhole
                            aria-hidden="true"
                            size={19}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--gold)]/80"
                        />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Wpisz swoje hasło"
                            className="w-full rounded-2xl border border-[var(--gold)]/45 bg-white/[0.06] py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-white/30 hover:border-[var(--gold)]/70 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="group flex w-full cursor-pointer items-center justify-center gap-2 
                    rounded-full border-2 border-[var(--gold)] bg-[var(--gold)] px-6 py-3.5 font-semibold
                     text-black transition hover:bg-transparent hover:text-[var(--gold)] focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-4 
                     focus-visible:ring-offset-[var(--background)] active:bg-[var(--gold)] active:text-black"
                >
                    Zaloguj się
                    <ArrowRight
                        aria-hidden="true"
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                    />
                </button>
            </form>

            <div className="mt-8 border-t border-[var(--gold)]/20 pt-6 text-center">
                <p className="text-xs leading-5 text-white/40">
                    Dostęp wyłącznie dla upoważnionych użytkowników Atelier.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
