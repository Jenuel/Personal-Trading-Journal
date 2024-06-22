import React, { useState } from 'react'
import './Dropdown.css'

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

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleSelect = (option: Trade) => {
        onSelect(option)
        setIsOpen(false)
        setCurrentName(option.name)
    }

    const handleDelete = (option: Trade) => {

    }

    return (
        <div className='port-picker'>
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
                                    Delete    
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
