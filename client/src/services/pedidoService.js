// src/services/pedidoService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/pedidos";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Crear nuevo pedido
export const crearPedido = async (pedidoData) => {
  const res = await axios.post(API_URL, pedidoData, getAuthHeader());
  return res.data;
};

// Obtener pedidos del usuario (opcional)
export const obtenerPedidosCliente = async () => {
  const res = await axios.get(`${API_URL}/cliente`, getAuthHeader());
  return res.data;
};

export const cancelarPedido = async (id) => {
  const res = await axios.put(`${API_URL}/cancelar/${id}`, {}, getAuthHeader());
  return res.data;
};
export const obtenerPedidosEmpresa = async () => {
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

export const actualizarEstadoPedido = async (id, estado) => {
  const res = await axios.put(`${API_URL}/${id}`, { estado }, getAuthHeader());
  return res.data;
};