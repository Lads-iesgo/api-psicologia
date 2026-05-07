import { Router } from "express";
import {
  getUsers,
  getUsersById,
  createUser,
  updateUser,
  getFisioterapeutas,
  deleteUser
} from "../controller/userController";

const router = Router();

router.get("/", getUsers);
router.get("/alunos", getFisioterapeutas); // Nova rota
router.get("/:id", getUsersById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser); // Se você implementar a deleção

export default router;
