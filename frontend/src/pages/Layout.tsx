import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import './Layout.css'
import { Portfolio } from '../interfaces/interfaces'

interface LayoutProps {
    data: Portfolio[]
    page: React.ReactNode
}

function Layout({ data, page }: LayoutProps) {
    const params = useParams()
    const portId = params.portId

    const [portfolio, setPortfolio] = useState<Portfolio | undefined>();

    useEffect(() => {
        console.log("Testing")
        const portfolio = data.find(data => data._id === portId )
        if (portfolio) {
            setPortfolio(portfolio)
        }
    }, [portId, data])


    if (!portfolio) {
        return <div>Loading...</div>; 
    }

    return (
        <div className='main-container'>
            <div className="sidebar-container">
                <Sidebar chosenPort={portfolio} portfolios={data} id={portId || ''}/>
            </div>
            <div className="page">
                {page}
            </div>
        </div>
    )
}

export default Layout
