const express = require('express');
const cors = require('cors');

// Routes
const productRoutes = require('./modules/product/product.routes.js');
const authRoutes = require('./modules/auth/auth.routes.js');
const userRoutes = require("./modules/user/user.routes.js");
const adminRoutes = require("./modules/admin/admin.route.js");
const errorMiddleware = require("./middleware/error.middleware.js");


const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));


app.use(express.json());

app.get('/', (req, res) => {
    res.send('Authentication System API chal rahi hai!');
});


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);


module.exports = app;
