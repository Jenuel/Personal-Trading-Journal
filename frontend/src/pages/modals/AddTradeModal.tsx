import React, { useState, useEffect } from 'react';
import '../modals/AddTradeModal.css'

interface AddTradeModalProps {
  closeModal: () => void;
}

function AddTradeModal({ closeModal }: AddTradeModalProps) {
  const [category, setCategory] = useState<string>('');
  const [currencyPair, setCurrencyPair] = useState<string>('');
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [closingPrice, setClosingPrice] = useState<number>(0);
  const [entryTime, setEntryTime] = useState<string>(''); 
  const [closingTime, setClosingTime] = useState<string>('');
  const [units, setUnits] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);
  const [status, setStatus] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const majorCurrencyPairs: string[] = ["EUR/USD", "USD/JPY", "GBP/USD"];

  const handleCategorySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
  };

  const handleCurrencySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrencyPair(event.target.value);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const computedProfit = (closingPrice - entryPrice) * units;

    const computedStatus = computedProfit > 0 ? 'Win' : 'Loss';

    setProfit(computedProfit);
    setStatus(computedStatus);

    closeModal();
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
        <form onSubmit={handleFormSubmit}>
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
