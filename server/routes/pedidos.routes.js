// backend/routes/pedidos.js

import express from "express";
import { crearPedido, obtenerPedidosPorCliente, cancelarPedido, obtenerPedidos, actualizarEstadoPedido } from "../controllers/pedidos.js";
import { validarJWT }from "../middleware/validarJWT.js"; // Asegúrate de tener este middleware

const router = express.Router();

router.post("/", validarJWT, crearPedido);
router.get("/cliente", validarJWT, obtenerPedidosPorCliente);
router.get("/", validarJWT, obtenerPedidos); // para empresa
router.put("/cancelar/:id", validarJWT, cancelarPedido);
router.put("/:id", validarJWT, actualizarEstadoPedido);

export default router;
