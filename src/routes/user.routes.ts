import { Router } from "express";
import {
  getUsers,
  getUsersById,
  createUser,
  updateUser,
  getFisioterapeutas,
  deleteUser
} from "../controller/userController";

import { restrictProfessorUserCreation } from "../middleware/rbacMiddleware";
const router = Router();

router.get("/", getUsers);
router.get("/fisioterapeutas", getFisioterapeutas); // Nova rota
router.get("/:id", getUsersById);
router.post("/", restrictProfessorUserCreation, createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser); // Se você implementar a deleção

export default router;
