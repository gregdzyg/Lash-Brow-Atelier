import Privacy from './pages/Privacy';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import About from './pages/About';
import Gallery from './pages/Galery';
import Offer from './pages/Offer';
import Contact from './pages/Contact';
import ScrollToTop from './components/public/ScrollToTop';
import Regulamin from './pages/Regulamin';
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from './auth/ProtectedRoute';
import ClientsPage from './pages/admin/ClientsPage';
import NewClientPage from './pages/admin/NewClientPage';
import ClientDetailsPage from './pages/admin/ClientDetailsPage';
import EditClientPage from './pages/admin/EditClientPage';

function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        <Route path='/' element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path='about' element={<About />} />
          <Route path='gallery' element={<Gallery />} />
          <Route path='offer' element={<Offer />} />
          <Route path='contact' element={<Contact />} />
          <Route path="polityka-prywatnosci" element={<Privacy />} />
          <Route path="regulamin" element={<Regulamin />} />
        </Route>
        <Route element={<AuthLayout />} >
          <Route path='/admin/login' element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path='clients' element={<ClientsPage />} />
          <Route path='clients/new' element={<NewClientPage />} />
          <Route path='clients/:clientId' element={<ClientDetailsPage />} />
          <Route path="clients/:clientId/edit" element={<EditClientPage />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
