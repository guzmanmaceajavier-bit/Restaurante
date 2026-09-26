import { Route, Routes } from 'react-router-dom'
import AppLayout from '../../layouts/PublicLayout'
import AdminLayout from '../../layouts/AdminLayout'
import { AdminGuard } from '../../components/navigation/AdminGuard'

// Public pages
import Home from '../../pages/public/Home'
import Menu from '../../pages/public/Menu'
import MenuDetail from '../../pages/public/MenuDetail'
import CheckOut from '../../pages/public/CheckOut'
import OrderConfirmation from '../../pages/public/OrderConfirmation'
import Reserve from '../../pages/public/Reserve'
import Contact from '../../pages/public/Contact'
import Resenas from '../../pages/public/Resenas'
import Gallery from '../../pages/public/Gallery'
import Events from '../../pages/public/Events'
import NotFound from '../../pages/public/NotFound'
import MiPerfil from '../../pages/public/MiPerfil'
import PoliticaPrivacidad from '../../pages/public/PoliticaPrivacidad'
import TerminosCondiciones from '../../pages/public/TerminosCondiciones'
import ClientLogin from '../../pages/client/ClientLogin'
import ClientPanel from '../../pages/client/ClientPanel'
import OrderTracking from '../../pages/public/OrderTracking'
import AboutUs from '../../pages/public/AboutUs'
import ForgotPassword from '../../pages/client/ForgotPassword'
import DemoHub from '../../pages/public/DemoHub'

// Admin pages
import GestionReserva from '../../pages/admin/GestionReserva'
import AdminReservas from '../../pages/admin/AdminReservas'
import AdminOrdenes from '../../pages/admin/AdminOrdenes'
import AdminDashboard from '../../pages/admin/AdminDashboard'
import OrderHistory from '../../pages/public/OrderHistory'
import Promociones from '../../pages/public/Promociones'
import AdminLogin from '../../pages/admin/AdminLogin'
import AdminWhatsApp from '../../pages/admin/AdminWhatsApp'
import AdminClientes from '../../pages/admin/AdminClientes'
import AdminResenas from '../../pages/admin/AdminResenas'
import AdminCocina from '../../pages/admin/AdminCocina'
import AdminMesas from '../../pages/admin/AdminMesas'
import AdminConfig from '../../pages/admin/AdminConfig'
import AdminPromociones from '../../pages/admin/AdminPromociones'
import AdminCatalogo from '../../pages/admin/AdminCatalogo'
import AdminFinanzas from '../../pages/admin/AdminFinanzas'
import AdminActividad from '../../pages/admin/AdminActividad'
import AdminProveedores from '../../pages/admin/AdminProveedores'
import AdminCompras from '../../pages/admin/AdminCompras'
import AdminCaja from '../../pages/admin/AdminCaja'
import AdminFacturacion from '../../pages/admin/AdminFacturacion'
import AdminUsuarios from '../../pages/admin/AdminUsuarios'
import AdminFidelizacion from '../../pages/admin/AdminFidelizacion'
import AdminEventos from '../../pages/admin/AdminEventos'
import ClientLayout from '../../layouts/ClientLayout'

import { RoutesPath } from './routes'

export default function MainRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AppLayout />}>
        <Route path={RoutesPath.home} element={<Home />} />
        <Route path={RoutesPath.menu} element={<Menu />} />
        <Route path={RoutesPath.menuDetail(':id')} element={<MenuDetail />} />
        <Route path={RoutesPath.checkout} element={<CheckOut />} />
        <Route path={RoutesPath.orderConfirmation(':id')} element={<OrderConfirmation />} />
        <Route path={RoutesPath.reserve} element={<Reserve />} />
        <Route path={RoutesPath.contact} element={<Contact />} />
        <Route path={RoutesPath.resenas} element={<Resenas />} />
        <Route path={RoutesPath.galeria} element={<Gallery />} />
        <Route path={RoutesPath.eventos} element={<Events />} />
        <Route path={RoutesPath.promociones} element={<Promociones />} />
        <Route path={RoutesPath.miPerfil} element={<MiPerfil />} />
        <Route path={RoutesPath.orderHistory} element={<OrderHistory />} />
        <Route path={RoutesPath.politicaPrivacidad} element={<PoliticaPrivacidad />} />
        <Route path={RoutesPath.terminosCondiciones} element={<TerminosCondiciones />} />
        <Route path={RoutesPath.aboutUs} element={<AboutUs />} />
        <Route path={RoutesPath.orderTrackingBase} element={<OrderTracking />} />
        <Route path={RoutesPath.orderTracking(':id')} element={<OrderTracking />} />
      </Route>

      {/* Client portal - independent layout */}
      <Route element={<ClientLayout />}>
        <Route path={RoutesPath.clientLogin} element={<ClientLogin />} />
        <Route path={RoutesPath.clientRegister} element={<ClientLogin />} />
        <Route path={RoutesPath.clientPanel} element={<ClientPanel />} />
        <Route path={RoutesPath.forgotPassword} element={<ForgotPassword />} />
      </Route>

      {/* Admin login */}
      <Route path={RoutesPath.adminLogin} element={<AdminLogin />} />

      {/* Admin routes with sidebar */}
      <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route path={RoutesPath.adminDashboard} element={<AdminDashboard />} />
        <Route path={RoutesPath.gestionReserva} element={<GestionReserva />} />
        <Route path={RoutesPath.adminReservas} element={<AdminReservas />} />
        <Route path={RoutesPath.adminOrdenes} element={<AdminOrdenes />} />
        <Route path={RoutesPath.adminWhatsApp} element={<AdminWhatsApp />} />
        <Route path={RoutesPath.adminClientes} element={<AdminClientes />} />
        <Route path={RoutesPath.adminResenas} element={<AdminResenas />} />
        <Route path={RoutesPath.adminCocina} element={<AdminCocina />} />
        <Route path={RoutesPath.adminMesas} element={<AdminMesas />} />
        <Route path="/admin-config" element={<AdminConfig />} />
        <Route path={RoutesPath.adminPromociones} element={<AdminPromociones />} />
        <Route path={RoutesPath.adminFinanzas} element={<AdminFinanzas />} />
        <Route path={RoutesPath.adminActividad} element={<AdminActividad />} />
        <Route path={RoutesPath.adminProveedores} element={<AdminProveedores />} />
        <Route path={RoutesPath.adminCompras} element={<AdminCompras />} />
        <Route path={RoutesPath.adminCaja} element={<AdminCaja />} />
        <Route path={RoutesPath.adminFacturacion} element={<AdminFacturacion />} />
        <Route path={RoutesPath.adminUsuarios} element={<AdminUsuarios />} />
        <Route path={RoutesPath.adminFidelizacion} element={<AdminFidelizacion />} />
        <Route path={RoutesPath.adminEventos} element={<AdminEventos />} />
        <Route path={RoutesPath.adminCatalogo} element={<AdminCatalogo />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

      {/* Demo hub */}
      <Route path={RoutesPath.demo} element={<DemoHub />} />
    </Routes>
  )
}
