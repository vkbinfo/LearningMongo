const Mongoose = require('mongoose');

const USER = Mongoose.model('Users', {
    email: {
        type: String,
        required: true,
        trim: true
    }
})



module.exports = {
    USER
}