var router = require('express').Router();

router.use('/associated-data', require('./associated-data'));
router.use('/pubsub', require('./pubsub'));
router.use('/readonly', require('./readonly'));
router.use('/redlock', require('./redlock'));
router.use('/task-queue', require('./task-queue'));

module.exports = router;
