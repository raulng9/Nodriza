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

  const FPS = 30;
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
        let begin = Date.now();
        let delay = 1000/FPS - (Date.now() - begin);

        cap.read(src);

        let dstForBlur = new cv.Mat();
        let blurKernelSize = new cv.Size(3,3);

        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(src, dstForBlur, blurKernelSize, 0, 0, cv.BORDER_DEFAULT);

        let dstForFirstEdges = new cv.Mat();
        let firstEdgesFrame = cv.Canny(dstForBlur, dstForFirstEdges, 75, 200);
        cv.imshow('canvasOutput', dstForFirstEdges);
        setTimeout(processVideo, delay);

    } catch (err) {
        console.log("error during processing");
        console.log(err);
    }
};

// schedule the first one.
setTimeout(processVideo, 0);
