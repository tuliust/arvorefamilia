-- Mantém documentos históricos fora de URLs públicas permanentes.
-- O frontend abre PDFs via createSignedUrl() e baixa via Storage API autenticada.
update storage.buckets
set public = false
where id = 'historical-files';
