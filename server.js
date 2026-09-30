// server.js
require('dotenv').config();
const{sql, poolPromise} = require("./src/config/db.js")
const app = require('./src/app.js');

const PORT = process.env.PORT || 4200;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
