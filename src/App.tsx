import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VotingPage from './pages/VotingPage';
import LiveResults from './pages/LiveResults';
import AdminDashboard from './pages/AdminDashboard';
import { FloatingParticles } from './components/FloatingParticles';

function App() {
  return (
    <Router>
      <div className="relative min-h-screen">
        <FloatingParticles />
        <Routes>
          <Route path="/" element={<VotingPage />} />
          <Route path="/live" element={<LiveResults />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
