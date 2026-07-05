// A rota /mapa-familiar?pessoa=:id deve usar a mesma lógica visual canônica de /mapa-familiar.
// Este runtime patch antigo alterava largura, colunas e posicionamento de grupos na perspectiva,
// o que quebrava a organização de cônjuges em Irmãos/Sobrinhos quando "Todos os cônjuges" estava ativo.
// A correção definitiva fica nos componentes React do mapa familiar; este módulo permanece neutro.

export {};
