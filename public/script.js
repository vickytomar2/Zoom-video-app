const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
//console.log(videoGrid);
let myVideoStream;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, myVideoStream);
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on(
  "call",
  (call) => {
    call.answer(myVideoStream);
    const video = document.createElement("video");
    console.log("call");
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
  },
  function (err) {
    console.log("Failed to get local stream", err);
  }
);

peer.on("open", (id) => {
  console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  console.log("call sent");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

let text = $("input");
console.log(text);

$("html").keydown((e) => {
  if (e.which == 13 && text.val().length != 0) {
    console.log(text.val());
    socket.emit("message", text.val());
    text.val("");
  }
});

socket.on("createMessage", (message) => {
  $("ul").append(`<li class="message"><b>user</b></br>${message}</li>`);
  scrollToBottom();
});

const scrollToBottom = () => {
  let d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteOrUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  let html = `
        <i class="fas fa-microphone"></i>
             <span>Mute</span>
             `;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  let html = `
  <i class="unmute fas fa-microphone-slash"></i>
         <span>Unmute</span>
  `;
  document.querySelector(".main__mute__button").innerHTML = html;
};

const playStopVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayButton();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopButton();
  }
};

const setStopButton = () => {
  let htmls = `<i class="fas fa-video"></i>
             <span>Stop Video</span>`;
  document.querySelector(".main__video__button").innerHTML = htmls;
};

const setPlayButton = () => {
  let html = `<i class="stop fas fa-video-slash"></i><span>Play Video</span>`;
  document.querySelector(".main__video__button").innerHTML = html;
};
