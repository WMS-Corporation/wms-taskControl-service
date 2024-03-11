const express = require('express');
const {verifyToken} = require("./authMiddleware");
const {assignTask, getMyTasks} = require("../services/taskServices");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World');
})
router.post('/assignment', verifyToken, assignTask)
router.get('/myTasks', verifyToken, getMyTasks)

module.exports = router