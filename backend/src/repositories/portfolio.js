import { supabase } from "../config/client.js";

const TABLE_NAME = "portfolios"

// The frontend renders each account together with its trades and cash
// transactions, so both are embedded rather than fetched separately.
const SELECT_WITH_RELATIONS = '*, trades(*), cash_transactions(*)';

export const PortfolioRepository = {
    getAllPortfolios: async () => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(SELECT_WITH_RELATIONS)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data;
    },


    getPortfolioById: async (id) => {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select(SELECT_WITH_RELATIONS)
            .eq('id', id)
            .maybeSingle();

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
