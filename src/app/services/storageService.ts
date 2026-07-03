import { supabase } from '../lib/supabaseClient';

export const PERSON_AVATARS_BUCKET = 'person-avatars';
export const HISTORICAL_FILES_BUCKET = 'historical-files';
export const SITE_MEDIA_BUCKET = 'site-media';

type UploadOptions = {
  pessoaId?: string | null;
  relacionamentoId?: string | null;
};

type StorageUploadResult = {
  bucket: string;
  path: string;
  url: string;
};

type HistoricalStorageRow = {
  storage_bucket?: string | null;
  storage_path?: string | null;
};

export type PersonProfileStorageCleanupResult = {
  deleted_avatar_storage_objects: number;
  deleted_historical_storage_objects: number;
};

const IMAGE_EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

function getMissingBucketMessage(bucket: string) {
  return `Bucket de Storage "${bucket}" não encontrado. Aplique a migration de buckets antes de enviar arquivos.`;
}

function isMissingStorageBucketError(message: string) {
  const normalized = message.toLocaleLowerCase('pt-BR');
  return normalized.includes('bucket not found') || (normalized.includes('bucket') && normalized.includes('not found'));
}

function getSafeFileName(fileName: string) {
  const normalized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return normalized || 'arquivo';
}

function getExtension(file: File | Blob, fallback = 'bin') {
  if ('name' in file && file.name) {
    const extension = file.name.split('.').pop()?.trim().toLowerCase();
    if (extension) return extension;
  }

  return IMAGE_EXTENSION_BY_TYPE[file.type] ?? (file.type === 'application/pdf' ? 'pdf' : fallback);
}

function normalizeStoragePrefix(prefix: string) {
  return prefix.replace(/^\/+|\/+$/g, '');
}

function uniqueStoragePaths(paths: string[]) {
  return Array.from(new Set(paths.map((path) => path.trim()).filter(Boolean)));
}

function chunkStoragePaths(paths: string[], size = 100) {
  const chunks: string[][] = [];
  for (let index = 0; index < paths.length; index += size) {
    chunks.push(paths.slice(index, index + size));
  }
  return chunks;
}

async function getCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.id) {
    throw new Error('Não foi possível identificar o usuário autenticado para enviar o arquivo.');
  }

  return data.user.id;
}

async function uploadPublicFile(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType: string
): Promise<StorageUploadResult> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    if (isMissingStorageBucketError(error.message)) {
      throw new Error(getMissingBucketMessage(bucket));
    }

    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    bucket,
    path,
    url: data.publicUrl,
  };
}

async function listStorageFolderFiles(bucket: string, prefix: string): Promise<string[]> {
  const normalizedPrefix = normalizeStoragePrefix(prefix);
  const paths: string[] = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(normalizedPrefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      if (isMissingStorageBucketError(error.message)) {
        return [];
      }

      throw new Error(`Erro ao listar arquivos do bucket "${bucket}": ${error.message}`);
    }

    const entries = data ?? [];
    paths.push(
      ...entries
        .map((entry) => String(entry.name ?? '').trim())
        .filter((name) => name && name !== '.emptyFolderPlaceholder' && !name.endsWith('/'))
        .map((name) => `${normalizedPrefix}/${name}`)
    );

    if (entries.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function removeStorageFiles(bucket: string, paths: string[]): Promise<number> {
  const uniquePaths = uniqueStoragePaths(paths);
  if (uniquePaths.length === 0) return 0;

  let removed = 0;

  for (const chunk of chunkStoragePaths(uniquePaths)) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(chunk);

    if (error) {
      if (isMissingStorageBucketError(error.message)) {
        continue;
      }

      throw new Error(`Erro ao remover arquivos do bucket "${bucket}": ${error.message}`);
    }

    removed += data?.length ?? chunk.length;
  }

  return removed;
}

async function getHistoricalStorageRows(pessoaId: string): Promise<HistoricalStorageRow[]> {
  const { data, error } = await supabase
    .from('arquivos_historicos')
    .select('storage_bucket, storage_path')
    .eq('pessoa_id', pessoaId);

  if (error) {
    throw new Error(`Erro ao carregar caminhos de arquivos históricos: ${error.message}`);
  }

  return data ?? [];
}

export async function removePersonProfileStorageFiles(pessoaId: string): Promise<PersonProfileStorageCleanupResult> {
  const [avatarPaths, historicalFolderPaths, historicalRows] = await Promise.all([
    listStorageFolderFiles(PERSON_AVATARS_BUCKET, pessoaId),
    listStorageFolderFiles(HISTORICAL_FILES_BUCKET, `pessoas/${pessoaId}`),
    getHistoricalStorageRows(pessoaId),
  ]);

  const historicalPathsByBucket = new Map<string, string[]>();
  historicalPathsByBucket.set(HISTORICAL_FILES_BUCKET, [...historicalFolderPaths]);

  historicalRows.forEach((row) => {
    const bucket = String(row.storage_bucket ?? '').trim();
    const path = String(row.storage_path ?? '').trim();
    if (!bucket || !path) return;

    const bucketPaths = historicalPathsByBucket.get(bucket) ?? [];
    bucketPaths.push(path);
    historicalPathsByBucket.set(bucket, bucketPaths);
  });

  const deletedAvatarStorageObjects = await removeStorageFiles(PERSON_AVATARS_BUCKET, avatarPaths);

  let deletedHistoricalStorageObjects = 0;
  for (const [bucket, paths] of historicalPathsByBucket.entries()) {
    deletedHistoricalStorageObjects += await removeStorageFiles(bucket, paths);
  }

  return {
    deleted_avatar_storage_objects: deletedAvatarStorageObjects,
    deleted_historical_storage_objects: deletedHistoricalStorageObjects,
  };
}

export async function uploadPersonAvatarFile(file: File | Blob, options: UploadOptions = {}) {
  const userId = await getCurrentUserId();
  const extension = getExtension(file, 'jpg');
  const pessoaSegment = options.pessoaId || 'pending';
  const storagePath = `${pessoaSegment}/${userId}-${Date.now()}.${extension}`;

  return uploadPublicFile(PERSON_AVATARS_BUCKET, storagePath, file.type || 'image/jpeg');
}

export async function uploadHistoricalFile(file: File, options: UploadOptions = {}) {
  const userId = await getCurrentUserId();
  const ownerSegment = options.relacionamentoId
    ? `relacionamentos/${options.relacionamentoId}`
    : `pessoas/${options.pessoaId || 'pending'}`;
  const storagePath = `${ownerSegment}/${userId}-${Date.now()}-${getSafeFileName(file.name)}`;

  return uploadPublicFile(HISTORICAL_FILES_BUCKET, storagePath, file, file.type || 'application/octet-stream');
}

export async function uploadSiteMediaFile(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Selecione apenas arquivos de imagem.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('A imagem deve ter no máximo 5MB.');
  }

  const userId = await getCurrentUserId();
  const extension = getExtension(file, 'jpg');
  const storagePath = `site/${userId}-${Date.now()}.${extension}`;

  return uploadPublicFile(SITE_MEDIA_BUCKET, storagePath, file, file.type || 'image/jpeg');
}
