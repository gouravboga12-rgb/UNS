import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { fetchProducts, fetchCategories } from './store/productsSlice';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BottomNavigation } from './components/BottomNavigation';
import { ScrollToTop } from './components/ScrollToTop';
import { ToastNotification } from './components/ToastNotification';

// Pages lazy/direct import
import { Home } from './pages/Home';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { TrackOrder } from './pages/TrackOrder';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { AdminDashboard } from './pages/AdminDashboard';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';

import AOS from 'aos';
import 'aos/dist/aos.css';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Initialize animations
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-quad',
    });

    // Fetch initial static/mock catalog data
    dispatch(fetchProducts() as any);
    dispatch(fetchCategories() as any);
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-background w-full max-w-full">
        {!isAdminRoute && <Navbar />}
        <ToastNotification />
        
        <main className={isAdminRoute ? "flex-grow" : "flex-grow pb-16 lg:pb-0 w-full max-w-full overflow-x-hidden"}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </main>

        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <FloatingWhatsApp />}
        {!isAdminRoute && <BottomNavigation />}
      </div>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
};

export default App;
