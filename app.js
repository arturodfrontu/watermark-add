const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async (
  inputFile, 
  outputFile, 
  text
  ) => {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };
    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    console.log(`It's look good ! You get a watermark on Your Image`);
    startApp();
  }
  catch(error) {
    console.log(`There's a problem, check everything and try again!`)
  }
};

const addImageWatermarkToImage = async (
  inputFile,
  outputFile,
  watermarkFile
) => {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log(`It's look good ! You get a watermark on Your Image`);
    startApp();
  } catch(error) {
    console.log(`There's a problem, check everything and try again!`)
  };
};

const prepareOutputFilename = filename => {
  const [name, ext] = filename.split('.');
  return `${name}-modified.${ext}`;
};

const startApp = async () => {
  const answer = await inquirer.prompt([
    {
      name: 'start',
      message:
        `Thank You to choose a 'Watermark App Manager'! 
        Use Ctrl+C to stop. You can do this anytime. 
        Make sure you have copied the image files to modify to the "/img" folder. 
        Then you can use them in this app. 
        Are you ready?`,
      type: 'confirm',
    },
  ]);

  if (!answer.start) { 
    console.log(`All right, so come back when you're ready. The application will close.`);
    process.exit();
  }

  const input = await inquirer.prompt([
    {
      name: 'inputImage',
      type: 'input',
      message: 'Which file do you want to modify ?',
      default: 'test.jpg',
    },
  ]);

  if (!fs.existsSync('./img/' + input.inputImage)) {
    console.log('Check your path, there is no such file. The application will close.');
    process.exit();
  }

  const watermark = await inquirer.prompt([{
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);
  
  if (watermark.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([
      {
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
        default: 'W.A.M.'
      },
    ]);
    watermark.watermarkText = text.value;
    addTextWatermarkToImage(
      './img/' + input.inputImage,
      './img/' + prepareOutputFilename(input.inputImage),
      watermark.watermarkText
    );
  } else if (watermark.watermarkType === 'Image watermark'){
    const image = await inquirer.prompt([
      {
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'WAM.png',
      },
    ]);

    // check if file provided by user exists
    if (fs.existsSync('./img/' + image.filename)) {
      // console.log('The path exists.');
      watermark.watermarkImage = image.filename;
      addImageWatermarkToImage(
        './img/' + input.inputImage,
        './img/' + prepareOutputFilename(input.inputImage),
        './img/' + watermark.watermarkImage
      );
    } else {
      console.log('Check your path, there is no such file. The application will close.');
      process.exit();
    }
  }
};

startApp();