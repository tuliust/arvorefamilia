import { supabase } from '../lib/supabaseClient';

export const PERSON_AVATARS_BUCKET = 'person-avatars';
export const HISTORICAL_FILES_BUCKET = 'historical-files';
export const SITE_MEDIA_BUCKET = 'site-media';

type UploadOptions = {
  pessoaId?: string | null;
  relacionamentoId?: string | null;
};

type StorageBackedFile = {
  url?: string | null;
  storage_bucket?: string | null;
  storage_path?: string | null;
};

type StorageUploadResult = {
  bucket: string;
  path: string;
  url: string;
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

export async function getStorageFileAccessUrl(file: StorageBackedFile, expiresInSeconds = 15 * 60) {
  const fallbackUrl = String(file.url ?? '').trim();
  const bucket = String(file.storage_bucket ?? '').trim();
  const path = String(file.storage_path ?? '').trim();

  if (!bucket || !path) {
    if (!fallbackUrl) throw new Error('Arquivo sem localização válida no Storage.');
    return fallbackUrl;
  }

  if (bucket === HISTORICAL_FILES_BUCKET) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message || 'Não foi possível gerar acesso temporário ao arquivo histórico.');
    }

    return data.signedUrl;
  }

  if (fallbackUrl) return fallbackUrl;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function openStorageFileInNewTab(file: StorageBackedFile) {
  const popup = window.open('about:blank', '_blank');

  try {
    const url = await getStorageFileAccessUrl(file);
    if (popup) {
      popup.opener = null;
      popup.location.href = url;
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    popup?.close();
    throw error;
  }
}

export async function downloadStorageFile(file: StorageBackedFile, filename: string) {
  const bucket = String(file.storage_bucket ?? '').trim();
  const path = String(file.storage_path ?? '').trim();

  if (bucket && path) {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) {
      throw new Error(error?.message || 'Não foi possível baixar o arquivo.');
    }

    const objectUrl = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  const url = await getStorageFileAccessUrl(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function uploadPersonAvatarFile(file: File | Blob, options: UploadOptions = {}) {
  const userId = await getCurrentUserId();
  const extension = getExtension(file, 'jpg');
  const pessoaSegment = options.pessoaId || 'pending';
  const storagePath = `${pessoaSegment}/${userId}-${Date.now()}.${extension}`;

  return uploadPublicFile(PERSON_AVATARS_BUCKET, storagePath, file, file.type || 'image/jpeg');
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
