const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const ProductModel = require('./models/product');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))


mongoose.connect('mongodb+srv://viveksalwan63:utz4BOsIaNPWuDNt@e-commerce.6nl3f.mongodb.net/?retryWrites=true&w=majority&appName=roxilersystems')

  .then(resp => console.log('database connected'))
  .catch(err => console.log(err))


// api to fetch data from api and store in mongodb
app.get('/get-products', async (req, res) => {

  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const products = response.data;

    // console.log('products fetched',)

    await ProductModel.deleteMany({});

    await ProductModel.insertMany(products)

    res.status(200).send('Database initialized with seed data.');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to initialize database.');
  }

})


// api for searching and pagination
app.get('/get-transactions', async (req, res) => {
  try {
    const { search = '', page = 1, perPage = 10, } = req.query;
    console.log('transactions data', search, page, perPage,)

    const query = {};
    if (search) {
      // Creating a regex pattern for search
      const searchRegex = new RegExp(search, 'i');

      const searchNumber = parseFloat(search);

      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];

      if (!isNaN(searchNumber)) {
        query.$or.push({ price: searchNumber });
      }
    }

    // Calculing pagination values
    const limit = parseInt(perPage, 10) || 10;
    const skip = (parseInt(page, 10) - 1) * limit;

    const products = await ProductModel.find(query)
      .skip(skip)
      .limit(limit);

    const totalProducts = await ProductModel.countDocuments(query);

    res.status(200).json({
      products,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions.' });
  }
});



// api to get transactions of selected month
app.get('/get-transactions-based-on-month', async (req, res) => {

  try {
    const { month } = req.query;
    // console.log('month based', month)

    const allProducts = ProductModel.find();

    const filteredProducts = (await allProducts).filter(products => products.dateOfSale.getMonth() + 1 == month)

    // console.log('month based products', filteredProducts)
    res.status(200).json({
      filteredProducts
    });

  } catch (error) {
    console.error('Error fetching month based transactions:', error);
    res.status(500).json({ message: 'Failed to fetch month based transactions.' });
  }
})

// statistics


// api to get all statistics
app.get('/get-statistics', async (req, res) => {
  try {
    const { month } = req.query;
    // console.log('monthhh', month)
    const transactions = await ProductModel.find();

    let filteredTransactions;

    if (month == 'All') {
      filteredTransactions = transactions
    } else {
      filteredTransactions = transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
        // console.log('month is ', month)
        return transactionMonth == month;
      });

    }
    // console.log('filtered products', filteredTransactions)
    const totalSaleAmount = filteredTransactions
      .filter(transaction => transaction.sold == true)
      .reduce((acc, transaction) => acc + transaction.price, 0);

    // console.log('total sale amount', totalSaleAmount)

    const totalSoldItems = filteredTransactions.filter(transaction => transaction.sold).length;

    const totalNotSoldItems = filteredTransactions.filter(transaction => !transaction.sold).length;

    res.status(200).json({
      totalSaleAmount,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'An error occurred while fetching statistics' });
  }
});



//   bar chart api
app.get('/get-price-range', async (req, res) => {

  try {
    const { month } = req.query;

    const transactions = await ProductModel.find();

    let filteredTransactions;
    if (month == 'All') {
      filteredTransactions = transactions
    } else {

      filteredTransactions = transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
        return transactionMonth == month;
      });

    }


    const priceRanges = {
      '0-100': 0,
      '101-200': 0,
      '201-300': 0,
      '301-400': 0,
      '401-500': 0,
      '501-600': 0,
      '601-700': 0,
      '701-800': 0,
      '801-900': 0,
      '901+': 0
    };

    filteredTransactions.forEach(transaction => {
      if (transaction.price >= 0 && transaction.price <= 100) {
        priceRanges['0-100']++;
      } else if (transaction.price >= 101 && transaction.price <= 200) {
        priceRanges['101-200']++;
      } else if (transaction.price >= 201 && transaction.price <= 300) {
        priceRanges['201-300']++;
      } else if (transaction.price >= 301 && transaction.price <= 400) {
        priceRanges['301-400']++;
      } else if (transaction.price >= 401 && transaction.price <= 500) {
        priceRanges['401-500']++;
      } else if (transaction.price >= 501 && transaction.price <= 600) {
        priceRanges['501-600']++;
      } else if (transaction.price >= 601 && transaction.price <= 700) {
        priceRanges['601-700']++;
      } else if (transaction.price >= 701 && transaction.price <= 800) {
        priceRanges['701-800']++;
      } else if (transaction.price >= 801 && transaction.price <= 900) {
        priceRanges['801-900']
      } else if (transaction.price > 900) {
        priceRanges['901+']++;
      }
    });


    res.json({
      month,
      priceRanges
    });


  } catch (error) {
    console.error('Error fetching price range:', error);
    res.status(500).json({ error: 'An error occurred while fetching price range' });
  }
})

// author should be authorvs and name should be viveksalwan(for code copyrights)
app.get('/get-name', (req, res) => {
  res.json({massage:'authorvs', name:'Vivek Salwan'})
})

//pie chart api
app.get('/get-category', async (req, res) => {
  try {
    const { month } = req.query;

    const transactions = await ProductModel.find();

    let filteredTransactions;

    if (month == 'All') {
      filteredTransactions = transactions
    } else {
      filteredTransactions = transactions.filter(transaction => {
        const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1;
        return transactionMonth == month;
      });
    }

    const categoryCounts = {};

    filteredTransactions.forEach(transaction => {
      const category = transaction.category;

      if (categoryCounts[category]) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
    });

    const responseData = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category]
    }));

    // console.log('category data', responseData)
    // Send the response containing the categories and their counts
    res.status(200).json({
      message: 'Category data fetched successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching category data:', error);
    res.status(500).json({ message: 'An error occurred', error });
  }
});



// combined response
app.get('/get-combined-data', async (req, res) => {
  try {
    const { month } = req.query;

    const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
      axios.get('http://localhost:3001/get-statistics', { params: { month } }),
      axios.get('http://localhost:3001/get-price-range', { params: { month } }),
      axios.get('http://localhost:3001/get-category', { params: { month } })
    ]);

    const statisticsData = statisticsResponse.data;
    const barChartData = barChartResponse.data;
    const pieChartData = pieChartResponse.data;

    const combinedData = {
      statistics: statisticsData,
      barChart: barChartData,
      pieChart: pieChartData
    };

    // console.log('combined data', combinedData)

    res.status(200).json({
      message: 'Combined data fetched successfully',
      data: combinedData
    });

  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({
      message: 'Failed to fetch combined data',
      error: error.message
    });
  }
});







app.get('/', (req, res) => {
  res.send('hello from backend')
})


app.listen(3001, () => {
  console.log('viveks server is running')
})
