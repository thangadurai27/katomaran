/** FRONTEND_URL (docs) or CLIENT_URL (Render) + local dev */
const getCorsOrigins = () => {
    const origins = new Set([
        'http://localhost:5173',
        'http://localhost:3000',
    ]);

    for (const key of ['FRONTEND_URL', 'CLIENT_URL']) {
        const value = process.env[key];
        if (value) origins.add(value.replace(/\/$/, ''));
    }

    return [...origins];
};

module.exports = { getCorsOrigins };
