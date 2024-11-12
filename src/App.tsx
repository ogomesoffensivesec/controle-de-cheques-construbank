// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './pages/dashboard';
import LogOffPage from './pages/logoff';
import TabelOperacoesPage from './pages/tabela-operacoes';
import DetalhesOperacao from './pages/detalhes-operacao';
import Login from './pages/login';
import PrivateRoute from './components/routes/private-route';
import PrivateLayout from './components/layout/private-layout'; // Certifique-se de ter criado este componente
import { AuthProvider } from './contexts/auth-context';
import TelaConfiguracoes from './pages/settings';
import NovoEstorno from './pages/novo-estorno';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rota Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Privadas */}
          <Route
            path="/*" // Usa wildcard para englobar todas as rotas privadas
            element={
              <PrivateRoute>
                <PrivateLayout />
              </PrivateRoute>
            }
          >
            {/* Rotas Filhas Relativas */}
            <Route index element={<DashboardHome />} />
            <Route path="estornos" element={<TabelOperacoesPage />} />
            <Route path="estornos/novo-estorno" element={<NovoEstorno />} />
            <Route path="estornos/:id" element={<DetalhesOperacao />} />
            <Route path="signoff" element={<LogOffPage />} />
            <Route path='settings' element={<TelaConfiguracoes/>}/>
          </Route>

          {/* Redirecionamento para a Dashboard por padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
