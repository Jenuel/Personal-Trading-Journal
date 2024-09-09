import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio } from '../../interfaces/interfaces';
import './LandingPage.css';

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

  return (
    <div className="container">
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
  );
}

export default LandingPage;
