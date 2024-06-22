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

    return (
        <div className='port-picker'>
            <button className="dropdown" onClick={toggleDropdown}>
                { currentName }
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {options.map(option => (
                        <div key={option.id} className="dropdown-item" onClick={() => handleSelect(option)}>
                            {option.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DropButton
