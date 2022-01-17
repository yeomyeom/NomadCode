import express from "express"
const app = express();

app.set('view engine', 'pug');//view 엔진을 pug로 설정
app.set('views', __dirname + '/views');//Express 템플릿 설정(views 폴더에 뷰에 해당하는 css js 가 들어감)
app.use('/public', express.static(__dirname + '/public'));//public url을 생성해 유저에게 공유(frontend 에서 보여줄 js)

app.get('/', (req, res) => res.render('home'));//route handler('/'로 접속하면 home 화면으로 다이렉트)
const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);