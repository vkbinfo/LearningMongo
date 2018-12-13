const expect = require('expect');
const request = require('supertest'); // a library for testing express app
const {
    ObjectId
} = require('mongodb');

const {
    app
} = require('../server/server');
const {
    USER
} = require('../models/users');
const {
    TODO
} = require('../models/todo');

describe('POST /user/new', () => {
    const testEmail = 'test@gmail.com';
    beforeEach((done) => {
        USER.deleteMany({
            email: testEmail
        }, (err) => {
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
                USER.find({
                    email: testEmail
                }).then((doc) => {
                    expect(doc[0].email).toBe(testEmail);
                    done();
                })
            })
    })
})

describe('POST /todo/new', () => {
    const testText = 'Be a better asshole person.';
    beforeEach((done) => {
        TODO.deleteMany({
            text: testText
        }, (err) => {
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
                TODO.find({
                    text: testText
                }).then((doc) => {
                    expect(doc[0].text).toBe(testText);
                    expect(doc[0].completedAt).toBe(null);
                    expect(doc[0].completed).toBe(false);
                    done();
                })
            })
    })
})

// test for getting all the todos from the database
describe('GET /todos', () => {
    beforeEach((done) => {
        TODO.deleteMany().then((docs) => {done()}).catch((error) => {done(error)});
    })

    it('should get all the todos in the response body', (done) => {
        const newTodos = [{
            text: 'It is something'
        }, {
            text: 'It is not something'
        }]
        TODO.insertMany(newTodos).then((docs) => {})
            .catch((error) => {
                console.log('failed insertion of records in the database for GET /todos testing', error)
                done();
            });
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

describe('POST /todo/new', () => {
    const testText = 'Be a better asshole person.';
    beforeEach((done) => {
        TODO.deleteMany({
            text: testText
        }, (err) => {
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
                TODO.find({
                    text: testText
                }).then((doc) => {
                    expect(doc[0].text).toBe(testText);
                    expect(doc[0].completedAt).toBe(null);
                    expect(doc[0].completed).toBe(false);
                    done();
                })
            })
    })
})

// test for getting one todo from the database
describe('GET /todo/:id', () => {
    const objectId = new ObjectId();
    const testText = 'This is for one doc'

    beforeEach((done) => {
        const newTodo = new TODO({
            _id: objectId,
            text: testText
        });
        TODO.findByIdAndDelete(objectId).then((res) => {
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
            .get(`/todo/${randomObjectIdString}`+ '1234' )
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
            .get('/todo/' + objectId.toHexString())
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(testText);
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
    const objectId = new ObjectId();
    const testText = 'Document before update/patch'

    beforeEach((done) => {
        const newTodo = new TODO({
            _id: objectId,
            text: testText
        });
        TODO.findByIdAndDelete(objectId).then((res) => {
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
            .delete(`/todo/${randomObjectIdString}`+ '1234' )
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
            .patch('/todo/' + objectId.toHexString())
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
            .patch('/todo/' + objectId.toHexString())
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
    const objectId = new ObjectId();
    const testText = 'This is for one doc'

    beforeEach((done) => {
        const newTodo = new TODO({
            _id: objectId,
            text: testText
        });
        TODO.findByIdAndDelete(objectId).then((res) => {
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
            .delete(`/todo/${randomObjectIdString}`+ '1234' )
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
            .delete('/todo/' + objectId.toHexString())
            .expect(200)
            .expect((response) => {
                expect(response.body.result).toBe('Successfully Deleted');
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }
                TODO.findById(objectId.toHexString()).then((todo) => {
                    expect(todo).toBeFalsy()
                    done();
                }).catch((error) => done(error))
            })
    })
})