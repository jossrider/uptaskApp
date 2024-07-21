import { request, type Request, type Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body
    /** Find User */
    const user = await User.findOne({ email }).select('_id email name')
    if (!user) {
      const error = new Error('Usuario No Encontrado!!')
      return res.status(404).json({ error: error.message })
    }
    res.json(user)
  }

  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await Project.findById(req.project.id).populate({ path: 'team', select: 'id email name' })
    res.json(project.team)
  }

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body
    /** Find User */
    const user = await User.findById(id).select('_id')
    if (!user) {
      const error = new Error('Usuario No Encontrado!!')
      return res.status(404).json({ error: error.message })
    }
    if (req.project.team.some((team) => team._id.toString() === user.id.toString())) {
      const error = new Error('El usuario ya fue agregado al proyecto!!')
      return res.status(409).json({ error: error.message })
    }
    req.project.team.push(user.id)
    await req.project.save()
    res.send('Usuario agregado con exito!!')
  }

  static removeMemberById = async (req: Request, res: Response) => {
    const { userId } = req.params
    if (!req.project.team.some((team) => team._id.toString() === userId.toString())) {
      const error = new Error('El usuario no existe en el proyecto!!')
      return res.status(409).json({ error: error.message })
    }
    req.project.team = req.project.team.filter((teamMember) => teamMember._id.toString() !== userId.toString())
    await req.project.save()
    res.send('Usuario removido del proyecto!!')
  }
}
