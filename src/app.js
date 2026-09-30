const express = require('express');
const cors = require('cors');

// Routes
const productRoutes = require('./modules/product/product.routes.js');
const authRoutes = require('./modules/auth/auth.routes.js');


const app = express();

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Authentication System API chal rahi hai!');
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


module.exports = app;
