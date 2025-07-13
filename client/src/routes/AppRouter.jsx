import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedByRole from "./ProtectedByRole";
import Register from "../pages/Register";
import Login from "../pages/Login"
import NotFound from "../pages/NotFound";

//cliente
import ClienteLayout from "../components/cliente/ClienteLayout";
import HomeCliente from "../pages/cliente/HomeCliente";
import ProductosCliente from "../pages/cliente/ProductosCliente";
import PedidosClientes from "../pages/cliente/PedidosCliente"
import EditarPerfil from "../pages/cliente/EditarPerfil"

//Empresa
import EmpresaLayout from "../components/empresa/EmpresaLayout";
import HomeEmpresa from "../pages/empresa/HomeEmpresa";
import ProductosEmpresa from "../pages/empresa/ProductosEmpresa";
import PedidosEmpresa from "../pages/empresa/PedidosEmpresa";
import ClientesEmpresa from "../pages/empresa/ClientesEmpresa";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/registrar" element={<Register />} />
            <Route path="/*" element={<NotFound />} />

            <Route path="/cliente" element={
                <ProtectedByRole allowed={["cliente"]}>
                    <ClienteLayout/>
                </ProtectedByRole>
            }>
                <Route path="HomeCliente" element={<HomeCliente />} />
                <Route path="ProductosCliente" element={<ProductosCliente />} />
                <Route path="PedidosCliente" element={<PedidosClientes />} />
                <Route path="EditarPerfil" element={<EditarPerfil />} />
            </Route>

            <Route path="/empresa" element={
                <ProtectedByRole allowed={["empresa"]}>
                    <EmpresaLayout/>
                </ProtectedByRole>
            }>
                <Route path="HomeEmpresa" element={<HomeEmpresa />} />
                <Route path="ProductosEmpresa" element={<ProductosEmpresa />} />
                <Route path="PedidosEmpresa" element={<PedidosEmpresa />} />
                <Route path="ClientesEmpresa" element={<ClientesEmpresa />} />
            </Route>
        </Routes>

    );
}
