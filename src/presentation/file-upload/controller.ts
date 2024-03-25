import { Response, Request } from 'express'
import { CustomError } from '../../domain'

export class FileUploadController {
  constructor() {}

  private handleError = (error: unknown, res: Response) => {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message })
    } else {
      console.log(`${error}`)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  uploadFile = (req: Request, res: Response) => {
    res.json('UploadFile')
  }

  uploadMultipleFiles = (req: Request, res: Response) => {
    res.json('UploadMultipleFiles')
  }
}
