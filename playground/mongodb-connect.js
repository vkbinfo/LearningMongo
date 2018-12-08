const MongoClient = require('mongodb').MongoClient;
const dbURI = 'mongodb://localhost:27017';

MongoClient.connect(dbURI, { useNewUrlParser: true }, (err, client) => {
    if(err) {
        return console.log('Unsuccessful while connecting to Mongo database.')
    }
    db = client.db('TodoApp');
    db.collection('Users').insertOne({
        exist: 'Universe',
        what_else: 'Nothing'
    }, (err, result) => {
        if (err) {
            return console.log('Something happened, was not able to insert user record in collection');
        }
        console.log('User detail Successfully inserted.', JSON.stringify(result, 2));
    })
    // closing mongodb connection.
    client.close();
})