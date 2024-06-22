import React, { useState } from 'react';
import './AddPortModal.css';

interface AddPortModalProps {
    closeModal: () => void;
}

const AddPortModal = ({ closeModal }: AddPortModalProps) => {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Name:', name, 'Balance:', balance)
      closeModal()
    }

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Name</label>
                    <input 
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <label htmlFor="balance">Balance</label>
                    <input 
                        id="balance"
                        type="number"
                        required
                        value={balance}
                        onChange={(e) => setBalance(parseFloat(e.target.value))}
                    />
                    <div className="button-container">
                        <button className="cancel" type="button" onClick={closeModal}>Cancel</button>
                        <button className="submit" type="submit">Create</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddPortModal
