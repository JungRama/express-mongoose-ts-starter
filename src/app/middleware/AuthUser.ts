import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const UserAuth = (req: Request, res: Response, next: NextFunction) => {

    if(!req.get('Authorization')){
        return res.status(401).send({ success: false, message: 'Not Authentication!'})
    }
    
    const token = req.get('Authorization')?.split(' ')[1]

    let decodeToken
    if(token) {
        try {
            decodeToken = <any>jwt.verify(token, process.env.JWT_KEY as string)
            res.locals.id_user = decodeToken.id_user
        } catch (error) {
            return res.status(401).send({ success: false, message: 'Not Authentication!'})
        }
    }

    next()
}

export default UserAuth