import DropButton from './DropButton'
import React from 'react'

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
      <DropButton options={samplePorts} onSelect={handleSelected}/>
    </div>
  )
}

export default Navbar
