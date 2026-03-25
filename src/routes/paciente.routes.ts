import express from "express";
import {
  getPaciente,
  getPacienteById,
  createPaciente,
  updatePaciente,
  validar,
} from "../controller/pacienteController";

const router = express.Router();

//Rotas Paciente
router.get("/", getPaciente); // GET /paciente
router.get("/:id", getPacienteById); // GET /paciente/:id
router.post("/", createPaciente); // POST /paciente
router.put("/:id", updatePaciente); // PUT /paciente/:id
router.post("/validar", validar); // POST /paciente/validar

export default router;
