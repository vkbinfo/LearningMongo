const MongoClient = require('mongodb').MongoClient;
const dbURI = 'mongodb://localhost:27017';

MongoClient.connect(dbURI, { useNewUrlParser: true }, (err, client) => {
    if(err) {
        return console.log('Unsuccessful while connecting to Mongo database.')
    }
    db = client.db('TodoApp');
    // To delete first find document from the collection.
    db.collection('Users').deleteOne({name: 'Vikash'}).then((docs) => {
        console.log('Deleted one document from collection.', JSON.stringify(docs, undefined, 2))
    }, (error) => {})

    // To delete first find document from the collection.
    db.collection('Users').deleteOne({name: 'Neha'}).then((docs) => {
        console.log('Deleted one document from collection.', JSON.stringify(docs, undefined, 2))
    }, (error) => {})
    
    // To delete multiple documents from one query.
    db.collection('Users').deleteMany({change: 'required'}).then((docs) => {
        console.log('Deleted multiple documents from collection.', JSON.stringify(docs, undefined, 2))
    }, (error) => {})

    // this way of deletion deletes the document and also returns. This is a good one, you can also insert
    //  it back if the user wants to undo the operation.
    db.collection('Users').findOneAndDelete({change: 'required'}).then((docs) => {
        console.log('Delted and Got that document.', JSON.stringify(docs, undefined, 2))
    }, (error) => {})
})