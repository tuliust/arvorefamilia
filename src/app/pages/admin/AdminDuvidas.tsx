import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { HelpCircle, Plus, RefreshCcw, Search, Settings } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import {
  adminArchiveQaItem,
  adminCreateQaCategory,
  adminCreateQaItem,
  adminListQaCategories,
  adminListQaItems,
  adminMoveQaItemToDraft,
  adminPublishQaItem,
  adminToggleQaCategoryActive,
  adminUpdateQaCategory,
  adminUpdateQaItem,
} from '../../services/qaService';
import type { QaCategory, QaCategoryInput, QaItem, QaItemInput, QaItemStatus } from '../../types/qa';

const emptyCategoryForm: QaCategoryInput = {
  title: '',
  short_title: '',
  slug: '',
  description: '',
  order_index: 0,
  is_active: true,
};

const emptyItemForm: QaItemInput = {
  category_id: '',
  question: '',
  answer: '',
  slug: '',
  keywords: [],
  related_page_label: '',
  related_page_path: '',
  is_featured: false,
  status: 'draft',
  order_index: 0,
};

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function slugify(value: string) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function keywordStringToArray(value: string) {
  return value
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function keywordsToString(value?: string[]) {
  return (value ?? []).join(', ');
}

function statusLabel(status: QaItemStatus) {
  if (status === 'published') return 'Publicado';
  if (status === 'archived') return 'Arquivado';
  return 'Rascunho';
}

function statusBadgeClass(status: QaItemStatus) {
  if (status === 'published') return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
  if (status === 'archived') return 'bg-slate-200 text-slate-700 hover:bg-slate-200';
  return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
}

function getCategoryName(categories: QaCategory[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.title ?? 'Categoria não encontrada';
}

function categoryToForm(category: QaCategory): QaCategoryInput {
  return {
    title: category.title,
    short_title: category.short_title ?? '',
    slug: category.slug,
    description: category.description ?? '',
    order_index: category.order_index,
    is_active: category.is_active,
  };
}

function itemToForm(item: QaItem): QaItemInput {
  return {
    category_id: item.category_id,
    question: item.question,
    answer: item.answer,
    slug: item.slug,
    keywords: item.keywords,
    related_page_label: item.related_page_label ?? '',
    related_page_path: item.related_page_path ?? '',
    is_featured: item.is_featured,
    status: item.status,
    order_index: item.order_index,
    published_at: item.published_at ?? null,
  };
}

export function AdminDuvidas() {
  const [categories, setCategories] = useState<QaCategory[]>([]);
  const [items, setItems] = useState<QaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | QaItemStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activePanel, setActivePanel] = useState<'items' | 'categories'>('items');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<QaCategoryInput>(emptyCategoryForm);
  const [itemForm, setItemForm] = useState<QaItemInput>(emptyItemForm);
  const [keywordsInput, setKeywordsInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextCategories, nextItems] = await Promise.all([adminListQaCategories(), adminListQaItems()]);
      setCategories(nextCategories);
      setItems(nextItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o módulo de dúvidas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!itemForm.category_id && categories.length > 0) {
      setItemForm((current) => ({ ...current, category_id: categories[0].id }));
    }
  }, [categories, itemForm.category_id]);

  const stats = useMemo(() => {
    return {
      categories: categories.length,
      activeCategories: categories.filter((category) => category.is_active).length,
      published: items.filter((item) => item.status === 'published').length,
      drafts: items.filter((item) => item.status === 'draft').length,
      archived: items.filter((item) => item.status === 'archived').length,
      featured: items.filter((item) => item.is_featured).length,
    };
  }, [categories, items]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);

    return items.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category_id !== categoryFilter) return false;

      if (!normalizedSearch) return true;

      const categoryName = getCategoryName(categories, item.category_id);
      const haystack = normalizeText(
        [
          item.question,
          item.answer,
          item.slug,
          item.related_page_label ?? '',
          item.related_page_path ?? '',
          item.keywords.join(' '),
          categoryName,
        ].join(' ')
      );

      return haystack.includes(normalizedSearch);
    });
  }, [categories, categoryFilter, items, searchTerm, statusFilter]);

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
  };

  const resetItemForm = () => {
    setEditingItemId(null);
    setKeywordsInput('');
    setItemForm({
      ...emptyItemForm,
      category_id: categoryFilter !== 'all' ? categoryFilter : categories[0]?.id ?? '',
      order_index: items.length > 0 ? Math.max(...items.map((item) => item.order_index)) + 10 : 10,
    });
  };

  const handleEditCategory = (category: QaCategory) => {
    setActivePanel('categories');
    setEditingCategoryId(category.id);
    setCategoryForm(categoryToForm(category));
    setSuccess(null);
    setError(null);
  };

  const handleEditItem = (item: QaItem) => {
    setActivePanel('items');
    setEditingItemId(item.id);
    setItemForm(itemToForm(item));
    setKeywordsInput(keywordsToString(item.keywords));
    setSuccess(null);
    setError(null);
  };

  const handleCategoryTitleChange = (title: string) => {
    setCategoryForm((current) => ({
      ...current,
      title,
      slug: editingCategoryId || current.slug ? current.slug : slugify(title),
      short_title: current.short_title || title.slice(0, 18),
    }));
  };

  const handleQuestionChange = (question: string) => {
    setItemForm((current) => ({
      ...current,
      question,
      slug: editingItemId || current.slug ? current.slug : slugify(question),
    }));
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!categoryForm.title.trim() || !categoryForm.slug.trim()) {
      setError('Informe título e slug da categoria.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingCategoryId) {
        await adminUpdateQaCategory(editingCategoryId, categoryForm);
        setSuccess('Categoria atualizada.');
      } else {
        await adminCreateQaCategory(categoryForm);
        setSuccess('Categoria criada.');
      }

      resetCategoryForm();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleItemSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!itemForm.category_id || !itemForm.question.trim() || !itemForm.answer.trim() || !itemForm.slug.trim()) {
      setError('Informe categoria, pergunta, resposta e slug.');
      return;
    }

    const payload: QaItemInput = {
      ...itemForm,
      keywords: keywordStringToArray(keywordsInput),
    };

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingItemId) {
        await adminUpdateQaItem(editingItemId, payload);
        setSuccess('Pergunta atualizada.');
      } else {
        await adminCreateQaItem(payload);
        setSuccess('Pergunta criada.');
      }

      resetItemForm();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar a pergunta.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (category: QaCategory) => {
    const confirmed = category.is_active
      ? window.confirm('Desativar esta categoria? Perguntas publicadas dela deixarão de aparecer na página Dúvidas.')
      : true;

    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminToggleQaCategoryActive(category);
      setSuccess(category.is_active ? 'Categoria desativada.' : 'Categoria ativada.');
      await loadData();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Não foi possível alterar a categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (item: QaItem) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminPublishQaItem(item);
      setSuccess('Pergunta publicada.');
      await loadData();
    } catch (publishError) {
      setError(publishError instanceof Error ? publishError.message : 'Não foi possível publicar a pergunta.');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (item: QaItem) => {
    const confirmed = window.confirm('Arquivar esta pergunta? Ela deixará de aparecer na página Dúvidas.');
    if (!confirmed) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminArchiveQaItem(item);
      setSuccess('Pergunta arquivada.');
      await loadData();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Não foi possível arquivar a pergunta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDraft = async (item: QaItem) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminMoveQaItemToDraft(item);
      setSuccess('Pergunta movida para rascunho.');
      await loadData();
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : 'Não foi possível mover a pergunta para rascunho.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader
        title="Dúvidas"
        subtitle="Gerencie categorias, perguntas e respostas da página de ajuda"
        icon={HelpCircle}
        actions={[
          ...DEFAULT_MEMBER_HEADER_ACTIONS,
          { label: 'Admin', to: '/admin', icon: Settings },
          { label: 'Ver página', to: '/duvidas', icon: HelpCircle },
          { label: 'Atualizar', onClick: loadData, icon: RefreshCcw, variant: 'primary', disabled: loading || saving },
        ]}
      />

      <main className={`${PAGE_CONTAINER_CLASS} py-6 sm:py-8`}>
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Categorias</p><p className="text-2xl font-bold text-gray-900">{stats.categories}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Ativas</p><p className="text-2xl font-bold text-gray-900">{stats.activeCategories}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Publicadas</p><p className="text-2xl font-bold text-emerald-700">{stats.published}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Rascunhos</p><p className="text-2xl font-bold text-amber-700">{stats.drafts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Arquivadas</p><p className="text-2xl font-bold text-slate-700">{stats.archived}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Destaques</p><p className="text-2xl font-bold text-blue-700">{stats.featured}</p></CardContent></Card>
        </div>

        {(error || success) && (
          <div className="mb-6 space-y-2">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por pergunta, resposta, palavra-chave ou página relacionada"
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.title}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | QaItemStatus)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
            <option value="archived">Arquivado</option>
          </select>
          <Button type="button" variant="outline" onClick={resetItemForm} className="w-full lg:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nova dúvida
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 lg:hidden">
          <Button type="button" variant={activePanel === 'items' ? 'default' : 'outline'} onClick={() => setActivePanel('items')}>Perguntas</Button>
          <Button type="button" variant={activePanel === 'categories' ? 'default' : 'outline'} onClick={() => setActivePanel('categories')}>Categorias</Button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
          <div className={`${activePanel === 'items' ? 'block' : 'hidden'} space-y-6 lg:block`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perguntas e respostas</CardTitle>
                <p className="text-sm text-gray-500">
                  {loading ? 'Carregando...' : `${filteredItems.length} pergunta(s) encontrada(s).`}
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-gray-500">Carregando perguntas...</p>
                ) : filteredItems.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Nenhuma pergunta encontrada para os filtros atuais.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <article key={item.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge className={statusBadgeClass(item.status)}>{statusLabel(item.status)}</Badge>
                              {item.is_featured && <Badge variant="secondary">Destaque</Badge>}
                              <span className="text-xs text-gray-500">Ordem {item.order_index}</span>
                            </div>
                            <h3 className="break-words text-base font-semibold text-gray-900">{item.question}</h3>
                            <p className="mt-1 line-clamp-3 break-words text-sm text-gray-600">{item.answer}</p>
                            <p className="mt-3 text-xs text-gray-500">
                              {getCategoryName(categories, item.category_id)}
                              {item.related_page_label ? ` · Página relacionada: ${item.related_page_label}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <Button type="button" size="sm" variant="outline" onClick={() => handleEditItem(item)}>Editar</Button>
                            {item.status !== 'published' && <Button type="button" size="sm" onClick={() => handlePublish(item)} disabled={saving}>Publicar</Button>}
                            {item.status === 'published' && <Button type="button" size="sm" variant="outline" onClick={() => handleDraft(item)} disabled={saving}>Rascunho</Button>}
                            {item.status !== 'archived' && <Button type="button" size="sm" variant="outline" onClick={() => handleArchive(item)} disabled={saving}>Arquivar</Button>}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={activePanel === 'items' ? 'block' : 'hidden lg:block'}>
              <CardHeader>
                <CardTitle className="text-lg">{editingItemId ? 'Editar pergunta' : 'Nova pergunta'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleItemSubmit}>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoria
                    <select
                      value={itemForm.category_id}
                      onChange={(event) => setItemForm((current) => ({ ...current, category_id: event.target.value }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Selecione</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.title}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Pergunta
                    <input
                      value={itemForm.question}
                      onChange={(event) => handleQuestionChange(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Resposta
                    <textarea
                      value={itemForm.answer}
                      onChange={(event) => setItemForm((current) => ({ ...current, answer: event.target.value }))}
                      rows={6}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Slug
                      <input
                        value={itemForm.slug}
                        onChange={(event) => setItemForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Ordem
                      <input
                        type="number"
                        value={itemForm.order_index ?? 0}
                        onChange={(event) => setItemForm((current) => ({ ...current, order_index: Number(event.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Página relacionada
                      <input
                        value={itemForm.related_page_label ?? ''}
                        onChange={(event) => setItemForm((current) => ({ ...current, related_page_label: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Caminho relacionado
                      <input
                        value={itemForm.related_page_path ?? ''}
                        onChange={(event) => setItemForm((current) => ({ ...current, related_page_path: event.target.value }))}
                        placeholder="/meus-vinculos"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    Palavras-chave
                    <input
                      value={keywordsInput}
                      onChange={(event) => setKeywordsInput(event.target.value)}
                      placeholder="árvore, vínculos, cadastro"
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                      <select
                        value={itemForm.status ?? 'draft'}
                        onChange={(event) => setItemForm((current) => ({ ...current, status: event.target.value as QaItemStatus }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="archived">Arquivado</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 pt-7 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={itemForm.is_featured === true}
                        onChange={(event) => setItemForm((current) => ({ ...current, is_featured: event.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Mostrar em dúvidas frequentes
                    </label>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" disabled={saving} className="w-full sm:w-auto">{editingItemId ? 'Salvar pergunta' : 'Criar pergunta'}</Button>
                    <Button type="button" variant="outline" onClick={resetItemForm} className="w-full sm:w-auto">Limpar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className={activePanel === 'categories' ? 'block' : 'hidden lg:block'}>
              <CardHeader>
                <CardTitle className="text-lg">{editingCategoryId ? 'Editar categoria' : 'Nova categoria'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCategorySubmit}>
                  <label className="block text-sm font-medium text-gray-700">
                    Título
                    <input
                      value={categoryForm.title}
                      onChange={(event) => handleCategoryTitleChange(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Título curto
                      <input
                        value={categoryForm.short_title ?? ''}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, short_title: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                    <label className="block text-sm font-medium text-gray-700">
                      Ordem
                      <input
                        type="number"
                        value={categoryForm.order_index ?? 0}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, order_index: Number(event.target.value) }))}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug
                    <input
                      value={categoryForm.slug}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, slug: slugify(event.target.value) }))}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                    <textarea
                      value={categoryForm.description ?? ''}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active !== false}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, is_active: event.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Categoria ativa
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button type="submit" disabled={saving} className="w-full sm:w-auto">{editingCategoryId ? 'Salvar categoria' : 'Criar categoria'}</Button>
                    <Button type="button" variant="outline" onClick={resetCategoryForm} className="w-full sm:w-auto">Limpar</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className={activePanel === 'categories' ? 'block' : 'hidden lg:block'}>
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-xl border border-gray-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-gray-900">{category.title}</p>
                          <p className="text-xs text-gray-500">Ordem {category.order_index} · {category.slug}</p>
                        </div>
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>{category.is_active ? 'Ativa' : 'Inativa'}</Badge>
                      </div>
                      {category.description && <p className="mt-2 line-clamp-2 text-xs text-gray-600">{category.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => handleEditCategory(category)}>Editar</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => handleToggleCategory(category)} disabled={saving}>
                          {category.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
