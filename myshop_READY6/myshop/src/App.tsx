import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { AgeGate } from './components/AgeGate';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { TelegramFloatingButton } from './components/TelegramButton';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { InvoicePage } from './pages/InvoicePage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <Router>
      <ProductProvider>
        <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            {/* Age Verification Gate */}
            <AgeGate />

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/invoice" element={<InvoicePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Floating Telegram Button */}
            <TelegramFloatingButton />
          </div>
        </CartProvider>
      </ProductProvider>
    </Router>
  );
}

export default App;
