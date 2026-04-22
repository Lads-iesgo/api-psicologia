import prisma from "../config/db";
import { PacienteInterface } from "../interfaces/types";
import { paciente_genero } from "../../generated/prisma/enums";
import { Request, Response, NextFunction } from "express";

function parseDateSafe(value: any): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export const getPaciente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos_pacientes = await prisma.paciente.findMany();
    res.status(200).json(todos_pacientes);
  } catch (error) {
    next(error);
  }
};

export const getPacienteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const busca_paciente_pelo_id = await prisma.paciente.findUnique({where: {id}});

    if (!busca_paciente_pelo_id) {
      res.status(404).json({ message: "Paciente não encontrado" });
      return;
    }

    res.status(200).json(busca_paciente_pelo_id);
  } catch (error) {
    next(error);
  }
};

export const createPaciente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      nome_completo,
      email,
      telefone,
      genero,
      data_nascimento,
      cpf,
      cep,
      endereco,
    }: PacienteInterface = req.body;

    if(cpf == undefined){
      res.status(401).json({
        message: "Houve algum problema no campo de CPF"
      });
      return;
    }

    const criar_paciente = await prisma.paciente.create({
      data: {
        nome_completo: nome_completo ? String(nome_completo) : undefined,
        email: email ? String(email) : undefined,
        telefone: telefone ? String(telefone) : undefined,
        genero: genero ? (genero as paciente_genero) : undefined,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : undefined,
        cpf: String(cpf),
        cep: cep ? String(cep) : undefined,
        endereco: endereco ? String(endereco) : undefined,
      }
    })

    res.status(201).json(criar_paciente);
  } catch (error) {
    next(error);
  }
};

export const updatePaciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const campos = [ "nome_completo", "email", "telefone", "genero", "data_nascimento", "cpf", "cep", "endereco" ];

    // Tem que colocar a verificação de atualização
    const dados_atualizacao: any = {};

    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        if (campo === "data_nascimento") {
          dados_atualizacao[campo] = parseDateSafe(req.body[campo]);
        } else {
          dados_atualizacao[campo] = campo === "genero"
            ? (req.body[campo] as paciente_genero) ?? null
            : req.body[campo];
        }
      }
    };

    if (Object.keys(dados_atualizacao).length === 0) {
      res.status(400).json({ message: "Nenhum campo para atualizar." });
      return;
    }

    const atualizar_paciente = await prisma.paciente.update({
      where: {id},
      data: dados_atualizacao
    });

    res.status(200).json(atualizar_paciente);
} catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Paciente não encontrado" });
      return;
    };
    
    next(error);
  }
}

export const deletePaciente = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    await prisma.paciente.delete({
      where: {id}
    });

    res.status(200).json({ message: "Paciente excluído com sucesso" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Paciente não encontrado." });
      return;
    };
    next(error);
  }
}