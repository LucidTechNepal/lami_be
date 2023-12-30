const mongoose = require('mongoose');
const { Clients } = require('../models/client');

mongoose.connect('mongodb://127.0.0.1:27017/Lami', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        const client = new Clients({
            full_name: 'John Doe',
            birthDate: new Date('1990-01-01'),
            email: 'hari@hari.com',
            password: 'jghahsjda'
        });

        // Save the client to the database
        client.save()
            .then(savedClient => {
                console.log('Client saved:', savedClient);

                // Access the virtual field 'age' using the getter function
                console.log(savedClient.age); // Output: 33 (depending on the current date)
                mongoose.disconnect();
            })
            .catch(error => {
                console.error('Error saving client:', error);
                mongoose.disconnect();
            });
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });
