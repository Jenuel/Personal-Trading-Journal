import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'
import routes from "./routes/index.js";
import { checkSupabaseConnection } from "./config/healthCheck.js";

dotenv.config();

const app = express()

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,PATCH,POST,PUT,DELETE',
}));

app.use(express.json());
app.use(routes)

try {
    await checkSupabaseConnection();
    console.log("Supabase connection successful")
    app.listen(process.env.PORT, () => {
        console.log("Listening on port", process.env.PORT || 3000)
    })
} catch (error) {
    console.error("Error in server.js", error)
    process.exit(1);
}