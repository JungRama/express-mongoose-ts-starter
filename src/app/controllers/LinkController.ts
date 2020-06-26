// LIBRARY & HELPERS
import { Request, Response } from 'express'
import BaseController from '../base/BaseController'
import Joi from 'joi'

// MODEL
import User from '../models/User'
import Package from '../models/Package'
import Link from '../models/Link'

class LinkController extends BaseController {
    /* ------------------------------- INDEX ------------------------------- */
    index = async(req: Request, res: Response) => {
        const schema = Joi.object().keys({
            id_company: Joi.string().required(),
        })

        try {
            this.validateData(res, req.query, schema)

            const user = await User.findById(res.locals.id_user)

            if(user){
                const pacakgeData = await Package.findById(user.id_package)
                const link_limit = <number>pacakgeData?.link_limit

                const links = await Link.find({ 
                    id_company: req.query.id_company,
                    id_user: res.locals.id_user
                }).sort({ order: -1 }).exec()

                if(links){
                    return this.returnResponse(res, 200, true, "Success get data!", { limitLink: link_limit, links })
                }else{
                    return this.returnResponse(res, 400, false, "Data not found!")
                }
            }
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* ------------------------------- CREATE ------------------------------- */
    create = async(req: Request, res: Response) => {
        const schema = Joi.object().keys({
            id_company: Joi.string().required(),
            link_name: Joi.string().max(50).required(),
            link_url: Joi.string().uri().max(255).required()
        })

        try {
            this.validateData(res, req.body, schema)

            const user = await User.findById(res.locals.id_user)
            if(user) {
                const pacakgeData = await Package.findById(user.id_package)
                const link_limit = <number>pacakgeData?.link_limit
                const countAllLink:number = await Link.countDocuments({})
                const lastOrderLink = await Link.findOne({
                        id_company: req.body.id_company,
                        id_user: res.locals.id_user }
                    )
                    .sort({order: -1})
                    .exec(); 

                const createOrder = function(){
                    if(lastOrderLink?.order){
                        return lastOrderLink.order + 1
                    }else{
                        return 1
                    }
                }
                    

                if(link_limit == -1 || countAllLink < link_limit){
                    await Link.create({
                        id_user: res.locals.id_user,
                        id_company: req.body.id_company,
                        link_name: req.body.link_name,
                        link_url: req.body.link_url,
                        order: createOrder()
                    })
                    return this.returnResponse(res, 200, true, "Success created new link!")
                }else{
                    return this.returnResponse(res, 400, true, `The limit of using link for your account package is only ${link_limit}`)
                }
            }

            return this.returnResponse(res, 400, false, "User not found!")
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }
    
    /* ------------------------------- DELETE ------------------------------- */
    update = async(req: Request, res: Response) => {
        const schema = Joi.object().keys({
            link_name: Joi.string().max(50).required(),
            link_url: Joi.string().uri().max(255).required()
        })

        try {
            this.validateData(res, req.body, schema)

            await Link.findOneAndUpdate(
                { _id: req.params.id, id_user: res.locals.id_user }, 
                { 
                    link_name: req.body.link_name,
                    link_url: req.body.link_url
                }
            )
            return this.returnResponse(res, 200, true, "Success updated link!")

        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* ------------------------------- DELETE ------------------------------- */
    delete = async(req: Request, res: Response) => {
        try {

            await Link.findOneAndRemove({ _id: req.params.id, id_user: res.locals.id_user })
            return this.returnResponse(res, 200, true, "Success remove link!")

        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* ------------------------------- CHANGE ORDER ------------------------------- */
    changeOrder = async(req: Request, res: Response) => {
        try {
            const links = req.body.updatedData

            for await (const link of links) {
                await Link.findOneAndUpdate(
                    { _id: link.id }, 
                    {
                        order: link.order
                    }
                )
            }
            
            return this.returnResponse(res, 200, true, "Success update order link!")
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }
}

export default new LinkController()