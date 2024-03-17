require('dotenv').config()
const express = require('express');
const tradeRoutes = require('./routes/tradeRoute')

const app = express()


app.use('/trades', tradeRoutes)
 
app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT)
})