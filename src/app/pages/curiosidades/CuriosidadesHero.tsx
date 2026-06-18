import { Sparkles } from 'lucide-react';

export function CuriosidadesHero() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            <Sparkles className="h-4 w-4" />
            Curiosidades da família
          </div>
          <h2 className="text-3xl font-bold leading-tight text-gray-950 md:text-4xl">
            Uma área para reunir descobertas, memórias e conexões familiares.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-gray-600">
            Esta página começa como uma vitrine organizada dos recursos de curiosidades. As próximas etapas poderão usar dados familiares reais para preencher números, rankings, perguntas e histórias.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm font-semibold text-gray-900">Status inicial</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Estrutura pronta para receber dados familiares, integrações e cálculos em fases futuras.
          </p>
        </div>
      </div>
    </section>
  );
}

