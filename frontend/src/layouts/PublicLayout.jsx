import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import CookieBanner from "../components/public/CookieBanner";
import PrivacyPreferencesProvider from "../privacy/PrivacyPreferencesProvider";

const PublicLayout = () => {
    return(
        <PrivacyPreferencesProvider>
            <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[var(--background)] text-white">
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none fixed -left-40 top-36 h-96 w-96
                        rounded-full bg-[var(--rose)]/7 blur-3xl
                    "
                />
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none fixed -right-48 top-[38rem] h-[30rem] w-[30rem]
                        rounded-full bg-[var(--gold)]/8 blur-3xl
                    "
                />
                <Navbar />
                <main className="relative z-10 flex-1">
                    <Outlet />
                </main>
                <Footer />
                <CookieBanner />
            </div>
        </PrivacyPreferencesProvider>
    ); 
}

export default PublicLayout;
