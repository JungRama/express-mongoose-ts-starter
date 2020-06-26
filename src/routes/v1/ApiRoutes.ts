import BaseConfig from '../RouteConfig'

// CONTROLLER
import AuthController from '../../app/controllers/AuthController'
import UserController from '../../app/controllers/UserController'
import LinkController from '../../app/controllers/LinkController'
import ProductController from '../../app/controllers/ProductController'

// SEEDER
import Seeder from '../../config/seeders/Seeders'

// MIDDLEWARE
import AuthUser from '../../app/middleware/AuthUser'

class ApiRoutes extends BaseConfig {
    public routes(): void {
        // SEEDER 
        this.router.get('/seeder', Seeder.mainSeeder)

        // AUTH
        this.router.post('/auth/sign-up', AuthController.signUp)
        this.router.post('/auth/sign-in', AuthController.signIn)
        this.router.post('/auth/verification', AuthController.userVerification)
        this.router.post('/auth/forgot-password', AuthController.userForgotPassword)
        
        // USER MANAGEMENT
        this.router.get('/user', AuthUser, UserController.checkUser)
        this.router.put('/user/company', AuthUser, UserController.updateCompany)

        // LINK MANAGEMENT
        this.router.get('/link', AuthUser, LinkController.index)
        this.router.post('/link', AuthUser, LinkController.create)
        this.router.put('/link/edit/:id', AuthUser, LinkController.update)
        this.router.delete('/link/delete/:id', AuthUser, LinkController.delete)
        this.router.put('/link/change-order', AuthUser, LinkController.changeOrder)
        
        // PRODUCT MANAGEMENT
        this.router.get('/product', AuthUser, ProductController.index)
        this.router.post('/product/create', AuthUser, ProductController.create)
        this.router.put('/product/edit/:id', AuthUser, ProductController.update)
        this.router.delete('/product/delete/:id', AuthUser, ProductController.delete)
        this.router.put('/product/change-order', AuthUser, ProductController.changeOrder)
    }
}

export default new ApiRoutes().router