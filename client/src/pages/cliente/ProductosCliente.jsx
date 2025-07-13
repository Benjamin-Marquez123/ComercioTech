import React, { useState, useEffect } from "react";
import { obtenerProductos } from "../../services/productoService"; // Asume que tienes esta función para obtener productos
import { crearPedido } from "../../services/pedidoService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

export default function HacerPedido() {
  const { userData } = useAuth();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombre-asc");
  const [cantidades, setCantidades] = useState({}); // { productoId: cantidad }

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const data = await obtenerProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error cargando productos:", error);
      }
    };
    cargarProductos();
  }, []);

  // Maneja el cambio de cantidad para un producto
  const manejarCantidad = (id, valor) => {
    const cantidad = parseInt(valor);
    if (cantidad >= 0) {
      setCantidades((prev) => ({ ...prev, [id]: cantidad }));
    }
  };

  // Filtrar y ordenar productos
  const productosFiltrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      switch (orden) {
        case "nombre-asc":
          return a.nombre.localeCompare(b.nombre);
        case "nombre-desc":
          return b.nombre.localeCompare(a.nombre);
        case "precio-asc":
          return a.precio - b.precio;
        case "precio-desc":
          return b.precio - a.precio;
        default:
          return 0;
      }
    });

  // Manejar envío del pedido
  const handleEnviarPedido = async () => {
    // Filtrar productos con cantidad > 0
    const productosSeleccionados = Object.entries(cantidades)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([productoId, cantidad]) => ({ productoId, cantidad }));

    if (productosSeleccionados.length === 0) {
      Swal.fire("Error", "Debes seleccionar al menos un producto con cantidad mayor a 0.", "error");
      return;
    }

    // Calcular monto total sumando (precio * cantidad)
    let montoTotal = 0;
    for (const item of productosSeleccionados) {
      const prod = productos.find((p) => p._id === item.productoId);
      if (!prod) {
        Swal.fire("Error", "Producto no encontrado.", "error");
        return;
      }
      if (item.cantidad > prod.cantidad) {
        Swal.fire(
          "Error",
          `Cantidad solicitada para ${prod.nombre} excede el stock disponible (${prod.cantidad}).`,
          "error"
        );
        return;
      }
      montoTotal += prod.precio * item.cantidad;
    }

    const pedido = {
      cliente: userData._id,
      montoTotal,
      fechaTransaccion: new Date(),
      estado: "Pendiente",
      productos: productosSeleccionados,
    };

    try {
      await crearPedido(pedido);
      Swal.fire("Éxito", "Pedido creado correctamente.", "success");
      setCantidades({}); // Resetear cantidades
    } catch (error) {
      console.error("Error creando pedido:", error);
      Swal.fire("Error", "No se pudo crear el pedido.", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Hacer Pedido</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="nombre-asc">Nombre (A–Z)</option>
            <option value="nombre-desc">Nombre (Z–A)</option>
            <option value="precio-asc">Precio (menor a mayor)</option>
            <option value="precio-desc">Precio (mayor a menor)</option>
          </select>
        </div>
      </div>

      {productosFiltrados.length === 0 ? (
        <p>No hay productos disponibles.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((prod) => (
              <tr key={prod._id}>
                <td>{prod.nombre}</td>
                <td>${prod.precio}</td>
                <td>{prod.cantidad}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={prod.cantidad}
                    value={cantidades[prod._id] || 0}
                    onChange={(e) => manejarCantidad(prod._id, e.target.value)}
                    className="form-control"
                    style={{ maxWidth: "100px" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="btn btn-primary" onClick={handleEnviarPedido}>
        Enviar Pedido
      </button>
    </div>
  );
}
