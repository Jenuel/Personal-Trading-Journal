import { supabase } from "./client";

export async function healthCheck() {
    const { error } = await supabase.from('_health').select('1').limit(1)

    if (error) {
        throw new Error(`Failed to connect to Supabase: ${error.message}`)
    }

    return true;
}