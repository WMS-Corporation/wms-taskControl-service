const express = require('express');
const {verifyToken} = require("./authMiddleware");
const {assignTask, getMyTasks, getAll, getTaskByCode, updateTaskStatus} = require("../services/taskServices");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello World');
})
router.post('/assignment', verifyToken, assignTask)
router.get('/myTasks', verifyToken, getMyTasks)
router.get('/all', verifyToken, getAll)
router.get('/:codTask', verifyToken, getTaskByCode)
router.put('/:codTask', verifyToken, updateTaskStatus)

module.exports = router