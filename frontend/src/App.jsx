import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCart } from "./slices/cartSlice";
import { setWishlist } from "./slices/wishlistSlice";
import { getCart } from "./services/cartApi";
import { getWishlist } from "./services/wishlistApi";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import Subscription from "./pages/Subscription";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Profile from "./pages/Profile";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { pathname } = useLocation();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Load cart and wishlist into Redux on auth change
  useEffect(() => {
    if (isAuthenticated) {
      getCart().then(data => { if (data) dispatch(setCart(data)); }).catch(() => { });
      getWishlist().then(data => { if (data) dispatch(setWishlist(data)); }).catch(() => { });
    }
  }, [isAuthenticated, dispatch]);

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/wishlist" element={
          <ProtectedRoute><Wishlist /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />
        <Route path="/order-success/:orderId" element={
          <ProtectedRoute><OrderSuccess /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
      </Routes>
      {!isAuthPage && <Footer />}
    </>
  );
}

export default App;