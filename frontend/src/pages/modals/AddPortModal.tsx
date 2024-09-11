import React, { useState, useEffect, useRef } from 'react'
import './AddPortModal.css'
import axios from 'axios'

interface AddPortModalProps {
    closeModal: () => void;
}

const AddPortModal = ({ closeModal }: AddPortModalProps) => {
    const [portName, setPortName] = useState('')
    const [balance, setBalance] = useState(0)
    const modalRef = useRef<HTMLDivElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
    //   console.log('Name:', name, 'Balance:', balance)
      createPort()
    }

    const createPort = () => {
        const portData = { portName, balance };
        
        axios.post('http://localhost:4000/ports', portData)
          .then(response => {
            console.log('Port created:', response.data);
            closeModal();
          })
          .catch(error => {
            if (error.response) {
              console.error('Server responded with:', error.response.status, error.response.data);
            } else if (error.request) {
              console.error('No response received:', error.request);
            } else {
              console.error('Error:', error.message);
            }
          });
      };
      


    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal()
      }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="modal-backdrop">
             <div className="modal-content" ref={modalRef}>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="name">Name</label>
                    <input 
                        id="name"
                        type="text"
                        required
                        value={portName}
                        onChange={(e) => setPortName(e.target.value)}
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
