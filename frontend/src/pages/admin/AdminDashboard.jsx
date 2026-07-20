import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const adminSections = [
    {
        title: "Klientki",
        description: "Zarządzaj bazą klientek",
        icon: "👥",
        to: "/admin/clients",
    },
    {
        title: "Wizyty",
        description: "Zarządzaj wizytami i kalendarzem",
        icon: "📅",
        to: "/admin/appointments",
    },
    {
        title: "Oferta",
        description: "Zarządzaj usługami i cenami",
        icon: "💄",
        to: "/admin/offer",
    },
    {
        title: "Dostępność",
        description: "Godziny pracy i wyjątki",
        icon: "⏰",
        to: "/admin/availability",
    },
];

const AdminDashboard = () => {
    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-10 max-w-2xl sm:mb-12">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Panel administracyjny
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    Witaj w swoim Atelier
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Wybierz obszar, aby zarządzać najważniejszymi zadaniami na dziś.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
                {adminSections.map((section) => (
                    <Link
                        key={section.title}
                        to={section.to}
                        className="
                            group relative flex min-h-52 flex-col justify-between overflow-hidden
                            rounded-4xl border border-[var(--gold)]/35
                            bg-gradient-to-br from-white/[0.08] to-white/[0.025]
                            p-6 backdrop-blur-xl

                            transition duration-300 ease-out
                            hover:-translate-y-1 hover:border-[var(--gold)]/80
                            hover:from-[var(--gold)]/15 hover:to-white/[0.04]
                            hover:shadow-[0_20px_50px_rgba(0,0,0,0.28)]

                            focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                            focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--background)]

                            sm:min-h-60 sm:p-8
                        "
                    >
                        <div className="flex items-start justify-between gap-6">
                            <span
                                aria-hidden="true"
                                className="
                                    flex h-14 w-14 items-center justify-center rounded-2xl
                                    border border-[var(--gold)]/25 bg-black/15 text-3xl
                                "
                            >
                                {section.icon}
                            </span>
                            <ArrowUpRight
                                aria-hidden="true"
                                size={22}
                                className="
                                    text-[var(--gold)]/65 transition-transform duration-300
                                    group-hover:translate-x-1 group-hover:-translate-y-1
                                    group-hover:text-[var(--gold)]
                                "
                            />
                        </div>

                        <div className="mt-10">
                            <h2 className="text-2xl font-semibold text-[var(--gold)]">
                                {section.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-white/60 sm:text-base">
                                {section.description}
                            </p>
                        </div>

                        <div
                            aria-hidden="true"
                            className="
                                absolute inset-x-8 bottom-0 h-px origin-left scale-x-0
                                bg-[var(--gold)]/80 transition-transform duration-300
                                group-hover:scale-x-100
                            "
                        />
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default AdminDashboard;
