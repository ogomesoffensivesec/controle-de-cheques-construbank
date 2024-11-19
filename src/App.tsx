// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import PrivateRoute from './components/routes/private-route';
import PrivateLayout from './components/layout/private-layout';
import { AuthProvider } from './contexts/auth-context';

// Importações Dinâmicas
const DashboardHome = lazy(() => import('./pages/dashboard'));
const LogOffPage = lazy(() => import('./pages/logoff'));
const Login = lazy(() => import('./pages/login'));
const TelaConfiguracoes = lazy(() => import('./pages/settings'));
const Cheques = lazy(() => import('./pages/visualizar-cheques'));
const NovoCheque = lazy(() => import('./pages/cadastrar-cheque'));
const DetalhesCheque = lazy(() => import('./pages/detalhes-cheque'));
const Remessas = lazy(() => import('./pages/visualizar-remessas'));
const NovaRemessa = lazy(() => import('./pages/nova-remessa'));
const DetalhesRemessa = lazy(() => import('./pages/detalhes-remessa'));


function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Carregando...</div>}>
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

              {/* Rotas de Cheques */}
              <Route path="cheques" element={<Cheques />} />
              <Route path="cheques/novo" element={<NovoCheque />} />
              <Route path="cheques/:id" element={<DetalhesCheque />} />

              {/* Rotas de Remessas */}
              <Route path="remessas" element={<Remessas />} />
              <Route path="remessas/nova-remessa" element={<NovaRemessa />} />
              <Route path="remessas/:id" element={<DetalhesRemessa />} />

              {/* Outras Rotas */}
              <Route path="signoff" element={<LogOffPage />} />
              <Route path="settings" element={<TelaConfiguracoes />} />
            </Route>

            {/* Redirecionamento para a página inicial se a rota não for encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
