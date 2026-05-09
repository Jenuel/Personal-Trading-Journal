import { supabase } from "./client.js";

export async function checkSupabaseConnection() {
    const { error } = await supabase
        .from('portfolios')
        .select('id')
        .limit(1)

    if (error) {
        throw new Error(`Failed to connect to Supabase: ${error.message}`)
    }

    return true;
}