import express from "express";
import { validarJWT } from "../middleware/validarJWT.js";
import {
  obtenerProductos,
  crearProducto,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} from "../controllers/productos.js";

const router = express.Router();

// Rutas públicas
router.get("/", obtenerProductos); // (opcionalmente podría ser pública)
router.get("/:id", obtenerProductoPorId);

// Rutas protegidas
router.post("/", validarJWT, crearProducto);
router.put("/:id", validarJWT, actualizarProducto);
router.delete("/:id", validarJWT, eliminarProducto);

export default router;
