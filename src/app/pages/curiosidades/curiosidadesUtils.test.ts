import { describe, expect, it } from 'vitest';
import type { Pessoa, Relacionamento } from '../../types';
import {
  buildCoupleAnniversaries,
  buildCuriosityQuizQuestions,
  buildTodayFamilyEvents,
  calculateFullYearsSince,
  countChildrenByPerson,
  getBirthCityRanking,
  getBirthMonthCounts,
  getMostRepeatedFirstNames,
  getPeopleBySocialGeneration,
  getProfessionRanking,
  getZodiacCompatibility,
  getZodiacSignFromDate,
  parseFamilyDate,
} from './curiosidadesUtils';

function makePessoa(overrides: Partial<Pessoa> & { id: string }): Pessoa {
  return {
    id: overrides.id,
    nome_completo: `Pessoa ${overrides.id}`,
    humano_ou_pet: 'Humano',
    ...overrides,
  } as Pessoa;
}

function makeRelacionamento(overrides: Partial<Relacionamento> & { id: string }): Relacionamento {
  return {
    id: overrides.id,
    pessoa_origem_id: '',
    pessoa_destino_id: '',
    tipo_relacionamento: 'pai',
    ativo: true,
    ...overrides,
  } as Relacionamento;
}

describe('curiosidadesUtils', () => {
  it('interpreta datas ISO, datas brasileiras e ano isolado', () => {
    expect(parseFamilyDate('1989-01-23')?.getFullYear()).toBe(1989);
    expect(parseFamilyDate('23/01/1989')?.getMonth()).toBe(0);
    expect(parseFamilyDate(1989)?.getDate()).toBe(1);
    expect(parseFamilyDate('')).toBeNull();
  });

  it('calcula anos completos respeitando mes e dia', () => {
    expect(calculateFullYearsSince('2000-06-20', new Date(2026, 5, 19))).toBe(25);
    expect(calculateFullYearsSince('2000-06-20', new Date(2026, 5, 20))).toBe(26);
  });

  it('calcula rankings de nomes, profissoes, cidades e meses sem contar pets', () => {
    const pessoas = [
      makePessoa({ id: 'p1', nome_completo: 'Ana Souza', data_nascimento: '1980-01-10', profissao: 'Jornalista', local_nascimento: 'Recife' }),
      makePessoa({ id: 'p2', nome_completo: 'Ana Lima', data_nascimento: '1982-01-12', profissao: 'Jornalista', local_nascimento: 'Recife' }),
      makePessoa({ id: 'p3', nome_completo: 'Bruno Lima', data_nascimento: '1990-02-12', profissao: 'Engenheiro', local_nascimento: 'Porto Alegre' }),
      makePessoa({ id: 'pet1', nome_completo: 'Rex', humano_ou_pet: 'Pet', data_nascimento: '2020-01-01', profissao: 'Mascote', local_nascimento: 'Recife' }),
    ];

    expect(getMostRepeatedFirstNames(pessoas, 1)[0]).toMatchObject({ label: 'Ana', count: 2 });
    expect(getProfessionRanking(pessoas, 1)[0]).toMatchObject({ label: 'Jornalista', count: 2 });
    expect(getBirthCityRanking(pessoas, 1)[0]).toMatchObject({ label: 'Recife', count: 2 });

    const monthCounts = getBirthMonthCounts(pessoas);
    expect(monthCounts[0].count).toBe(2);
    expect(monthCounts[1].count).toBe(1);
  });

  it('classifica pessoas por geracao social', () => {
    const pessoas = [
      makePessoa({ id: 'boomer', nome_completo: 'Pessoa Boomer', data_nascimento: '1950-01-01' }),
      makePessoa({ id: 'x', nome_completo: 'Pessoa X', data_nascimento: '1975-01-01' }),
      makePessoa({ id: 'z', nome_completo: 'Pessoa Z', data_nascimento: '2005-01-01' }),
    ];

    const groups = getPeopleBySocialGeneration(pessoas);

    expect(groups.find((group) => group.key === 'baby-boomer')?.people).toHaveLength(1);
    expect(groups.find((group) => group.key === 'geracao-x')?.people).toHaveLength(1);
    expect(groups.find((group) => group.key === 'geracao-z')?.people).toHaveLength(1);
  });

  it('monta eventos familiares do dia', () => {
    const now = new Date(2026, 0, 23, 12);
    const pessoas = [
      makePessoa({ id: 'p1', nome_completo: 'Ana Souza', data_nascimento: '1989-01-23' }),
      makePessoa({ id: 'p2', nome_completo: 'Bruno Souza', data_nascimento: '1988-03-10', data_falecimento: '2020-01-23' }),
    ];

    const relacionamentos = [
      makeRelacionamento({
        id: 'r1',
        pessoa_origem_id: 'p1',
        pessoa_destino_id: 'p2',
        tipo_relacionamento: 'conjuge',
        data_casamento: '2010-01-23',
      }),
    ];

    const events = buildTodayFamilyEvents(pessoas, relacionamentos, now);

    expect(events.map((event) => event.type)).toEqual(expect.arrayContaining(['birthday', 'death', 'wedding']));
  });

  it('calcula bodas a partir de relacionamentos com data de casamento', () => {
    const pessoas = [
      makePessoa({ id: 'p1', nome_completo: 'Ana Souza' }),
      makePessoa({ id: 'p2', nome_completo: 'Bruno Souza' }),
    ];

    const relacionamentos = [
      makeRelacionamento({
        id: 'r1',
        pessoa_origem_id: 'p1',
        pessoa_destino_id: 'p2',
        tipo_relacionamento: 'conjuge',
        data_casamento: '2001-01-01',
      }),
    ];

    const couples = buildCoupleAnniversaries(pessoas, relacionamentos, new Date(2026, 0, 1));

    expect(couples).toHaveLength(1);
    expect(couples[0].years).toBe(25);
    expect(couples[0].milestone?.years).toBe(25);
  });

  it('conta filhos usando a direcao padrao da arvore', () => {
    const relacionamentos = [
      makeRelacionamento({
        id: 'r1',
        pessoa_origem_id: 'p1',
        pessoa_destino_id: 'c1',
        tipo_relacionamento: 'filho',
      }),
      makeRelacionamento({
        id: 'r2',
        pessoa_origem_id: 'c2',
        pessoa_destino_id: 'p1',
        tipo_relacionamento: 'pai',
      }),
      makeRelacionamento({
        id: 'r3',
        pessoa_origem_id: 'c3',
        pessoa_destino_id: 'p1',
        tipo_relacionamento: 'mae',
      }),
    ];

    const counts = countChildrenByPerson(relacionamentos);

    expect(counts.find((item) => item.personId === 'p1')?.count).toBe(3);
  });

  it('gera perguntas de quiz com base nos dados cadastrados', () => {
    const pessoas = [
      makePessoa({ id: 'p1', nome_completo: 'Ana Souza', data_nascimento: '1940-01-01', profissao: 'Medica', local_nascimento: 'Recife' }),
      makePessoa({ id: 'p2', nome_completo: 'Bruno Souza', data_nascimento: '1980-01-01', profissao: 'Medica', local_nascimento: 'Recife' }),
      makePessoa({ id: 'p3', nome_completo: 'Carla Souza', data_nascimento: '1990-01-01', profissao: 'Jornalista', local_nascimento: 'Natal' }),
      makePessoa({ id: 'p4', nome_completo: 'Daniel Souza', data_nascimento: '2020-01-01', profissao: 'Estudante', local_nascimento: 'Porto Alegre' }),
      makePessoa({ id: 'p5', nome_completo: 'Eduardo Souza', data_nascimento: '1970-01-01', profissao: 'Engenheiro', local_nascimento: 'Salvador' }),
      makePessoa({ id: 'p6', nome_completo: 'Fernanda Souza', data_nascimento: '1965-01-01', profissao: 'Arquiteta', local_nascimento: 'Fortaleza' }),
    ];

    const relacionamentos = [
      makeRelacionamento({
        id: 'r1',
        pessoa_origem_id: 'p1',
        pessoa_destino_id: 'p4',
        tipo_relacionamento: 'filho',
      }),
    ];

    const questions = buildCuriosityQuizQuestions(pessoas, relacionamentos);

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.map((question) => question.id)).toEqual(expect.arrayContaining(['oldest-living-person', 'youngest-person', 'profession-journalist', 'more-children']));
    expect(questions.every((question) => question.options.length === 5)).toBe(true);
  });

  it('calcula signo e compatibilidade recreativa', () => {
    const aquario = getZodiacSignFromDate('1989-01-23');
    const gemeos = getZodiacSignFromDate('1990-05-25');

    expect(aquario?.element).toBe('Ar');
    expect(gemeos?.element).toBe('Ar');

    const compatibility = getZodiacCompatibility(aquario, gemeos);

    expect(compatibility.score).toBeGreaterThanOrEqual(80);
  });
});