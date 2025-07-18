import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';

export const registrar = async (req, res) => {
  const { nombre, rut, email, password, direccion, telefono, rol } = req.body;
  
  try {
    // Validaciones básicas
    if (!nombre || !rut || !email || !password || !direccion || !telefono) {
      return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
    }

    // Validar formato de email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: 'Email inválido' });
    }

    // Verificar si el usuario ya existe por email o rut
    const usuarioExistente = await Usuario.findOne({ 
      $or: [{ email }, { rut }] 
    });
    
    if (usuarioExistente) {
      const campoDuplicado = usuarioExistente.email === email ? 'email' : 'rut';
      const mensajeCampo = campoDuplicado === 'email' 
        ? 'El correo ya está registrado' 
        : 'El RUT ya está registrado';
      
      return res.status(400).json({ 
        msg: mensajeCampo,
        campo: campoDuplicado
      });
    }


    // Validar RUT chileno
    if (!validarRUTChileno(rut)) {
      return res.status(400).json({ msg: 'RUT inválido' });
    }

    // Validar teléfono chileno (9 dígitos + código país)
    const telefonoLimpio = telefono.replace(/\D/g, '');
    if (telefonoLimpio.length !== 11 || !telefonoLimpio.startsWith('56')) {
      return res.status(400).json({ msg: 'Teléfono inválido. Debe ser +56 9 1234 5678' });
    }

    // Validar fortaleza de la contraseña
    if (!validarFortalezaPassword(password)) {
      return res.status(400).json({ 
        msg: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números'
      });
    }

    // Crear nuevo usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre: validator.escape(nombre),
      rut: rut.replace(/[^0-9kK]/g, ''),
      email: validator.normalizeEmail(email),
      password: hashedPassword,
      direccion: validator.escape(direccion),
      telefono: telefonoLimpio,
      rol: rol || 'cliente'
    });

    await nuevoUsuario.save();

    // Crear token JWT
    const payload = {
      usuario: {
        id: nuevoUsuario._id,
        rol: nuevoUsuario.rol
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).send('Error en el servidor');
  }
};

// Función para validar RUT chileno
function validarRUTChileno(rut) {
  if (!rut) return false;
  
  // Limpiar RUT
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  if (rutLimpio.length < 8) return false;

  // Separar cuerpo y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  // Calcular DV esperado
  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

  return dv === dvCalculado;
}

// Función para validar fortaleza de contraseña
function validarFortalezaPassword(password) {
  const regex = /^(?=.*[a-zñ])(?=.*[A-ZÑ])(?=.*\d)[A-Za-zñÑ\d@$!%*?&]{6,}$/;
  return regex.test(password);
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ msg: "Credenciales incorrectas" });

    // Comparar password
    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) return res.status(400).json({ msg: "Credenciales incorrectas" });

    // Crear payload y token
    const payload = {
      usuario: {
        id: usuario._id,
        rol: usuario.rol,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "5h" });
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

export const obtenerPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Buscar usuario excluyendo password
    const usuario = await Usuario.findById(usuarioId).select("-password");
    if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

export const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, telefono, direccion } = req.body;

    // Validar campos mínimos
    if (!nombre || !telefono || !direccion) {
      return res.status(400).json({ msg: "Nombre, teléfono y dirección son obligatorios" });
    }

    // Validar teléfono chileno como en el registro
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 11 || !telefonoLimpio.startsWith("56")) {
      return res.status(400).json({ msg: "Teléfono inválido. Debe ser +56 9 1234 5678" });
    }

    // Actualizar solo esos campos
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      {
        nombre,
        telefono: telefonoLimpio,
        direccion,
      },
      { new: true, runValidators: true, context: "query" }
    ).select("-password");

    res.json({ msg: "Perfil actualizado", usuario: usuarioActualizado });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};
// Obtener todos los clientes (solo para rol empresa)
export const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Usuario.find({ rol: "cliente" }).select("-password");
    res.json(clientes);
  } catch (error) {
    console.error("Error obteniendo clientes:", error);
    res.status(500).json({ msg: "Error interno del servidor" });
  }
};