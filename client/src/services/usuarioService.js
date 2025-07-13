// src/services/usuarioService.js
import axios from "axios";

const API_URL = "http://3.220.10.212:5000/api/auth/clientes";

export const obtenerClientes = async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};