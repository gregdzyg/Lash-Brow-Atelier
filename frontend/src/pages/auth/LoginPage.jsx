import {
    ArrowRight,
    LoaderCircle,
    LockKeyhole,
    UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";


const LoginPage = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError('');

        if(!username.trim() || !password) {
            setError('Wprowadź nazwę użytkownika i hasło.');
            return;
        }

        setIsSubmitting(true);

        try {
            await login(username.trim(), password);
            navigate("/admin");
        } catch (error) {
            
            if (error.response?.status === 401) {
                setError("Nieprawidłowa nazwa użytkownika lub hasło.");
            } else if (error.response?.status === 429) {
                setError(
                    error.response?.data?.message
                    || "Zbyt wiele prób logowania. Spróbuj ponownie później."
                );
            } else if (error.request) {
                setError("Nie udało się połączyć z serwerem.");
            } else {
                setError("Wystąpił nieoczekiwany błąd.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

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

            <form className="space-y-8" onSubmit={handleSubmit}>
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
                            className="
                                pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
                                text-[var(--gold)]/80
                            "
                        />
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            placeholder="Wpisz swój login"
                            disabled={isSubmitting}
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="
                                w-full rounded-2xl border border-[var(--gold)]/45
                                bg-white/[0.06] py-3.5 pl-12 pr-4 text-white
                                outline-none transition placeholder:text-white/30
                                hover:border-[var(--gold)]/70
                                focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
                                disabled:cursor-not-allowed disabled:opacity-60
                            "
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
                            className="
                                pointer-events-none absolute left-4 top-1/2 -translate-y-1/2
                                text-[var(--gold)]/80
                            "
                        />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Wpisz swoje hasło"
                            disabled={isSubmitting}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="
                                w-full rounded-2xl border border-[var(--gold)]/45
                                bg-white/[0.06] py-3.5 pl-12 pr-4 text-white
                                outline-none transition placeholder:text-white/30
                                hover:border-[var(--gold)]/70
                                focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20
                                disabled:cursor-not-allowed disabled:opacity-60
                            "
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="
                        group flex w-full cursor-pointer items-center justify-center gap-2

                        rounded-full border-2 border-[var(--gold)]
                        bg-[var(--gold)]

                        px-6 py-3.5

                        font-semibold text-black

                        transition
                        hover:bg-transparent
                        hover:text-[var(--gold)]

                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[var(--gold)]
                        focus-visible:ring-offset-4
                        focus-visible:ring-offset-[var(--background)]

                        active:bg-[var(--gold)]
                        active:text-black

                        disabled:cursor-wait
                        disabled:opacity-70
                        disabled:hover:bg-[var(--gold)]
                        disabled:hover:text-black
                    "
                >
                    {isSubmitting ? (
                        <>
                            <LoaderCircle
                                aria-hidden="true"
                                size={18}
                                className="animate-spin"
                            />
                            Logowanie…
                        </>
                    ) : (
                        <>
                            Zaloguj się
                            <ArrowRight
                                aria-hidden="true"
                                size={18}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        </>
                    )}
                </button>

                {isSubmitting && (
                    <p
                        role="status"
                        aria-live="polite"
                        className="text-center text-xs leading-5 text-white/45"
                    >
                        Łączenie z serwerem. Pierwsze uruchomienie może chwilę potrwać.
                    </p>
                )}
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
