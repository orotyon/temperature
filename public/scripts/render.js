function onOpenCvReady() {
  document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
}

function rendering(){
    let src = cv.imread('canvasInput');
    let dst = new cv.Mat();
    let dst2 = new cv.Mat();
    let lines = new cv.Mat();
    let fx=300/src.cols;
    let fy=200/src.rows;

//    let color = new cv.Scalar(255, 0, 0);
    cv.resize(src, dst, dst.size(), fx, fy, cv.INTER_NEAREST);

    cv.medianBlur(dst, dst2, 5);
    cv.cvtColor(dst2, dst2, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(dst2, dst2, 50, 200, 3);

    cv.imshow('canvasOutput1', dst2);

    // You can try more different parameters
    cv.HoughLinesP(dst2, lines, 1, Math.PI / 180, 2, 0, 0);
    // draw lines
    let xMin=-1;
    let xMax=0;
    let yMin=-1;
    let yMax=0;
    for (let i = 0; i < lines.rows; ++i) {
        let x1=lines.data32S[i * 4];
        let y1=lines.data32S[i * 4 + 1];
        let x2=lines.data32S[i * 4 + 2];
        let y2=lines.data32S[i * 4 + 3];

        if (xMin<0 || xMin > x1){xMin=x1;}
        if (xMin<0 || xMin > x2){xMin=x2;}
        if (xMax < x1){xMax=x1;}
        if (xMax < x2){xMax=x2;}
        if (yMin < 0 || yMin > y1){yMin=y1;}
        if (yMin < 0 || yMin > y2){yMin=y2;}
        if (yMax < y1){yMax=y1;}
        if (yMax < y2){yMax=y2;}
    }

    let lcolor = new cv.Scalar(255, 0, 0);
    let p1 = new cv.Point(xMin, yMin);
    let p2 = new cv.Point(xMax, yMax);
    //let rect = new cv.Rect(xMin, yMax, xMax, yMin);
    cv.rectangle(dst, p1, p2, lcolor, cv.LINE_4);
    cv.imshow('canvasOutput2', dst);

    let orgXMin = xMin/fx;
    let orgYMin = yMin/fy;
    let orgXMax = xMax/fx;
    let orgYMax = yMax/fy;
//    let rect = new cv.Rect(orgXMin,src.rows-orgYMax,orgXMax-orgXMin,orgYMax-orgYMin);
    let rect = new cv.Rect(orgXMin,orgYMin,orgXMax-orgXMin,orgYMax-orgYMin);
    console.log(orgXMin);
    console.log(src.rows-orgYMax);
    console.log(orgXMax-orgXMin);
    console.log(orgYMax-orgYMin);
    let dst3 = src.roi(rect);
    cv.imshow('canvasOutput3', dst3);
    let low = new cv.Mat(dst3.rows, dst3.cols, dst3.type(), [0, 0, 0, 0]);
    let high = new cv.Mat(dst3.rows, dst3.cols, dst3.type(), [80, 80, 80, 255]);
    cv.inRange(dst3, low, high, dst3);
    cv.bitwise_not(dst3,dst3);
    cv.imshow('canvasOutput4', dst3);

    src.delete(); dst.delete(); lines.delete(); dst2.delete(); dst3.delete();

}
