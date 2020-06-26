// LIBRARY & HELPERS
import { Request, Response } from 'express'
import BaseController from '../base/BaseController'
import Mailer from '../../config/helpers/Mailer'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Joi from 'joi'

// MODEL
import User from '../models/User'
import Company from '../models/Company'
import Package from '../models/Package'

class AuthController extends BaseController {
    /* --------------------------------- SIGN IN -------------------------------- */
    signIn = async (req: Request, res: Response) => {
        const schema = Joi.object().keys({
            email: Joi.string().email().max(50).required(),
            password: Joi.string().min(8).max(50).required()
        })

        try {
            this.validateData(res, req.body, schema)

            const user = await User.findOne({ email: req.body.email }).exec()
            if(user) {
                // CHECK IF USER IS SELLER
                if(user.type != 'seller'){
                    return this.returnResponse(res, 401, false, "Your account is not for seller!")
                }

                // COMPARE PASSWORD
                const isEqual = await bcrypt.compare(req.body.password, user.password)
                if(!isEqual) {
                    return this.returnResponse(res, 401, false, "Your email or password does't match!")
                }
                // SIGN JWT TOKEN
                const token = await jwt.sign(
                    {
                        id_user: user._id.toString(),
                    }, 
                        process.env.JWT_KEY as string,
                    {
                        expiresIn: '1d'
                    }
                )
                // SEND THE TOKEN
                const company = await Company.findOne({ id_user: user._id }).exec()
                const packages = await Package.findById(user.id_package)

                this.returnResponse(res, 200, true, "Sign in success!", {
                    email: user.email,
                    is_verified: user.token_verification == null ? true : false,
                    token: token,
                    package_name: packages?.package_name,
                    company: company,
                })
            }else {
                return this.returnResponse(res, 401, false, "Your email or password does't match!")
            }
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* --------------------------------- SIGN UP -------------------------------- */
    signUp = async(req: Request, res: Response) => {
        const token_verification = this.uuidv4()
        const freePackage = await Package.findOne({ price: 0 }).exec()
        const hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUND as string))

        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            id_package: freePackage?._id,
            type: 'seller',
            token_verification,
            token_reset_password: null
        })

        const company = new Company({
            id_user: user._id
        })

        // VALIDATION
        const schema = Joi.object().keys({
            email: Joi.string().email().max(255).required(),
            password: Joi.string().min(8).max(50).required()
        })

        const session = await mongoose.startSession()
        session.startTransaction()
        try {
            this.validateData(res, req.body, schema)
            // CHECK FOR UNQUE EMAIL
            const checkEmail = await User.find({ email: req.body.email })
            if(checkEmail.length){
                throw new Error('Email already used, try another email!')
            }

            await user.save({ session })
            await company.save({ session })

            await this.sendVerificationEmail(req.body.email, token_verification)

            await session.commitTransaction();
            this.returnResponse(res, 200, true, "Success created new account!")
        } catch (error) {
            await session.abortTransaction();
            return this.returnResponse(res, 500, false, error.message)
        } finally {
            session.endSession();
        }
    }

    /* ----------------------------- FORGOT PASSWORD ---------------------------- */
    userVerification = async(req: Request, res: Response) => {
        const schema = Joi.object().keys({
            email: Joi.string().email().max(50).required()
        })

        try {
            /* ---------------------------- MAIL VERIFICATION --------------------------- */
            if(req.query.type == 'mail') {
                this.validateData(res, req.body, schema)
                const user = await User.findOne({ email: req.body.email })
                if(user && user.token_verification != null) {
                    await this.sendVerificationEmail(user.email, user.token_verification)
                    return this.returnResponse(res, 200, true, "Success sending your new email verification!")
                }else{
                    return this.returnResponse(res, 400, false, "User not found or user already verified!")
                }
            }

            /* --------------------------  USER VERIFICATION -------------------------- */
            if(req.query.token) {
                let user = await User.findOne({ token_verification: req.query.token }).exec()
                if(!user) {
                    return this.returnResponse(res, 400, false, "User not found!")
                }
                // SET TOKEN VERIFICATION
                user.token_verification = null
                await user.save()
                return this.returnResponse(res, 200, true, "Success verified user!")
            }else {
                return this.returnResponse(res, 400, false, "User with this token not found!")
            }

        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }
    }

    /* ---------------------------------- VERIFICATION EMAIL --------------------------------- */
    sendVerificationEmail = async(email: string, token_verification: string) => {
        return Mailer.sendEmail(
            undefined,
            email,
            `Email Verification`,
            `Welcome to ${process.env.APP_NAME}, verify your account now!`,
            `Please click the button below to verify your account`,
            'Verify Account',
            `${process.env.FRONT_APP_URL}?token=${token_verification}`,
        )
    }

    /* ---------------------------------- FORGOT PASSWORD --------------------------------- */
    userForgotPassword = async(req: Request, res: Response) => {
        const schemaEmail = Joi.object().keys({
            email: Joi.string().email().max(50).required()
        })

        const schemaChangePassword = Joi.object().keys({
            password: Joi.string().min(8).max(50).required()
        })

        try {
            /* -------------------------- MAIL FORGOT PASSWORD -------------------------- */
            if(req.query.type == 'mail'){
                this.validateData(res, req.body, schemaEmail)
                const user = await User.findOne({ email: req.body.email })
                if(user) {
                    user.token_reset_password = this.uuidv4()
                    await user.save()
                    
                    console.log(user.token_reset_password);
                    await Mailer.sendEmail(
                        undefined,
                        user.email,
                        `Change Password`,
                        `You requested to change your password!`,
                        `Please click the button below to change your password`,
                        'Change Password',
                        `${process.env.FRONT_APP_URL}/forgot-password?token=${user.token_reset_password}`,
                    )

                    return this.returnResponse(res, 200, true, "Success sending your forgot password mail!")
                }else{
                    return this.returnResponse(res, 500, false, "User not found!")
                }
            }

            /* --------------------------- CHECK AVAILABLE TOKEN -------------------------- */
            if(req.query.type == 'checker') {
                let user = await User.findOne({ token_reset_password: req.query.token }).exec()
                if(!user) {
                    return this.returnResponse(res, 400, false, "User not found!")
                }

                return this.returnResponse(res, 200, true, "User found!")
            }

            /* --------------------------  USER FORGOT PASSWORD -------------------------- */
            if(req.query.token) {
                this.validateData(res, req.body, schemaChangePassword)

                let user = await User.findOne({ token_reset_password: req.query.token }).exec()
                if(!user) {
                    return this.returnResponse(res, 400, false, "User not found!")
                }

                const hashedPassword = await bcrypt.hash(req.body.password, parseInt(process.env.SALT_ROUND as string))
                user.token_reset_password = null
                user.password = hashedPassword
                await user.save()

                return this.returnResponse(res, 200, true, "Success changed user password!")
            }else {
                return this.returnResponse(res, 400, false, "User with this token not found!")
            }
        } catch (error) {
            return this.returnResponse(res, 500, false, error.message)
        }

    }

}

export default new AuthController()