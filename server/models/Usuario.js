import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rut: {type: String, required: true, unique: true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  direccion: {type: String, required: true},
  telefono: {type: String, required: true},
  rol: { type: String, enum: ['empresa', 'cliente'], required: true },
});

export default mongoose.model('Usuario', UserSchema);