import { Router } from 'express'
import {
  AuthRoutes,
  CategoryRoutes,
  ProductRoutes,
  FileUploadRoutes
} from './routes-exports'

export class AppRoutes {
  static get routes(): Router {
    const router = Router()

    router.use('/api/auth', AuthRoutes.routes)
    router.use('/api/categories', CategoryRoutes.routes)
    router.use('/api/products', ProductRoutes.routes)
    router.use('/api/upload', FileUploadRoutes.routes)

    return router
  }
}
