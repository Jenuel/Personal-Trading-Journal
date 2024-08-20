import AddPort from './AddPort'
import DropButton from './DropButton'
import React from 'react'
import { Link } from 'react-router-dom' 
import './Sidebar.css'
import { Portfolio } from '../interfaces/interfaces'

interface SidebarProps {
  chosenPort: Portfolio
  portfolios: Portfolio[]
  id: string
}
function Sidebar({chosenPort, portfolios, id} : SidebarProps) {
  return (
    <div className='sidebar'>
      <div className="port-container">
        <DropButton selectedPort={chosenPort} options={portfolios} />
        <div className="addport"> 
          <AddPort />
        </div>
      </div>
      <div className="choices">
        <ul>
          <li><Link to={`/statistics/${id}`}>Statistics</Link></li>
          <li><Link to={`/transactions/${id}`}>Trades</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
