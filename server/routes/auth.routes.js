import express from 'express';
import { registrar, login, obtenerPerfil, actualizarPerfil, obtenerClientes } from '../controllers/auth.js';
import { validarJWT } from "../middleware/validarJWT.js"

const router = express.Router();

// @route   POST api/auth/registrar
// @desc    Registrar usuario
// @access  Public
router.post('/registrar', registrar);
router.post('/login', login);
router.get("/perfil", validarJWT, obtenerPerfil);
router.put("/perfil", validarJWT, actualizarPerfil);
router.get("/clientes", validarJWT, obtenerClientes);


// @route   POST api/auth/login
// @desc    Iniciar sesión
// @access  Public

export default router;