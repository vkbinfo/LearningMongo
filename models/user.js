const Mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = Mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid Email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

// When mongoose save the user, we can override what it returns in this specific method
userSchema.methods.toJSON = function() {
    const user = this;
    return { _id: user._id, email: user.email }
}

const appSecret = 'AuthSecretThatrequiresforJWTTokens';
userSchema.methods.generateAuthToken = function () { // we are not using arrow function, because mongoose adds this as user object 
    const user = this;                              // so we can use the user object inside this function
    const access = 'auth';
    const token = jwt.sign({ _id: user._id, access}, appSecret)
    user.tokens.push({access, token})
    return user.save().then(() => {
        return token;
    });
}
const USER = Mongoose.model('User', userSchema);



module.exports = {
    USER
}