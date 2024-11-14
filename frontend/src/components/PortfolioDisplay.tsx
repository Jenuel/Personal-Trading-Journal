import React from 'react'
import { Portfolio } from '../interfaces/interfaces'

interface PortfolioDisplayProps {
    port: Portfolio | null;
}

function PortfolioDisplay({ port } : PortfolioDisplayProps) {
    if (!port) {
        return <div>No Portfolio Data Available</div>; // Handle the null case
      }
    
      return (
        <div>{port.balance}</div>
      );
}

export default PortfolioDisplay