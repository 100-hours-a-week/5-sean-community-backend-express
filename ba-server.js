const express = require('express');
const app = express();
const port = 3001; 
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const MySQLStore = require('express-mysql-session')(session);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());

//db연결
const dbOptions = {
    host: 'localhost',
    port: 3306,
    user: 'junho',
    password: 'Qwerasdf1234!',
    database: 'community'
};0

const sessionStore = new MySQLStore(dbOptions);

// CORS 정책 설정: credentials 옵션과 함께 구체적인 도메인 지정
app.use(cors({
    origin: 'http://localhost:8080',  // 클라이언트 주소를 정확히 지정
    credentials: true,  // 자격증명 포함 허용
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type']
}));

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,  // 24시간
        httpOnly: true
    }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 여기서부터 라우트 설정
const postRoute = require("./router/postRouter")
app.use("/posts", postRoute);

const commentRoute = require("./router/commentRouter");  // 경로 및 변수명 확인
app.use("/comments", commentRoute);

const userRoute = require("./router/userRouter")
app.use("/users", userRoute)

//경로설정
app.use(express.static("../front/public"));

console.log("__dirname is:", __dirname);

//포트 연결 확인
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});