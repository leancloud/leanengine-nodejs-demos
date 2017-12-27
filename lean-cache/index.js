var router = require('express').Router();

router.use('/associated-data', require('./associated-data'))
router.use('/leaderboard', require('./leaderboard'))
router.use('/task-queue', require('./task-queue'))
router.use('/redlock', require('./redlock'))
router.use('/readonly', require('./readonly'))
router.use('/captcha', require('./captcha'))

module.exports = router;
