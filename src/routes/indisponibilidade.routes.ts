import express from "express";
import {
  getIndisponibilidade,
  getIndisponibilidadeById,
  createIndisponibilidade,
  updateIndisponibilidade,
  deleteIndisponibilidade
} from "../controller/indisponibilidadeController";

const router = express.Router();

router.get("/", getIndisponibilidade);
router.get("/:id", getIndisponibilidadeById);
router.post("/", createIndisponibilidade);
router.put("/:id", updateIndisponibilidade);
router.delete("/:id", deleteIndisponibilidade);

export default router;
