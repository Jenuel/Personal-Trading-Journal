import React from 'react';
import { Portfolio } from '../interfaces/interfaces';


interface PortfolioDisplayProps {
  port: Portfolio | null;
}

function PortfolioDisplay({ port }: PortfolioDisplayProps) {
  if (!port) {
    return (
      <div className="portfolio-card error">
        <h2>No Portfolio Data Available</h2>
        <p>Please make sure your portfolio data is loaded correctly.</p>
      </div>
    );
  }

  return (
    <div className="portfolio-card">
      <h4>Balance: {port.balance ? `$${port.balance.toFixed(2)}` : 'N/A'}</h4>
    </div>
  );
}

export default PortfolioDisplay;
