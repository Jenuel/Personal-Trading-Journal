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
    options: Trade[]
    onSelect: (option: Trade) => void;
}

const DropButton = ({ options, onSelect } : PortPickerProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentName, setCurrentName] = useState("Select Trade")
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
        <ConfirmationModal  />
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

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
                            <div className="port-name">
                                <span onClick={() => handleSelect(option)}>{option.name}</span>
                            </div>
                            <div className="delete-container">
                                <button className="delete-button" onClick={() => handleDelete(option)}>
                                    <IconButton onClick={() => handleDelete(option)} color="primary" aria-label="add port">
                                        <DeleteIcon />
                                    </IconButton>
                                </button>  
                            </div>                      
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DropButton
