import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';


function CategoryChart({ month }) {
    const [categoryData, setCategoryData] = useState([])

    // Define colors for the pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4567'];
    useEffect(() => {

        axios.get('https://rs-assignment-deployed.onrender.com/get-category', { params: { month: month } })
            .then(resp => {
                // console.log('categorydata', resp.data)
                setCategoryData(resp.data.data)
            })
            .catch(err => console.log(err))
    }, [month])

    return (
        <PieChart width={400} height={400}>
            <Pie
                data={categoryData}
                dataKey="count" // This is the key that represents the values (number of items)
                nameKey="category" // This is the key that represents the labels (categories)
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
            >
                {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip />
            <Legend />
        </PieChart>
    )
}

export default CategoryChart
