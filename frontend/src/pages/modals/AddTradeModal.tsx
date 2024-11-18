import React, { useState, useEffect } from 'react';
import '../modals/AddTradeModal.css'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useTradesContext } from '../../hooks/useTradesContext';

interface AddTradeModalProps {
  closeModal: () => void;
}

function AddTradeModal({ closeModal }: AddTradeModalProps) {
  const { dispatch } = useTradesContext();
  const [category, setCategory] = useState<string>('');
  const [currencyPair, setCurrencyPair] = useState<string>('');
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [closingPrice, setClosingPrice] = useState<number>(0);
  const [entryTime, setEntryTime] = useState<string>(''); 
  const [closingTime, setClosingTime] = useState<string>('');
  const [units, setUnits] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const { portId } = useParams()
  const majorCurrencyPairs: string[] = ["EUR/USD", "USD/JPY", "GBP/USD"];

  const handleCategorySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
  };

  const handleCurrencySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyPair(event.target.value);
  };

  const createTrade = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const computedProfit = parseFloat(((closingPrice - entryPrice) * units).toFixed(2));
    const computedStatus = (computedProfit > 0) ? 'Win' : 'Loss';
    

    const tradeData = {
      category,
      currencyPair,
      entryPrice,
      closingPrice,
      entryTime,
      closingTime,
      units,
      return: computedProfit,
      status: computedStatus,
      description,
      portId
    };

    console.log("Adding this trade: "+ JSON.stringify(tradeData, null, 2))

    axios.post('http://localhost:4000/trades', tradeData)
      .then(response => {
        console.log('Trade created:', response.data);
        updateBalance(computedProfit)
        dispatch({type: 'CREATE_TRADE', payload: response.data})
        closeModal()
      })
      .catch(error => {
        if (error.response) {
          console.error('Server responded with:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error:', error.message);
        }
      })
  };

  const updateBalance = async (computedReturn: number) => {
    axios.patch('http://localhost:4000/ports', {
      _id: portId,
      incrementValue: computedReturn,
    })
      .then(response => {
        console.log('Balance updated successfully:', response.data);
      })
      .catch(error => {
        // Handle error response
        console.error('Error updating balance:', error.response?.data || error.message);
      });
  };
  

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById('modal-container');
      if (modal && !modal.contains(event.target as Node)) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeModal]);

  return (
    <div className="modal-overlay">
      <div id="modal-container" className="modal-content">
        <form onSubmit={createTrade}>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" className="category" value={category} onChange={handleCategorySelect}>
              <option value="">Please select a transaction</option>
              <option value="Long">LONG</option>
              <option value="Short">SHORT</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="currencyPair">Currency Pair</label>
            <select id="currencyPair" className="pairs" value={currencyPair} onChange={handleCurrencySelect}>
              <option value="">Please select a transaction</option>
              {majorCurrencyPairs.map((pair, index) => (
                <option key={index} value={pair}>
                  {pair}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="entry-price">Entry Price</label>
            <input 
              id="entry-price"
              type="number"
              required
              value={entryPrice}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
            />
          </div>

          <div className="form-group">
            <label htmlFor="closing-price">Closing Price</label>
            <input 
              id="closing-price"
              type="number"
              required
              value={closingPrice}
              onChange={(e) => setClosingPrice(parseFloat(e.target.value))}
            />
          </div>

           <div className="form-group">
            <label htmlFor="entry-time">Entry Time</label>
            <input 
              id="entry-time"
              type="datetime-local"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="closing-time">Closing Time</label>
            <input 
              id="closing-time"
              type="datetime-local"
              value={closingTime}
              onChange={(e) => setClosingTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="units">Units</label>
            <input 
              id="units"
              type="number"
              required
              value={units}
              onChange={(e) => setUnits(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default AddTradeModal;
