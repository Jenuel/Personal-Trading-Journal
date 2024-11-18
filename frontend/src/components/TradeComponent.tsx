import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { Trade } from '../interfaces/interfaces';
import StatusComponent from './StatusComponent';

interface TradeProps {
  data: Trade
  onClick: () => void
  onDelete: () => void 
}

function TradeComponent({ data, onClick, onDelete }: TradeProps) {

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();
    onDelete();
  };

  return (
    <tr onClick={onClick} style={{ cursor: 'pointer' }}>
      <td>{data.category}</td>
      <td>{data.currencyPair}</td>
      <td>{data.entryPrice}</td>
      <td>{data.closingPrice}</td>
      <td>{data.entryTime}</td>
      <td>{data.closingTime}</td>
      <td>{data.units}</td>
      <td>{data.return}</td>
      <td><StatusComponent status={data.status}/></td>
      <td>
        <IconButton onClick={handleDeleteClick} aria-label='delete'>
          <DeleteIcon/>
        </IconButton>
      </td>
    </tr>
  );
}

export default TradeComponent;
