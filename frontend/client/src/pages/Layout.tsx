import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

interface Trade {
    id: string
    name: string
}

interface LayoutProps {
    data: Trade[]
}

function Layout({data,}: LayoutProps) {
    const params = useParams()
    const portId = params.portId

    const [portName, setPortName] = useState<string | null>(null);

    useEffect(() => {
        const portfolio = data.find(data => data.id === portId )
        if (portfolio) {
            setPortName(portfolio.name)
        }
    }, [portId, data])



  return (
    <div className='main-container'>
        <div className="sidebar">
            <Navbar chosenPort={portName}/>
        </div>
    </div>
  )
}

export default Layout