import { useState, useEffect } from "react";
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from "../../services/productoService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function ProductosEmpresa() {
  const { userData } = useAuth();
  const [productos, setProductos] = useState([]);
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombre-asc");

  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    cantidad: "",
    disponibilidad: "Disponible",
  });

  const obtenerYOrdenarProductos = async () => {
    try {
      let data = await obtenerProductos();

      // Filtro por nombre
      if (busqueda.trim() !== "") {
        data = data.filter((p) =>
          p.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
      }

      // Ordenamiento
      if (orden === "nombre-asc") {
        data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      } else if (orden === "nombre-desc") {
        data.sort((a, b) => b.nombre.localeCompare(a.nombre));
      } else if (orden === "precio-asc") {
        data.sort((a, b) => a.precio - b.precio);
      } else if (orden === "precio-desc") {
        data.sort((a, b) => b.precio - a.precio);
      } else if (orden === "disponibles") {
        data = data.filter(p => p.disponibilidad === "Disponible");
      } else if (orden === "no disponibles") {
        data = data.filter(p => p.disponibilidad === "No disponible");
      }

      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  useEffect(() => {
    obtenerYOrdenarProductos();
  }, [busqueda, orden]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validarFormulario = () => {
    if (formData.nombre.trim() === "") return "El nombre es obligatorio";
    if (isNaN(formData.precio) || formData.precio <= 0)
      return "El precio debe ser un número positivo";
    if (!Number.isInteger(Number(formData.cantidad)) || formData.cantidad < 0)
      return "La cantidad debe ser un número entero mayor o igual a 0";
    if (!["Disponible", "No disponible"].includes(formData.disponibilidad))
      return "Disponibilidad no válida";
    return null;
  };

  const eliminarProductos = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (confirm.isConfirmed) {
        await eliminarProducto(id);
        Swal.fire("Eliminado", "El producto ha sido eliminado.", "success");
        obtenerYOrdenarProductos();
      }
    } catch (error) {
      console.error("Error al eliminar producto", error);
      Swal.fire("Error", "No se pudo eliminar el producto", "error");
    }
  };

    const abrirModalEditar = (producto) => {
    setFormData({ ...producto }); // Incluye _id
    setFormularioVisible(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validarFormulario();
        if (error) {
            Swal.fire("Error", error, "error");
            return;
        }

        try {
            if (formData._id) {
            // Si tiene ID, está editando
            await actualizarProducto(formData._id, formData);
            Swal.fire("Actualizado", "Producto actualizado correctamente", "success");
            } else {
            // Si no tiene ID, está creando
            await crearProducto(formData);
            Swal.fire("Éxito", "Producto creado correctamente", "success");
            }

            setFormularioVisible(false);
            setFormData({
            nombre: "",
            precio: "",
            cantidad: "",
            disponibilidad: "Disponible",
            });
            obtenerYOrdenarProductos();
        } catch (error) {
            Swal.fire("Error", "No se pudo guardar el producto", "error");
        }
    };

  return (
    <div className="container mt-4">
      <h2>Productos de la Empresa</h2>

      {/* Filtros */}
      <div className="row mt-3 mb-4">
        <div className="col-md-4 mt-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <div className="col-md-4 mt-4">
          <select
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="nombre-asc">Nombre (A-Z)</option>
            <option value="nombre-desc">Nombre (Z-A)</option>
            <option value="precio-asc">Precio (menor a mayor)</option>
            <option value="precio-desc">Precio (mayor a menor)</option>
            <option value="disponibles">Disponibles</option>
            <option value="no disponibles">No Disponibles</option>
          </select>
        </div>
        <div className="col-md-4 text-end mt-4">
          <button
            className="btn btn-primary"
            onClick={() => setFormularioVisible(!formularioVisible)}
          >
            {formularioVisible ? "Cerrar Formulario" : "Agregar Producto"}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {formularioVisible && (
        <form onSubmit={handleSubmit} className="border p-3 mb-4 rounded">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="form-control"
                maxLength={40}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Precio</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                className="form-control"
                max={9999999}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Cantidad</label>
              <input
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                className="form-control"
                max={999999}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Disponibilidad</label>
              <select
                name="disponibilidad"
                value={formData.disponibilidad}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Disponible">Disponible</option>
                <option value="No disponible">No Disponible</option>
              </select>
            </div>
          </div>
          <div className="text-end mt-3">
            <button className="btn btn-success" type="submit">
              Guardar Producto
            </button>
          </div>
        </form>
      )}

      {/* Tabla de productos */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Disponibilidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length > 0 ? (
            productos.map((producto) => (
              <tr key={producto._id}>
                <td>{producto.nombre}</td>
                <td>${producto.precio}</td>
                <td>{producto.cantidad}</td>
                <td>{producto.disponibilidad}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => abrirModalEditar(producto)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => eliminarProductos(producto._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No hay productos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
