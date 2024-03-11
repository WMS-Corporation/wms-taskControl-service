const { Task } = require('../src/entities/task');
const {createTaskFromData} = require("../src/factories/taskFactory");
const path = require("path");
const fs = require("fs");
describe('Task testing', () => {
    let task;

    beforeAll(() => {
        const jsonFilePath = path.resolve(__dirname, './Resources/MongoDB/WMS.Task.json')
        const taskData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'))
        task = createTaskFromData(taskData)
    });

    it('should return the correct codTask', () => {
        expect(task.codTask).toBe("000543");
    });

    it('should return the correct codUser', () => {
        expect(task.codOperator).toBe('000002');
    });

    it('should return the correct date', () => {
        expect(task.date).toBe('11/03/2023');
    });

    it('should return the correct type', () => {
        expect(task.type).toBe('loading');
    });

    it('should return the status state', () => {
        expect(task.status).toBe('pending');
    });

    it('should return the number of products', () => {
        expect(task.productList.length).toBe(2);
    });

    it('should set codOperator correctly', () => {
        task.codOperator = '000015';
        expect(task.codOperator).toBe('000015');
    });

    it('should set codTask correctly', () => {
        task.codTask = '000005';
        expect(task.codTask).toBe('000005');
    });

    it('should set date correctly', () => {
        task.date = '11/03/2023';
        expect(task.date).toBe('11/03/2023');
    });

    it('should set type correctly', () => {
        task.type = 'unloading';
        expect(task.type).toBe('unloading');
    });

    it('should set status correctly', () => {
        task.status = 'Completed';
        expect(task.status).toBe('Completed');
    });
});