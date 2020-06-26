import mongoose from 'mongoose'
const Scheme = mongoose.Schema

const UserScheme = new Scheme({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true  
    },
    id_package: {
        type: Scheme.Types.ObjectId,
        ref: 'package'
    },
    type: {
        type: String,
        enum: ['seller'],
        required: true  
    },
    token_verification: {
        type: String,
        default: null
    },
    token_reset_password: {
        type: String,
        default: null
    },
},
    { timestamps: true }
)

interface IUser extends mongoose.Document {
    email: string,
    password: string,
    id_package: string,
    type: string,
    token_verification: any,
    token_reset_password: any,
}

const model = mongoose.model<IUser>('User', UserScheme)
model.createCollection()

export default model