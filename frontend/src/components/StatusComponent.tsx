import React from 'react'

interface StatusComponentProps {
    status: string;
  }

function StatusComponent({ status } : StatusComponentProps) {
  return (
    <div>
        {status}
    </div>
  )
}

export default StatusComponent