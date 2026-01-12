const router = require('express').Router(); // On cree un routeur express

const userRouter = require('./users'); // Import des routes users

router.use('/users', userRouter);

module.exports = router; // Export du routeur object