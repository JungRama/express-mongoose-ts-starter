import mongoose from 'mongoose'
const Scheme = mongoose.Schema

const PackageScheme = new Scheme({
    package_name: {
        type: String,
        required: true
    },
    product_limit: {
        type: Number,
    },
    link_limit: {
        type: Number,
    },
    custom_logo: {
        type: Boolean,
    },
    analytics_power: {
        type: Boolean,
    },
},
    { timestamps: true }
)

interface IPackage extends mongoose.Document {
    package_name: string,
    product_limit: number,
    link_limit: number,
    custom_logo: boolean,
    analytics_power: boolean
}

const model = mongoose.model<IPackage>('Package', PackageScheme)
model.createCollection()

export default model