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

const socket = io();//브라우저에서 서버로 연결 console에서 io 입력하면 함수 구현 코드가 보임

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

function backendDone(msg){
    console.log(`backend says : ` + msg);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    socket.emit("enter_room", {payload:input.value}, backendDone);//emit(event이름, dataobject(string이 아니여도 됨))
    //함수는 반드시 마지막 인자로 와야함 정의는 브라우저(프론트) 인자는 서버(백엔드)에서 줄 수 있음
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

