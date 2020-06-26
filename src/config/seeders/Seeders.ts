import { Request, Response } from 'express'
import bcrypt, { hash } from 'bcrypt'

import Package from '../../app/models/Package';
import User from '../../app/models/User';
import Company from '../../app/models/Company';
class Seeders {
    async mainSeeder(req: Request, res: Response ) {
        
        try {
            const packages = await Package.create([
                {
                    package_name: 'Free Package',
                    product_limit: 10,
                    link_limit: 3,
                    custom_logo: false,
                    analytics_power: false
                },
                {
                    package_name: 'Premium Package',
                    product_limit: -1,
                    link_limit: 5,
                    custom_logo: true,
                    analytics_power: true
                }
            ])
    
            const hashedPassword = await bcrypt.hash('password', parseInt(process.env.SALT_ROUND as string))
    
            const user = await User.create([
                {
                    email: 'jungrama.id@gmail.com',
                    password: hashedPassword, 
                    id_package: packages[0]._id,
                    type: 'seller',
                    token_verification: null,
                    token_reset_password: null
                }
            ])
    
            await Company.create([
                {
                    id_user: user[0]._id
                }
            ])
    
            res.status(200).send({ message: 'seeder success!' })
        } catch (error) {
            res.status(500).send({ message: 'seeder failed!' })
        }
        
    }
}

export default new Seeders