import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuario } from "../services/authService";
import "../components/estilosCSS/register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    email: "",
    password: "",
    direccion: "",
    telefono: "",
    rol: "cliente" // Por defecto será cliente
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validaciones
  const validarPassword = (pass) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,}$/;
    return regex.test(pass);
  };

  const validarRUT = (rut) => {
    if (!rut) return false;
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (rutLimpio.length < 8) return false;
    
    // Implementar validación completa del RUT aquí si es necesario
    return true;
  };

  const formatearTelefono = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length >= 11) {
      return `+56 ${numeros[2]} ${numeros.slice(3, 7)} ${numeros.slice(7, 11)}`;
    }
    return valor;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "telefono") {
      const numeros = value.replace(/\D/g, "");
      setFormData({
        ...formData,
        [name]: formatearTelefono(numeros)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validaciones
    if (!formData.nombre || formData.nombre.length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (!validarRUT(formData.rut)) {
      newErrors.rut = "RUT inválido";
    }

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      newErrors.email = "Email inválido";
    }

    if (!validarPassword(formData.password)) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres, incluyendo letras y números";
    }

    if (formData.telefono && formData.telefono.replace(/\D/g, "").length !== 11) {
      newErrors.telefono = "Teléfono inválido (Ej: +56 9 1234 5678)";
    }

    if (!formData.direccion || formData.direccion.length < 5) {
      newErrors.direccion = "Dirección inválida";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire("Error", "Por favor corrige los errores en el formulario", "error");
      return;
    }

    try {
      await registrarUsuario(formData);
      
      Swal.fire({
        title: "Registro exitoso",
        text: "Tu cuenta ha sido creada correctamente",
        icon: "success",
        confirmButtonText: "Iniciar sesión"
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Error al registrar:", error);
      let errorMessage = "Ocurrió un error al registrar";
      
      if (error.response) {
        if (error.response.data.msg === "El usuario ya existe") {
          errorMessage = "El email o RUT ya está registrado";
        } else {
          errorMessage = error.response.data.msg || errorMessage;
        }
      }
      
      Swal.fire("Error", errorMessage, "error");
    }
  };

  return (
    <div className="register-container">
      <button type="button" className="btn btn-primary mb-3">
        <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Volver</Link>
      </button>
      <h2 className="mb-3">Registro</h2>
      <form onSubmit={handleSubmit}>
        {/* Nombre */}
        <div className="mb-3">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            minLength={3}
            maxLength={50}
            required
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>

        {/* RUT */}
        <div className="mb-3">
          <label className="form-label">RUT</label>
          <input
            type="text"
            className={`form-control ${errors.rut ? "is-invalid" : ""}`}
            name="rut"
            value={formData.rut}
            onChange={handleChange}
            placeholder="12345678-9"
            minLength={9}
            maxLength={12}
            required
          />
          {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            minLength={6}
            maxLength={100}
            required
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        {/* Contraseña */}
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className={`form-control ${errors.password ? "is-invalid" : ""}`}
            name="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            maxLength={50}
            required
          />
          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          <small className="form-text text-muted">
            Mínimo 6 caracteres, incluyendo letras y números
          </small>
        </div>

        {/* Teléfono */}
        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
            inputMode="numeric"
            minLength={8}
            maxLength={18}
            required
          />
          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
        </div>

        {/* Dirección */}
        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            className={`form-control ${errors.direccion ? "is-invalid" : ""}`}
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            minLength={5}
            maxLength={100}
            required
          />
          {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
        </div>

        {/* Rol (oculto ya que solo será cliente) */}
        <input type="hidden" name="rol" value="cliente" />

        <button type="submit" className="btn btn-success">
          Registrar
        </button>
      </form>
    </div>
  );
}