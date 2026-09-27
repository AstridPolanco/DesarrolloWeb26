export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export function manejadorErrores(err, req, res, next) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Error interno' });
}