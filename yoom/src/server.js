/*
socket == 브라우저
ws == 웹 소켓 서버
ws.on("connect, 함수") == 각 브라우저와 연결된 서버 동작 정의
*/
import express from "express"
import http from "http"
import {Server} from "socket.io"//import WebSocket from "ws"
import { instrument } from "@socket.io/admin-ui";//import SocketIO from "socket.io"

const app = express();
//nodeJS
app.set('view engine', 'pug');//view 엔진을 pug로 설정
app.set('views', __dirname + '/views');//Express 템플릿 설정(views 폴더에 뷰에 해당하는 css js 가 들어감)
app.use('/public', express.static(__dirname + '/public'));//public url을 생성해 유저에게 공유(frontend 에서 보여줄 js)
app.get('/', (req, res) => res.render('home'));//route handler('/'로 접속하면 home 화면으로 다이렉트)
app.get('/*', (req, res) => res.redirect('/'));//어떤 경로로 접속하던 / -> home 으로


const handleListen = () => console.log(`Listening on http://localhost:3000 and ws://localhost:3000`);
//app.listen(3000, handleListen);

const httpServer = http.createServer(app);//http 서버 생성
//const wss = new WebSocket.Server({server});//webSoket 서버 
//const wsServer = SocketIO(httpServer);//socket.io 서버
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
})
instrument(wsServer, {
    auth: false
})

/*
function handleConnetion(socket){//socket은 연결된 브라우저를 의미
    console.log(socket);
}
wss.on("connection", handleConnetion);
//연결이벤트, function, socket:메시지 주고받는 통로(객체) backend에 연결된 사람의 정보(브라우저) 제공해줌
*/


// const sockets = [];//socket(개별 브라우저)들 모아두는 DB 라고 생각하자

// wss.on("connection", (socket) => {//socket 객체를 통해 누가 접속했는지 암 wss 객체는 웹소켓 서버 전체를 의미
//     sockets.push(socket);//브라우저 정보 모아두기(다른 소켓(브라우저)에 메시지 보내주기 위함)
//     socket["nickname"] = "Anonymous";//socket 객체에 key값 추가 가능함(로그인할때 닉네임 안정한 사람은 Ann으로 뜨게)
//     console.log("connected to server");
//     socket.on("close", () => console.log("disconnected from browser"));//브라우저가 꺼졌는지 추적
//     /*
//     socket.on("message", message => {
//         console.log(message.toString('utf8'));
//     });//브라우저가 서버로 메시지를 보냈을때 listener
//     */
//     socket.on("message", msg => {
//         const message = JSON.parse(msg);//메시지 타입 구분 가능(별명, 메시지)
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload.toString()}`));//DB에 있는 모든 소캣을 aSocket에 담고 send 함(브토드케스트)
//             case "nickname":
//                 socket["nickname"] = message.payload;//socket객체에 nickname key를 추가해 브라우저로부터 온 message.payload를 쓴다.
//                 //message = {type:별명, 메시지, payload: 데이터}
//                 //nickname을 지정하면 Anonymous 에서 payload로 덮어씌워지기 됨 socket객체(브라우저)가 disconnect 되지 않는한 유지(disconnect 하면 sockets 배열에서 빼줘야할거 같은데)
//         }
//         //socket.send(message.toString());
//     });//브라우저가 서버로 메시지를 보냈을때 listener, 브라우저 메시지 그대로 다시 브라우저로, 서버 - 브라우저 1:1 관계만 연결되어있음

//     socket.send("hello");//브라우저로 hello 메시지 보냄
// });//매번 새로운 브라우저가 서버로 접속했을때 각 브라우저에 이 동작을 함(이벤트 리스너 주르륵)
// //이 코드를 안해줘도 됨 기본적으로 on connection 이 정의되어있음

//---------------------------------------------------------------------------
// //채팅룸
// function publicRooms(){
//     const {
//         sockets: {
//             adapter:{sids, rooms},
//      },
//     } = wsServer;//wsServer.sockets.adapter로부터 sids와 rooms 정보를 가져옴
//     const publicRooms = [];
//     rooms.forEach((_, key)=>{//가져온 room 정보로 publicroom인 경우에만 push 하도록 함
//         if(sids.get(key) === undefined){//sids에 rooms에 있는 key값이 없으면 publicroom임
//             publicRooms.push(key);
//         }
//     });
//     return publicRooms;
//     // const sids = wsServer.sockets.adapter.sids;
//     // const rooms = wsServer.sockets.adapter.rooms;
// }

// function countRoom(roomName){//방에 참여자 수 세기
//     return wsServer.sockets.adapter.rooms.get(roomName)?.size;
// }

// wsServer.on("connection", socket => {
//     //wsServer.socketsJoin("announcement");// socket 하나하나가 아니라 전체 서버에 announcement 방으로 들어감
//     socket["nickname"] = "Anonymous"; // 초기 별명 설정
//     socket.onAny((event)=>{//모든 이벤트들이 발생했을 때 동작함
//         //console.log(wsServer.sockets.adapter);
//         console.log(`socket Event : ${event}`);
//     });

//     socket.on("enter_room", (roomName, done) => {
//         socket.join(roomName);// room에 접속
//         done();//브라우저에서 인자로 넘겨준 showRoom 함수를 동작하게 함(브라우저에서 동작함 백엔드에서 동작 안함)
//         socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
//         wsServer.sockets.emit("room_change", publicRooms());//enter_room할때 모든 방(wsServer)에 방이 생성되었다고 알림 단 publicroom인 경우에만
//     });//브라우저에서 보내는 emit(이벤트이름, 실행할 함수)

//     socket.on("disconnecting", ()=>{//사용자가 접속을 종료할때(socket io 정의 이벤트)
//         socket.rooms.forEach((room)=> socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1));//socket.rooms 모든 방에 bye를 emit함(전송함)
//         //아직 완전하게 종료하지 않아서 count -1을 해줘야 함 (내가 포함된 숫자가 나올테니까)
//     });

//     socket.on("disconnect", () =>{//완전히 접속을 끊었을때
//         wsServer.sockets.emit("room_change", publicRooms());
//     })

//     socket.on("new_message", (msg, room, done) => {
//         socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);//브라우저로 new_message 에 payload:msg 를 보낸다
//         done();
//     });

//     socket.on("nickname", nickname => {socket["nickname"] = nickname;});//별명 설정

// });//브라우저에서 오는 connection 받기

wsServer.on("connection", socket =>{
    socket.on("join_room", (roomName) => {//roomName에 참여
        socket.join(roomName);
        socket.to(roomName).emit("Welcome");
    });
    socket.on("offer", (offer, roomName)=>{
        socket.to(roomName).emit("offer", offer);
    });//이렇게 하면 들어온 브라우저(socket)에게만 가는데 왜냐하면 socket io는 나를 제외한 모든 방 참여자에게 보내기 때문
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })

});

httpServer.listen(3000, handleListen);

