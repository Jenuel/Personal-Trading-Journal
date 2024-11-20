import React, { useState, useEffect, useRef } from 'react'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import './DropdownButton.css'
import ConfirmationModal from '../pages/modals/ConfirmationModal'
import { Link } from 'react-router-dom'
import { Portfolio } from '../interfaces/interfaces'
import axios from 'axios'

type PortPickerProps = {
    selectedPort: Portfolio
    options: Portfolio[]
}

function DropButton({ selectedPort, options} : PortPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedTrade, setSelectedTrade] = useState<Portfolio | null>(null);
    const [currentName, setCurrentName] = useState(selectedPort.portName)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleSelect = (option: Portfolio) => {
        setIsOpen(false)
        setCurrentName(option.portName)
    }

    const handleDelete = (option: Portfolio) => {
        setSelectedTrade(option)
        setModalOpen(true)
    }

    //delete
    const confirmDelete = () => {
        if (selectedTrade) {
            axios.delete(`http://localhost:4000/ports/${selectedTrade._id}`)
            .then(response => {
                console.log(`Deleted ${selectedTrade.portName}`);
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
            
        }
        setModalOpen(false);
        setSelectedTrade(null);
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

   console.log(currentName)
    return (
        <div className='port-picker' ref={dropdownRef}>
            <button className="dropdown" onClick={toggleDropdown}>
                { currentName }
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {options
                        .filter(option => option.portName !== currentName)
                        .map(option => (
                            <div key={option._id} className="dropdown-item">
                               <Link to={`/transactions/${option._id}`} className="port-name">
                                    <span onClick={() => handleSelect(option)}>
                                        {option.portName}
                                    </span>
                                </Link>
                                <IconButton
                                    onClick={() => handleDelete(option)}
                                    color="primary"
                                    aria-label="delete port"
                                    sx={{ p: 0.25 }}
                                    size="small"
                                >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </div>
                        ))}
                </div>
            )}
             {selectedTrade && (
                <ConfirmationModal 
                    open={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                    onConfirm={confirmDelete} 
                    message={`Are you sure you want to delete ${selectedTrade.portName}?`} 
                />
            )}
        </div>
    )
}

export default DropButton
