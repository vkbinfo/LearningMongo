const expect = require('expect');
const request = require('supertest'); // a library for testing express app

const {app} = require('../server/server');
const {USER} = require('../models/users');
const {TODO} = require('../models/todo');

describe('POST /user/new', () => {
    const testEmail = 'test@gmail.com';
    beforeEach((done) => {
        USER.deleteMany({email:testEmail},(err) => {
            if (err) {
                return done(err);
            }
            done();
        })
    })

    it('should insert a new record in the User Collection', (done) => {
        request(app)
            .post('/user/new')
            .send({
                email: testEmail
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.email).toBe(testEmail)
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                USER.find({email:testEmail}).then((doc) => {
                    expect(doc[0].email).toBe(testEmail);
                    done();
                })
            })
    })
})

describe('POST /todo/new', () => {
    const testText = 'Be a better asshole person.';
    beforeEach((done) => {
        TODO.deleteMany({text:testText},(err) => {
            if (err) {
                return done(err);
            }
            done();
        })
    })

    it('should insert a new record in the todo collection', (done) => {
        request(app)
            .post('/todo/new')
            .send({
                text: testText
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(testText);
                expect(response.body.completedAt).toBe(null);
                expect(response.body.completed).toBe(false);
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                TODO.find({text:testText}).then((doc) => {
                    expect(doc[0].text).toBe(testText);
                    expect(doc[0].completedAt).toBe(null);
                    expect(doc[0].completed).toBe(false);
                    done();
                })
            })
    })
})