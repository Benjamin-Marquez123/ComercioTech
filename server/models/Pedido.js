import mongoose from "mongoose";

const PedidoSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  montoTotal: { type: Number, required: true },
  fechaTransaccion: { type: Date, required: true },
  estado: {
    type: String,
    enum: ["Pendiente", "Aprobado", "Rechazado", "Cancelado"],
    default: "Pendiente",
  },
  productos: [
    {
      productoId: { type: mongoose.Schema.Types.ObjectId, ref: "Producto", required: true },
      cantidad: { type: Number, required: true },
    },
  ],
});

export default mongoose.model("Pedido", PedidoSchema);