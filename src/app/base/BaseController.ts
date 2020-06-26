import { Response } from "express";
import Joi from 'joi'

export default class BaseController {
    public returnResponse = <T>(res: Response, statusCode: number, success: boolean, message: T, data?: any): Response => {
        if(data){
            return res.status(statusCode).send({ success, message, data })
        }
        return res.status(statusCode).send({ success, message })
    }
    
    public validateData = <T>(res: Response, value: any, schema: Joi.Schema) => {
        Joi.validate(value, schema, (error) => {
            if(error){
                this.returnResponse(res, 400, false, error.details)
            }
        });
    }

    public uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}