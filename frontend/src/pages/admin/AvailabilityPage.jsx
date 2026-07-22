import { CalendarDays, Clock3 } from "lucide-react";
import { useState } from "react";
import AvailabilityExceptionsPanel from "../../components/admin/availability/AvailabilityExceptionsPanel";
import WorkingHoursPanel from "../../components/admin/availability/WorkingHoursPanel";

const tabs = [
    {
        id: "working-hours",
        label: "Godziny pracy",
        icon: Clock3,
    },
    {
        id: "exceptions",
        label: "Wyjątki",
        icon: CalendarDays,
    },
];

const AvailabilityPage = () => {
    const [activeTab, setActiveTab] = useState("working-hours");

    const handleTabKeyDown = (event, currentIndex) => {
        let nextIndex = currentIndex;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        setActiveTab(tabs[nextIndex].id);
        document.getElementById(`availability-tab-${tabs[nextIndex].id}`)?.focus();
    };

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
            <div className="mb-8 max-w-2xl sm:mb-10">
                <p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
                    <span className="h-px w-8 bg-[var(--gold)]/70" />
                    Panel administracyjny
                </p>
                <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    Dostępność
                </h1>
                <p className="mt-3 text-sm leading-6 text-white/60 sm:text-base">
                    Ustal tygodniowe godziny pracy i zarządzaj wyjątkami dla wybranych dat.
                </p>
            </div>

            <div
                role="tablist"
                aria-label="Sekcje zarządzania dostępnością"
                className="mb-7 flex w-fit max-w-full gap-1 rounded-2xl border border-[var(--gold)]/25 bg-white/[0.04] p-1.5 backdrop-blur-xl"
            >
                {tabs.map((tab, index) => {
                    const Icon = tab.icon;
                    const isSelected = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            id={`availability-tab-${tab.id}`}
                            type="button"
                            role="tab"
                            aria-selected={isSelected}
                            aria-controls={`availability-panel-${tab.id}`}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => setActiveTab(tab.id)}
                            onKeyDown={(event) => handleTabKeyDown(event, index)}
                            className={`
                                flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5
                                text-sm font-semibold transition-colors focus-visible:outline-none
                                focus-visible:ring-2 focus-visible:ring-[var(--gold)]
                                ${isSelected
                                    ? "bg-[var(--gold)] text-black"
                                    : "text-white/60 hover:bg-white/[0.05] hover:text-white"
                                }
                            `}
                        >
                            <Icon aria-hidden="true" size={17} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <div
                id={`availability-panel-${activeTab}`}
                role="tabpanel"
                aria-labelledby={`availability-tab-${activeTab}`}
                tabIndex={0}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            >
                {activeTab === "working-hours" ? (
                    <WorkingHoursPanel />
                ) : (
                    <AvailabilityExceptionsPanel />
                )}
            </div>
        </section>
    );
};

export default AvailabilityPage;
