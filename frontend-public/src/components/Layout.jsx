import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieBanner from "./CookieBanner";

const Layout = () => {
    return(
        <div className='min-h-screen flex flex-col bg-[var(--background)] text-white'>
            <Navbar />
            <main className='flex-1'>
                <Outlet />
            </main>
            <div className='w-4/5 mx-auto h-px bg-[var(--gold)]/50 my-1' />
            <Footer />
            <CookieBanner />
        </div>
    ); 
}

export default Layout;