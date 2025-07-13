import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // para obtener token o info si lo usas
import axios from "axios";
import Swal from "sweetalert2";

export default function PerfilUsuario() {
  const { token } = useAuth(); // asumimos que guardas el token aquí
  const [usuario, setUsuario] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // Obtener perfil al montar
    const obtenerPerfil = async () => {
      try {
        const res = await axios.get("http://3.220.10.212:5000/api/auth/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsuario(res.data);
        setForm({
          nombre: res.data.nombre || "",
          telefono: res.data.telefono || "",
          direccion: res.data.direccion || "",
        });
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar el perfil", "error");
      } finally {
        setCargando(false);
      }
    };

    obtenerPerfil();
  }, [token]);

    const formatearTelefono = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11); // solo números, máx 11 dígitos
    if (numeros.length === 0) return '';

    if (numeros.length >= 11) {
        return `+${numeros.slice(0, 2)} ${numeros[2]} ${numeros.slice(3, 7)} ${numeros.slice(7, 11)}`;
    }
    return `+${numeros}`;
    };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telefono") {
        const numeros = value.replace(/\D/g, ""); // solo dígitos
        setForm((prev) => ({
        ...prev,
        telefono: formatearTelefono(numeros),
        }));
    } else {
        setForm((prev) => ({
        ...prev,
        [name]: value,
        }));
    }
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await axios.put(
        "http://3.220.10.212:5000/api/auth/perfil",
        {
          nombre: form.nombre,
          telefono: form.telefono,
          direccion: form.direccion,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Éxito", res.data.msg, "success");
      setUsuario(res.data.usuario);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "No se pudo actualizar el perfil",
        "error"
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <p>Cargando perfil...</p>;

  if (!usuario)
    return <p>No se pudo cargar la información del usuario. Intenta de nuevo.</p>;

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h2>Mi Perfil</h2>

      <form onSubmit={handleSubmit} noValidate>
        {/* Mostrar campos no editables */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            className="form-control"
            type="email"
            value={usuario.email}
            disabled
          />
        </div>

        <div className="mb-3">
          <label className="form-label">RUT</label>
          <input className="form-control" type="text" value={usuario.rut} disabled />
        </div>

        {/* Editable */}
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            className="form-control"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={50}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="telefono" className="form-label">
            Teléfono
          </label>
          <input
            className="form-control"
            id="telefono"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            required
            maxLength={17}
            placeholder="+56 9 1234 5678"
            />
        </div>

        <div className="mb-3">
          <label htmlFor="direccion" className="form-label">
            Dirección
          </label>
          <input
            className="form-control"
            id="direccion"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}

