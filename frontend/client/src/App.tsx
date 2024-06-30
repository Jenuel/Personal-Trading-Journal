import Navbar from './components/Navbar';
import React, { useState } from 'react';
import './App.css';
import LandingPage from './pages/landing/LandingPage';

interface Trade {
  id: string;
  name: string;
}

function App() {

  const samplePorts: Trade[] = [
    { id: '1', name: 'Trade A' },
    { id: '2', name: 'Trade B' },
    { id: '3', name: 'Trade C' },
    { id: '4', name: 'Trade D' },
    { id: '5', name: 'Trade E' },
    { id: '6', name: 'Trade F' },
    { id: '7', name: 'Trade G' },
    { id: '8', name: 'Trade H' },
    { id: '9', name: 'Trade I' },
    { id: '10', name: 'Trade J' },
    { id: '11', name: 'Trade K' },
    { id: '12', name: 'Trade L' },
    { id: '13', name: 'Trade M' },
    { id: '14', name: 'Trade N' },
    { id: '15', name: 'Trade O' },
    { id: '16', name: 'Trade P' },
    { id: '17', name: 'Trade Q' },
    { id: '18', name: 'Trade R' },
    { id: '19', name: 'Trade S' },
    { id: '20', name: 'Trade T' }
];
  const [data, setData] = useState<Trade[]>([])
  const [selectedPortfolio, setSelectedPortfolio] = useState<Trade | null>(null)

  const handleSelect = (portfolio: Trade) => {
    setSelectedPortfolio(portfolio)
  }
  return (
    <div className="App">
      {!selectedPortfolio ? (
        <LandingPage portfolios={samplePorts} onSelectPortfolio={handleSelect} />
      ) : (
        <>
          <div className='sidebar-app'>
            <Navbar/>
          </div>
          <div className="choice-page">
           
          </div>
        </>
      )}
    </div>
  );
}

export default App;
