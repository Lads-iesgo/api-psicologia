import express from "express";
import {
  getConsulta,
  getConsultaById,
  createConsulta,
  updateConsulta,
  deleteConsulta,
} from "../controller/consultaController";
import { checkConsultaOwnership, readOnlyForStudents } from "../middleware/rbacMiddleware";

const router = express.Router();

//Rotas Perfil
router.get("/", getConsulta); // GET /consulta
router.get("/:id", readOnlyForStudents, checkConsultaOwnership, getConsultaById); // GET consulta/:id
router.post("/", createConsulta); // POST /consulta
router.put("/:id", readOnlyForStudents, checkConsultaOwnership, updateConsulta); // PUT /consulta/:id
router.delete("/:id", readOnlyForStudents, checkConsultaOwnership, deleteConsulta); // DELETE /consulta/:id

export default router;
