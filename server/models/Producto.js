import mongoose from 'mongoose';

const ProductoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  cantidad: { type: Number, required: true },
  disponibilidad: {type: String, enum: ['disponible', 'no disponible'], required: true}
});

export default mongoose.model('Producto', ProductoSchema);