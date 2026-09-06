// Shared plumbing for translating between camelCase API objects and
// snake_case database rows.

function asNumber(value) {
    if (value === null || value === undefined) {
        return value;
    }
    return Number(value);
}

/**
 * Builds a { toApi, toRow } pair from a field map.
 *
 * @param fields       { apiKey: 'column_name' }
 * @param numericField  api keys whose NUMERIC column should come back as a number
 * @param readOnly      api keys the client is never allowed to write
 */
export function createMapper({ fields, numericFields = [], readOnly = [] }) {
    const numeric = new Set(numericFields);
    const protectedKeys = new Set(readOnly);

    const toApi = (row) => {
        if (!row) {
            return row;
        }

        const result = {};
        for (const [apiKey, column] of Object.entries(fields)) {
            if (row[column] === undefined) {
                continue;
            }
            result[apiKey] = numeric.has(apiKey) ? asNumber(row[column]) : row[column];
        }
        return result;
    };

    // Keys the caller did not supply are left out entirely, so a partial update
    // never writes undefined over a column it was not asked to touch.
    const toRow = (payload) => {
        if (!payload) {
            return {};
        }

        const row = {};
        for (const [apiKey, column] of Object.entries(fields)) {
            if (payload[apiKey] === undefined || protectedKeys.has(apiKey)) {
                continue;
            }
            row[column] = numeric.has(apiKey) ? asNumber(payload[apiKey]) : payload[apiKey];
        }
        return row;
    };

    return { toApi, toRow };
}
