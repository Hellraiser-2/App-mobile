import React, { useMemo, useState } from "react";
import { CheckCircle2, Globe, ShoppingBag } from "lucide-react";
import { initialProducts, adminUsers } from "./data";
import {
  Modal,
  StockForm,
  RelocateForm,
  DamageForm,
  EditProductForm,
} from "./components/ui";
import Header from "./components/Header";
import ShopView from "./components/ShopView";
import WarehouseView from "./components/WarehouseView";
import AdminView from "./components/AdminView";
import CartSidebar from "./components/CartSidebar";
import EntryScreen from "./components/EntryScreen";
import AdminLoginModal from "./components/AdminLoginModal";
import SupportChat from "./components/SupportChat";

export default function App() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState("santiago");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [notice, setNotice] = useState("");
  const [stockModal, setStockModal] = useState(null);
  const [relocateModal, setRelocateModal] = useState(null);
  const [damageModal, setDamageModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showEntry, setShowEntry] = useState(true);
  const [loginModal, setLoginModal] = useState(false);
  const [adminLoginModal, setAdminLoginModal] = useState(false);

  const shippingCost = shipping === "santiago" ? 3990 : 7990;

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = category === "Todos" || p.category === category;
        return matchesSearch && matchesCategory;
      }),
    [products, search, category]
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + (cart.length ? shippingCost : 0);

  const projectedSales = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const losses = products.reduce((sum, p) => sum + (p.lossValue || 0), 0);
  const efficiency = projectedSales
    ? Math.max(0, ((projectedSales - losses) / projectedSales) * 100)
    : 100;

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return flash("Producto sin stock.");
    setCart((current) => {
      const found = current.find((x) => x.id === product.id);
      if (found) {
        if (found.qty >= product.stock) return current;
        return current.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...current, { ...product, qty: 1 }];
    });
    flash("Producto agregado al carrito.");
  };

  const changeQty = (id, delta) => {
    const product = products.find((p) => p.id === id);
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          const qty = Math.min(product.stock, Math.max(0, item.qty + delta));
          return { ...item, qty };
        })
        .filter((item) => item.qty > 0)
    );
  };

  const checkout = () => {
    if (!cart.length) return flash("El carrito está vacío.");
    setProducts((current) =>
      current.map((p) => {
        const item = cart.find((x) => x.id === p.id);
        return item ? { ...p, stock: p.stock - item.qty } : p;
      })
    );
    setCart([]);
    setCartOpen(false);
    flash("Compra finalizada. Stock descontado de bodega.");
  };

  const injectStock = (id, amount) => {
    const qty = Number(amount);
    if (!qty || qty < 1) return;
    setProducts((current) =>
      current.map((p) => (p.id === id ? { ...p, stock: p.stock + qty } : p))
    );
    setStockModal(null);
    flash(`Se ingresaron ${qty} unidades a bodega.`);
  };

  const relocate = (id, location) => {
    if (!location.trim()) return;
    setProducts((current) =>
      current.map((p) => (p.id === id ? { ...p, location: location.trim() } : p))
    );
    setRelocateModal(null);
    flash("Ubicación física actualizada.");
  };

  const registerDamage = (id, qty, reason) => {
    const amount = Number(qty);
    if (!amount || amount < 1) return;
    setProducts((current) =>
      current.map((p) =>
        p.id === id
          ? {
              ...p,
              stock: Math.max(0, p.stock - amount),
              lossValue: (p.lossValue || 0) + amount * p.price,
              lastDamage: reason || "Daño/defecto",
            }
          : p
      )
    );
    setDamageModal(null);
    flash(`Se registraron ${amount} unidades como merma.`);
  };

  const updateProduct = (id, patch) => {
    setProducts((current) =>
      current.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
    setEditModal(null);
    flash(`Producto actualizado: ${patch.name}.`);
  };

  const handleAdminSuccess = (admin) => {
    setIsAdmin(true);
    setIsLoggedIn(true);
    setUser(admin);
    setAdminLoginModal(false);
    setShowEntry(false);
    setView("admin");
    flash(`Bienvenido, ${admin.name}. Acceso concedido.`);
  };

  const handleGoogleLogin = () => {
    const googleUser = {
      id: "google",
      name: "Usuario Google",
      email: "usuario@gmail.com",
      role: "Usuario",
      username: "usuario",
    };
    setIsAdmin(false);
    setIsLoggedIn(true);
    setUser(googleUser);
    setLoginModal(false);
    setShowEntry(false);
    flash("Sesión iniciada con Google.");
  };

  const handleGoogleRegister = handleGoogleLogin;

  const handleGuest = () => {
    setShowEntry(false);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser({ id: "guest", name: "Invitado", role: "guest" });
    flash("Continuando como invitado.");
  };

  const handleEntryLogin = () => {
    setShowEntry(false);
    setLoginModal(true);
  };

  const handleEntryAdmin = () => {
    setShowEntry(false);
    setAdminLoginModal(true);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsLoggedIn(false);
    setUser(null);
    setView("shop");
    flash("Sesión cerrada.");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      {showEntry && (
        <EntryScreen
          onLogin={handleEntryLogin}
          onGuest={handleGuest}
          onAdminLogin={handleEntryAdmin}
        />
      )}

      <Header
        view={view}
        setView={setView}
        isAdmin={isAdmin}
        user={user}
        isLoggedIn={isLoggedIn}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
      />

      {notice && (
        <div className="fixed right-4 top-20 z-50 flex items-center gap-2 rounded-xl border border-red-900 bg-zinc-950 px-4 py-3 text-sm shadow-2xl">
          <CheckCircle2 size={18} className="text-red-500" />
          {notice}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        {view === "shop" && (
          <ShopView
            products={filteredProducts}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            addToCart={addToCart}
            cart={cart}
            changeQty={changeQty}
            subtotal={subtotal}
            total={total}
            shipping={shipping}
            setShipping={setShipping}
            shippingCost={shippingCost}
            checkout={checkout}
          />
        )}

        {view === "warehouse" && isAdmin && (
          <WarehouseView
            products={products}
            setStockModal={setStockModal}
            setRelocateModal={setRelocateModal}
            setDamageModal={setDamageModal}
            setEditModal={setEditModal}
          />
        )}

        {view === "admin" && isAdmin && (
          <AdminView
            projectedSales={projectedSales}
            losses={losses}
            efficiency={efficiency}
            users={adminUsers}
            onLogout={handleLogout}
          />
        )}
      </main>

      {stockModal && (
        <Modal title="Inyectar stock" onClose={() => setStockModal(null)}>
          <StockForm product={stockModal} onSubmit={injectStock} />
        </Modal>
      )}

      {relocateModal && (
        <Modal title="Relocalizar producto" onClose={() => setRelocateModal(null)}>
          <RelocateForm product={relocateModal} onSubmit={relocate} />
        </Modal>
      )}

      {damageModal && (
        <Modal title="Registrar merma / daño" onClose={() => setDamageModal(null)}>
          <DamageForm product={damageModal} onSubmit={registerDamage} />
        </Modal>
      )}

      {editModal && (
        <Modal
          title="Editar producto"
          onClose={() => setEditModal(null)}
        >
          <EditProductForm product={editModal} onSubmit={updateProduct} />
        </Modal>
      )}

      {cartOpen && (
        <CartSidebar
          cart={cart}
          changeQty={changeQty}
          subtotal={subtotal}
          total={total}
          shipping={shipping}
          setShipping={setShipping}
          shippingCost={shippingCost}
          checkout={checkout}
          onClose={() => setCartOpen(false)}
        />
      )}

      {loginModal && (
        <Modal title="Iniciar sesión · Cliente" onClose={() => setLoginModal(false)}>
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-zinc-900">
              <ShoppingBag size={26} className="text-red-500" />
            </div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
              Acceso para clientes
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Inicia sesión para guardar tu carrito y hacer seguimiento de tus pedidos.
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-900"
          >
            <Globe size={18} className="text-red-500" />
            Iniciar con Google
          </button>

          <div className="text-center text-xs text-zinc-600">
            ¿No tienes cuenta?{" "}
            <button
              onClick={handleGoogleRegister}
              className="text-red-500 hover:underline"
            >
              Crear cuenta
            </button>
          </div>
        </Modal>
      )}

      {adminLoginModal && (
        <AdminLoginModal
          onClose={() => setAdminLoginModal(false)}
          onSuccess={handleAdminSuccess}
        />
      )}

      <SupportChat />
    </div>
  );
}
