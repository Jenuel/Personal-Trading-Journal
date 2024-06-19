import React from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddPortPopupProps {
  onClick?: () => void; // Optional prop for click handler
}

const AddPortPopup: React.FC<AddPortPopupProps> = ({ onClick }) => {
  return (
    <IconButton onClick={onClick} color="primary" aria-label="add port">
      <AddIcon />
    </IconButton>
  );
};

export default AddPortPopup;
