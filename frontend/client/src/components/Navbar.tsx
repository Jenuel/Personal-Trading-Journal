import AddPort from './AddPort'
import DropButton from './DropButton'
import React from 'react'
import { Link } from 'react-router-dom' 
import './Navbar.css'

interface Portfolio {
  id: string
  name: string
}

interface NavbarProps {
  chosenPort: Portfolio
  portfolios: Portfolio[]
}
function Navbar({chosenPort, portfolios} : NavbarProps) {


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
          <li><Link to="/statistics">Statistics</Link></li>
          <li><Link to="/trades">Trades</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Navbar
