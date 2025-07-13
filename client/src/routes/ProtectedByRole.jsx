import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedByRole({ allowed, children }) {
  const { userData, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!userData) {
    // No está logueado
    return <Navigate to="/" />;
  }

  if (!allowed.includes(userData.rol)) {
    // Logueado pero sin permiso
    return <Navigate to="/" />;
  }

  // Autenticado y con el rol correcto
  return children;
}