import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'

interface Trade {
    id: string
    name: string
}

interface LayoutProps {
    data: Trade[]
    page: React.ReactNode
}

function Layout({data, page}: LayoutProps) {
    const params = useParams()
    const portId = params.portId

    const [portName, setPortName] = useState('');

    useEffect(() => {
        const portfolio = data.find(data => data.id === portId )
        if (portfolio) {
            setPortName(portfolio.name)
        }
    }, [portId, data])



  return (
    <div className='main-container'>
        <div className="sidebar">
            <Navbar chosenPort={portName} portfolios={data}/>
        </div>
        <div className="page">
            {page}
        </div>
    </div>
  )
}

export default Layout