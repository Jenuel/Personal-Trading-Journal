import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors'
import routes from "./routes/index.js";
import { checkSupabaseConnection } from "./config/healthCheck.js";

dotenv.config();

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,PATCH,POST,PUT,DELETE',
}));

app.use(express.json());
app.use(routes)

try {
    await checkSupabaseConnection();
    console.log("Supabase connection successful")
    // 5000 is what the frontend's NEXT_PUBLIC_API_URL defaults to; 3000 belongs to Next.js.
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log("Listening on port", PORT);
    });
} catch (error) {
    console.error("Error in server.js", error)
    process.exit(1);
}