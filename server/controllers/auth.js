import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrar = async (req, res) => {
  const { nombre, rut, email, password, direccion, telefono, rol } = req.body;

  try {
    // Verificar si el usuario ya existe por email o rut
    const usuarioExistente = await Usuario.findOne({ 
      $or: [{ email }, { rut }] 
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Validar formato de RUT (implementación básica)
    if (!rut || rut.length < 8) {
      return res.status(400).json({ msg: 'RUT inválido' });
    }

    // Validar teléfono
    if (!telefono || telefono.length !== 11) {
      return res.status(400).json({ msg: 'Teléfono inválido' });
    }

    // Crear nuevo usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      rut,
      email,
      password: hashedPassword,
      direccion,
      telefono,
      rol: rol || 'cliente' // Por defecto cliente
    });

    await nuevoUsuario.save();

    // Crear token JWT
    const payload = {
      usuario: {
        id: nuevoUsuario._id,
        rol: nuevoUsuario.rol
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};