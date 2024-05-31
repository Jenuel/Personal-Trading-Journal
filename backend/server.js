import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import tradeRoutes from './routes/tradeRoute.js';
import mongoose from 'mongoose';


//application
const app = express()

//routers
app.use('/trades', tradeRoutes)


//connection to database
mongoose.connect(process.env.DB_URI)
 .then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Listening on port", process.env.PORT || 3000)
    })
 })
 .catch((error) => {
    console.log(error)
 })


 
