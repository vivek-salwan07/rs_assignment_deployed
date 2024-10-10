import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Statistics({month}) {
    const [totalSaleAmount, setTotalSaleAmount] = useState(Number)
    const [totalSoldItem, setTotalSoldItem] = useState(Number)
    const [totalNotSoldItem, setTotalNotSoldItem] = useState(Number)

    useEffect(() => {


        axios.get('http://localhost:3001/get-statistics', {
            params: {
                month: month
            }
        })
            .then(resp => {
                setTotalSaleAmount(resp.data.totalSaleAmount)
                setTotalSoldItem(resp.data.totalSoldItems)
                setTotalNotSoldItem(resp.data.totalNotSoldItems)
            })
            .catch(err => console.log(err))



    }, [month])
    return (
        <div className="statistics">
            <span>Month : {month} </span> <br />

            <p>Total sale amount: <b> {totalSaleAmount}₹ </b> </p>
            <p>Total sold item: <b>{totalSoldItem} </b> </p>
            <p>Total not sold item: <b>{totalNotSoldItem}</b> </p>

        </div>
    )
}

export default Statistics
