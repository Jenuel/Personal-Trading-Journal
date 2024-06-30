import React, { useState, useEffect, useRef } from 'react'
import { IconButton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import './Dropdown.css'
import ConfirmationModal from '../pages/ConfirmationModal'

interface Trade {
    id: string
    name: string
}

type PortPickerProps = {
    selectedPort: Trade
    options: Trade[]
    onSelect: (option: Trade) => void;
}

const DropButton = ({ selectedPort, options, onSelect } : PortPickerProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
    const [currentName, setCurrentName] = useState(selectedPort.name)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleSelect = (option: Trade) => {
        onSelect(option)
        setIsOpen(false)
        setCurrentName(option.name)
    }

    const handleDelete = (option: Trade) => {
        setSelectedTrade(option)
        setModalOpen(true)
    }

    const confirmDelete = () => {
        if (selectedTrade) {
            console.log(`Deleted ${selectedTrade.name}`);
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


    return (
        <div className='port-picker' ref={dropdownRef}>
            <button className="dropdown" onClick={toggleDropdown}>
                { currentName }
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map(option => (
                        <div key={option.id} className="dropdown-item">
                            <span className="port-name" onClick={() => handleSelect(option)}>{option.name}</span>
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
                    message={`Are you sure you want to delete ${selectedTrade.name}?`} 
                />
            )}
        </div>
    )
}

export default DropButton
