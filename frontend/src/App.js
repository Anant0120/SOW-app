import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Pricelist from './pages/Pricelist';
import Terms from './pages/Terms';



function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/pricelist" element={<Pricelist />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
