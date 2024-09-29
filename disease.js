const fs = require('fs');
const csv = require('csv-parser');
const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
const app = express();

// Specify the correct path to the CSV file
const filePath = 'C:/Users/Admin/OneDrive/Desktop/vit-hack/Medicine-Recommendation-System-Personalized-Medical-Recommendation-System-with-Machine-Learning/Symptom-severity.csv';

// Initialize an empty object to store symptom data
const symptomData = {};

// Read the CSV file and store symptom data
fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    // Store each symptom and its weight in the symptomData object
    symptomData[row.Symptom.toLowerCase()] = parseInt(row.weight, 10);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  })
  .on('error', (error) => {
    console.error('Error reading the CSV file:', error.message);
  });

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define the variable to hold the input data
let inputForm; // Variable to store symptoms data

// Endpoint to receive the data
app.post('/submit-symptoms', (req, res) => {
    inputForm = req.body.symptoms; // Store the received data in inputForm
    console.log('Received symptoms:', inputForm);

    // Split the inputForm into an array of symptoms
    const symptomsArray = inputForm.split(',').map(symptom => symptom.trim().toLowerCase());

    // Calculate the total weight for the input symptoms
    let totalWeight = 0;
    symptomsArray.forEach(symptom => {
        const weight = symptomData[symptom]; // Find weight for the symptom
        if (weight) {
            totalWeight += weight;
        } else {
            console.log(`Symptom "${symptom}" not found in dataset.`);
        }
    });

    // Output the total weight in the console
    console.log(`Total weight for symptoms ${inputForm}: ${totalWeight}`);

    // Respond to the client with the total weight
    res.json({ message: 'Symptoms received', totalWeight: totalWeight });
});

// Start your server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
