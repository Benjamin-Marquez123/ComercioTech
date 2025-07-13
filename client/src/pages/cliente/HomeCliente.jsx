import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";

export default function HomeCliente() {
  const navigate = useNavigate();
  const { userData } = useAuth();

  useEffect(() => {
    if (!userData) {
      // Si no hay usuario autenticado, redirige al login
      navigate("/");
    }
  }, [userData, navigate]);

  return (
    <div className="mt-4 px-3">
      <h1>
        ¡Bienvenido{userData?.nombre ? `, ${userData.nombre}` : ""}!
      </h1>
      <p className="text-muted">Este es tu panel como cliente.</p>
    </div>
  );
}
