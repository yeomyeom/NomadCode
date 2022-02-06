/* 여기의 socket은 서버를 의미함 */
/*
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);//소캣 열고

function makeMessage(type, payload){
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("connected to server");
});//브라우저와 서버가 연결 되었을때

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);//메시지를 화면에 ul li m.data로 보여줌

});//서버로부터 브라우저가 데이터를 받았을때

socket.addEventListener("close", () => {
    console.log("Disconnected from server");
});//서버가 죽었을때

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    //socket.send(input.value);//브라우저에서 작성한 내용을 서버로 전송
    socket.send(makeMessage("new_message", input.value));
    li.innerText = `You ${input.value}`;
    messageList.append(li);
    input.value = "";
}
function handleNickSubmit(event){
    event.preventDefault();
    const input = nickForm.querySelector("input");
    //socket.send(input.value);//message인지 nick 인지 구분이 안감
    socket.send(makeMessage("nickname", input.value));
}
messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
*/
//-----------------------------------------------------------------
/* //채팅룸
const socket = io();//브라우저에서 서버로 연결 console에서 io 입력하면 함수 구현 코드가 보임

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");//채팅방

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}//채팅창 메시지

function handleMessageSubmit(event){//채팅 메시지
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`you: ${value}`);
    });
    input.value = "";
}

function handleNicknameSubmit(event){//별명 
    event.preventDefault();
    const input = room.querySelector("#name input");
    const value = input.value;
    socket.emit("nickname", value);
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
}

function backendDone(msg){
    console.log(`backend says : ` + msg);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", input.value, showRoom);//emit(event이름, dataobject(string이 아니여도 됨))
    //함수는 반드시 마지막 인자로 와야함 정의는 브라우저(프론트) 인자는 서버(백엔드)에서 줄 수 있음
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} Joined`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left`);
});

socket.on("new_message", addMessage);//, (msg) => {addMessage(msg)} 와 같은 코드

socket.on("room_change", (rooms) => {// 방 목록 만들기
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    });
});
*/
const socket = io();

//welcome form(After join a room)
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const terminateBtn = document.getElementById("terminate");
const camearsSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName = '';
let myPeerConnection;
let myDataChannel;//datachannel 사용하기

async function getCameras(){
    try{
        const devices = await navigator.mediaDevices.enumerateDevices(); // 장치에 연결된 미디어 장비 ㅣ스트 생성
        const cameras = devices.filter((device) => device.kind === "videoinput")// 미디어 장치중 카메라만
        const currentCamera = myStream.getVideoTracks()[0];
        const option = document.createElement("option");
        if(cameras.length <= 0){
            option.disabled = true;
            option.value = '0'
            option.innerText = 'Video Disconnected'; 
            camearsSelect.appendChild(option);
        }else{
            cameras.forEach(camera => {
                option.value = camera.deviceId;
                option.innerText = camera.label;
                if(currentCamera.label == camera.label){
                    option.selected = true;
                }
                camearsSelect.appendChild(option);
            });
        }
    }catch(e){
        console.log(e);
    }
}

async function getMedia(deviceId){
    const initialConstrains={
        audio: true,
        video: {facingMode: "user"},
    };
    const cameraConstrains = {
        audio: true,
        video: {deviceId : {exact: deviceId}},
    };//정확히 그 deviceId를 찾음 만약 그냥 deviceId 라고 하면 다른 장비로 보여줄 것임
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstrains : initialConstrains,
        );
        myFace.srcObject = myStream;
        if(!deviceId){//카메라ID가 없으면 목록을 가져옴
            await getCameras();
        }
    }catch(e){
        console.log(e);
    }
}//navigator.mediaDevices.getUserMedia는 유저의 유저미디어 string을 줌

function handleMuteClick(){
    myStream.getAudioTracks()
        .forEach(track => track.enabled = !track.enabled);//enable속성 false true 전환
    //track(getAutioTracks에서 보내준 오디오 장치 목록을 받은 인자)의 enable 속성은
    //readOnly라서 이렇게 바꿔야 한다.(참고로 forEach로 한 이유는 모든 오디오 장비를 음소거하기 위함) 
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else{
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick(){
    myStream.getVideoTracks()
        .forEach(track => track.enabled = !track.enabled);//enable속성 false true 전환
    if(cameraOff){
        cameraBtn.innerText = "Turen Camera Off"
        cameraOff = false;
    }else{
        cameraBtn.innerText = "Turen Camera On"
        cameraOff = true;
    }

}
async function handleCameraChange(){
    await getMedia(camearsSelect.value);//select에서 선택된 카메라의 ID 값 새로운 stream을 생성함
    if(mypeerConnection){//카메라를 전환했을때 바뀐 stream으로 보내주기 sender 속성 이용
        const videoTrack = myStream.getVideoTracks()[0];//나 자신의 stream(내 PC 카메라)
        const videoSender = myPeerConnection.getSenders()//새롭게 바뀐 stream
            .find((sender) => sender.track.kind === "video");//카메라(video stream만 보내주기 위함)
        videoSender.replaceTrack(videoTrack);//새롭게 바뀐 stream 중 video만 적용한다.
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
terminateBtn.addEventListener("click", () => {window.location.reload()});
camearsSelect.addEventListener("input",handleCameraChange);


//welcome form(Before join a room)
const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

//Peer[A]
async function initCall(){
    welcome.hidden = true;//방 참여하는 프론트 없앰
    call.hidden = false;//화상 프론트 활성화
    await getMedia();//화상 채팅 기능 활성화
    makeConnection();//브라우저끼리 연결 만들기
}

async function handleWelcomSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();//emit join_room 할때 같이 보내지 않는 이유는 너무 빨리 일어나서 
    //myPeerConnection이 연결(offer)을 받았을때 생성이 안 되어있기 때문에 미리 실행해 놓기 위함
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomSubmit);

//Peer[A]
socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event)=>{
        console.log(event.data);
    });
    const offer = await myPeerConnection.createOffer();//3.[A]createOffer()
    myPeerConnection.setLoalDescription(offer);//4.[A]setLoalDescription()
    console.log("Send offer");
    socket.emit("offer", offer, roomName);//offer는 일종의 초대장이라 생각하면됨
});//누군가 새로 들어왔을 때 WebRTC의 3, 4단계를 진행함

//Peer[B]
socket.on("offer", async (offer) =>{
    myPeerConnection.addEventListener("datachannel", (event)=>{
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message",(event)=>{
            console.log(event.data);
        });
    });
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);//5.[B]SetremoteDescription()
    const answer = await myPeerConnection.createAnswer();//8.[B]createAnswer() 6,7은 [A]도 getUserMedia addStream 이 되어있기 때문
    myPeerConnection.setLoalDescription(answer);//9.[B]setLoalDescription()
    socket.emit("answer", answer, roomName);//offer에 대한 답변
    console.log("Send answer");
});

//Peer[A]
socket.on("answer", answer =>{
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);//10.[A]SetremoteDescription()
});

//Peer[B]
socket.on("ice", ice => {
    console.log("received ice candidate");
    myPeerConnection.addICECandidate(ice);//12.[B]addICECandidate() 필요한 모든 정보 교환 종료
});

//Peer[A]
function makeConnection(){
    myPeerConnection = new RTCPeerConnection({
        iceServers: [//구글에서 무료로 제공해주는 stun server 목록 만약 전문적으로 한다면 개인 stunserver를 가져야함
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      });//1.[A]getUserMedia()

    //밑에 event listener는 모두 브라우저API에서 제공한다.
    myPeerConnection.addEventListener("icecandidate", handleIce);//11.[A]icecandidate event fired하기 위한 리스너 생성
    myPeerConnection.addEventListener("addStream", handleAddStream);//15.[A] [B]에서 온 stream 받기 위한 리스너 생성
    //myPeerConnection.addEventListener("track", handleTrack);//15.[A] 위와 같지만 safari에서는 제공을 안해 track 이벤트를 addstream 대신 사용
    myStream.getTracks()
        .forEach(track => myPeerConnection.addTrack(track, myStream));//2.[A]addStream() peerconnection에 stream 추가
    }

function handleIce(data){
    socket.emit("ice", data.candidate, roomName);//11.5.[server] send Candidate
    console.log("start icecandidate handler & sent candidate");
}

function handleAddStream(data){
    const peersStream = document.getElementById("peerFace");
    console.log("got an stream from my peer");//15.[A] [B]에서 온 stream 받기(data.stream)
    peersStream.srcObject = data.stream;
}

function handleTrack(data){
    console.log("handle track");
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream[0];
}


