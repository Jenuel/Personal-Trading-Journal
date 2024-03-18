require('dotenv').config()
const express = require('express');
const tradeRoutes = require('./routes/tradeRoute')
const moongose = require('moongose')

const app = express()

app.use('/trades', tradeRoutes)

mongoose.connect(process.env.DB_URI)
 .then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Listening on port", process.env.PORT)
    })
 })
 .catch((error) => {
    console.log(error)
 })


 
