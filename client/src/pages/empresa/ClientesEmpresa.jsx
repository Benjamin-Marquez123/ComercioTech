// src/pages/empresa/ClientesEmpresa.jsx
import React, { useEffect, useState } from "react";
import { obtenerClientes } from "../../services/usuarioService";
import Swal from "sweetalert2";

export default function ClientesEmpresa() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const data = await obtenerClientes();
        setClientes(data);
      } catch (error) {
        Swal.fire("Error", "No se pudieron cargar los clientes", "error");
      }
    };

    cargarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Clientes Registrados</h2>
      <input
        type="text"
        placeholder="Buscar cliente por nombre..."
        className="form-control my-3"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>RUT</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length === 0 ? (
            <tr><td colSpan="5">No hay clientes que coincidan con la búsqueda.</td></tr>
          ) : (
            clientesFiltrados.map((cliente) => (
              <tr key={cliente._id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.rut}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefono}</td>
                <td>{cliente.direccion}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
