import express from 'express';
import { registrar, login } from '../controllers/authController.js';

const router = express.Router();

// @route   POST api/auth/registrar
// @desc    Registrar usuario
// @access  Public
router.post('/registrar', registrar);

// @route   POST api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', login);

export default router;