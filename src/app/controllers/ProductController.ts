// LIBRARY & HELPERS
import { Request, Response } from 'express'
import BaseController from '../base/BaseController'
import Joi from 'joi'

// MODEL
import User from '../models/User'
import Package from '../models/Package'
import Product from '../models/Product'

import ManageFile from '../../config/helpers/ManageFile'

const BUCKET_PRODUCT = 'catalogistic-products'

class ProductController extends BaseController {
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
                const product_limit = <number>pacakgeData?.product_limit

                const products = await Product.find({ 
                    id_company: req.query.id_company,
                    id_user: res.locals.id_user
                }).sort({ order: -1 }).exec()

                if(products){
                    return this.returnResponse(res, 200, true, "Success get data!", { limitProduct: product_limit, products })
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
            product_title: Joi.string().max(50).required(),
            product_description: Joi.string().max(255).required(),
            product_price: Joi.number().required(),
            product_link: Joi.string().uri().max(255).required(),
        })

        try {
            this.validateData(res, req.body, schema)

            const user = await User.findById(res.locals.id_user)
            if(user) {
                const pacakgeData = await Package.findById(user.id_package)
                const product_limit = <number>pacakgeData?.product_limit
                const countAllLink: number = await Product.countDocuments({})
                const lastOrderProduct = await Product.findOne({
                        id_company: req.body.id_company,
                        id_user: res.locals.id_user }
                    )
                    .sort({order: -1})
                    .exec(); 

                const createOrder = function(){
                    if(lastOrderProduct?.order){
                        return lastOrderProduct.order + 1
                    }else{
                        return 1
                    }
                }

                if(product_limit == -1 || countAllLink < product_limit){
                    if(req.files?.product_images){
                        let index = 0
                        let all_products_images = []

                        for await (const image of req.files.product_images) {
                            try {
                                if(image.size > 3*1000000){
                                    return this.returnResponse(res, 400, true, 'Limit of image size upload is 3MB')
                                }
                                
                                const fileType = image.name.split('.').pop();
                                const fileName = new Date().toISOString() + '-' + req.body.product_title + '-' + index++ + '.' + fileType
                                const imageUrl = await ManageFile.uploadFile(image, fileName, BUCKET_PRODUCT)
                                all_products_images.push(imageUrl)
                            } catch (error) {
                                return this.returnResponse(res, 500, false, error)
                            }
                        }

                        const product = new Product({
                            id_user: res.locals.id_user,
                            id_company: req.body.id_company,
                            product_title: req.body.product_title,
                            product_description: req.body.product_description,
                            product_price: req.body.product_price,
                            product_link: req.body.product_link,
                            product_images: all_products_images,
                            order: createOrder()
                        })
    
                        await product.save()
                    }else {
                        return this.returnResponse(res, 400, false, 'Product image is required!')
                    }

                    return this.returnResponse(res, 200, true, "Success created new product!")
                }else{
                    return this.returnResponse(res, 400, true, `The limit of using product for your account package is only ${product_limit}`)
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
            product_title: Joi.string().max(50).required(),
            product_description: Joi.string().max(255).required(),
            product_price: Joi.number().required(),
            product_link: Joi.string().uri().max(255).required(),
        })

        try {
            this.validateData(res, req.body, schema)

            await Product.findOneAndUpdate(
                { _id: req.params.id, id_user: res.locals.id_user }, 
                { 
                    product_title: req.body.product_title,
                    product_description: req.body.product_description,
                    product_price: req.body.product_price,
                    product_link: req.body.product_link
                }
            )
            return this.returnResponse(res, 200, true, "Success updated product!")

        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* ------------------------------- DELETE ------------------------------- */
    delete = async(req: Request, res: Response) => {
        try {
            const product = await Product.findOne({ _id: req.params.id, id_user: res.locals.id_user })
            
            if(product?.product_images){
                for await (const image of product?.product_images) {
                    await ManageFile.deleteFile(image, BUCKET_PRODUCT)
                }
                product.remove()
            }else{
                return this.returnResponse(res, 400, false, 'Product image not found!')
            }

            return this.returnResponse(res, 200, true, "Success remove product!")
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* ------------------------------- CHANGE ORDER ------------------------------- */
    changeOrder = async(req: Request, res: Response) => {
        try {
            const products = req.body.updatedData

            for await (const product of products) {
                await Product.findOneAndUpdate(
                    { _id: product.id },
                    {
                        order: product.order
                    }
                )
            }
            
            return this.returnResponse(res, 200, true, "Success update order product!")
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }
}

export default new ProductController()
