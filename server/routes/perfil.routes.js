import { Router } from 'express';
import { validarJWT } from '../middleware/validarJWT.js';
import Usuario from '../models/Usuario.js';

const router = Router();

router.get('/perfil', validarJWT, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

export default router;
