import React from 'react'
import '../statistics/Statistics.css'
import AddTrade from '../../components/AddTrade'

function Statistics() {
  return (
    <div className='statistics-container'>
      <div className="table-container">
        <div className="contents">
          <div className="filter">
            <AddTrade />
          </div>
          <div className="header-container">
            <tr>
              <th>Testing</th>
              <th>Testing</th>
              <th>Testing</th>
              <th>Testing</th>
              <th>Testing</th>
            </tr>
          </div>
          <div className="trades-container">
          <tr>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
          </tr>
          <tr>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
          </tr>
          <tr>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
          </tr>
          <tr>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
            <td>Testing</td>
          </tr>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics