// setting config for this app
require('./config');
const _ = require('lodash');
const Mongoose = require('mongoose');
Mongoose.set('useFindAndModify', false); // setting to close down the deprecation warning for findByIdAndUpdate command.
const { ObjectId } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const { USER } = require('./models/user');
const { TODO } = require('./models/todo');

//importing middleware
const { authenticate } = require('./middleware/authenticate');

// getting PORT number from environment for Heroku deployment.
const port = process.env.PORT || 3000

const dbURI = process.env.MongoDB_URI;

Mongoose.connect(dbURI, { useNewUrlParser: true }).then((success) => {
    console.log('Mongodb connected with ' + dbURI);
}).catch((error) => {
    console.error('Unsuccessful db connection', error);
});

const app = express();
app.use(bodyParser.json());

app.post('/user/new', (req, res) => {
    // it just creates a new object with given keys
    const newUser =new USER(_.pick(req.body, ['email', 'password']));
    newUser.save().then((doc) => {
        newUser.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(newUser);
        })
    }, (err) => {
        console.error('Validation Error', err);
        res.status(400).send(err.message);
    })
})

app.get('/user/me', authenticate, (req, res) => {
    res.send(req.user);
})

// route to login a user
app.post('/user/login', (req, res) => {
    const userCred = _.pick(req.body, ['email', 'password'])
    USER.findByCredentials(userCred.email, userCred.password).then((user) => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((error) => {
        res.status(400).send(error);
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
    TODO.find().then((todos) => {
        res.send({
            todos
        })
    }, (error) => {
        res.status(400).send(error)
    })
})

// getting a specific todo from the given url params 
app.get('/todo/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            Error: 'Id is not valid'
        })
    }
    TODO.findById(id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({
            todo
        })
    }, (error) => {
        res.status(400).send(error)
    })
})

// Patching/updating a specific todo from the given url params 
app.patch('/todo/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            Error: 'Id is not valid'
        })
    }
    // it just creates a new object with given keys
    const todoBody = _.pick(req.body, ['text', 'completed'])
    if (_.isBoolean(todoBody.completed) && todoBody.completed) {
        todoBody.completedAt = new Date().getTime();
    } else if(!todoBody.completed){
        todoBody.completedAt = null;
    }
    TODO.findByIdAndUpdate(id, {
        $set: todoBody // these are mongodb operators that are required to update something in the doc
    }, {
        new: true // just tells mongoose to return the updated doc
    }).then((updatedTodo) => {
        if (!updatedTodo) {
            return res.status(404).send('No Record Found with this id.');
        }
        res.send(updatedTodo)
    }, (error) => {
        res.status(400).send(error)
    })
})

// deleting a specific todo from the given url params 
app.delete('/todo/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send({
            Error: 'Id is not valid'
        })
    }
    TODO.findByIdAndDelete(id).then((todo) => {
        if (!todo) {
            return res.status(404).send('No Record Found with this id.');
        }
        res.send({
            result: 'Successfully Deleted'
        })
    }, (error) => {
        res.status(400).send(error)
    })
})

if(!module.parent){
    app.listen(port, () => {
        console.log(`NodeJS server started with expressJS on the port ${port}`);
    })
}

module.exports = {
    app
}