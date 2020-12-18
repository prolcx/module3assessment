//imports
const morgan = require('morgan')
const express = require('express')
const multer = require('multer')
const AWS = require('aws-sdk')
const fs = require('fs')
const mysql = require('mysql2/promise')
const secureEnv = require('secure-env')
const bodyParser = require('body-parser')
const sha1 = require('sha1')


//mongo seteup
const MongoClient = require('mongodb').MongoClient
const { nextTick } = require('process')
const MONGO_URL = 'mongodb://localhost:27017'
const mongoClient = new MongoClient(MONGO_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})

//mongo database setup
const DATABASE = 'daily'
const COLLECTION = 'daily'


//my sql crendential
global.env = secureEnv({secret: 'secretPassword'})
const pool = mysql.createPool({
    host: global.env.MYSQL_SERVER,
    port: global.env.MYSQL_SVR_PORT,
    user: global.env.MYSQL_USERNAME,
    password: global.env.MYSQL_PASSWORD,
    database: global.env.MYSQL_SCHEMA,
    connectionLimit: global.env.MYSQL_CON_LIMIT
})


//configure express
const app = express()
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json({limit: '50mb'}))


//configure multer
const upload = multer({
    dest: process.env.TMP_DIR || '/opt/tmp/uploads'
})


//configure s3
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('sfo2.digitaloceanspaces.com'),
    accessKeyId: global.env.ACCESS_KEY,
    secretAccessKey: global.env.SECRET_ACCESS_KEY
})  

//setup PORT
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000


//SQL Queries
const queryLogin = 'select * from user where user_id = ?'

//Processing SQL Queries
const makeQuery = (sql, pool) =>{
	console.log(sql)
	return (async (args)=>{
		const conn = await pool.getConnection()
		try{
			let results = await conn.query(sql, args || [])
			// console.log(results[0])
			return results[0]
		}catch(e){
			console.log(e)
		}finally{
			conn.release()
		}
	})
	}

//cloure function for queries
const getLogin = makeQuery(queryLogin, pool)


let username =''
let password =''

//mongoDB queries
const mkDaily = (params, image) =>{
    return {
        ts: new Date(),
		// user: username,
		// password: password,
        title: params.title,
        comments: params.comments,
        image
    }
}


//set up aws s3 promises for file read and image upload
const readFile = (path) => new Promise(
    (resolve, reject) => 
        fs.readFile(path, (err, imgBody)=>{
            if(null!=err)
                reject(err)
            else
                resolve(imgBody)
        })
    
)

const putObject = (file, imgBody, s3) => new Promise(
    (resolve, reject) => {
        const params = {
            Bucket: 'day4',
            Key: file.filename,
            Body: imgBody,
            ACL: 'public-read',
            ContentType: file.mimetype,
            ContentLength: file.size
        }
        s3.putObject(params, (error, result)=>{
            if(null!=error)
                reject(error)
            else
                resolve(result)
        })
    }
)


//Get for login process
app.post('/', (req, resp)=>{

	username = req.body.username
	password = sha1(req.body.password)
	
	getLogin(username).then((result)=>{
		console.log(result)
		resp.status(200)
		if(result[0].user_id== username && result[0].password == password){
			resp.status(200).json('ok')
		}
		else{
			resp.status(401)
			
			resp.json({message: 'Authentication failed'})
		}

	})
	.catch((e)=>{
		console.log('Username not found !')
		resp.status(401).json({message: 'Username not found'})
	})

	})

app.post('/daily',upload.single('upload'), (req, resp)=>{

	const doc = mkDaily(req.body, req.file.filename)
	
	console.log('>>> req.file: ', req.file)
	console.log('>>> req.file: ', req.body)
	
	readFile(req.file.path)
    .then(imgBody=>
        putObject(req.file, imgBody, s3)
    )
    .then(result=>
        mongoClient.db(DATABASE).collection(COLLECTION)
        .insertOne(doc)
    )
    .then(result =>{
		console.info('insert results: ', result)
		fs.unlink(req.file.path, ()=>{ })
        resp.status(200)
			resp.json({ id: result.ops[0]._id })
        
    })
    .catch(error=>{
        console.error('insert error: ', error)
        resp.status(500)
        resp.json({ error })
    })
})

app.use(express.static(__dirname + '/frontend'))

//test ping of my sql and mongo
const p0 = (async () => {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    return true
})()

const p1 = mongoClient.connect()

Promise.all([p0,p1])
.then(()=>{
    app.listen(PORT,()=>{
        console.info(`APP Started at ${PORT}`)
    })
})
.catch(err=>{ console.error('Cant connect to the port !!!!', err)})

