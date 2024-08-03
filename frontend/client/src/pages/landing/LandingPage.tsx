import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Portfolio } from '../../interfaces/interfaces';

interface LandingPageProps {
  data: Portfolio[];
}

function LandingPage({ data }: LandingPageProps) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string>('');

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPortfolioId = event.target.value;
    setSelectedId(selectedPortfolioId);
    navigate(`/trades/${selectedPortfolioId}`);
  };


  return (
    <div className="container">
      <select className="portfolio-dropdown" value={selectedId} onChange={handleSelectChange}>
        <option value="">Please select a portfolio</option>
        {data.map((portfolio) => (
          <option key={portfolio.id} value={portfolio.id}>
            {portfolio.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LandingPage;
