import express from "express"
import http from "http"
import WebSocket from "ws"

const app = express();
//nodeJS
app.set('view engine', 'pug');//view 엔진을 pug로 설정
app.set('views', __dirname + '/views');//Express 템플릿 설정(views 폴더에 뷰에 해당하는 css js 가 들어감)
app.use('/public', express.static(__dirname + '/public'));//public url을 생성해 유저에게 공유(frontend 에서 보여줄 js)
app.get('/', (req, res) => res.render('home'));//route handler('/'로 접속하면 home 화면으로 다이렉트)
app.get('/*', (req, res) => res.redirect('/'));//어떤 경로로 접속하던 / -> home 으로


const handleListen = () => console.log(`Listening on http://localhost:3000 and ws://localhost:3000`);
//app.listen(3000, handleListen);

const server = http.createServer(app);//http 서버 생성
const wss = new WebSocket.Server({server});//webSoket 서버 

function handleConnetion(socket){//socket은 연결된 브라우저를 의미
    console.log(socket);
}

wss.on("connection", handleConnetion);
//연결이벤트, function, socket:메시지 주고받는 통로(객체) backend에 연결된 사람의 정보(브라우저) 제공해줌

server.listen(3000, handleListen);

