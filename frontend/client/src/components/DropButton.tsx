import { useState }from 'react'

interface Trade {
    id: string
    name: string
}
type PortPickerProps = {
    options: Trade[]
    onSelect: (option: Trade) => void;
}

function DropButton({}) {

  
  return (
    <div className='port-picker'>

    </div>
  )
}

export default DropButton