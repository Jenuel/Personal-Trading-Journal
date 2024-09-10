import dotenv from 'dotenv';
import express from 'express';
import tradeRoutes from './routes/tradeRoute.js';
import portRoutes from './routes/portRoute.js';
import mongoose from 'mongoose';
import cors from 'cors'

dotenv.config();
//application
const app = express()

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: 'GET,POST,PUT,DELETE', 
  }));
//routers
app.use(express.json()); 
app.use(portRoutes)
app.use(tradeRoutes)


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

 /* ANOTHER SOLUTION OF SPECIFYING THE DATABASE INSTEAD OF 
    REFACTORING THE MONGO CLUSTER URI
 try {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'ecomm' // specify the database name here
    });
    console.log('Connected to MongoDB');
} catch (error) {
    console.error('Database connection error:', error);
}
 */
