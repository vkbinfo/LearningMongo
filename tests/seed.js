const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const APP_SECRET = 'authsecretthatrequiresforJWTTokens';
const {
    USER
} = require('../models/user');
const {
    TODO
} = require('../models/todo');

const todos = [{
    _id: new ObjectId(),
    text: 'It is something'
}, {
    _id: new ObjectId(),
    text: 'It is not something'
}]

const userOneObjectId = new ObjectId();
const userTwoObjectId = new ObjectId();
const users = [
    {
        _id: userOneObjectId,
        email: 'Vikash@gmail.com',
        password: '12345678',
        tokens: [
            {
                access: 'auth',
                token: jwt.sign({ _id: userOneObjectId.toHexString(), access: 'auth' }, APP_SECRET).toString()
            }
        ]
    },
    {
        _id: userTwoObjectId,
        email: 'Akash@gmail.com',
        password: 'abc45678',
    }
]


const populateUsers = (done) => {
    USER.deleteMany().then( () => {
        const userOne = new USER(users[0]).save()
        const userTwo = new USER(users[1]).save()
        Promise.all([userOne, userTwo]).then(() => {
            done();
        })
    }).catch(() => {
        console.error('Something failing while deleting and inserting user data in seed file')
    }) 
}

const populateTodos = (done) => {
    TODO.deleteMany().then( () => {
        TODO.insertMany(todos).then(() => {
            done();
        })
    }).catch(() => {
        console.error('Something failing while deleting and inserting todo data in seed file')
    })   
}
module.exports = { todos, users, populateUsers, populateTodos }