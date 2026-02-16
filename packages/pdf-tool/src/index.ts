import fs from 'fs';
import pdf from 'pdf-parse';

async function extractText(filePath: string) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);

        console.log(`\n--- Text Content of ${filePath} ---\n`);
        console.log(data.text);
        console.log(`\n--- End of Text ---\n`);
        console.log(`Pages: ${data.numpages}`);
        console.log(`Info: ${JSON.stringify(data.info)}`);

    } catch (error) {
        console.error("Error reading PDF:", error);
    }
}

const targetFile = process.argv[2];
if (!targetFile) {
    console.error("Please provide a file path: tsx src/index.ts <path_to_pdf>");
    process.exit(1);
}

extractText(targetFile);
