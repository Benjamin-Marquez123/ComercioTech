import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavCliente from "./NavCliente";

export default function ClienteLayout() {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar a la izquierda */}
      <aside className={`sidebar bg-dark text-white p-3 ${showSidebar ? "d-block" : "d-none d-md-flex"}`}>
        <NavCliente />
      </aside>

      {/* Aquí renderizamos las rutas hijas */}
      <main className="flex-grow-1 p-3">
        <Outlet />
      </main>
    </div>
  );
}
