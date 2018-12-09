const { TODO } = require('../models/models');
const Mongoose = require('mongoose');
const dbURI = 'mongodb://localhost:27017/TodoApp';
Mongoose.connect(dbURI);

const newTodo = new TODO({
    text: 'Talk with a native english speaker'
})

newTodo.save().then((doc) => {
    console.log('Todo Successfully inserted', doc);
}, (err) => {
    console.error('Some error happened while inserting the doc into mongodb database.', err);
})