import AddPortPopup from '../pages/AddPortPopup'
import DropButton from './DropButton'
import React from 'react'
import { Link } from 'react-router-dom' 

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
    { id: '3', name: 'Trade C' }
  ]
  
  return (
    <div className='sidebar'>
      <div className="portpicker">
        <DropButton options={samplePorts} onSelect={handleSelected}/>
        <AddPortPopup />
      </div>
      <div className="choices">
        <ul>
          <li><Link to="/">Statistics</Link></li>
          <li><Link to="/">Trades</Link></li>
        </ul>
      </div>
    </div>
  )
}

export default Navbar
