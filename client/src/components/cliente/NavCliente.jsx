// src/components/cliente/layout/NavEmpresa.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NavCliente() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    logout(); // Borra el token y datos del contexto
    navigate("/"); // Redirige al login o landing page
  };
  return (
    <nav className="sidebar bg-dark text-white p-3 d-flex flex-column justify-content-between">
      <div>
        <h4 className="text-white mb-4">ComercioTech</h4>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink to="/cliente/HomeCliente" className="nav-link text-white">Inicio</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cliente/ProductosCliente" className="nav-link text-white">Productos</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cliente/PedidosCliente" className="nav-link text-white">Mis Pedidos</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cliente/EditarPerfil" className="nav-link text-white">Perfil</NavLink>
          </li>
        </ul>
      </div>
      <div className="ms-auto">
        <button onClick={handleCerrarSesion} className="btn btn-danger">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
