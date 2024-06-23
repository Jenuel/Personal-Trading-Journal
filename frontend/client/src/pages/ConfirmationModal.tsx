  import React from 'react'

  interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
  }

  function ConfirmationModal({open, onClose, onConfirm, message }: ConfirmationModalProps) {
    return (
      <div className="confirm-modal">
        <div className="message-container">
          <p className="message">{message}</p>
        </div>
        <div className="buttons">
          <button className="cancel"> Cancel</button>
          <button className="confirm">Confirm</button>
        </div>
      </div>
    )
  }

  export default ConfirmationModal