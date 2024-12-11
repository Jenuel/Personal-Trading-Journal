import AddPort from './AddPort';
import DropButton from './DropButton';
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { Portfolio } from '../interfaces/interfaces';
import { usePortfolioContext } from '../hooks/usePortfolioContext';
import BarChartIcon from '@mui/icons-material/BarChart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

interface SidebarProps {
  chosenPort: Portfolio;
  portfolios: Portfolio[];
  id: string;
}

function Sidebar({ chosenPort, portfolios, id }: SidebarProps) {
  const { dispatch } = usePortfolioContext();
  
  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_PORTFOLIO', payload: id });
    console.log(`Deleted portfolio with ID : ${id}`);
  };

  return (
    <div className="sidebar">
      <div className="port-container">
        <DropButton 
          selectedPort={chosenPort} 
          options={portfolios} 
          onDelete={handleDelete} 
        />
        <div className="addport">
          <AddPort />
        </div>
      </div>
      <div className="choices">
        <ul>
          <li>
            <Link to={`/statistics/${id}`}>
              <BarChartIcon sx={{ marginRight: '8px' }} /> Statistics
            </Link>
          </li>
          <li>
            <Link to={`/transactions/${id}`}>
              <SwapHorizIcon sx={{ marginRight: '8px' }} /> Trades
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
