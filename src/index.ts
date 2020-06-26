import express, { Application, Request, Response } from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fileUpload from 'express-fileupload';
import morgan from 'morgan'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'

// ROUTER
import ApiRoutes from './routes/v1/ApiRoutes'
import AdminRoutes from './routes/v1/AdminRoutes'

class App {
    public app: Application

    constructor() {
        this.app = express()
        this.plugins()
        this.routes()
    }

    protected plugins(): void {
        // BODY PARSER
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({
            extended: false
        }))
        this.app.use(morgan('dev')) // APP LISTEN LOG
        this.app.use(compression()) // COMPRESS EVERY REQUEST
        this.app.use(fileUpload({ createParentPath: true })) // EXPRESS FILE UPLOAD

        // this.app.use(helmet()) // SECURE THE HEADER
        // this.app.use(cors()) // CROSS ORIGIN
    }

    protected routes(): void {
        this.app.use('/api/v1', ApiRoutes)
        this.app.use('/administrator', AdminRoutes)
    }
}

// CONFIG
dotenv.config()

// START MONGOOSE & APP
mongoose.connect(process.env.DB_ACCESS as string, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
.then(() => {
    const port: number = 3030 || process.env.PORT
    const app = new App().app
    app.listen(port)
    console.log(`App running on ${port}`);
}).catch(err => {
    throw new Error(err)
})