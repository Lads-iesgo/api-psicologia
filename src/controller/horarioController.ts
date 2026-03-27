import prisma from "../config/db";
import { HorarioInterface } from "../interfaces/types";
import { Request, Response, NextFunction } from "express";

export const getHorario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos_horarios_agendados = await prisma.horario_agendamento.findMany();
    res.status(200).json(todos_horarios_agendados);
  } catch (error) {
    next(error);
  }
};

export const getHorarioById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const id_horarios_agendados = await prisma.horario_agendamento.findFirst({
      where: {id}
    });

    if (!id_horarios_agendados) {
      res.status(404).json({ message: "Horário não encontrado" });
      return;
    }

    res.status(200).json(id_horarios_agendados);
  } catch (error) {
    next(error);
  }
};

export const createHorario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { horario }: HorarioInterface = req.body;

    if (!horario) {
      res.status(400).json({ message: "O campo horário é obrigatório para criar um novo horário." });
      return;
    }

    const criar_horario = await prisma.horario_agendamento.create({
      data: {horario}
    });

    res.status(201).json(criar_horario);
  } catch (error) {
    next(error);
  }
};

// Atualiza as consultas sem precisar criar uma variavel que recebe as atualizações
export const updateHorario = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const { horario }: HorarioInterface = req.body;

    if (!horario) {
      res.status(400).json({ message: "O campo horário é obrigatório para atualização." });
      return;
    }

    const atualiza_horario = await prisma.horario_agendamento.update({
      where: {id},
      data: {horario: horario}
    });

    res.status(200).json(atualiza_horario);
  } catch (error: any) {
    if (error.code === "P2025") {
      res.status(404).json({ message: "Horário não encontrado" });
      return;
    };
    next(error);
  }
};
