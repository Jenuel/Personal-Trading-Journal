import React from 'react'

interface Trade {
    id: string
    name: string
}

interface LandingPageProps {
    portfolios: Trade[]
    onSelectPortfolio: (portfolio: Trade) => void;
}

function LandingPage({portfolios, onSelectPortfolio} : LandingPageProps) {
  return (
    <div className="container">
        <button className="initial">
            Please select a portfolio
        </button>
        <div className="ports">
        {portfolios.map((portfolio) => (
            <button key={portfolio.id} onClick={() => onSelectPortfolio(portfolio)} className="portfolio-button">
              {portfolio.name}
            </button>
        ))}
        </div>
    </div>
  )
}

export default LandingPage