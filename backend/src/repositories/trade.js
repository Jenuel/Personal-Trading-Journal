import { supabase } from "../config/client";

const TABLE_NAME = "trades"

export const TradeRepository = {
    getAllTrades: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    },

    getTradeById: async (id) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }

        return data;
    },

    getTradesByPortfolioId: async (portfolio_id) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('portfolio_id', portfolio_id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    },

    createTrade: async (trade) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert([trade])
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    },

    updateTrade: async (id, updates) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updates)
            .eq('id', id)
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    },

    deleteTrade: async (id) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .delete()
            .eq('id', id)
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    }
}