import mongoose from 'mongoose'
const Scheme = mongoose.Schema

const CompanyScheme = new Scheme({
    id_user: {
        type: Scheme.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    name: {
        type: String,
    },
    page_link: {
        type: String,
    },
    logo: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    description: {
        type: String,
    },
    config: {
        type: Object,
    }
},
    { timestamps: true }
)

interface ICompany extends mongoose.Document {
    id_user: any,
    name: string,
    page_link: string,
    logo: string,
    email: string,
    phone: string,
    description: string,
    config: object
};

const model = mongoose.model<ICompany>('Company', CompanyScheme)
model.createCollection()

export default model