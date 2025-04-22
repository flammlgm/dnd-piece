import express from 'express'
import { findPath } from '../controllers/pathfinding.controller.js'

const router = express.Router()
router.post('/', findPath)

export default router