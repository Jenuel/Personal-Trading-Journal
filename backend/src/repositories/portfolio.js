import { supabase } from "../config/client.js";

const TABLE_NAME = "portfolios"

export const PortfolioRepository = {
    getAllPortfolios: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    },


    getPortfolioById: async (id) => {
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

    createPortfolio: async (portfolio) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .insert(portfolio)
            .select('*');

        if (error) {
            throw error;
        }

        return data;
    },

    updatePortfolio: async (id, updates) => {
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

    deletePortfolio: async (id) => {
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