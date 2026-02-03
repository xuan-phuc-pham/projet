const router = require('express').Router(); // On cree un routeur express

const userRouter = require('./users'); // Import des routes users
const indexRouter = require('./index'); // Import des routes index
const authRoute = require('./authRoute');


router.use('/users', userRouter);
router.use('/auth', authRoute);
router.use('/', indexRouter);


module.exports = router;