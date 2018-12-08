const MongoClient = require('mongodb').MongoClient;
const dbURI = 'mongodb://localhost:27017';

MongoClient.connect(dbURI, { useNewUrlParser: true }, (err, client) => {
    if(err) {
        return console.log('Unsuccessful while connecting to Mongo database.')
    }
    db = client.db('TodoApp');
    // db.collection('Users').insertOne({
    //     name: 'Sohani',
    //     change: 'required'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Something happened, was not able to insert user record in collection');
    //     }
    //     console.log('User detail Successfully inserted.', JSON.stringify(result, 2));
    // })
    // // closing mongodb connection.
    // client.close();
    db.collection('Users').find({name: 'Deendayal'}).toArray().then((docs) => {
        console.log('Found result', JSON.stringify(docs, undefined, 2))
    }, (error) => {})
})