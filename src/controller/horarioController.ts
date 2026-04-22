import prisma from "../config/db";
import { HorarioInterface } from "../interfaces/types";
import { Request, Response, NextFunction } from "express";

// Converte o DateTime que Prisma retorna para campos TIME do MySQL para "HH:MM"
// O Prisma retorna campos TIME como DateTime com data base 1970-01-01T00:00:00Z
function formatHorario(value: any): string {
  if (value instanceof Date) {
    const h = String(value.getUTCHours()).padStart(2, "0");
    const m = String(value.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
  if (typeof value === "string") {
    return value.substring(0, 5);
  }
  return String(value ?? "");
}

// Converte "HH:MM" para Date com base 1970-01-01 (formato esperado pelo Prisma para @db.Time)
function parseHorario(value: string): Date {
  const [h, m] = value.split(":").map(Number);
  const d = new Date(0);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export const getHorario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const todos_os_horarios = await prisma.horario_agendamento.findMany();
    const formatted = todos_os_horarios.map((r: typeof todos_os_horarios[number]) => ({
      ...r,
      horario: formatHorario(r.horario),
    }));
    res.status(200).json(formatted);
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

    res.status(200).json({id_horarios_agendados, horario: formatHorario(id_horarios_agendados.horario)});
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
