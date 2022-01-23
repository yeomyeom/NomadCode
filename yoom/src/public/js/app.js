/* 여기의 socket은 서버를 의미함 */
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
/*
setTimeout(() =>{
    socket.send("hello from browser!");
}, 10000);//브라우저에서 서버로 메시지 보냄
*/

function handleSubmit(event){
    event.preventDefault();
    const input = messageForm.querySelector("input");
    //socket.send(input.value);//브라우저에서 작성한 내용을 서버로 전송
    socket.send(makeMessage("new_message", input.value));
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