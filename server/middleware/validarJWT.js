import jwt from 'jsonwebtoken';

// Middleware para verificar token y extraer usuario
export const validarJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extrae solo el token

  if (!token) {
    return res.status(401).json({ msg: 'No hay token, permiso denegado' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload.usuario; // guardar info usuario para siguiente middleware o controlador
    next();
  } catch (error) {
    return res.status(401).json({ msg: 'Token no válido' });
  }
};