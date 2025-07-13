// src/services/productoService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/productos";

// Función para obtener el token guardado
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Obtener todos los productos de una empresa
export const obtenerProductos = async () => {
  const res = await axios.get(API_URL, getAuthHeader());
  return res.data;
};

// Crear nuevo producto
export const crearProducto = async (datos) => {
  const res = await axios.post(API_URL, datos, getAuthHeader());
  return res.data;
};

// Editar producto
export const actualizarProducto = async (id, datos) => {
  const res = await axios.put(`${API_URL}/${id}`, datos, getAuthHeader());
  return res.data;
};

// Eliminar producto
export const eliminarProducto = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
  return res.data;
};
