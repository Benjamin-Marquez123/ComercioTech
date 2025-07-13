import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import "../components/css/register.css"


export default function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    rut: "",
    email: "",
    password: "",
    confirmPassword: "",
    direccion: "",
    telefono: "",
    rol: "cliente"
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Efecto para limpiar errores cuando cambian los campos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(errors).length > 0) {
        const newErrors = { ...errors };
        Object.keys(newErrors).forEach(key => {
          if (formData[key]) {
            delete newErrors[key];
          }
        });
        setErrors(newErrors);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [formData]);

  // Validaciones comunes
  const validarPassword = (pass) => {
    const regex = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)[A-Za-zñÑ\d@$!%*?&]{6,}$/;
    return regex.test(pass);
  };

  const formatearRUT = (rut) => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (rutLimpio.length === 0) return '';
    
    let cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    if (cuerpo.length > 0) {
      cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    return `${cuerpo}-${dv}`;
  };

  const formatearTelefono = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length === 0) return '';
    
    if (numeros.length >= 11) {
      return `+${numeros.slice(0, 2)} ${numeros[2]} ${numeros.slice(3, 7)} ${numeros.slice(7, 11)}`;
    }
    return `+${numeros}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "telefono") {
      const numeros = value.replace(/\D/g, "");
      setFormData(prev => ({
        ...prev,
        [name]: formatearTelefono(numeros)
      }));
    } else if (name === "rut") {
      setFormData(prev => ({
        ...prev,
        [name]: formatearRUT(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newErrors = {};

    // Validaciones
    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
      newErrors.nombre = "Nombre debe tener al menos 3 caracteres";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!validarPassword(formData.password)) {
      newErrors.password = "Mínimo 8 caracteres, con mayúsculas, minúsculas y números XD";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    const telefonoLimpio = formData.telefono.replace(/\D/g, '');
    if (telefonoLimpio.length !== 11 || !telefonoLimpio.startsWith('56')) {
      newErrors.telefono = "Teléfono inválido (Ej: +56 9 1234 5678)";
    }

    if (!formData.direccion.trim() || formData.direccion.trim().length < 5) {
      newErrors.direccion = "Dirección inválida (mínimo 5 caracteres)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      Swal.fire("Error", "Por favor corrige los errores en el formulario", "error");
      return;
    }

    try {
      // Preparar datos para enviar (eliminar confirmPassword)
      const { confirmPassword, ...datosEnvio } = formData;
      await axios.post("/api/auth/registrar", datosEnvio);

      
      await Swal.fire({
        title: "¡Registro exitoso!",
        text: "Tu cuenta ha sido creada correctamente",
        icon: "success",
        confirmButtonText: "Iniciar sesión"
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error al registrar:", error);
      let errorMessage = "Ocurrió un error al registrar";
      
      if (error.response) {
        if (error.response.data.msg === "El usuario ya existe") {
          errorMessage = `El ${error.response.data.campo} ya está registrado`;
        } else {
          errorMessage = error.response.data.msg || errorMessage;
        }
      }
      
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <Link to="/" className="btn btn-outline-primary mb-4">
                <i className="bi bi-arrow-left me-2"></i>Volver
              </Link>
              
              <h2 className="mb-4 text-center">Crear cuenta</h2>
              
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* Nombre */}
                  <div className="col-md-6">
                    <label className="form-label">Nombre completo*</label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>

                  {/* RUT */}
                  <div className="col-md-6">
                    <label className="form-label">RUT*</label>
                    <input
                      type="text"
                      className={`form-control ${errors.rut ? "is-invalid" : ""}`}
                      name="rut"
                      maxLength={12}
                      value={formData.rut}
                      onChange={handleChange}
                      placeholder="12.345.678-9"
                      required
                    />
                    {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                  </div>

                  {/* Email */}
                  <div className="col-12">
                    <label className="form-label">Correo electrónico*</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  {/* Contraseña */}
                  <div className="col-md-6">
                    <label className="form-label">Contraseña*</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    <small className="form-text text-muted">
                      Mínimo 6 caracteres, con mayúsculas, minúsculas y números Sexo
                    </small>
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="col-md-6">
                    <label className="form-label">Confirmar contraseña*</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  {/* Teléfono */}
                  <div className="col-md-6">
                    <label className="form-label">Teléfono*</label>
                    <input
                      type="tel"
                      className={`form-control ${errors.telefono ? "is-invalid" : ""}`}
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                      required
                    />
                    {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                  </div>

                  {/* Dirección */}
                  <div className="col-md-6">
                    <label className="form-label">Dirección*</label>
                    <input
                      type="text"
                      className={`form-control ${errors.direccion ? "is-invalid" : ""}`}
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                    {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                  </div>

                  <div className="col-12 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100 py-2 btn-register"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Registrando...
                        </>
                      ) : "Registrarse"}
                    </button>
                  </div>

                  <div className="col-12 text-center mt-3">
                    <p className="mb-0">
                      ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}