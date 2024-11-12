import React, { useState } from 'react'
import { Trade } from '../../interfaces/interfaces'
import './DetailModal.css'  // Import the CSS file

interface DetailModalProps {
  open: boolean
  onClose: () => void
  data: Trade
  onSave: (updatedData: Trade) => void
}

function DetailModal({ open, onClose, data, onSave }: DetailModalProps) {
  const [formData, setFormData] = useState<Trade>(data)
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onSave(formData)
    setIsEditing(false)
    onClose()
  }

  const handleCancel = () => {
    setFormData(data)  // Reset form data to original values
    setIsEditing(false)
  }

  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>X</button>
        <div>
          <label>Type: 
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Currency Pair: 
            <input
              type="text"
              name="currencyPair"
              value={formData.currencyPair}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Entry Price: 
            <input
              type="number"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Closing Price: 
            <input
              type="number"
              name="closingPrice"
              value={formData.closingPrice}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Entry Time: 
            <input
              type="datetime-local"
              name="entryTime"
              value={new Date(formData.entryTime).toISOString().slice(0, -1)}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Closing Time: 
            <input
              type="datetime-local"
              name="closingTime"
              value={new Date(formData.closingTime).toISOString().slice(0, -1)}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Units: 
            <input
              type="number"
              name="units"
              value={formData.units}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          <label>Return: 
            <input
              type="number"
              name="return"
              value={formData.return}
              onChange={handleChange}
              readOnly={true}
            />
          </label>
          <label>Description: 
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              readOnly={!isEditing}
            />
          </label>
          
          {isEditing ? (
            <div>
              <button className="modal-save-button" onClick={handleSave}>Save</button>
              <button className="modal-cancel-button" onClick={handleCancel}>Cancel</button>
            </div>
          ) : (
            <button className="modal-edit-button" onClick={handleEdit}>Edit</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailModal
