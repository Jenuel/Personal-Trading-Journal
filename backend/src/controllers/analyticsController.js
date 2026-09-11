import { createHash } from 'node:crypto';
import { AnalyticsService, ANALYTICS_SCHEMA_VERSION } from "../services/analyticsService.js";
import { analyticsToApi, analyticsSummariesToApi } from "../mappers/analytics.js";

function buildEtag(...parts) {
    const digest = createHash('sha1')
        .update([ANALYTICS_SCHEMA_VERSION, ...parts].join(':'))
        .digest('base64url');

    return `"v${ANALYTICS_SCHEMA_VERSION}.${digest}"`;
}

// If-None-Match uses weak comparison, so W/"…" against our strong tag is still
// a hit. The header may also carry a list, or "*".
function etagMatches(ifNoneMatch, etag) {
    if (!ifNoneMatch) {
        return false;
    }

    const bare = (tag) => tag.trim().replace(/^W\//, '');

    return ifNoneMatch
        .split(',')
        .some(tag => tag.trim() === '*' || bare(tag) === bare(etag));
}

// no-cache means store but always revalidate: max-age would let the dashboard
// render a P&L the user just changed.
function setValidators(response, etag) {
    response.set('Cache-Control', 'private, no-cache');
    response.set('Vary', 'Authorization');
    response.set('ETag', etag);
}

export const AnalyticsController = {
    getAnalytics: async (request, response) => {
        const { id } = request.params;

        try {
            // Cheap read first: revalidation must not pay for every trade.
            const version = await AnalyticsService.getVersion(id);

            if (version === null) {
                return response.status(404).json({ message: 'Portfolio not found' });
            }

            const etag = buildEtag(id, version);
            setValidators(response, etag);

            if (etagMatches(request.headers?.['if-none-match'], etag)) {
                return response.status(304).end();
            }

            const result = await AnalyticsService.getAnalytics(id);

            if (!result) {
                return response.status(404).json({ message: 'Portfolio not found' });
            }

            // A write can land between the two reads; describe this body, not
            // the one the first read implied.
            if (result.version !== version) {
                response.set('ETag', buildEtag(id, result.version));
            }

            return response.status(200).json(analyticsToApi(result.analytics));
        } catch (error) {
            return response.status(500).json({ message: 'Error computing analytics', error: error.message });
        }
    },

    getSummaries: async (request, response) => {
        const portfolioIds = request.query?.portfolioIds
            ?.split(',')
            .map(id => id.trim())
            .filter(Boolean);

        try {
            const summaries = await AnalyticsService.listSummaries(portfolioIds);

            const etag = buildEtag(
                'summaries',
                summaries.map(row => `${row.portfolio_id}@${row.version}`).join(',')
            );
            setValidators(response, etag);

            if (etagMatches(request.headers?.['if-none-match'], etag)) {
                return response.status(304).end();
            }

            return response.status(200).json(analyticsSummariesToApi(summaries));
        } catch (error) {
            return response.status(500).json({ message: 'Error computing analytics', error: error.message });
        }
    },
};
