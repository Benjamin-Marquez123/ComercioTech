// controllers/pedidos.js
import Pedido from "../models/Pedido.js";
import Producto from "../models/Producto.js";
import Usuario from "../models/Usuario.js";

export const crearPedido = async (req, res) => {
  try {
    const { productos } = req.body;
    const clienteId = req.usuario.id; // Asumiendo que el middleware de autenticación coloca el usuario aquí

    // Validar que haya productos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Debe seleccionar al menos un producto." });
    }

    let montoTotal = 0;

    // Recorremos los productos para obtener su precio y calcular el monto total
    for (const item of productos) {
      const producto = await Producto.findById(item.productoId);
      if (!producto) {
        return res.status(404).json({ error: `Producto con ID ${item.productoId} no encontrado.` });
      }

      montoTotal += producto.precio * item.cantidad;
    }

    const nuevoPedido = new Pedido({
      cliente: clienteId,
      montoTotal,
      fechaTransaccion: new Date(),
      productos,
    });

    await nuevoPedido.save();

    res.status(201).json(nuevoPedido);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
};

export const obtenerPedidosPorCliente = async (req, res) => {
  try {
    const clienteId = req.usuario.id;

    // Obtener pedidos del cliente con productos y sus datos
    const pedidos = await Pedido.find({ cliente: clienteId })
      .populate("productos.productoId", "nombre precio") // trae nombre y precio solo
      .sort({ fechaTransaccion: -1 }); // ordena más recientes primero

    res.json(pedidos);
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// controllers/pedidos.js
export const cancelarPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.findById(id);
    if (!pedido) return res.status(404).json({ mensaje: "Pedido no encontrado" });

    if (pedido.estado !== "Pendiente") {
      return res.status(400).json({ mensaje: "Solo se pueden cancelar pedidos pendientes" });
    }

    pedido.estado = "Cancelado";
    await pedido.save();

    res.json({ mensaje: "Pedido cancelado correctamente", pedido });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    res.status(500).json({ mensaje: "Error al cancelar el pedido" });
  }
};

export const obtenerPedidos = async (req, res) => {
  try {
    // Traer todos los pedidos, con productos y datos del cliente
    const pedidos = await Pedido.find()
      .populate("cliente", "nombre email") // datos cliente
      .populate("productos.productoId", "nombre precio cantidad") // datos producto
      .sort({ fechaTransaccion: -1 }); // orden descendente por fecha
    
    res.json(pedidos);
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

export const actualizarEstadoPedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    // Buscar el pedido y popular productos para actualizar stock
    const pedido = await Pedido.findById(id).populate("productos.productoId");

    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    // Validar estado recibido
    const estadosValidos = ["Pendiente", "Aprobado", "Rechazado", "Cancelado"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ mensaje: "Estado inválido" });
    }

    // Si el estado no cambia, solo retornamos el pedido actual
    if (pedido.estado === estado) {
      return res.json({ mensaje: "Estado sin cambios", pedido });
    }

    // Si el nuevo estado es "Aprobado", se reduce el stock
    if (estado === "Aprobado") {
      for (const item of pedido.productos) {
        const producto = item.productoId;

        if (producto.cantidad < item.cantidad) {
          return res.status(400).json({
            mensaje: `Stock insuficiente para producto ${producto.nombre}`,
          });
        }
      }

      // Si stock es suficiente, ahora sí reducimos y guardamos
      for (const item of pedido.productos) {
        const producto = item.productoId;
        producto.cantidad -= item.cantidad;
        await producto.save();
      }
    }

    pedido.estado = estado;
    await pedido.save();

    return res.json({ mensaje: "Estado actualizado correctamente", pedido });
  } catch (error) {
    console.error("Error actualizando pedido:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};