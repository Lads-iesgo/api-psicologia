// Deve validar se todos os caracteres de cpf, cep e telefone foram criados
import { Request, Response, NextFunction } from "express";
import { PacienteInterface } from "../interfaces/types";

export async function validarInputs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const { cpf, cep, telefone }: PacienteInterface = req.body;

        const regexTelefone = /^[1-9]{2}9[0-9]{8}$/;
        const regexCpf = /^[0-9]{11}$/;

        if (!telefone || !regexTelefone.test(telefone)) {
            res.status(400).json({ message: "Telefone incorreto ou faltando caracteres!" });
            return;
        }

        if (!cpf || !regexCpf.test(cpf)) {
            res.status(400).json({ message: "CPF incorreto ou faltando caracteres!" });
            return;
        }

        if (!cep) {
            res.status(400).json({ message: "CEP não informado!" });
            return;
        }

        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json`);

        if (!resposta.ok) {
            res.status(400).json({ message: "Erro ao consultar o CEP na base de dados externa." });
            return;
        }

        const dadosCep = await resposta.json();

        if (dadosCep.erro) {
            res.status(400).json({ message: "CEP inexistente!" });
            return;
        }

        next();
    } catch(error) {
        res.status(500).json({ message: "Erro interno ao validar os dados do paciente." });
    }
};
