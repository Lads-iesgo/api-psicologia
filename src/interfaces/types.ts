export interface PacienteInterface {
  id?: number;
  nome_completo: string;
  email: string;
  telefone: string;
  genero: string;
  data_nascimento: Date;
  cpf: string;
  cep: string;
  endereco: string;
}

export interface UserInterface {
  id?: number;
  nome_completo: string;
  email: string;
  senha_hash?: string;
  senha?: string;
  telefone: string;
  cpf: string;
  semestre: string;
  perfil_id: number;
  ativo?: Number;
}

export interface PerfilInterface {
  id?: number;
  nome: string;
}

export interface ConsultaInterface {
  id?: number;
  paciente_id: number;
  data_consulta: Date | string;
  horario_id: number;
  aluno_id: number;
  status?: string;
}

export interface HorarioInterface {
  id?: number;
  horario: string;
}

export interface IndisponibilidadeInterface{
  id?: number;
  data_indisponivel: Date | string;
  descricao: string;
  hora_inicio: Date | string;
  hora_fim: Date | string;
}

