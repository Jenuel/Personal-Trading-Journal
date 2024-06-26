import React from 'react'
import './ConfirmationModal.css'

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

function ConfirmationModal({open, onClose, onConfirm, message }: ConfirmationModalProps) {
  if (!open) return null
  
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="message-container">
          <p className="message">{message}</p>
            </div>
              <div className="buttons">
                <button className="cancel" onClick={onClose}>Cancel</button>
                <button className="confirm" onClick={onConfirm}>Confirm</button>
              </div>
            </div>
    </div>
  )
}

export default ConfirmationModal