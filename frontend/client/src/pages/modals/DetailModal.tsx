import React from 'react'
import { Trade } from '../../interfaces/interfaces'

interface DetailModalProps {
  open: boolean
  onClose: () => void
  data: Trade
}

function DetailModal({ open, onClose, data } : DetailModalProps) {
  return (
    <div>DetailModal</div>
  )
}

export default DetailModal