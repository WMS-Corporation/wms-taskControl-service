const {app} = require("../index");
const request = require("supertest");//simula le richieste HTTP al tuo server Express e verifica le risposte

describe('Index Testing', () => {
    it('Should respond with status 200 for the main route', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });
});