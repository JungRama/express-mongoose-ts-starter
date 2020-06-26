// LIBRARY & HELPERS
import { Request, Response } from 'express'
import BaseController from '../base/BaseController'
import Joi from 'joi'

// MODEL
import User from '../models/User'
import Company from '../models/Company'
import Package from '../models/Package'

class UserController extends BaseController {
    /* ------------------------------- CHECK USER ------------------------------- */
    checkUser = async(req: Request, res: Response) => {
        const user = await User.findById(res.locals.id_user)
        const packages = await Package.findById(user?.id_package)
        const company = await Company.findOne({ id_user: res.locals.id_user }).exec()

        this.returnResponse(res, 200, true, "Success get data!", {
            email: user?.email,
            is_verified: user?.token_verification == null ? true : false,
            package_name: packages?.package_name,
            company: company,
        })
    }

    /* ------------------------------- UPDATE COMPANY ------------------------------- */
    updateCompany = async(req: Request, res: Response) => {
        const schema = Joi.object().keys({
            name: Joi.string().max(40).required(),
            page_link: Joi.string().max(30).required(),
            email: Joi.string().email().max(50),
            phone: Joi.string().max(20),
            description: Joi.string().max(255),
        })

        try {
            this.validateData(res, req.body, schema)

            const company = await Company.findOne({ id_user: res.locals.id_user }).exec()
            if(company){
                company.name = req.body.name
                company.page_link = req.body.page_link
                company.email = req.body.email
                company.phone = req.body.phone
                company.description = req.body.description
                company.save()
                this.returnResponse(res, 200, true, "Success updated company data!")
            }
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

}

export default new UserController()
