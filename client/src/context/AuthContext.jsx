import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // <- importante

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("/api/usuarios/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        setUserData(null);
      } finally {
        setLoading(false); // <- muy importante
      }
    };

    fetchUser();
  }, [token]);

  // Función para guardar token después de login
  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ userData, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
