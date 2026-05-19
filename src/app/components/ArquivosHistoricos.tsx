import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { ArquivoHistorico } from '../types';
import { ArrowDown, ArrowUp, Download, ExternalLink, Upload, X, FileText, Eye } from 'lucide-react';
import { uploadHistoricalFile } from '../services/storageService';

const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function sanitizeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function getExtensionFromDataUrl(url: string) {
  const match = url.match(/^data:([^;,]+)/);
  const mimeType = match?.[1];

  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';

  return null;
}

function getExtensionFromUrl(url: string) {
  if (url.startsWith('data:')) return getExtensionFromDataUrl(url);

  try {
    const pathname = new URL(url, window.location.href).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  } catch {
    const extension = url.split('?')[0]?.split('#')[0]?.split('.').pop()?.toLowerCase();
    if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  }

  return null;
}

function getHistoricalFileName(arquivo: ArquivoHistorico) {
  const baseName = sanitizeFileName(arquivo.titulo || 'arquivo-historico') || 'arquivo-historico';
  const extension = getExtensionFromUrl(arquivo.url) ?? (arquivo.tipo === 'pdf' ? 'pdf' : 'jpg');

  return baseName.endsWith(`.${extension}`) ? baseName : `${baseName}.${extension}`;
}

function openArquivoInNewTab(arquivo: ArquivoHistorico) {
  window.open(arquivo.url, '_blank', 'noopener,noreferrer');
}

interface ArquivosHistoricosProps {
  arquivos: ArquivoHistorico[];
  onChange: (arquivos: ArquivoHistorico[]) => void;
  pessoaId?: string | null;
  relacionamentoId?: string | null;
  readOnly?: boolean;
}

export function ArquivosHistoricos({ arquivos, onChange, pessoaId, relacionamentoId, readOnly = false }: ArquivosHistoricosProps) {
  const [novoArquivo, setNovoArquivo] = useState({
    titulo: '',
    descricao: '',
    ano: '',
    tipo: 'imagem' as 'imagem' | 'pdf',
    url: '',
    storage_bucket: '',
    storage_path: '',
    mime_type: '',
  });
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState<ArquivoHistorico | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      alert('Apenas JPG, PNG, WebP e PDF são permitidos');
      return;
    }

    setIsUploadingFile(true);
    try {
      const upload = await uploadHistoricalFile(file, { pessoaId, relacionamentoId });
      setNovoArquivo(prev => ({
        ...prev,
        url: upload.url,
        storage_bucket: upload.bucket,
        storage_path: upload.path,
        mime_type: file.type || 'application/octet-stream',
        tipo: isImage ? 'imagem' : 'pdf'
      }));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível enviar o arquivo.');
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleAddArquivo = () => {
    if (!novoArquivo.titulo || !novoArquivo.url) {
      alert('Por favor, preencha o título e selecione um arquivo');
      return;
    }

    const arquivo: ArquivoHistorico = {
      id: `arquivo-${Date.now()}`,
      tipo: novoArquivo.tipo,
      url: novoArquivo.url,
      storage_bucket: novoArquivo.storage_bucket || undefined,
      storage_path: novoArquivo.storage_path || undefined,
      mime_type: novoArquivo.mime_type || undefined,
      titulo: novoArquivo.titulo,
      pessoa_id: pessoaId ?? null,
      relacionamento_id: relacionamentoId ?? null,
      descricao: novoArquivo.descricao || undefined,
      ano: novoArquivo.ano || undefined,
      ordem: arquivos.length,
    };

    onChange([...arquivos, arquivo]);
    setNovoArquivo({ titulo: '', descricao: '', ano: '', tipo: 'imagem', url: '', storage_bucket: '', storage_path: '', mime_type: '' });
    setIsAddingFile(false);
  };

  const handleRemoveArquivo = (id: string) => {
    onChange(arquivos.filter(a => a.id !== id));
  };

  const handleUpdateArquivo = (id: string, field: 'titulo' | 'descricao' | 'ano', value: string) => {
    onChange(arquivos.map((arquivo) => (
      arquivo.id === id ? { ...arquivo, [field]: value } : arquivo
    )));
  };

  const handleMoveArquivo = (id: string, direction: -1 | 1) => {
    const currentIndex = arquivos.findIndex((arquivo) => arquivo.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= arquivos.length) return;

    const nextArquivos = [...arquivos];
    const [item] = nextArquivos.splice(currentIndex, 1);
    nextArquivos.splice(nextIndex, 0, item);
    onChange(nextArquivos.map((arquivo, index) => ({ ...arquivo, ordem: index })));
  };

  const handleViewFile = (arquivo: ArquivoHistorico) => {
    setPreviewFile(arquivo);
  };

  const handleDownloadArquivo = (arquivo: ArquivoHistorico) => {
    const link = document.createElement('a');
    link.href = arquivo.url;
    link.download = getHistoricalFileName(arquivo);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="break-words">Arquivos Históricos</CardTitle>
            {!readOnly && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => setIsAddingFile(!isAddingFile)}
              >
                <Upload className="h-4 w-4" />
                Adicionar Arquivo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAddingFile && !readOnly && (
            <div className="space-y-3 rounded-lg border border-gray-300 bg-gray-50 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Arquivo (imagem ou PDF) *
                </label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  disabled={isUploadingFile}
                  className="cursor-pointer"
                />
                {novoArquivo.url && (
                  <p className="mt-1 break-words text-xs text-green-600">
                    ✓ Arquivo carregado ({novoArquivo.tipo})
                  </p>
                )}
                {isUploadingFile && (
                  <p className="mt-1 break-words text-xs text-blue-600">
                    Enviando arquivo para o Storage...
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Título *
                </label>
                <Input
                  type="text"
                  value={novoArquivo.titulo}
                  onChange={(e) => setNovoArquivo(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Certidão de nascimento"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Descrição
                </label>
                <textarea
                  value={novoArquivo.descricao}
                  onChange={(e) => setNovoArquivo(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={2}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Informações adicionais sobre o arquivo..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ano
                </label>
                <Input
                  type="text"
                  value={novoArquivo.ano}
                  onChange={(e) => setNovoArquivo(prev => ({ ...prev, ano: e.target.value }))}
                  placeholder="Ex: 1950"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsAddingFile(false);
                    setNovoArquivo({ titulo: '', descricao: '', ano: '', tipo: 'imagem', url: '', storage_bucket: '', storage_path: '', mime_type: '' });
                  }}
                  disabled={isUploadingFile}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={handleAddArquivo}
                  disabled={isUploadingFile}
                >
                  Adicionar
                </Button>
              </div>
            </div>
          )}

          {arquivos.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">
              Nenhum arquivo histórico adicionado
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {arquivos.map((arquivo, index) => (
                <div
                  key={arquivo.id}
                  className="min-w-0 rounded-lg border border-gray-200 p-3 transition-colors hover:border-gray-300"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0">
                      {arquivo.tipo === 'imagem' ? (
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-100">
                          <img 
                            src={arquivo.url} 
                            alt={arquivo.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded bg-red-50">
                          <div className="flex flex-col items-center gap-1">
                            <FileText className="h-7 w-7 text-red-600" />
                            <span className="text-[10px] font-semibold text-red-700">PDF</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      {readOnly ? (
                        <>
                          <h4 className="break-words text-sm font-medium text-gray-900">
                            {arquivo.titulo}
                          </h4>
                          {arquivo.ano && (
                            <p className="mt-1 break-words text-xs text-gray-500">{arquivo.ano}</p>
                          )}
                          {arquivo.descricao && (
                            <p className="mt-1 line-clamp-2 break-words text-xs text-gray-500">
                              {arquivo.descricao}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            value={arquivo.titulo}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, 'titulo', event.target.value)}
                            placeholder="Título"
                            className="h-8 bg-white text-sm"
                          />
                          <Input
                            value={arquivo.ano ?? ''}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, 'ano', event.target.value)}
                            placeholder="Ano"
                            className="h-8 bg-white text-sm"
                          />
                          <textarea
                            value={arquivo.descricao ?? ''}
                            onChange={(event) => handleUpdateArquivo(arquivo.id, 'descricao', event.target.value)}
                            rows={2}
                            className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                            placeholder="Descrição"
                          />
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-2">
                        <button
                          type="button"
                          onClick={() => handleViewFile(arquivo)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <Eye className="h-3 w-3" />
                          Visualizar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadArquivo(arquivo)}
                          className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                        >
                          <Download className="h-3 w-3" />
                          Baixar arquivo
                        </button>
                        <button
                          type="button"
                          onClick={() => openArquivoInNewTab(arquivo)}
                          className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Abrir
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleMoveArquivo(arquivo.id, -1)}
                              disabled={index === 0}
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              <ArrowUp className="h-3 w-3" />
                              Subir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveArquivo(arquivo.id, 1)}
                              disabled={index === arquivos.length - 1}
                              className="inline-flex items-center gap-1 text-xs text-gray-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                            >
                              <ArrowDown className="h-3 w-3" />
                              Descer
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveArquivo(arquivo.id)}
                              className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline"
                            >
                              <X className="h-3 w-3" />
                              Remover
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualização */}
      <Dialog open={!!previewFile} onOpenChange={(open) => {
        if (!open) setPreviewFile(null);
      }}>
        <DialogContent className="grid max-h-[92vh] max-w-5xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="break-words">
              {previewFile?.titulo ? `Visualização: ${previewFile.titulo}` : 'Visualização do arquivo'}
            </DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="min-h-0 overflow-auto rounded-lg border bg-gray-50 p-3">
              {previewFile.tipo === 'imagem' || previewFile.url.startsWith('data:image') ? (
                <img 
                  src={previewFile.url}
                  alt={previewFile.titulo || 'Arquivo histórico'}
                  className="mx-auto max-h-[68vh] w-auto max-w-full rounded object-contain"
                />
              ) : (
                <div className="space-y-3">
                  <iframe
                    src={previewFile.url}
                    className="h-[68vh] w-full rounded border bg-white"
                    title={`Preview do PDF ${previewFile.titulo || 'arquivo histórico'}`}
                  />
                  <p className="break-words text-xs text-gray-600">
                    Se o PDF não carregar no navegador, use “Abrir em nova aba”.
                  </p>
                </div>
              )}
            </div>
          )}
          {previewFile && (
            <DialogFooter className="sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => handleDownloadArquivo(previewFile)}
              >
                <Download className="h-4 w-4" />
                Baixar arquivo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => openArquivoInNewTab(previewFile)}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir em nova aba
              </Button>
              <DialogClose asChild>
                <Button type="button" className="w-full sm:w-auto">Fechar</Button>
              </DialogClose>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}