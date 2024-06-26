const express = require('express');
const {verifyToken} = require("./authMiddleware");
const {assignTask, getAll, getTaskByCode, updateTaskByCode} = require("../services/taskServices");
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).send('OK');
})
router.post('/assignment', verifyToken, assignTask)
router.get('/all', verifyToken, getAll)
router.get('/:codTask', verifyToken, getTaskByCode)
router.put('/:codTask', verifyToken, updateTaskByCode)

module.exports = router