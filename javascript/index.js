const fs = require('fs');
const path = require('path');
const { processMessages } = require('./solution');

console.log('Starting tests...');

const inputDir = '../test/input/';
const outputDir = '../test/output/';
const inputFiles = fs.readdirSync(inputDir);
const outputFiles = fs.readdirSync(outputDir);

inputFiles.forEach((value, i) => {
  const inputData = fs.readFileSync(path.join(inputDir, value)).toString();
  const outputData = fs.readFileSync(path.join(outputDir, outputFiles[i])).toString();

  // console.log(inputData);
  // console.log(outputData);
  const process = processMessages(inputData);
  if (process === outputData) {
    console.log(`Test ${i + 1}/${outputFiles.length} - Passed`);
  } else {
    console.log(`Test ${i + 1}/${outputFiles.length} - Failed`);
  }
});
