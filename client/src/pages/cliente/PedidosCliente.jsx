import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { obtenerPedidosCliente, cancelarPedido } from "../../services/pedidoService";
import Swal from "sweetalert2";

export default function MisPedidos() {
  const { userData } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("fecha-desc");

  useEffect(() => {
    if (userData) {
      cargarPedidos();
    }
  }, [userData]);

  const cargarPedidos = async () => {
    try {
      const data = await obtenerPedidosCliente();
      setPedidos(data || []); // aseguro array
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los pedidos", "error");
    }
  };

  // Filtrar por búsqueda (nombre productos)
  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.productos.some((p) =>
      (p.productoId?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  // Ordenar pedidos
  pedidosFiltrados.sort((a, b) => {
    if (orden === "fecha-asc") return new Date(a.fechaTransaccion) - new Date(b.fechaTransaccion);
    if (orden === "fecha-desc") return new Date(b.fechaTransaccion) - new Date(a.fechaTransaccion);
    if (orden === "monto-asc") return a.montoTotal - b.montoTotal;
    if (orden === "monto-desc") return b.montoTotal - a.montoTotal;
    return 0;
  });

  const handleCancelarPedido = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Cancelar pedido?",
      text: "Esta acción no se puede revertir",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
    });

    if (!confirm.isConfirmed) return;

    try {
      await cancelarPedido(id);
      Swal.fire("Cancelado", "El pedido ha sido cancelado", "success");
      cargarPedidos();
    } catch (error) {
      Swal.fire("Error", "No se pudo cancelar el pedido", "error");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Mis Pedidos</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Buscar producto en pedidos..."
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

      {pedidosFiltrados.length === 0 ? (
        <p>No hay pedidos que coincidan con la búsqueda.</p>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Productos</th>
              <th>Monto Total</th>
              <th>Cancelar Pedido</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido._id}>
                <td>{new Date(pedido.fechaTransaccion).toLocaleDateString()}</td>
                <td>{pedido.estado}</td>
                <td>
                  <ul>
                    {pedido.productos.map((p) => (
                      <li key={p.productoId?._id || Math.random()}>
                        {p.productoId?.nombre || "Producto no disponible"} - Cantidad: {p.cantidad} - Precio unitario: ${p.productoId?.precio ?? "N/A"}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>${pedido.montoTotal}</td>
                <td>
                  {pedido.estado === "Pendiente" && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancelarPedido(pedido._id)}
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
