feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
let video = document.querySelector('#videoInput');
let canvasOutput = document.getElementById('canvasOutput');
//const screenshotImage = document.querySelector('img');
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

/*
const doScreenshot = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  screenshotImage.src = canvas.toDataURL('image/webp');
  screenshotImage.classList.remove('d-none');
};
*/

pause.onclick = pauseStream;
//screenshot.onclick = doScreenshot;

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

        //console.log(cap);
        /*
        let begin = Date.now();


        // start processing.

        cap.read(src);

        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.imshow('openCVOutput', dst);
        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
        */
        //console.log(video.clientHeight);
        //console.log(video.clientWidth);
        //console.log(cap);

        //Refresh rate and frame read
        let begin = Date.now();
        let delay = 1000/FPS - (Date.now() - begin);
        cap.read(src);


        //console.log("blurred performed");

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


        //cv.cvtColor(dstForFirstEdges, edgesMonochrome, cv.COLOR_RGBA2GRAY);


        //Threshold
        //cv.threshold(dstForBlur, dstForBlur, 120,200, cv.THRESH_BINARY);

        let contoursFrame = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let dstForContours = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC1);
        let copyOfEdges = dstForBlur.clone();
        let convertedDst = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC1);
        let matForContours = new cv.Mat();
        //copyOfEdges.convertTo(matToConvert, cv.CV_8UC1);
        //Conversion to matrix format accepted by findContours()
        cv.cvtColor(copyOfEdges, matForContours, cv.COLOR_RGBA2GRAY);
        cv.findContours(dstForFirstEdges, contoursFrame, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        //Contour drawing
        let color = new cv.Scalar(255,0,0,255);
        let colorfulContours = new cv.Mat.zeros(src.cols,src.rows, cv.CV_8UC3);
        for(let i = 0; i<contoursFrame.size();i++){
          //let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
          //let color = new cv.Scalar(0,255,0);
          cv.drawContours(colorfulContours, contoursFrame, i, color, 1, cv.LINE_8, hierarchy, 100);
          //console.log("color applied to contour");
        }

        let contoursBySize = [];

        let frameForApproximations = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
        let frameForBiggestContour = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

        //At least one contour was found
        if(contoursFrame.size() > 0){

          //Contour sorting by area (reversed)
          //contoursFrame.sort(function(a,b){ return cv.contourArea(a) - cv.contourArea(b);});
          //contoursBySize = contoursFrame.sort((a,b) => cv.contourArea(a) - cv.contourArea(b));

          console.log(contoursFrame.size());

          //Two dimensional array with index of contour and area for it,
          //later on we sort the array by area and access the first element,
          //which will be the test sheet square
          var listOfIndexesWithArea = [];

          let poly = new cv.MatVector();
          //Searching for four corner contours
          for(var i = 0; i < contoursFrame.size(); i++){
            var currentContour = contoursFrame.get(i);
            //Checking for closed curves (true param)
            let perimeter = cv.arcLength(currentContour, true);
            //console.log("perimeter: " + perimeter);
            //Polygon approximation
            let approxPoly = new cv.Mat();
            let approximation = cv.approxPolyDP(currentContour, approxPoly, 3,true);
            poly.push_back(approxPoly);
            var valueForCurrentContour = new Array();
            valueForCurrentContour[0] = i;
            valueForCurrentContour[1] = cv.contourArea(currentContour, false);
            listOfIndexesWithArea.push(valueForCurrentContour);
            if(approximation){
            //We found a squared shape
              if(approximation.size() == 4){
                mainSquareish = currentContour;
                console.log("four eyes");
                break;
              }
            }
          }

          for (let i = 0; i < contoursFrame.size(); ++i) {
                let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
                cv.drawContours(frameForApproximations, poly, i, color, 1, 8, hierarchy, 0);
          }


          listOfIndexesWithArea.sort(sortByArea);

          function sortByArea(a,b){
            return b[1] - a[1];
          }

          console.log(listOfIndexesWithArea);

          cv.drawContours(dstForBlur, contoursFrame,listOfIndexesWithArea[0][0], color, 1, 8, hierarchy, 0);

        }

        else{
          console.log("no contours found");
        }


        cv.imshow('canvasOutput', frameForBiggestContour);
        setTimeout(processVideo, delay);

    } catch (err) {
        console.log("error during processing");
        console.log(err);
    }
};

/*

the call on processVideo should be:
// Find Contours
const contours = new cv.MatVector();
const hierarchy = new cv.Mat();
const thresholded = makeColorMask(img)
cv.findContours(thresholded, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);


function makeColorMask(img){

  const blackUpperBound = hue => new cv.Vec(hue, 0.8 * 255, 0.6 * 255); // change this values
  const blackLowerBound = hue => new cv.Vec(hue, 0.1 * 255, 0.05 * 255); // change this values

  const makeColorMask = (img) => {
    // filter by color
    const imgHLS = img.cvtColor(cv.COLOR_BGR2HLS);
    const rangeMask = imgHLS.inRange(BlackLowerBound(80), blackUpperBound(140)); // change this values

    // remove noise
    const blurred = rangeMask.blur(new cv.Size(10, 10));
    const thresholded = blurred.threshold(
      200,
      255,
      cv.THRESH_BINARY
    );

    return thresholded;
  };

}
*/


// To execute before the camera is started
//tosetTimeout(processVideo, 0);
