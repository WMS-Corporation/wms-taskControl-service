const express = require('express');
const {verifyToken} = require("./authMiddleware");
const {assignTask, getMyTasks, getAll} = require("../services/taskServices");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World');
})
router.post('/assignment', verifyToken, assignTask)
router.get('/myTasks', verifyToken, getMyTasks)
router.get('/all', verifyToken, getAll)

module.exports = router