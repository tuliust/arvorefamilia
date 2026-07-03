import { supabase } from './app/lib/supabaseClient';
import { removePersonProfileStorageFiles } from './app/services/storageService';

type PatchedSupabaseClient = typeof supabase & {
  __adminResetProfileStorageApiCleanupInstalled?: boolean;
  rpc: (...args: any[]) => Promise<any>;
};

const ADMIN_RESET_PROFILE_RPC = 'admin_reset_person_profile';

function getResetPessoaId(params: unknown) {
  if (!params || typeof params !== 'object') return '';
  return String((params as { target_pessoa_id?: unknown }).target_pessoa_id ?? '').trim();
}

const client = supabase as PatchedSupabaseClient;

if (!client.__adminResetProfileStorageApiCleanupInstalled) {
  client.__adminResetProfileStorageApiCleanupInstalled = true;

  const originalRpc = client.rpc.bind(client);

  client.rpc = async (...args: any[]) => {
    const [functionName, params, options] = args;

    if (functionName !== ADMIN_RESET_PROFILE_RPC) {
      return originalRpc(functionName, params, options);
    }

    const pessoaId = getResetPessoaId(params);
    if (!pessoaId) {
      return originalRpc(functionName, params, options);
    }

    const storageCleanup = await removePersonProfileStorageFiles(pessoaId);
    const result = await originalRpc(functionName, params, options);

    if (result?.error || !result?.data || typeof result.data !== 'object') {
      return result;
    }

    return {
      ...result,
      data: {
        ...result.data,
        deleted_avatar_storage_objects:
          Number(result.data.deleted_avatar_storage_objects ?? 0) + storageCleanup.deleted_avatar_storage_objects,
        deleted_historical_storage_objects:
          Number(result.data.deleted_historical_storage_objects ?? 0) + storageCleanup.deleted_historical_storage_objects,
      },
    };
  };
}

export {};
