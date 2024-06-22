import React, { useState } from 'react'

interface AddPortModalProps {
    closeModal: () => void;
}

function AddPortModal({ closeModal } : AddPortModalProps) {
    const [name, setName] = useState('')
    const [balance, setBalance] = useState(0)

    const handleSubmit = () => {

    }

  return (
    <div>
        <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input 
            type="text"
            required
            value={name}
            />
            <label>Balance</label>
            <input 
            type="number"
            required
            value={balance}
            />
        </form>
        <button className="cancel" onClick={closeModal}>Cancel</button>
        <button className="submit" type='submit'>Create</button>
    </div>
  )
}

export default AddPortModal