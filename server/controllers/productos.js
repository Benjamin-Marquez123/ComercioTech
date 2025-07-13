import Producto from "../models/Producto.js";

// Obtener todos los productos
export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener productos" });
  }
};

// Crear producto
export const crearProducto = async (req, res) => {
  const { nombre, precio, cantidad, disponibilidad } = req.body;

  if (!nombre || precio == null || cantidad == null || !disponibilidad) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  try {
    const nuevoProducto = new Producto({ nombre, precio, cantidad, disponibilidad });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ msg: "Error al crear producto" });
  }
};

// Obtener producto por ID
export const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ msg: "Error al obtener producto" });
  }
};

// Actualizar producto
export const actualizarProducto = async (req, res) => {
  const { nombre, precio, cantidad, disponibilidad } = req.body;

  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });

    producto.nombre = nombre || producto.nombre;
    producto.precio = precio ?? producto.precio;
    producto.cantidad = cantidad ?? producto.cantidad;
    producto.disponibilidad = disponibilidad || producto.disponibilidad;

    await producto.save();
    res.json(producto);
  } catch (error) {
    res.status(500).json({ msg: "Error al actualizar producto" });
  }
};

// Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ msg: "Producto no encontrado" });
    res.json({ msg: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ msg: "Error al eliminar producto" });
  }
};
