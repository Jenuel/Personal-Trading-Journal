import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio } from '../../interfaces/interfaces';
import './LandingPage.css';
import logo from '../../assets/trading-journal-logo.png';

interface LandingPageProps {
  data: Portfolio[];
}

function LandingPage({ data }: LandingPageProps) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>('');

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPortfolioId = event.target.value;
    setSelectedId(selectedPortfolioId);
    if (selectedPortfolioId) {
      navigate(`/transactions/${selectedPortfolioId}`);
    }
  };

  if (!data) {
    return <div>No portfolios available</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <img src={logo} alt="TradeLog Logo" className="logo" />
          <h1 className="name">TradeLog</h1>
        </div>
        <div className="card-body">
          <select
            className="portfolio-dropdown"
            value={selectedId}
            onChange={handleSelectChange}
          >
            <option value="">Please select a portfolio</option>
            {data.length > 0 ? (
              data.map((portfolio) => (
                <option key={portfolio._id} value={portfolio._id}>
                  {portfolio.portName}
                </option>
              ))
            ) : (
              <option value="" disabled>No portfolios available</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
