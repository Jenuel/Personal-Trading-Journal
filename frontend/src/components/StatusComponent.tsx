import React from 'react'
import './StatusComponent.css'

interface StatusComponentProps {
  status: string;
}

function StatusComponent({ status } : StatusComponentProps) {

  return (
    <div className={`status-component ${status.toLowerCase()}`}>
      {status}
    </div>
  )
}

export default StatusComponent