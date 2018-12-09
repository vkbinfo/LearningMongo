const Mongoose = require('mongoose');

const TODO = Mongoose.model('Todos', {
    text: {
        type: String,
        required: true,
        minLength: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
})

module.exports = {
    TODO
}