import { ProductModel } from '../../data/mongo/models/product.model'
import { CustomError, PaginationDto } from '../../domain'
import { CreateProductDto } from '../../domain/dtos/product/create-product.dto'

export class ProductService {
  constructor() {}

  async createProduct(createProductDto: CreateProductDto) {
    const productExists = await ProductModel.findOne({
      name: createProductDto.name
    })

    if (productExists) {
      throw CustomError.badRequest('Product already exists')
    }

    try {
      const product = new ProductModel(createProductDto)
      await product.save()

      return product
    } catch (error) {
      console.log(error)
      throw CustomError.internalServer('Internal server error')
    }
  }

  async getProducts(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto
    try {
      const [total, products] = await Promise.all([
        await ProductModel.countDocuments(),
        await ProductModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
          .populate(['user', 'category'])
      ])

      return {
        products: products,
        page: page,
        limit: limit,
        total: total,
        next: `/api/products?page=${page + 1}&limit=${limit}`,
        prev:
          page - 1 > 0 ? `/api/products?page=${page - 1}&limit=${limit}` : null
      }
    } catch (error) {
      throw CustomError.internalServer('Internal Server Error')
    }
  }
}
