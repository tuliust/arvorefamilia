const fs = require("fs");
const path = require("path");

const root = process.cwd();

const displayPath = path.join(
  root,
  "src",
  "app",
  "utils",
  "relationshipDegreeDisplay.ts"
);

const panelPath = path.join(
  root,
  "src",
  "app",
  "pages",
  "home",
  "ConnectionDiscoveryPanel.tsx"
);

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function replaceOrFail(content, from, to, label) {
  if (!content.includes(from)) {
    console.error(`Trecho não encontrado para substituição: ${label}`);
    console.error("Trecho procurado:");
    console.error(from);
    process.exit(1);
  }

  return content.replace(from, to);
}

let display = readFile(displayPath);

const displayAppend = `
function getShortPersonName(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return 'Pessoa';

  return cleanName.split(/\\s+/)[0] || cleanName;
}

function getPossessiveParentLabel(stepLabel: string) {
  if (stepLabel === 'mae' || stepLabel === 'mãe') return 'mãe';
  if (stepLabel === 'pai') return 'pai';
  return 'pai/mãe';
}

function getSiblingLabelByPersonName(name: string) {
  const firstName = getShortPersonName(name).toLowerCase();

  const likelyFemaleEndings = ['a', 'ia', 'na', 'ne', 'la', 'da'];
  const isLikelyFemale = likelyFemaleEndings.some((ending) => firstName.endsWith(ending));

  return isLikelyFemale ? 'irmã' : 'irmão';
}

function getParentLabelFromIncomingStep(result: RelationshipDegreeResult, stepIndex: number) {
  const step = result.path[stepIndex];
  if (!step) return 'pai/mãe';

  const rawLabel = getStepLabel(step.edge);
  return getPossessiveParentLabel(rawLabel);
}

function buildCousinNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  if (!result.found || result.path.length !== 3 || result.label !== 'primo(a)') return null;

  const relationPattern = result.path.map((step) => step.edge.normalizedType).join('>');
  if (relationPattern !== 'child>sibling>parent') return null;

  const peopleById = new Map(people.map((person) => [person.id, person]));
  const originFullName = getPersonName(peopleById, result.originPersonId);
  const targetFullName = getPersonName(peopleById, result.targetPersonId);

  const originShortName = getShortPersonName(originFullName);
  const targetShortName = getShortPersonName(targetFullName);

  const originParentId = result.path[0].to;
  const targetParentId = result.path[1].to;

  const originParentName = getPersonName(peopleById, originParentId);
  const targetParentName = getPersonName(peopleById, targetParentId);

  const originParentShortName = getShortPersonName(originParentName);
  const targetParentShortName = getShortPersonName(targetParentName);

  const originParentLabel = getParentLabelFromIncomingStep(result, 0);
  const targetParentLabel = getParentLabelFromIncomingStep(result, 2);
  const siblingLabel = getSiblingLabelByPersonName(targetParentName);

  return {
    title: \`\${originShortName} e \${targetShortName} são primos\`,
    summary: \`A \${originParentLabel} de \${originShortName}, \${originParentShortName}, é \${siblingLabel} de \${targetParentShortName}, que é \${targetParentLabel} de \${targetShortName}.\`,
  };
}

export function getRelationshipNarrative(result: RelationshipDegreeResult, people: Pessoa[]) {
  const cousinNarrative = buildCousinNarrative(result, people);
  if (cousinNarrative) return cousinNarrative;

  if (result.found) {
    const peopleById = new Map(people.map((person) => [person.id, person]));
    const originName = getShortPersonName(getPersonName(peopleById, result.originPersonId));
    const targetName = getShortPersonName(getPersonName(peopleById, result.targetPersonId));
    const label = result.label === 'a própria pessoa' ? 'a mesma pessoa' : result.label;

    return {
      title: \`\${originName} e \${targetName}: \${label}\`,
      summary: getRelationshipResultMessage(result),
    };
  }

  return {
    title: 'Sem vínculo encontrado',
    summary: getRelationshipResultMessage(result),
  };
}
`;

if (!display.includes("export function getRelationshipNarrative")) {
  display = display.trimEnd() + "\n" + displayAppend + "\n";
  writeFile(displayPath, display);
  console.log("Adicionada função getRelationshipNarrative em relationshipDegreeDisplay.ts");
} else {
  console.log("getRelationshipNarrative já existe. Nenhuma alteração feita nesse trecho.");
}

let panel = readFile(panelPath);

panel = replaceOrFail(
  panel,
  "import { getRelationshipResultMessage } from '../../utils/relationshipDegreeDisplay';",
  "import {\n  formatRelationshipPersonPath,\n  formatRelationshipStepPath,\n  getRelationshipMetricLabels,\n  getRelationshipNarrative,\n} from '../../utils/relationshipDegreeDisplay';",
  "import de relationshipDegreeDisplay"
);

const oldResultBlock = `      {connectionResult && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">
            {connectionResult.found ? connectionResult.label : 'Sem vínculo encontrado'}
          </p>
          <p className="mt-2">{getRelationshipResultMessage(connectionResult)}</p>
          <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-3">
            {connectionMetricLabels.map((metric) => (
              <span key={metric}>{metric}</span>
            ))}
          </div>
          {connectionPathText && (
            <p className="mt-3 text-xs text-gray-500">Caminho: {connectionPathText}</p>
          )}
          {connectionRelationText && (
            <p className="mt-1 text-xs text-gray-400">Relações: {connectionRelationText}</p>
          )}
          {connectionWarnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-amber-700">
              {connectionWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}`;

const newResultBlock = `      {connectionResult && (
        <ConnectionResultCard
          result={connectionResult}
          pessoas={pessoas}
          connectionMetricLabels={connectionMetricLabels}
          connectionPathText={connectionPathText}
          connectionRelationText={connectionRelationText}
          connectionWarnings={connectionWarnings}
        />
      )}`;

panel = replaceOrFail(
  panel,
  oldResultBlock,
  newResultBlock,
  "bloco atual de resultado em ConnectionDiscoveryPanel"
);

const panelAppend = `
function ConnectionResultCard({
  result,
  pessoas,
  connectionMetricLabels,
  connectionPathText,
  connectionRelationText,
  connectionWarnings,
}: {
  result: RelationshipDegreeResult;
  pessoas: Pessoa[];
  connectionMetricLabels: string[];
  connectionPathText: string;
  connectionRelationText: string;
  connectionWarnings: string[];
}) {
  const narrative = getRelationshipNarrative(result, pessoas);
  const technicalMetrics = connectionMetricLabels.length > 0
    ? connectionMetricLabels
    : getRelationshipMetricLabels(result);
  const personPath = connectionPathText || formatRelationshipPersonPath(result, pessoas);
  const relationPath = connectionRelationText || formatRelationshipStepPath(result);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-sm text-gray-700">
      <div className="space-y-2">
        <p className="text-base font-semibold text-gray-900">{narrative.title}</p>
        <p className="text-sm leading-relaxed text-gray-700">{narrative.summary}</p>
      </div>

      <div className="mt-4 grid gap-2 text-xs text-gray-600 sm:grid-cols-3">
        {technicalMetrics.map((metric) => (
          <span key={metric} className="rounded-lg border border-blue-100 bg-white/70 px-3 py-2 font-medium text-slate-700">
            {metric}
          </span>
        ))}
      </div>

      {(personPath || relationPath) && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-white/70 px-3 py-3 text-xs text-slate-600">
          {personPath && (
            <p>
              <span className="font-semibold text-slate-700">Caminho:</span> {personPath}
            </p>
          )}
          {relationPath && (
            <p className="mt-1">
              <span className="font-semibold text-slate-700">Relações:</span> {relationPath}
            </p>
          )}
        </div>
      )}

      {connectionWarnings.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-amber-700">
          {connectionWarnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
`;

if (!panel.includes("function ConnectionResultCard")) {
  panel = panel.trimEnd() + "\n" + panelAppend + "\n";
  writeFile(panelPath, panel);
  console.log("Adicionado ConnectionResultCard em ConnectionDiscoveryPanel.tsx");
} else {
  console.log("ConnectionResultCard já existe. Nenhuma alteração feita nesse trecho.");
}

console.log("Ajuste aplicado com sucesso.");
