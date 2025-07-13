import React, { useEffect, useState } from "react";
import { obtenerPedidosEmpresa, actualizarEstadoPedido } from "../../services/pedidoService"; // crea este servicio
import Swal from "sweetalert2";

export default function PedidosEmpresa() {
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("fecha-desc");
  const [cargando, setCargando] = useState(false);

  // Definimos cargarPedidos fuera de useEffect
  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const data = await obtenerPedidosEmpresa();
      setPedidos(data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleActualizarEstado = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(id, nuevoEstado);
      Swal.fire("Éxito", `Pedido ${nuevoEstado.toLowerCase()}`, "success");
      await cargarPedidos(); // Ahora sí puede llamar la función
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    }
  };


  // Filtrar por búsqueda por nombre cliente o nombre producto
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const clienteMatch = pedido.cliente?.nombre
      ?.toLowerCase()
      .includes(busqueda.toLowerCase());
    const productoMatch = pedido.productos.some((p) =>
      p.productoId?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );
    return clienteMatch || productoMatch;
  });

  // Ordenar
  pedidosFiltrados.sort((a, b) => {
    if (orden === "fecha-asc")
      return new Date(a.fechaTransaccion) - new Date(b.fechaTransaccion);
    if (orden === "fecha-desc")
      return new Date(b.fechaTransaccion) - new Date(a.fechaTransaccion);
    if (orden === "monto-asc") return a.montoTotal - b.montoTotal;
    if (orden === "monto-desc") return b.montoTotal - a.montoTotal;
    return 0;
  });

  return (
    <div className="container mt-4">
      <h2>Pedidos recibidos</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            className="form-control"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <select
            className="form-select"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
          >
            <option value="fecha-desc">Fecha (más recientes)</option>
            <option value="fecha-asc">Fecha (más antiguos)</option>
            <option value="monto-desc">Monto (mayor a menor)</option>
            <option value="monto-asc">Monto (menor a mayor)</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <p>Cargando pedidos...</p>
      ) : pedidosFiltrados.length === 0 ? (
        <p>No hay pedidos que coincidan con la búsqueda.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Productos</th>
              <th>Monto Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido._id}>
                <td>{pedido.cliente?.nombre || "Desconocido"}</td>
                <td>{new Date(pedido.fechaTransaccion).toLocaleDateString()}</td>
                <td>{pedido.estado}</td>
                <td>
                  <ul>
                    {pedido.productos.map((p) => (
                      <li key={p.productoId?._id}>
                        {p.productoId?.nombre} - Cantidad: {p.cantidad} - Precio unitario: ${p.productoId?.precio}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${pedido.montoTotal}</td>
                <td>
                  {pedido.estado === "Pendiente" && (
                    <>
                      <button
                        className="btn btn-success btn-sm me-1"
                        onClick={() => handleActualizarEstado(pedido._id, "Aprobado")}
                      >
                        Aceptar
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleActualizarEstado(pedido._id, "Rechazado")}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {pedido.estado !== "Pendiente" && <em>No disponible</em>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
