const imgElement = document.getElementById("imageSrc");
const inputElement = document.getElementById("fileInput");
const canvasElement = document.getElementById("canvasOutput");
const canvasLayerElement = document.getElementById("canvasLayer1");
const textareaElement = document.getElementById("textareaOutput");
const progressOCRElement = document.getElementById("progressOCR");
const selectedDivElement = document.getElementById("ocrselected-list");

let startX;
let startY;
let endX;
let endY;
let onMouse=false;

const canvasPoints = [];
const canvasSelectedElements = [];

/**
 * 座標を登録するためのコンストラクタ
 */
function canvasPoint(_startX,_startY,_endX,_endY){
    if(_startX<_endX){
        this.startX=_startX;
        this.endX=_endX;
    }
    else{
        this.startX=_endX;
        this.endX=_startX;
    }
    if(_startY<_endY){
        this.startY=_startY;
        this.endY=_endY;
    }
    else{
        this.startY=_endY;
        this.endY=_startY;
    }
    this.toX=this.endX-this.startX;
    this.toY=this.endY-this.startY;
}

/**
 * キャンバス作成
 */
function createCanvasSelectedElement(point){
    let src = cv.imread('canvasOutput');
    let dst = new cv.Mat();
    // 矩形選択
    let rect = new cv.Rect(point.startX,point.startY,point.toX,point.toY);
    dst = src.roi(rect);
    this.mem_canvas = document.createElement("canvas");
    this.mem_canvas.width = point.toX;
    this.mem_canvas.height = point.toY;

    let canvasidstr="canvasSelectedElements" + (canvasSelectedElements.length+1);
    let textidstr="textSelectedElements" + (canvasSelectedElements.length+1);
    let selectedidstr="divselectedElements" + (canvasSelectedElements.length+1);

    this.mem_canvas.id = canvasidstr;
    cv.imshow(this.mem_canvas, dst);
    src.delete();
    dst.delete();
    canvasSelectedElements.push(mem_canvas);
    // 選択済リスト
    let ocrselecteddiv = document.createElement("div");
    let zahyou = document.createElement("div");
    let text = document.createElement("textarea");
    let ocrbutton = document.createElement("input");
    let delbutton = document.createElement("input");
    ocrselecteddiv.className="ocrselected";
    ocrselecteddiv.id=selectedidstr;
    ocrbutton.type="button";
    ocrbutton.value="a";
    delbutton.type="button";
    delbutton.value="x";
    text.id=textidstr;

    ocrbutton.onclick=new Function("executeOCR('"+canvasidstr+"','"+textidstr+"');");
    delbutton.onclick=new Function("deleteSelected('"+selectedidstr+"');");

    zahyou.innerHTML = "startX=" + point.startX + ":startY=" + point.startY + ":endX=" + point.endX + ":endY" + point.endY;
    ocrselecteddiv.appendChild(mem_canvas);
    ocrselecteddiv.appendChild(zahyou);
    ocrselecteddiv.appendChild(text);
    ocrselecteddiv.appendChild(ocrbutton);
    ocrselecteddiv.appendChild(delbutton);

    selectedDivElement.appendChild(ocrselecteddiv);
    

}

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
    point=new canvasPoint(startX,startY,endX,endY);
    createCanvasSelectedElement(point);
    canvasPoints.push(point);
}, false);
canvasLayerElement.addEventListener('mousemove', (e) =>{
    if(onMouse==true){
        draw(canvasLayerElement,e.offsetX,e.offsetY);
    }
}, false);
// canvas.addEventListener("touchstart", (e) =>{
//     startX=e.offsetX;
//     startY=e.offsetY;
//     onMouse=true;
// }, false);
// canvas.addEventListener("touchend", (e) =>{
//     endX=e.offsetX;
//     endY=e.offsetY;
//     onMouse=false;
//     draw(canvasLayerElement,endX,endY);
//     copySelectedArea();
//     ocr();
// }, false);
// canvasLayerElement.addEventListener('touchmove', (e) =>{
//     if(onMouse==true){
//         draw(canvasLayerElement,e.offsetX,e.offsetY);
//     }
// }, false);

/**
 * 四角形描画用処理
 */
function draw(element,x,y){
	let context=element.getContext('2d');
    context.clearRect(0,0,element.width,element.height);
	context.strokeStyle='#FF0000';
    for(i=0;i<canvasPoints.length;i++){
        // 設定済みの四角形
        context.strokeRect(canvasPoints[i].startX,canvasPoints[i].startY,canvasPoints[i].toX,canvasPoints[i].toY);
    }
    // 描画中の四角形
	context.strokeRect(startX,startY,x-startX,y-startY);
}

// /**
//  * 選択領域をOCR用canvasにコピー
//  */
// function copySelectedArea(point){
//     let src = cv.imread('canvasOutput');
//     let dst = new cv.Mat();

//     // 矩形選択
//     let rect = new cv.Rect(point.startX,point.startY,point.toX,point.toY);
//     dst = src.roi(rect);
//     cv.imshow('canvasSelected', dst);


//     src.delete();
//     dst.delete();
// }

function ocr(element,textarea=textareaElement){
    Tesseract.recognize(
        element,
        'jpn',
        { logger: m => {progressOCRElement.value=m.progress;console.log(m);} }
        ).then(({ data: { text } }) => {
            textarea.value=textarea.value + '\n' + text;
        })
}

function executeAllOCR(){
    textareaElement.value="";
    for(i=0;i<canvasSelectedElements.length;i++){
        ocr(canvasSelectedElements[i]);
    }
}
function executeOCR(canvasid,outputid){
    console.log(canvasid + ":" + outputid);
    const canvaselement = document.getElementById(canvasid);
    const textareaelement = document.getElementById(outputid);
    // this.textareaelement.value="";
    ocr(canvaselement,textareaelement);
}
function deleteSelected(divid){
    console.log(divid);
    const element = document.getElementById(divid);

    element.remove();
}