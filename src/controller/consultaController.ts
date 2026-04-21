import prisma from "../config/db";
import { consulta_status } from "../../generated/prisma/enums";
import { ConsultaInterface } from "../interfaces/types";
import { Request, Response, NextFunction } from "express";

// Busca todos as consultas do banco de dados
export const getConsulta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todas_consultas = await prisma.consulta.findMany();
    res.status(200).json(todas_consultas);
  } catch (error) {
    next(error);
  }
};

// Busca as consultas individualmente através do id
export const getConsultaById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const busca_pelo_id = await prisma.consulta.findFirst({where: {id}}); // Colocar o id como @Unique no banco de dados da VPS

    if (!busca_pelo_id) {
      res.status(404).json({ message: "Consulta não encontrada" });
      return;
    }

    res.status(200).json(busca_pelo_id);
  } catch (error) {
    next(error);
  }
};

export const createConsulta = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let {
      paciente_id,
      data_consulta,
      horario_id,
      aluno_id,
      status
    }: ConsultaInterface = req.body;

    // Converte para 'YYYY-MM-DD' se vier no formato ISO
    if (typeof data_consulta === "string" && data_consulta.includes("T")) {
      data_consulta = data_consulta.split("T")[0];
    }

    // Cria uma consulta para o paciente
    const criar_consulta = await prisma.consulta.create({
      data: {
        paciente_id: Number(paciente_id),
        data_consulta: new Date((data_consulta as string) + "T00:00:00.000Z"),
        horario_id: Number(horario_id),
        aluno_id: Number(aluno_id),
        status: status ? (status as consulta_status) : undefined, 
      } as any
    });

    res.status(201).json(criar_consulta);
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(409).json({
        message:
          "Já existe uma consulta para esse paciente, data, horário e fisioterapeuta.",
      });
      return;
    }
    next(error);
  }
};

export const updateConsulta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const campos = [ "paciente_id", "data_consulta", "horario_id", "aluno_id", "status"]
    // Tem que colocar a verificação de atualização
      const dados_atualizacao: any = {};
    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        if (campo === "data_consulta") {
          const d = req.body[campo];
          dados_atualizacao[campo] = new Date(typeof d === "string" && d.includes("T") ? d.split("T")[0] + "T00:00:00.000Z" : d);
        } else if (["paciente_id", "horario_id", "aluno_id"].includes(campo)) {
          dados_atualizacao[campo] = Number(req.body[campo]);
        } else if (campo === "status") {
          dados_atualizacao[campo] = (req.body[campo] as consulta_status) ?? null;
        } else {
          dados_atualizacao[campo] = req.body[campo];
        }
      }
    }

    if (Object.keys(dados_atualizacao).length === 0) {
      res.status(400).json({ message: "Nenhum campo para atualizar." });
      return;
    }

    const updated = await prisma.consulta.update({
      where: { id },
      data: dados_atualizacao,
    });
    // Transforma os dados passados pelo usuário nos tipos que cada coluna do SQL precisa

    res.status(200).json(dados_atualizacao);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Consulta não encontrada." });
      return;
    } 
    next(error);
  }
};

export const deleteConsulta = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);

    await prisma.consulta.delete({
      where: {id}
    });

    res.status(200).json({ message: "Consulta excluída com sucesso" });
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Consulta não encontrada." });
      return;
    };
    next(error);
  }
};
