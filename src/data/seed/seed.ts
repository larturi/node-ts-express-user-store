import { envs } from '../../config'
import { MongoDatabase, CategoryModel, ProductModel, UserModel } from '../mongo'
import { seedData } from './data'
;(async () => {
  MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL
  })

  await main()

  await MongoDatabase.disconnect()
})()

const randomBetween0AndX = (x: number) => {
  return Math.floor(Math.random() * x)
}

async function main() {
  // Borrar todo
  await Promise.all([
    UserModel.deleteMany(),
    CategoryModel.deleteMany(),
    ProductModel.deleteMany()
  ])

  // Crear Users
  const users = await UserModel.insertMany(seedData.users)

  // Creart Categories
  const categories = await CategoryModel.insertMany(
    seedData.categories.map((category) => {
      return {
        ...category,
        user: users[randomBetween0AndX(seedData.users.length - 1)]._id
      }
    })
  )

  // Crear Products
  const products = await ProductModel.insertMany(
    seedData.products.map((product) => {
      return {
        ...product,
        user: users[randomBetween0AndX(seedData.users.length - 1)]._id,
        category:
          categories[randomBetween0AndX(seedData.categories.length - 1)]._id
      }
    })
  )

  console.log('Seed ok!')
  console.log(`Total Categories: ${categories.length}`)
  console.log(`Total Users: ${users.length}`)
  console.log(`Total Products: ${products.length}`)
}
