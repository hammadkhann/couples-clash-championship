import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { BracketPage } from './pages/BracketPage';
import { DuelPage } from './pages/DuelPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

function App() {
  return (
    <GameProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bracket" element={<BracketPage />} />
            <Route path="/duel" element={<DuelPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </Layout>
      </Router>
    </GameProvider>
  );
}

export default App;
