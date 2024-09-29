const fs = require('fs'); // Import file system module to read the CSV file
const csv = require('csv-parser'); // Import csv-parser to parse CSV data
const readline = require('readline'); // Import readline to accept user input from terminal

// Create an interface for reading input from the terminal
const rl = readline.createInterface({
    input: process.stdin, // Standard input (keyboard input)
    output: process.stdout // Standard output (console display)
});

// Initialize an object to hold diet data mapped to diseases
const dietData = {};

// Read the CSV file and parse it
fs.createReadStream('diets.csv') // Create a readable stream from the CSV file
  .pipe(csv()) // Pipe the stream through the csv-parser to convert CSV rows into JavaScript objects
  .on('data', (row) => {
    // For each row of the CSV file:
    
    const disease = row.Disease.trim().toLowerCase(); // Clean up the disease name: remove extra spaces and convert to lowercase
    dietData[disease] = JSON.parse(row.Diet.replace(/'/g, '"')); // Parse the 'Diet' field into JSON format and store it in dietData, using the disease name as key
  })
  .on('end', () => {
    // Once the entire CSV file has been read and parsed:

    console.log('CSV file successfully processed.'); // Confirm that CSV has been processed

    // Prompt the user to enter a disease name in the terminal
    rl.question('Enter the disease name: ', (diseaseName) => {
      
        const normalizedDiseaseName = diseaseName.trim().toLowerCase(); 
        // Normalize user input by trimming extra spaces and converting to lowercase to match our CSV format

        const diet = dietData[normalizedDiseaseName]; 
        // Find the diet for the inputted disease from the dietData object
        
        if (diet) {
            // If a diet is found for the disease:
            console.log(`Diet for ${diseaseName.toUpperCase()}:`, diet); 
            // Print the diet to the terminal (convert the disease name back to uppercase for display)
        } else {
            // If no diet is found for the inputted disease:
            console.log(`No diet found for ${diseaseName.toUpperCase()}.`); 
            // Inform the user that no diet was found for the entered disease
        }

        rl.close(); // Close the input interface to end the program
    });
  });
