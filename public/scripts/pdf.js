const imgElement = document.getElementById("imageSrc");
const inputElement = document.getElementById("fileInput");
const canvasElement = document.getElementById("canvasOutput");
const canvasLayerElement = document.getElementById("canvasLayer1");
const canvasSelectedElement = document.getElementById("canvasSelected");
const textareaElement = document.getElementById("textareaOutput");
const progressOCRElement = document.getElementById("progressOCR");

let startX;
let startY;
let endX;
let endY;
let onMouse=false;



inputElement.addEventListener("change", (e) =>{
    imgElement.src=URL.createObjectURL(e.target.files[0]);
},false);

imgElement.onload = function() {
    let mat = cv.imread(imgElement);
    cv.imshow('canvasOutput', mat);
    canvasLayerElement.width=canvasElement.width;
    canvasLayerElement.height=canvasElement.height;
    mat.delete();
};

// ローディング
function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js の 読み込みが完了しました。';
}

canvasLayerElement.addEventListener('mousedown', (e) =>{
    startX=e.offsetX;
    startY=e.offsetY;
    onMouse=true;
}, false);
canvasLayerElement.addEventListener('mouseup', (e) =>{
    endX=e.offsetX;
    endY=e.offsetY;
    onMouse=false;
    draw(canvasLayerElement,endX,endY);
    copySelectedArea();
    ocr();
}, false);
canvasLayerElement.addEventListener('mousemove', (e) =>{
    if(onMouse==true){
        draw(canvasLayerElement,e.offsetX,e.offsetY);
    }
}, false);
canvas.addEventListener("touchstart", (e) =>{
    startX=e.offsetX;
    startY=e.offsetY;
    onMouse=true;
}, false);
canvas.addEventListener("touchend", (e) =>{
    endX=e.offsetX;
    endY=e.offsetY;
    onMouse=false;
    draw(canvasLayerElement,endX,endY);
    copySelectedArea();
    ocr();
}, false);
canvasLayerElement.addEventListener('touchmove', (e) =>{
    if(onMouse==true){
        draw(canvasLayerElement,e.offsetX,e.offsetY);
    }
}, false);

/**
 * 四角形描画用処理
 */
function draw(element,x,y){
	let context=element.getContext('2d');
    context.clearRect(0,0,element.width,element.height);
	context.strokeStyle='#FF0000';
	context.strokeRect(startX,startY,x-startX,y-startY); 
}

/**
 * 選択領域をOCR用canvasにコピー
 */
function copySelectedArea(){
    let src = cv.imread('canvasOutput');
    let dst = new cv.Mat();

    // スタート座標と、そこからの距離を指定する必要があるるので計算
    if(startX>endX){let tmpX=endX;endX=startX;startX=tmpX;}
    if(startY>endY){let tmpY=endY;endY=startY;startY=tmpY;}
    let rect = new cv.Rect(startX, startY, endX-startX, endY-startY);
    dst = src.roi(rect);
    cv.imshow('canvasSelected', dst);
    src.delete();
    dst.delete();
}

function ocr(){
    Tesseract.recognize(
        canvasSelectedElement,
        'jpn',
        { logger: m => {progressOCRElement.value=m.progress;console.log(m);} }
        ).then(({ data: { text } }) => {
            textareaElement.value=text;
        })
}
