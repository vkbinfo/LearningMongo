const expect = require('expect');
const request = require('supertest'); // a library for testing express app
const {
    ObjectId
} = require('mongodb');

const {
    app
} = require('../server');
const {
    USER
} = require('../models/user');
const {
    TODO
} = require('../models/todo');

const {
    todos,
    users,
    populateUsers,
    populateTodos
} = require('./seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('Testing on api of User create, login and logout', () => {

    describe('POST /user/new', () => {
        const newUser = {
                "email": "test123@gmail.com",
                "password": "testPassword"
            }

        it('should insert a new record in the User Collection', (done) => {
            request(app)
                .post('/user/new')
                .send(newUser)
                .expect(200)
                .expect((response) => {
                    expect(response.headers['x-auth']).toBeTruthy();
                    expect(response.body.email).toBe(newUser.email)
                })
                .end((error, result) => {
                    if (error) {
                        return done(error);
                    }
                    USER.find({
                        email: newUser.email
                    }).then((doc) => {
                        expect(doc[0].email).toBe(newUser.email);
                        done();
                    })
                })
        })

        it('should handle user creation if we send no email in the body ', (done) => {
            request(app)
                .post('/user/new')
                .send({"newUser": 'password', "password": 'password'})
                .expect(400)
                .end(done);
        })

        it('should handle user creation if the email is already in use ', (done) => {
            request(app)
                .post('/user/new')
                .send({"email": users[0].email, "password": "nothigtoremember" })
                .expect(400)
                .end(done);
        })
    })

    describe('GET /user/me', () => {
        it('Should return a user if user is authenticated', (done) => {
            request(app)
                .get('/user/me')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body.email).toBe(users[0].email);
                })
                .end(done);
        })

        it('Should return 401 if user is not authorized', (done) => {
            request(app)
                .get('/user/me')
                .expect(401)
                .end(done);

        })
    })

    describe('POST /user/login', () => {
        it('Should respond with a auth token when the request is send with right credentials', (done) => {
            request(app)
                .post('/user/login')
                .send({
                    "email": users[1].email,
                    "password": users[1].password
                })
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                })
                .end(done);
        })

        it('Should return 400 if request for login is not valid', (done) => {
            request(app)
                .post('/user/login')
                .send({
                    email: users[0].email,
                    password: users[0].password + '35'
                })
                .expect(400)
                .end(done);

        })
    })
})

describe('POST /todo/new', () => {

    it('should insert a new record in the todo collection', (done) => {
        const newTodo = {
            text: 'I am here to do something.'
        }
        request(app)
            .post('/todo/new')
            .send(newTodo)
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(newTodo.text);
                expect(response.body.completedAt).toBe(null);
                expect(response.body.completed).toBe(false);
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                TODO.find({
                    text: newTodo.text
                }).then((doc) => {
                    expect(doc[0].text).toBe(newTodo.text);
                    expect(doc[0].completedAt).toBe(null);
                    expect(doc[0].completed).toBe(false);
                    done();
                })
            })
    })
})

// test for getting all the todos from the database
describe('GET /todos', () => {

    it('should get all the todos in the response body', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(2);
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })
})

// test for getting one todo from the database
describe('GET /todo/:id', () => {

    it('should handle wrong/invalid id and return some message about wrong id message', (done) => {
        const randomObjectIdString = new ObjectId().toHexString();
        request(app)
            .get(`/todo/${randomObjectIdString}` + '1234')
            .expect(400)
            .expect((response) => {
                expect(response.body.Error).toBe('Id is not valid');
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should response with not found document message with a id which does not exist in the database', (done) => {
        const randomObjectIdString = new ObjectId().toHexString();
        request(app)
            .get('/todo/' + randomObjectIdString)
            .expect(404)
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should get the one specific todo according to url', (done) => {
        request(app)
            .get('/todo/' + todos[0]._id.toHexString())
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(todos[0].text);
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })
})

// test for updating/patch one todo from the database
describe('Patch /todo/:id', () => {
    beforeEach((done) => {
        TODO.findByIdAndDelete(todos[0]._id).then((res) => {
            const newTodo = new TODO(todos[0])
            newTodo.save().then((result) => {
                done();
            }).catch((error) => {
                console.error('Something failing while inserting with error:', error);
                done();
            })
        }, (err) => {
            done(err)
        })
    })

    it('should handle wrong/invalid id and return some message about wrong id message', (done) => {
        const randomObjectIdString = new ObjectId().toHexString();
        request(app)
            .delete(`/todo/${randomObjectIdString}` + '1234')
            .expect(400)
            .expect((response) => {
                expect(response.body.Error).toBe('Id is not valid');
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should response with not found document message with a id which does not exist in the database', (done) => {
        const randomObjectIdString = new ObjectId().toHexString();
        request(app)
            .delete('/todo/' + randomObjectIdString)
            .expect(404)
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should update the one specific todo when completed is true in body', (done) => {
        const newUpdatedTodoData = {
            text: 'Document after update/patch',
            completed: true
        }
        request(app)
            .patch('/todo/' + todos[0]._id)
            .send(newUpdatedTodoData)
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(newUpdatedTodoData.text);
                expect(response.body.completed).toBeTruthy();
                expect(response.body.completedAt).toBeTruthy();
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should clear out the completedAt of the one specific todo when completed is false in body', (done) => {
        const newUpdatedTodoData = {
            text: 'Document after update/patch',
            completed: false
        }
        request(app)
            .patch('/todo/' + todos[0]._id)
            .send(newUpdatedTodoData)
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(newUpdatedTodoData.text);
                expect(response.body.completed).toBeFalsy();
                expect(response.body.completedAt).toBeFalsy();
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })
})

// test for deleting one todo from the database
describe('Delete /todo/:id', () => {
    beforeEach((done) => {
        TODO.findByIdAndDelete(todos[0]._id).then((res) => {
            const newTodo = new TODO(todos[0])
            newTodo.save().then((result) => {
                done();
            }).catch((error) => {
                console.error('Something failing while inserting with error:', error);
                done();
            })
        }, (err) => {
            done(err)
        })
    })

    it('should handle wrong/invalid id and return some message about wrong id message', (done) => {
        const randomObjectIdString = new ObjectId().toHexString();
        request(app)
            .delete(`/todo/${randomObjectIdString}` + '1234')
            .expect(400)
            .expect((response) => {
                expect(response.body.Error).toBe('Id is not valid');
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should response with not found document message with a id which does not exist in the database', (done) => {
        const randomObjectIdString = new ObjectId().toHexString();
        request(app)
            .delete('/todo/' + randomObjectIdString)
            .expect(404)
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                done();
            })
    })

    it('should delete the one specific todo according to url', (done) => {
        request(app)
            .delete('/todo/' + todos[0]._id)
            .expect(200)
            .expect((response) => {
                expect(response.body.result).toBe('Successfully Deleted');
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                TODO.findById(todos[0]._id.toHexString()).then((todo) => {
                    expect(todo).toBeFalsy()
                    done();
                }).catch((error) => done(error))
            })
    })
})