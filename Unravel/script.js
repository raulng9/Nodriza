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

  const FPS = 10;
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
        let blurKernelSize = new cv.Size(3,3);
        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(src, dstForBlur, blurKernelSize, 0, 0, cv.BORDER_DEFAULT);

        //Edges
        let dstForFirstEdges = new cv.Mat();
        cv.Canny(dstForBlur, dstForFirstEdges, 75, 200);

        //Contours
        cv.threshold(dstForBlur, dstForBlur, 120,200, cv.THRESH_BINARY);

        let contoursFrame = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let dstForContours = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC1);
        let copyOfEdges = dstForBlur.clone();
        let convertedDst = cv.Mat.zeros(src.cols, src.rows, cv.CV_8UC1);
        let matForContours = new cv.Mat();
        //copyOfEdges.convertTo(matToConvert, cv.CV_8UC1);
        //Conversion to matrix format accepted by findContours()
        cv.cvtColor(copyOfEdges, matForContours, cv.COLOR_RGBA2GRAY);
        cv.findContours(matForContours, contoursFrame, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        //Contour drawing
        //let color = new cv.Scalar(255,0,0,255);
        for(let i = 0; i<contoursFrame.size();i++){
          let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
          cv.drawContours(matForContours, contoursFrame, i, color, 1, cv.LINE_8, hierarchy, 100);
          //console.log("color applied to contour");
        }

        let contoursBySize = [];

        //At least one contour was found
        if(contoursFrame.size() > 0){
          //Contour sorting by area (reversed)
          //contoursFrame.sort(function(a,b){ return cv.contourArea(a) - cv.contourArea(b);});

          //contoursBySize = contoursFrame.sort((a,b) => cv.contourArea(a) - cv.contourArea(b));
          console.log(contoursFrame.size());
          console.log(contoursFrame);
          //console.log(contoursFrame);
          //console.log(cv.contourArea(contoursFrame.get(0)));
        }
        else{
          console.log("esto ni de palo");
        }

        let contoursWithFourCorners = [];
        //Searching for four corner contours
        for(var i = 0; i < contoursFrame.size(); i++){
          var currentContour = contoursFrame.get(i);
          //Checking for closed curves (true param)
          let perimeter = cv.arcLength(currentContour, true);
          //Polygon approximation
          let approxCurve = new cv.Mat();
          let approximation = cv.approxPolyDP(currentContour, approxCurve, 0.02 * perimeter,true);
          if(approximation){
          if(approximation.size() == 4){
            contoursWithFourCorners.push(currentContour);
          }
        }
        }

        console.log("length of four corner contours: " + contoursWithFourCorners.length);


        //console.log(cv.contourArea(contoursFrame[0]));

        cv.imshow('canvasOutput', matForContours);
        setTimeout(processVideo, delay);

    } catch (err) {
        console.log("error during processing");
        console.log(err);
    }
};

// schedule the first one.
//tosetTimeout(processVideo, 0);
