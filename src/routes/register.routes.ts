import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import prisma from "../config/db"; // Conexão com o banco de dados MySQL através do prisma

const router = express.Router();

// Certifique-se de que a pasta para uploads exista:
const UPLOAD_DIR = path.join(__dirname, "../../uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Configuração do Multer para armazenamento de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Rota de cadastro de usuário
router.post(
  "/register",
  upload.single("anexarArterias"), // Corrigido o nome do campo para evitar caracteres especiais
  [
    body("nome_completo").trim().notEmpty().withMessage("Nome completo é obrigatório."),
    body("email").isEmail().withMessage("E-Mail inválido."),
    body("senha_hash").trim().notEmpty().withMessage("Senha é obrigatória."),
    body("telefone").trim().notEmpty().withMessage("Telefone é obrigatório."),
    body("cpf").trim().notEmpty().withMessage("CPF é obrigatório."),
    body("semestre").trim().notEmpty().withMessage("Semestre é obrigatório."),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { nome_completo, email, senha_hash, telefone, cpf, semestre } = req.body;
    const arquivo = req.file;

    try {
      const senha_hashFinal = await bcrypt.hash(senha_hash, 10);

      const registra_novo_usuario = await prisma.usuario.create({
        data: {
          nome_completo,
          email,
          senha_hash: senha_hashFinal,
          telefone,
          cpf,
          semestre,
          perfil_id: 2
        }
      });

      res.status(201).json({
        message: "Usuário registrado com sucesso!",
        id: registra_novo_usuario.id
      });
    } catch (err) {
      console.error("Erro ao inserir dados:", err);
      res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
);

export default router;