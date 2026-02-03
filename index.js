const express = require('express');
const routes = require('./routes/routes');


require('dotenv').config();

const app = express();

app.use('/', routes);

app.use(/(.*)/, (req, res, next) => { 
    res.status(404).json({
        status: 'fail',
        message: 'Route not found'
    });
});

app.listen(process.env.PORT, () => {
    console.info(`Server is running on port ${process.env.PORT}`);
}
);