const Mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const {
    USER
} = require('../models/users');
const {
    TODO
} = require('../models/todo')
const dbURI = 'mongodb://localhost:27017/TodoApp';
Mongoose.connect(dbURI, { useNewUrlParser: true } ).then((success)=> {
    console.log('Mongodb connected with ' + dbURI);
}, (error) => {
    console.error('Unsuccessful db connection', error);
});

const app = express();
app.use(bodyParser.json());

app.post('/user/new', (req, res) => {
    const newUser = USER({
        email: req.body.email
    })
    newUser.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
})

app.post('/todo/new', (req, res) => {
    const newTodo = new TODO({
        text: req.body.text
    })

    newTodo.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
})

// getting all todo
app.get('/todos', (req, res) => {
    TODO.find().then((todos)=>{
        res.send({todos})
    }, (error) => {
        res.status(400).send(error)
    })
})

app.listen(3000, () => {
    console.log('NodeJS server started with expressJS on the port 3000');
})

module.exports = {
    app
}