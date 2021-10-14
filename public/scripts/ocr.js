const canvas = document.getElementById("canvasOutput4")
const outputtext= document.getElementById("ocrOutput")

function doocr(){
Tesseract.recognize(
    canvas,
    'jpn',
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    outputtext.value=text;
  })
}
