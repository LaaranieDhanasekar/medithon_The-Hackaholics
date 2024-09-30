const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = 3000;

// Specify the correct paths to the CSV files
const filePath = path.join(__dirname, 'Symptom-severity.csv');
const secondFilePath = path.join(__dirname, 'symtoms_df.csv');
const descriptionFilePath = path.join(__dirname, 'description.csv'); // Add path to description.csv

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(__dirname));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Data storage
let symptomData = {}; // To store symptom severity (Symptom -> weight)
let diseaseData = {}; // To store diseases and symptoms (Disease -> Set of symptoms)
let descriptionData = {}; // To store diseases and their descriptions (Disease -> Description)

// Read and process 'Symptom-severity.csv'
fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    symptomData[row.Symptom.toLowerCase().trim()] = parseInt(row.weight, 10);
  })
  .on('end', () => {
    console.log('Symptom-severity.csv file successfully processed');
  })
  .on('error', (error) => {
    console.error('Error reading the Symptom-severity.csv file:', error.message);
  });

// Read and process 'symptoms_df.csv'
fs.createReadStream(secondFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const diseaseName = row[Object.keys(row)[1]].toLowerCase().trim(); // Get disease name
    const symptoms = Object.keys(row).slice(2)
      .map(key => row[key].toLowerCase().trim())
      .filter(symptom => symptom);
      
    if (!diseaseData[diseaseName]) {
      diseaseData[diseaseName] = new Set(symptoms);
    }
  })
  .on('end', () => {
    console.log('symptoms_df.csv file successfully processed');
  })
  .on('error', (error) => {
    console.error('Error reading the symptoms_df.csv file:', error.message);
  });

// Read and process 'description.csv'
fs.createReadStream(descriptionFilePath)
  .pipe(csv())
  .on('data', (row) => {
    const diseaseName = row.Disease.toLowerCase().trim();
    const description = row.Description.trim();
    descriptionData[diseaseName] = description;
  })
  .on('end', () => {
    console.log('description.csv file successfully processed');
  })
  .on('error', (error) => {
    console.error('Error reading the description.csv file:', error.message);
  });

// Handle symptom submission
app.post('/submit-symptoms', (req, res) => {
  const inputForm = req.body.symptoms; 
  console.log('Received symptoms:', inputForm);

  const symptomsArray = inputForm.split(',').map(symptom => symptom.trim().toLowerCase());
  console.log('Parsed symptoms:', symptomsArray);

  const symptomWeights = symptomsArray.map(symptom => symptomData[symptom] || 0);
  const totalWeight = symptomWeights.reduce((acc, weight) => acc + weight, 0);
  console.log('Symptom weights:', symptomWeights);
  console.log('Total weight:', totalWeight);

  let matchedDiseases = [];
  for (const [disease, symptomsSet] of Object.entries(diseaseData)) {
    const matched = symptomsArray.some(symptom => symptomsSet.has(symptom));
    if (matched) {
      matchedDiseases.push(disease);
    }
  }

  const topMatchedDiseases = matchedDiseases.slice(0, 3);
  console.log('Top 3 matched diseases:', topMatchedDiseases);

  // Find descriptions for the top matched diseases
  const diseaseDescriptions = topMatchedDiseases.map(disease => ({
    disease: disease,
    description: descriptionData[disease] || 'Description not available'
  }));
  console.log('Disease descriptions:', diseaseDescriptions);

  // Send the disease names and descriptions to the client
  res.json({ diseaseDescriptions });
});


// Serve the HTML file when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start your server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
