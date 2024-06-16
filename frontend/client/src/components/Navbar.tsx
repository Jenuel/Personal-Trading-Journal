import AddPort from './AddPort'
import DropButton from './DropButton'
import React from 'react'
import { Link } from 'react-router-dom' 
import './Navbar.css'

interface Trade {
    id: string
    name: string
}

function Navbar() {
  function handleSelected(option: Trade) {
    console.log('Selected option:', option)
  }

  // Sample portfolios
  const samplePorts: Trade[] = [
    { id: '1', name: 'Trade A' },
    { id: '2', name: 'Trade B' },
    { id: '3', name: 'Trade C' },
    { id: '4', name: 'Trade D' },
    { id: '5', name: 'Trade E' },
    { id: '6', name: 'Trade F' },
    { id: '7', name: 'Trade G' },
    { id: '8', name: 'Trade H' },
    { id: '9', name: 'Trade I' },
    { id: '10', name: 'Trade J' },
    { id: '11', name: 'Trade K' },
    { id: '12', name: 'Trade L' },
    { id: '13', name: 'Trade M' },
    { id: '14', name: 'Trade N' },
    { id: '15', name: 'Trade O' },
    { id: '16', name: 'Trade P' },
    { id: '17', name: 'Trade Q' },
    { id: '18', name: 'Trade R' },
    { id: '19', name: 'Trade S' },
    { id: '20', name: 'Trade T' }
];

  
  return (
    <div className='sidebar'>
      <div className="port-container">
        <div className="portpicker">
          <DropButton options={samplePorts} onSelect={handleSelected}/>
        </div>
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
