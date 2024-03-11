const express = require('express');
const {verifyToken} = require("./authMiddleware");
const {assignTask} = require("../services/taskServices");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World');
})
router.post('/assignment', verifyToken, assignTask)

module.exports = router