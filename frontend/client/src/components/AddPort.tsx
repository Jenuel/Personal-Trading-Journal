import React, { useState } from 'react'
import { IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AddPortModal from '../pages/AddPortModal'

interface AddPortPopupProps {
  onClick?: () => void; // Optional prop for click handler
}

const AddPortPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  }

  const handleClose = () => {
    setIsOpen(false);
  }
  return (
    <>
      <IconButton onClick={handleOpen} color="primary" aria-label="add port">
        <AddIcon />
      </IconButton>

      {isOpen && <AddPortModal closeModal={handleClose} />}
    </>
  )
}

export default AddPortPopup;
