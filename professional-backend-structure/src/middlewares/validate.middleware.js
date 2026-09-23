import { ApiError } from '../utils/ApiError.js';

/**
 * Express middleware that validates incoming request data (body, query, params)
 * against a Zod schema at the API boundary.
 *
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        });

        // Attach parsed & sanitized payload
        req.validated = parsed;
        next();
    } catch (err) {
        const issues = err.issues || err.errors;
        if (issues && Array.isArray(issues)) {
            const formattedErrors = issues.map(e => ({
                field: e.path.join('.').replace(/^(body|query|params)\./, ''),
                message: e.message
            }));
            const errorSummary = formattedErrors.map(e => `${e.field}: ${e.message}`).join('; ');
            return res.status(400).json({
                statusCode: 400,
                data: null,
                message: `Validation Error: ${errorSummary}`,
                success: false,
                errors: formattedErrors
            });
        }
        next(err);
    }
};
