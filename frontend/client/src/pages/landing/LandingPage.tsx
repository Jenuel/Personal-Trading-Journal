import React from 'react';

interface Trade {
  id: string;
  name: string;
}

interface LandingPageProps {
  portfolios: Trade[];
  onSelectPortfolio: (portfolio: Trade) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ portfolios, onSelectPortfolio }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPortfolioId = event.target.value;
    const selectedPortfolio = portfolios.find(portfolio => portfolio.id === selectedPortfolioId);
    if (selectedPortfolio) {
      onSelectPortfolio(selectedPortfolio);
    }
  };

  return (
    <div className="container">
      <select className="portfolio-dropdown" onChange={handleChange}>
        <option value="">Please select a portfolio</option>
        {portfolios.map((portfolio) => (
          <option key={portfolio.id} value={portfolio.id}>
            {portfolio.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LandingPage;
