module.exports = {
    port: Number(process.env.PORT || 7000),
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME
    }
};
