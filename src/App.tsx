import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoutes";
import { StockIn } from "./pages/admin/StockIn";
import { AuthForm } from "./pages/AuthForm";
import { NFCApp } from "./pages/admin/NfcApp";
import NotFound from "./pages/NotFound";
import Home from "./pages/admin/Home";
import StockinDetail from "./pages/admin/StockInDetail";
import { Order } from "./pages/admin/Order";
import OrderDetail from "./pages/admin/OrderDetail";

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen max-w-md mx-auto bg-gray-50">
          <main>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route path="login" element={<AuthForm />} />
              <Route
                path="home"
                element={
                  <ProtectedRoute>
                    <StockIn />
                  </ProtectedRoute>
                }
              />
              <Route
                path="stock"
                element={
                  <ProtectedRoute>
                    <StockIn />
                  </ProtectedRoute>
                }
              />
              <Route
                path="stock/:id"
                element={
                  <ProtectedRoute>
                    <StockinDetail />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="order"
                element={
                  <ProtectedRoute>
                    <Order />
                  </ProtectedRoute>
                }
              />
              <Route
                path="order/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="nfc"
                element={
                  <ProtectedRoute>
                    <NFCApp />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
