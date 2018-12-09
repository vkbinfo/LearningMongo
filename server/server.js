const Mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const { USER } = require('../models/users');
const { TODO } = require('../models/todo')
const dbURI = 'mongodb://localhost:27017/TodoApp';
Mongoose.connect(dbURI);

const app = express();
app.use(bodyParser.json());

app.post('/user/new',(req, res) => {
    const newUser = USER({
        email: req.body.email
    })
    newUser.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err);
    })
} )



app.listen(3000, () => {
console.log('NodeJS server started with expressJS on the port 3000');
})


// const newTodo = new TODO({
//     text: 'Talk with a native english speaker'
// })

// newTodo.save().then((doc) => {
//     console.log('Todo Successfully inserted', doc);
// }, (err) => {
//     console.error('Some error happened while inserting the doc into mongodb database.', err);
// })