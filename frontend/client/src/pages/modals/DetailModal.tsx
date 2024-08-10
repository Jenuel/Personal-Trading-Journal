import React from 'react'
import { Trade } from '../../interfaces/interfaces'
import './DetailModal.css'

interface DetailModalProps {
  open: boolean
  onClose: () => void
  data: Trade
}

function DetailModal({ open, onClose, data } : DetailModalProps) {
  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>X</button>
        <div>
          <p>Type: {data.category}</p>
          <p>Currency Pair: {data.currencyPair}</p>
          <p>Entry Price: {data.entryPrice}</p>
          <p>Closing Price: {data.closingPrice}</p>
          <p>Entry Time: {data.entryTime.toString()}</p>
          <p>Closing Time: {data.closingTime.toString()}</p>
          <p>Units: {data.units}</p>
          <p>Return: {data.return}</p>
          <p>Description: {data.description}</p>
        </div>
      </div>
    </div>
  )
}

export default DetailModal