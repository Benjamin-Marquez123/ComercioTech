import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import usuarioRoutes from "./routes/perfil.routes.js";
import productoRoutes from "./routes/productos.routes.js";
import pedidoRoutes from "./routes/pedidos.routes.js"

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a DB
connectDB();

// Rutas
app.use('/api/auth', authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/pedidos", pedidoRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});