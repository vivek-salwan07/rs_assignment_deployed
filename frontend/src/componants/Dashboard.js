import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/dashboard.css'
import CategoryChart from './CategoryChart';
import PriceRangeChart from './PriceRangeChart';
import Statistics from './Statistics';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [monthProducts, setMonthProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [month, setMonth] = useState('03');
  const [cand, setCand] = useState('')

  // console.log('transations', transactions);

  useEffect(() => {

    axios.get('http://localhost:3001/get-products')
      .then(resp => console.log(resp))
      .catch(err => console.log(err))


  }, [])

  // Fetch transactions whenever the search or page changes
  useEffect(() => {
    fetchTransactions();
    console.log('page no', page)
    console.log('search', search)
  }, [search, page, month]);


  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/get-transactions', {
        params: {
          search,
          page,
          perPage,
          month
        }
      });
      setTransactions(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };


  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 whenever search changes
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // comibed data

  useEffect(() => {
    axios.get('http://localhost:3001/get-transactions-based-on-month', { params: { month: month } })
      .then(resp => {
        // console.log('get-transactions-based-on-month',resp.data)
        const filteredData = resp.data.filteredProducts || [];
        setMonthProducts(filteredData)
      })
      .catch(err => console.log(err))


    axios.get('http://localhost:3001/get-combined-data', { params: { month: month } })
      .then(resp => {
        console.log('comibeddata', resp.data)

      })
      .catch(err => console.log(err))

  }, [month])

  const getCandidate = () => {
    axios.get('http://localhost:3001/get-name')
      .then(resp => {
        if(resp.data.massage == 'authorvs'){
          setCand(resp.data.name)
        }
      })
      .catch(err => console.log(err))
  }

  return (
    <div className='page'>

      <div className="dashboard">
        <p> <span> Transaction Dashboard</span></p>

        <div className="controls">

          <input
            type="text"
            placeholder="To search select All"
            value={search}
            onChange={handleSearchChange}
          />

          <p><span>Select Month </span>
            <select name="month" id="" onChange={(e) => setMonth(e.target.value)}>
            <option value="03">Mar</option>
              <option value='All'>All</option>
              <option value='01'>Jan</option>
              <option value="02">Feb</option>
              <option value="04">Apr</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">Jul</option>
              <option value="08">Aug</option>
              <option value="09">Sep</option>
              <option value="10">Oct</option>
              <option value="11">Nov</option>
              <option value="12">Dec</option>
            </select>
          </p>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
                <th>Sold</th>
                <th>Image</th>
                <th>Date of Sale</th>
              </tr>
            </thead>
            <tbody>

              {
                monthProducts && monthProducts.length > 0
                  ? monthProducts.map((product, index) => {
                    return (
                      <tr>
                        <td>{product.id}</td>
                        <td>{product.title}</td>
                        <td>{product.description} </td>
                        <td>{product.price}</td>
                        <td> {product.category} </td>
                        <td> `{product.sold == true ? 'Sold' : 'Not Sold'}` </td>
                        <td> <img src={product.image} alt="" srcset="" /> </td>
                        <td>{product.dateOfSale}</td>
                      </tr>

                    )
                  })
                  :
                  transactions && transactions.map((product, index) => {

                    return (
                      <tr>
                        <td>{product.id}</td>
                        <td>{product.title}</td>
                        <td>{product.description} </td>
                        <td>{product.price}</td>
                        <td> {product.category} </td>
                        <td> `{product.sold == true ? 'Sold' : 'Not Sold'}` </td>
                        <td> <img src={product.image} alt="" srcset="" /> </td>
                        <td>{product.dateOfSale}</td>
                      </tr>
                    )
                  })
              }

            </tbody>
          </table>

          {/* pagination */}
          <div className="page-controls">
            {
              month && month == 'All' ?
                <div className="pagination">
                  <button onClick={() => handlePageChange(page - 1)}     >   Previous </button>
                  <span>{`Page ${page} of ${totalPages}`}</span>
                  <button onClick={() => handlePageChange(page + 1)}  >  Next   </button>
                </div>
                :

                <div className="pagination">
                  <button disabled >   Previous </button>
                  <span> no more transactions for {month} month </span>
                  <button disabled >  Next   </button>
                </div>

            }
          </div>
        </div>

      </div>
      <div className="statistics-section">
        <p className='heading s'> Trasactions Statistics</p>
        <Statistics month={month} />

      </div>

      <div className="barChart">

        <p className="heading s">Transactions BarChart</p>
        <PriceRangeChart month={month} />

      </div>

      <div className="categories">

        <p className="heading s">Transactions Categories / PieChart</p>
        <div className='category-section'>

          <div className="piechart">
            <CategoryChart month={month} />
          </div>
        </div>

      </div>
      <div className="authur">
        <button onClick={getCandidate}>View Candidate name</button> <span>{cand}</span>
        
      </div>
    </div>
  )
}

export default Dashboard
