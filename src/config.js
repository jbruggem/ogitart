var path = require('path');

module.exports = {
    port: 8547,
    dataFolder: path.join( __dirname,'..', './data'),
    cors: process.env.NODE_ENV !== 'production',
};
