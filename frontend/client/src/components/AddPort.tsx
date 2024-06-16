import React from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function AddPortPopup() {
  return (
    <IconButton color="primary" aria-label="add port">
      <AddIcon />
    </IconButton>
  );
}

export default AddPortPopup;
