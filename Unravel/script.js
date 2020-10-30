feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
let video = document.querySelector('#videoInput');
let canvasOutput = document.getElementById('canvasOutput');
const buttons = [...controls.querySelectorAll('button')];
let streamStarted = false;

const [play, pause] = buttons;

const constraints = {
  video: {
    width: {
      min: 1280,
      ideal: 1920,
      max: 2560,
    },
    height: {
      min: 720,
      ideal: 1080,
      max: 1440
    },
  }
};

cameraOptions.onchange = () => {
  const updatedConstraints = {
    ...constraints,
    deviceId: {
      exact: cameraOptions.value
    }
  };

  startStream(updatedConstraints);
};

play.onclick = () => {
  if (streamStarted) {
    video.play();
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    return;
  }
  if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
    const updatedConstraints = {
      ...constraints,
      deviceId: {
        exact: cameraOptions.value
      }
    };
    startStream(updatedConstraints);
  }

};

const pauseStream = () => {
  video.pause();
  play.classList.remove('d-none');
  pause.classList.add('d-none');
  streaming = false;
};


pause.onclick = pauseStream;

const startStream = async (constraints) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  handleStream(stream);
};


const handleStream = (stream) => {
  video.srcObject = stream;
  //video.play();
  play.classList.add('d-none');
  pause.classList.remove('d-none');
  //screenshot.classList.remove('d-none');
  processVideo();
};


const getCameraSelection = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const options = videoDevices.map(videoDevice => {
    return `<option value="${videoDevice.deviceId}">${videoDevice.label}</option>`;
  });
  cameraOptions.innerHTML = options.join('');
};

getCameraSelection();


  let src = new cv.Mat(600,600, cv.CV_8UC4);
  let dst = new cv.Mat(600,600, cv.CV_8UC1);
  video.width = 600;
  video.height = 600;
  let cap = new cv.VideoCapture(video);

  const FPS = 1;
  function processVideo() {
    try {
        /*
        if (!streaming) {
            // clean and stop.
            src.delete();
            dst.delete();
            return;
        }
        */

        //Refresh rate and frame read
        let begin = Date.now();
        let delay = 1000/FPS - (Date.now() - begin);
        cap.read(src);


        //Color & blur
        let dstForBlur = new cv.Mat();
        let blurKernelSize = new cv.Size(5,5);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(src, dstForBlur, blurKernelSize, 0, 0, cv.BORDER_DEFAULT);

        //Dilation
        let M = cv.Mat.ones(5, 5, cv.CV_8U);
        let anchor = new cv.Point(-1, -1);
        cv.dilate(dstForBlur, dstForBlur, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

        //Edges
        let dstForFirstEdges = new cv.Mat();
        cv.Canny(dstForBlur, dstForFirstEdges, 50,100);


        let contoursFrame = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let copyOfEdges = dstForBlur.clone();
        let matForEdgeConversion = new cv.Mat();
        //copyOfEdges.convertTo(matToConvert, cv.CV_8UC1);
        //Conversion to matrix format accepted by findContours()
        cv.cvtColor(copyOfEdges, matForEdgeConversion, cv.COLOR_RGBA2GRAY);
        cv.findContours(dstForFirstEdges, contoursFrame, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        //Contour drawing
        let color = new cv.Scalar(255,0,0,255);
        let colorfulContours = new cv.Mat.zeros(src.cols,src.rows, cv.CV_8UC3);
        for(let i = 0; i<contoursFrame.size();i++){
          cv.drawContours(colorfulContours, contoursFrame, i, color, 1, cv.LINE_8, hierarchy, 100);
        }
        //cv.imshow('canvasOutput', colorfulContours);
        let contoursBySize = [];

        let frameForApproximations = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        let frameForBiggestContour = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

        //At least one contour was found
        if(contoursFrame.size() > 0){

          //console.log(contoursFrame.size());

          //Two dimensional array with index of contour and area for it,
          //later on we sort the array by area and access the first element,
          //which will be the test sheet square
          var listOfIndexesWithArea = [];

          let poly = new cv.MatVector();

          //Saving of contour data into 2D array
          //Searching for four corner contours (NOT WORKING, try using a ruler next time)
          for(var i = 0; i < contoursFrame.size(); i++){
            var currentContour = contoursFrame.get(i);

            //Checking for closed curves (true param)
            let perimeter = cv.arcLength(currentContour, true);

            //Polygon approximation
            let approxPoly = new cv.Mat();
            let approximation = cv.approxPolyDP(currentContour, approxPoly, 3,true);
            //poly.push_back(approxPoly);
            var valueForCurrentContour = new Array();
            valueForCurrentContour[0] = i;
            valueForCurrentContour[1] = cv.contourArea(currentContour, false);
            listOfIndexesWithArea.push(valueForCurrentContour);
            if(approxPoly){
            //We found a squared shape
            //console.log("aprox");
            //console.log(approxPoly);
              if(approximation == 5){
                mainSquareish = currentContour;
                console.log("four eyes");
                break;
              }
            }
          }

          /*
          for (let i = 0; i < contoursFrame.size(); ++i) {
                let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
                cv.drawContours(frameForApproximations, poly, i, color, 1, 8, hierarchy, 0);
          }
          */

          listOfIndexesWithArea.sort(sortContoursByArea);

          //Order contours by area (greater to lower)
          function sortContoursByArea(a,b){
            return b[1] - a[1];
          }

          let shapedPoly = new cv.Mat();
          cv.approxPolyDP(contoursFrame.get(listOfIndexesWithArea[0][0]), shapedPoly, 3, true);
          poly.push_back(shapedPoly);

          let colorBlue = new cv.Scalar(0,0,255);
          cv.drawContours(frameForApproximations, poly, 0, colorBlue, 1, 8, hierarchy, 0);


          cv.drawContours(frameForBiggestContour, contoursFrame,listOfIndexesWithArea[0][0], color, 1, 8, hierarchy, 0);

          //Call the perspective for the biggest contour found
          let isolatedMainRect = perspectiveTransform(src,contoursFrame.get(listOfIndexesWithArea[0][0]));

          let dstThreshold = new cv.Mat();
          let threshResult = cv.threshold(isolatedMainRect, dstThreshold, 100, 255, cv.THRESH_BINARY&cv.THRESH_OTSU);
          //console.log("thresh done");
          //console.log(threshResult);
          //cv.imshow('canvasOutput', dstThreshold);

          //let threshCopy = dstThreshold.copy();
          findBubbles(dstThreshold);

        }

        else{
          console.log("no contours found");
        }

        //cv.imshow('canvasOutput', frameForApproximations);
        setTimeout(processVideo, delay);

    } catch (err) {
        console.log("error during processing");
        console.log(err);
    }
};

function findBubbles(thresholdImage){

  let bubbleEdges = new cv.Mat();
  cv.Canny(thresholdImage, bubbleEdges, 50,100);

  //Creation of parameters for contour finding
  let listOfContours = new cv.MatVector();
  let hierarchyBubbles = new cv.Mat();
  //cv.cvtColor(bubbleEdges,bubbleEdges, cv.COLOR_RGBA2GRAY);
  cv.findContours(bubbleEdges, listOfContours, hierarchyBubbles, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  //Contour drawing
  let color = new cv.Scalar(0,255,0,255);
  let bubbleContours = new cv.Mat.zeros(thresholdImage.cols,thresholdImage.rows, cv.CV_8UC3);
  for(let i = 0; i<listOfContours.size();i++){
    cv.drawContours(bubbleEdges, listOfContours, i, color, 1, cv.LINE_8, hierarchyBubbles, 100);
  }
  console.log(listOfContours.size() + " bubbles found");
  cv.imshow('canvasOutput', bubbleEdges);
}


function perspectiveTransform(inputImage, contourToTransform){

  let minRectangle = cv.minAreaRect(contourToTransform);
  let verticesRectangle = cv.RotatedRect.points(minRectangle);

  let corner1 = verticesRectangle[0];
  let corner2 = verticesRectangle[1];
  let corner3 = verticesRectangle[2];
  let corner4 = verticesRectangle[3];

  //Order the corners
  let cornerArray = [{ corner: corner1 }, { corner: corner2 }, { corner: corner3 }, { corner: corner4 }];
  //Sort by Y position (to get top-down)
  cornerArray.sort((item1, item2) => { return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0; }).slice(0, 5);

  //Determine left/right based on x position of top and bottom 2
  let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
  let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
  let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
  let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];

  //Calculate the max width/height
  let widthBottom = Math.hypot(br.corner.x - bl.corner.x, br.corner.y - bl.corner.y);
  let widthTop = Math.hypot(tr.corner.x - tl.corner.x, tr.corner.y - tl.corner.y);
  let theWidth = (widthBottom > widthTop) ? widthBottom : widthTop;
  let heightRight = Math.hypot(tr.corner.x - br.corner.x, tr.corner.y - br.corner.y);
  let heightLeft = Math.hypot(tl.corner.x - bl.corner.x, tr.corner.y - bl.corner.y);
  let theHeight = (heightRight > heightLeft) ? heightRight : heightLeft;

  //Transform!
  let finalDestCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, theWidth - 1, 0, theWidth - 1, theHeight - 1, 0, theHeight - 1]); //
  let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [tl.corner.x, tl.corner.y, tr.corner.x, tr.corner.y, br.corner.x, br.corner.y, bl.corner.x, bl.corner.y]);
  let dsize = new cv.Size(theWidth, theHeight);
  let M = cv.getPerspectiveTransform(srcCoords, finalDestCoords);
  let finalDst = new cv.Mat();

  //TODO: create matDestTransformed and finalDest in the caller function, how to connect them properly?
  cv.warpPerspective(src, finalDst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

  return finalDst;

}

// To execute before the camera is started
//tosetTimeout(processVideo, 0);
