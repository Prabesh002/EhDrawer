const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const generateEhhCode = require('../Functions/generateEhhCode');

const router = express.Router();

router.post('/', (req, res) => {
    const shapes = req.body.shapes;
    const timestamp = Date.now();
    const outputFileName = `output_${timestamp}.png`;
    const ehhFileName = `output_${timestamp}.ehh`;
    const TEMP_FOLDER = path.join(__dirname, 'temp');
    const outputFilePath = path.join(TEMP_FOLDER, outputFileName);
    const ehhFilePath = path.join(TEMP_FOLDER, ehhFileName);

    // Ensure the temporary directory exists
    if (!fs.existsSync(TEMP_FOLDER)) {
        fs.mkdirSync(TEMP_FOLDER, { recursive: true });
    }

    // Generate the EHlang code
    const ehhCode = generateEhhCode(shapes, outputFilePath);

    // Write the EHlang code to a file with the same timestamp
    fs.writeFileSync(ehhFilePath, ehhCode, 'utf8');

    // Run the ehhmake command to generate the image
    exec(`ehhmake ${ehhFilePath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error generating image: ${error}`);
            return res.status(500).send('Failed to generate image.');
        }

        // Send the generated image back to the client
        res.sendFile(outputFilePath, (err) => {
            if (err) {
                console.error(`Error sending file: ${err}`);
                return res.status(500).send('Failed to send image.');
            }

            
        });
    });
});

module.exports = router;
