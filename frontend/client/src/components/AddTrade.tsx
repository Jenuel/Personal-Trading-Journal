import React, { useState } from 'react'
import AddTradeModal from '../AddTradeModal'

function AddTrade() {
    const [isOpen, setIsOpen] = useState(false)

    const handleClick = () => {
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false)
    }
    
  return (
    <div>
        <button className='add-button' onClick={handleClick}>Add Trade</button>

        {isOpen && <AddTradeModal closeModal={handleClose}/>}
    </div>
  )
}

export default AddTrade