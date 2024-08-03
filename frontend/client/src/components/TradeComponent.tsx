import React, { useState } from 'react';
import { Trade } from '../interfaces/interfaces';

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
      <td>{data.entryTime.toLocaleString()}</td>
      <td>{data.closingTime.toLocaleString()}</td>
      <td>{data.units}</td>
      <td>{data.return}</td>
      <td>{data.status}</td>
      <td><button onClick={handleDeleteClick}>Delete</button></td>
    </tr>
  );
}

export default TradeComponent;
