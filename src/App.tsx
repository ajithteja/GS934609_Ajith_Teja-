import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';

import StoresPage from './pages/StoresPage';
import SKUsPage from './pages/SKUsPage';
import PlanningPage from './pages/PlanningPage';
import ChartPage from './pages/ChartPage';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-200">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-4">
              <Routes>
                <Route path="/" element={<StoresPage />} />
                <Route path="/skus" element={<SKUsPage />} />
                <Route path="/planning" element={<PlanningPage />} />
                <Route path="/chart" element={<ChartPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
