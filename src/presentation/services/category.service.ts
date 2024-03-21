import { CategoryModel } from '../../data/mongo/models/category.model'
import {
  CreateCategoryDto,
  CustomError,
  PaginationDto,
  UserEntity
} from '../../domain'

export class CategoryService {
  constructor() {}

  async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {
    const categoryExists = await CategoryModel.findOne({
      name: createCategoryDto.name
    })

    if (categoryExists) {
      throw CustomError.badRequest('Category already exists')
    }

    try {
      const category = new CategoryModel({
        ...createCategoryDto,
        user: user.id
      })

      await category.save()

      return {
        id: category.id,
        name: category.name,
        available: category.available
      }
    } catch (error) {
      console.log(error)
      throw CustomError.internalServer('Internal server error')
    }
  }

  async getCategories(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto
    try {
      const [total, categories] = await Promise.all([
        await CategoryModel.countDocuments(),
        await CategoryModel.find()
          .skip((page - 1) * limit)
          .limit(limit)
      ])

      return {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          available: category.available
        })),
        page: page,
        limit: limit,
        total: total,
        next: `/api/categories?page=${page + 1}&limit=${limit}`,
        prev:
          page - 1 > 0
            ? `/api/categories?page=${page - 1}&limit=${limit}`
            : null
      }
    } catch (error) {
      throw CustomError.internalServer('Internal Server Error')
    }
  }
}
