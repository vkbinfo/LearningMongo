const Mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const APP_SECRET = 'authsecretthatrequiresforJWTTokens';

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

// the methods array is applied on individual document
userSchema.methods.generateAuthToken = function () { // we are not using arrow function, because mongoose adds this as user object 
    const user = this;                              // so we can use the user object inside this function
    const access = 'auth';
    const token = jwt.sign({ _id: user._id, access}, APP_SECRET)
    user.tokens.push({access, token})
    return user.save().then(() => {
        return token;
    });
}

// this statics array holds the static class function like function and this function's this will be bind to the Model USER.
userSchema.statics.findByToken = function (token) {
    const USER = this;
    let decoded;
    try {
    decoded = jwt.verify(token, APP_SECRET);
    } catch(e) {
        return Promise.reject();
    }
    return USER.findOne({_id: decoded._id, 'tokens.access': decoded.access, 'tokens.token':token})
}
const USER = Mongoose.model('User', userSchema);



module.exports = {
    USER
}