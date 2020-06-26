import mongoose from 'mongoose'
const Scheme = mongoose.Schema

const ProductImageScheme = new Scheme({
    id_product: {
        type: Scheme.Types.ObjectId,
        required: true,
        ref: 'product'
    },
    product_images: {
        type: Array,
        required: true  
    },
},
    { timestamps: true }
)

interface IProductImage extends mongoose.Document {
    id_product: any,
    product_images: string[],
}
    
const model = mongoose.model<IProductImage>('Product_Image', ProductImageScheme)
model.createCollection()

export default model