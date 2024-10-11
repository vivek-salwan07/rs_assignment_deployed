import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

function PriceRangeChart({month}) {
    const [priceRange, setPriceRange] = useState([])


    useEffect(() => {

        axios.get('https://rs-assignment-deployed.onrender.com/get-price-range', { params: { month: month } })
            .then(resp => {

                const priceRanges = resp.data.priceRanges;

                const formattedData = Object.keys(priceRanges).map(range => ({
                    name: range,
                    transactions: priceRanges[range] // Use this for the number of transactions in that range
                }));

                setPriceRange(formattedData);
            })
            .catch(err => console.log(err))

    }, [month])


    return (
        <BarChart
            width={900}
            height={500}
            data={priceRange}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="transactions" fill="#06ABE2" />
        </BarChart>
    )
}

export default PriceRangeChart
