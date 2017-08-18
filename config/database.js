const url = process.env.MONGOLAB_URI;

module.exports = {
    database: url,
    secret: 'your secret'
};
