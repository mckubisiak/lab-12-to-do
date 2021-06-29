require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    test('create todo', async() => {
      const expectation = [
        {
          'id': 4,
          'todo': 'eat snakes on a plaen',
          'complete': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'todo': 'routes run with authorization',
          'complete': false,
          'owner_id': 2
        }
      ];
      for (let todo of expectation) {
        await fakeRequest(app)
          .post('/api/todolist')
          .send(todo)
          .set('Authorization', token)
          .expect('Content-Type', /json/)
          .expect(200);
      }
      const data = await fakeRequest(app)
        .get('/api/todolist')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });



    test('complete todo', async() => {
      const expectation = [
        {
          'id': 4,
          'todo': 'eat snakes on a plaen',
          'complete': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'todo': 'routes run with authorization',
          'complete': true,
          'owner_id': 2
        }
      ];
      await fakeRequest(app)
        .put('/api/todolist/5')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      const data = await fakeRequest(app)
        .get('/api/todolist')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });



    test('complete todo', async() => {
      const expectation = [
        {
          'id': 4,
          'todo': 'eat snakes on a plaen',
          'complete': false,
          'owner_id': 2
        },
        {
          'id': 5,
          'todo': 'routes run with authorization',
          'complete': true,
          'owner_id': 2
        }
      ];
      const data = await fakeRequest(app)
        .get('/api/todolist')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      expect(data.body).toEqual(expectation);
    });

  });
});
