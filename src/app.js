// src/app.js
const authRoutes = require("./modules/auth/auth.routes.js")

const express = require('express');
const app = express();


app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Authentication System API chal rahi hai! 🚀');
});

app.use("/api/auth", authRoutes)



module.exports = app;