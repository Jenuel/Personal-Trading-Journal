import React, { useState } from 'react'

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

    const toggleDropdown = () => {
        setIsOpen(!isOpen)
    }

    const handleSelect = (option: Trade) => {
        onSelect(option)
        setIsOpen(false)
    }

    return (
        <div className='port-picker'>
            <button className="dropdown" onClick={toggleDropdown}>
                Select Trade
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
