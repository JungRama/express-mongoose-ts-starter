import { Router } from 'express'

abstract class BaseConfig {
    public router: Router

    constructor() {
        this.router = Router()
        this.routes()
    }

    abstract routes(): void
}

export default BaseConfig