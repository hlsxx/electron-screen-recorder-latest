const { writeFile } = require('fs');
const electron = require('electron');

const electronRemote = process.type === 'browser'
  ? electron
  : require('@electron/remote')
;

const { desktopCapturer, Menu, dialog } = electronRemote;

const videoSelectBtn = document.getElementById('videoSelectBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoElement = document.getElementById('video');
const sourceNotSelectedText = document.getElementById("sourceNotSelectedText");
const closeVideoShareBtn = document.getElementById("closeVideoShareBtn");

async function getVideoSources() {
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => {
          selectSource(source);
        }
      };
    })
  );

  videoOptionsMenu.popup();
}

videoSelectBtn.onclick = getVideoSources;

let mediaRecorder;
const recordedChunks = [];

async function selectSource(source) {
  videoElementToggle(true);
  startRecordingBtnToggle(true);
  closeVideoShareBtnToggle(true);
  
  sourceNotSelectedText.style.display = "none";

  videoSelectBtn.innerText = source.name;

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };


  const stream = await navigator.mediaDevices
    .getUserMedia(constraints)
  ;

  videoElement.srcObject = stream;
  videoElement.play();


  const options = { mimeType: 'video/webm; codecs=vp9' };
  mediaRecorder = new MediaRecorder(stream, options);


  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.onstop = handleStop;
}

startBtn.onclick = () => {
  mediaRecorder.start();
  startBtn.className = "btn btn-danger";
  startBtn.innerText = "Recording";
  startBtn.setAttribute("disabled", "");
  videoSelectBtn.setAttribute("disabled", "");
  closeVideoShareBtn.setAttribute("disabled", "");

  stopRecordingBtnToggle();
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.className = "btn btn-success";
  startBtn.innerHTML = "<i class=\"fa-solid fa-play\"></i> Start recording";
  startBtn.removeAttribute("disabled");
  videoSelectBtn.removeAttribute("disabled");
  closeVideoShareBtn.removeAttribute("disabled");

  stopRecordingBtnToggle();
};

closeVideoShareBtn.onclick = () => {
  videoElement.removeAttribute('src');
  videoElement.load();

  startRecordingBtnToggle();
  closeVideoShareBtnToggle();
  sourceSelectedToggle();
  videoElementToggle();
  videoSelectBtn.innerHTML = "<i class=\"fa-solid fa-desktop\"></i> Share screen";
}

function handleDataAvailable(e) {
  console.log('video data available');
  recordedChunks.push(e.data);
}

async function handleStop(e) {
  const blob = new Blob(recordedChunks, {
    type: 'video/webm; codecs=vp9'
  });

  const buffer = Buffer.from(await blob.arrayBuffer());

  const { filePath } = await dialog.showSaveDialog({

    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  });

  console.log(filePath);

  writeFile(filePath, buffer, () => console.log('video saved successfully!'));
}

function elementToggle(element, display = null) {
  if (display === true || element.style.display == "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
}

function sourceSelectedToggle(display = null) {
  elementToggle(sourceNotSelectedText, display);
}

function closeVideoShareBtnToggle(display = null) {
  elementToggle(closeVideoShareBtn, display);
}

function videoElementToggle(display = null) {
  elementToggle(videoElement, display);
}

function startRecordingBtnToggle(display = null) {
  elementToggle(startBtn, display);
}

function stopRecordingBtnToggle(display = null) {
  elementToggle(stopBtn, display);
}



