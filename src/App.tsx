// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './pages/dashboard';
import LogOffPage from './pages/logoff';
import Login from './pages/login';
import PrivateRoute from './components/routes/private-route';
import PrivateLayout from './components/layout/private-layout';
import { AuthProvider } from './contexts/auth-context';
import TelaConfiguracoes from './pages/settings';
import Cheques from './pages/visualizar-cheques';
import NovoCheque from './pages/cadastrar-cheque';
import DetalhesCheque from './pages/detalhes-cheque';
import Remessas from './pages/visualizar-remessas';
import NovaRemessa from './pages/nova-remessa';
import DetalhesRemessa from './pages/detalhes-remessa';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <PrivateLayout />
              </PrivateRoute>
            }
          >
            {/* Rota Dashboard */}
            <Route index element={<DashboardHome />} />

            {/* Rotas de Estornos */}
            {/* <Route path="estornos" element={<TabelOperacoesPage />} />
            <Route path="estornos/novo-estorno" element={<NovoEstorno />} />
            <Route path="estornos/:id" element={<DetalhesOperacao />} /> */}

            {/* Rotas de Cheques (Ajuste aqui) */}
            <Route path="cheques" element={<Cheques />} />
            <Route path="cheques/novo" element={<NovoCheque />} />
            <Route path="cheques/:id" element={<DetalhesCheque />} />

            <Route path="remessas/nova-remessa" element={<NovaRemessa />} />
            {/* <Route path="remessas/finalizar/:id" element={<FinalizarRemessa />} /> */}
            <Route path="remessas/:id" element={<DetalhesRemessa />} />
            
            <Route path='remessas' element={<Remessas />}/>
              {/* Outras Rotas */}
            <Route path="signoff" element={<LogOffPage />} />
            <Route path="settings" element={<TelaConfiguracoes />} />
          </Route>

          {/* Redirecionamento para a página inicial se a rota não for encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
