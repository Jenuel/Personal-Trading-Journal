import Navbar from './components/Sidebar';
import React, { useState } from 'react';
import './App.css';
import LandingPage from './pages/landing/LandingPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './pages/Layout';
import Statistics from './pages/statistics/Statistics';
import Transactions from './pages/transactions/Transactions';


interface Trade {
  id: string;
  name: string;
}


function App() {

  const samplePorts: Trade[] = [
    { id: '1', name: 'Trade A' },
    { id: '2', name: 'Trade B' },
    { id: '3', name: 'Trade C' },
    { id: '4', name: 'Trade D' },
    { id: '5', name: 'Trade E' },
    { id: '6', name: 'Trade F' },
    { id: '7', name: 'Trade G' },
    { id: '8', name: 'Trade H' },
    { id: '9', name: 'Trade I' },
    { id: '10', name: 'Trade J' },
    { id: '11', name: 'Trade K' },
    { id: '12', name: 'Trade L' },
    { id: '13', name: 'Trade M' },
    { id: '14', name: 'Trade N' },
    { id: '15', name: 'Trade O' },
    { id: '16', name: 'Trade P' },
    { id: '17', name: 'Trade Q' },
    { id: '18', name: 'Trade R' },
    { id: '19', name: 'Trade S' },
    { id: '20', name: 'Trade T' }
];


const [data, setData] = useState(samplePorts)

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage data={data}/>
  },
  { //Statistics page
    path: "/statistics/:portId",
    element: <Layout data={data} page={<Statistics/>} />
  },
  { //Trades page
    path: "/transactions/:portId",
    element: <Layout data={data} page={<Transactions/>} />
  }
])



  return (
    <RouterProvider router={router}/>
  );


  
}

export default App;
