import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../components/css/login.css";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, userData } = useAuth(); // agregamos userData
  const navigate = useNavigate();

  // useEffect para redirigir si ya hay usuario logueado
  useEffect(() => {
    if (userData) {
      if (userData.rol === "cliente") {
        navigate("/cliente/HomeCliente");
      } else if (userData.rol === "empresa") {
        navigate("/empresa/HomeEmpresa");
      }
    }
  }, [userData, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.post("http://3.220.10.212:5000/api/auth/login", formData);
      login(res.data.token, res.data.usuario); // Aquí asegúrate que tu login acepte usuario también
      Swal.fire({
        icon: "success",
        title: "Login exitoso",
        showConfirmButton: false,
        timer: 1500,
      });
      // No necesitamos navegar aquí porque el useEffect lo hará
    } catch (error) {
      Swal.fire("Error", error.response?.data?.msg || "Credenciales incorrectas", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <h2>Inicio de Sesión</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            maxLength={50}
          />
        </div>

        <button className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="crear-cuenta">
          <Link to="/registrar">
            <button type="button" className="btn btn-success">
              Crear Cuenta Nueva
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}
