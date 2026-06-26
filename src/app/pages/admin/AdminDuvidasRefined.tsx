import React, { useEffect, useMemo, useState } from 'react';
import { Archive, CheckCircle2, Edit3, HelpCircle, Plus, Search, Star, XCircle } from 'lucide-react';
import { DEFAULT_MEMBER_HEADER_ACTIONS, MemberPageHeader, PAGE_CONTAINER_CLASS } from '../../components/layout/MemberPageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  adminCreateQaCategory,
  adminCreateQaItem,
  adminListQaCategories,
  adminListQaItems,
  adminSetQaItemStatus,
  adminToggleQaCategory,
  adminUpdateQaCategory,
  adminUpdateQaItem,
} from '../../services/qaService';
import type { QaCategory, QaCategoryInput, QaItem, QaItemInput, QaItemStatus } from '../../types/qa';

type CategoryFormState = QaCategoryInput & { id?: string };
type ItemFormState = QaItemInput & { id?: string };

const emptyCategoryForm: CategoryFormState = { title: '', short_title: '', slug: '', description: '', order_index: 0, is_active: true };
const emptyItemForm: ItemFormState = { category_id: '', question: '', answer: '', slug: '', keywords: [], related_page_label: '', related_page_path: '', is_featured: false, status: 'draft', order_index: 0 };

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeText(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function statusLabel(status: QaItemStatus) {
  if (status === 'published') return 'Publicado';
  if (status === 'archived') return 'Arquivado';
  return 'Rascunho';
}

function statusClass(status: QaItemStatus) {
  if (status === 'published') return 'bg-emerald-100 text-emerald-800';
  if (status === 'archived') return 'bg-slate-200 text-slate-700';
  return 'bg-amber-100 text-amber-800';
}

function IconAction({ label, children, onClick, disabled }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <Button type="button" size="icon" variant="outline" onClick={onClick} disabled={disabled} title={label} aria-label={label}>
      {children}
    </Button>
  );
}

export function AdminDuvidasRefined() {
  const [categories, setCategories] = useState<QaCategory[]>([]);
  const [items, setItems] = useState<QaItem[]>([]);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | QaItemStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);
  const stats = useMemo(() => ({
    categories: categories.length,
    activeCategories: categories.filter((category) => category.is_active).length,
    published: items.filter((item) => item.status === 'published').length,
    drafts: items.filter((item) => item.status === 'draft').length,
    archived: items.filter((item) => item.status === 'archived').length,
  }), [categories, items]);

  const filteredItems = useMemo(() => {
    const query = normalizeText(searchTerm);
    return items.filter((item) => {
      if (selectedCategoryId !== 'all' && item.category_id !== selectedCategoryId) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (!query) return true;
      const category = categoryById.get(item.category_id);
      const keywords = Array.isArray(item.keywords) ? item.keywords : [];
      return normalizeText([item.question, item.answer, item.slug, keywords.join(' '), category?.title ?? ''].join(' ')).includes(query);
    });
  }, [categoryById, items, searchTerm, selectedCategoryId, selectedStatus]);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage(null);
      const [categoriesData, itemsData] = await Promise.all([adminListQaCategories(), adminListQaItems()]);
      setCategories(categoriesData);
      setItems(itemsData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível carregar as dúvidas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    if (!itemForm.category_id && categories[0]?.id) setItemForm((current) => ({ ...current, category_id: categories[0].id }));
  }, [categories, itemForm.category_id]);

  function startCategoryEdit(category: QaCategory) {
    setEditingCategoryId(category.id);
    setCategoryForm({ id: category.id, title: category.title, short_title: category.short_title ?? '', slug: category.slug, description: category.description ?? '', order_index: category.order_index, is_active: category.is_active });
    setActiveTab('categories');
  }

  function startItemEdit(item: QaItem) {
    setEditingItemId(item.id);
    setItemForm({ id: item.id, category_id: item.category_id, question: item.question, answer: item.answer, slug: item.slug, keywords: item.keywords, related_page_label: item.related_page_label ?? '', related_page_path: item.related_page_path ?? '', is_featured: item.is_featured, status: item.status, order_index: item.order_index });
    setActiveTab('items');
  }

  async function saveCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryForm.title.trim()) return setErrorMessage('Informe o título da categoria.');
    const payload: QaCategoryInput = { ...categoryForm, slug: categoryForm.slug || slugify(categoryForm.title) };
    try {
      setSaving(true);
      if (editingCategoryId) await adminUpdateQaCategory(editingCategoryId, payload);
      else await adminCreateQaCategory(payload);
      setEditingCategoryId(null);
      setCategoryForm(emptyCategoryForm);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();
    if (!itemForm.category_id) return setErrorMessage('Selecione uma categoria.');
    if (!itemForm.question.trim() || !itemForm.answer.trim()) return setErrorMessage('Informe pergunta e resposta.');
    const payload: QaItemInput = { ...itemForm, slug: itemForm.slug || slugify(itemForm.question), keywords: Array.isArray(itemForm.keywords) ? itemForm.keywords : [] };
    try {
      setSaving(true);
      if (editingItemId) await adminUpdateQaItem(editingItemId, payload);
      else await adminCreateQaItem(payload);
      setEditingItemId(null);
      setItemForm({ ...emptyItemForm, category_id: categories[0]?.id ?? '' });
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar a dúvida.');
    } finally {
      setSaving(false);
    }
  }

  async function setItemStatus(id: string, status: QaItemStatus) {
    try {
      setSaving(true);
      await adminSetQaItemStatus(id, status);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível alterar o status.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: QaCategory) {
    try {
      setSaving(true);
      await adminToggleQaCategory(category.id, !category.is_active);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível atualizar a categoria.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader title="Dúvidas" subtitle="Gerencie categorias, perguntas e respostas da página de ajuda" icon={HelpCircle} actions={DEFAULT_MEMBER_HEADER_ACTIONS} />
      <main className={`${PAGE_CONTAINER_CLASS} py-6 sm:py-8`}>
        {errorMessage && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Categorias</p><p className="text-2xl font-bold">{stats.categories}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Ativas</p><p className="text-2xl font-bold">{stats.activeCategories}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Publicadas</p><p className="text-2xl font-bold text-emerald-700">{stats.published}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Rascunhos</p><p className="text-2xl font-bold text-amber-700">{stats.drafts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Arquivadas</p><p className="text-2xl font-bold text-slate-700">{stats.archived}</p></CardContent></Card>
        </section>

        <div className="mb-4 flex gap-2 sm:hidden">
          <Button type="button" variant={activeTab === 'items' ? 'default' : 'outline'} onClick={() => setActiveTab('items')} className="flex-1">Perguntas</Button>
          <Button type="button" variant={activeTab === 'categories' ? 'default' : 'outline'} onClick={() => setActiveTab('categories')} className="flex-1">Categorias</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className={activeTab === 'categories' ? 'block' : 'hidden lg:block'}>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5" />{editingCategoryId ? 'Editar categoria' : 'Nova categoria'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={saveCategory} className="space-y-3">
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Título" value={categoryForm.title} onChange={(event) => setCategoryForm((current) => ({ ...current, title: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Título curto" value={categoryForm.short_title ?? ''} onChange={(event) => setCategoryForm((current) => ({ ...current, short_title: event.target.value }))} />
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="slug" value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: slugify(event.target.value) }))} />
                  <textarea className="min-h-[90px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Descrição" value={categoryForm.description ?? ''} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Ordem" value={categoryForm.order_index ?? 0} onChange={(event) => setCategoryForm((current) => ({ ...current, order_index: Number(event.target.value) }))} />
                    <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"><input type="checkbox" checked={categoryForm.is_active !== false} onChange={(event) => setCategoryForm((current) => ({ ...current, is_active: event.target.checked }))} />Ativa</label>
                  </div>
                  <div className="flex gap-2"><Button type="submit" disabled={saving} className="flex-1">{editingCategoryId ? 'Salvar' : 'Criar'}</Button>{editingCategoryId && <Button type="button" variant="outline" onClick={() => { setEditingCategoryId(null); setCategoryForm(emptyCategoryForm); }}>Cancelar</Button>}</div>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader><CardTitle className="text-lg">Categorias</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="flex items-start justify-between gap-2"><div><p className="font-medium text-gray-900">{category.title}</p><p className="mt-1 text-xs text-gray-500">Ordem {category.order_index}</p></div><span className={`rounded-full px-2 py-1 text-xs ${category.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>{category.is_active ? 'Ativa' : 'Inativa'}</span></div>
                    <div className="mt-3 flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => startCategoryEdit(category)}><Edit3 className="mr-1 h-3.5 w-3.5" />Editar</Button><Button type="button" size="sm" variant="outline" onClick={() => toggleCategory(category)} disabled={saving}>{category.is_active ? <XCircle className="mr-1 h-3.5 w-3.5" /> : <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}{category.is_active ? 'Desativar' : 'Ativar'}</Button></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className={activeTab === 'items' ? 'block' : 'hidden lg:block'}>
            <Card className="mb-4">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Plus className="h-5 w-5" />{editingItemId ? 'Editar dúvida' : 'Nova dúvida'}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={saveItem} className="grid gap-3 lg:grid-cols-2">
                  <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={itemForm.category_id} onChange={(event) => setItemForm((current) => ({ ...current, category_id: event.target.value }))}><option value="">Selecione a categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select>
                  <input type="number" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Ordem" value={itemForm.order_index ?? 0} onChange={(event) => setItemForm((current) => ({ ...current, order_index: Number(event.target.value) }))} />
                  <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm lg:col-span-2" placeholder="Pergunta" value={itemForm.question} onChange={(event) => setItemForm((current) => ({ ...current, question: event.target.value, slug: current.slug || slugify(event.target.value) }))} />
                  <textarea className="min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm lg:col-span-2" placeholder="Resposta" value={itemForm.answer} onChange={(event) => setItemForm((current) => ({ ...current, answer: event.target.value }))} />
                  <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="slug" value={itemForm.slug} onChange={(event) => setItemForm((current) => ({ ...current, slug: slugify(event.target.value) }))} />
                  <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Palavras-chave separadas por vírgula" value={(itemForm.keywords ?? []).join(', ')} onChange={(event) => setItemForm((current) => ({ ...current, keywords: event.target.value.split(',').map((keyword) => keyword.trim()).filter(Boolean) }))} />
                  <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Página relacionada" value={itemForm.related_page_label ?? ''} onChange={(event) => setItemForm((current) => ({ ...current, related_page_label: event.target.value }))} />
                  <input className="rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Caminho relacionado" value={itemForm.related_page_path ?? ''} onChange={(event) => setItemForm((current) => ({ ...current, related_page_path: event.target.value }))} />
                  <div className="flex flex-wrap items-center gap-3 lg:col-span-2"><select className="rounded-lg border border-gray-300 px-3 py-2 text-sm" value={itemForm.status} onChange={(event) => setItemForm((current) => ({ ...current, status: event.target.value as QaItemStatus }))}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={itemForm.is_featured === true} onChange={(event) => setItemForm((current) => ({ ...current, is_featured: event.target.checked }))} />Destaque</label><Button type="submit" disabled={saving}>{editingItemId ? 'Salvar dúvida' : 'Criar dúvida'}</Button>{editingItemId && <Button type="button" variant="outline" onClick={() => { setEditingItemId(null); setItemForm({ ...emptyItemForm, category_id: categories[0]?.id ?? '' }); }}>Cancelar</Button>}</div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><div className="space-y-3"><CardTitle className="text-lg">Perguntas e respostas</CardTitle><div className="grid gap-2 lg:grid-cols-[minmax(12rem,1fr)_minmax(12rem,1fr)_minmax(10rem,0.8fr)]"><div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm" placeholder="Buscar dúvida" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div><select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}><option value="all">Todas as categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select><select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as 'all' | QaItemStatus)}><option value="all">Todos os status</option><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></div></div></CardHeader>
              <CardContent>
                {loading ? <p className="py-8 text-center text-sm text-gray-500">Carregando dúvidas...</p> : filteredItems.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Nenhuma dúvida encontrada.</p> : (
                  <div className="space-y-3">
                    {filteredItems.map((item) => {
                      const category = categoryById.get(item.category_id);
                      return (
                        <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="mb-1 flex min-w-0 flex-1 flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>{item.is_featured && <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"><Star className="mr-1 h-3 w-3" />Destaque</span>}<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">{category?.title ?? 'Sem categoria'}</span></div><div className="flex shrink-0 flex-wrap gap-2"><IconAction label="Editar dúvida" onClick={() => startItemEdit(item)}><Edit3 className="h-4 w-4" /></IconAction>{item.status !== 'published' && <IconAction label="Publicar dúvida" onClick={() => setItemStatus(item.id, 'published')} disabled={saving}><CheckCircle2 className="h-4 w-4" /></IconAction>}{item.status !== 'draft' && <IconAction label="Mover dúvida para rascunho" onClick={() => setItemStatus(item.id, 'draft')} disabled={saving}><XCircle className="h-4 w-4" /></IconAction>}{item.status !== 'archived' && <IconAction label="Arquivar dúvida" onClick={() => setItemStatus(item.id, 'archived')} disabled={saving}><Archive className="h-4 w-4" /></IconAction>}</div></div>
                          <div className="mt-1 min-w-0"><h3 className="break-words text-base font-semibold text-gray-900">{item.question}</h3><p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-gray-600">{item.answer}</p><p className="mt-3 text-xs text-gray-500">Ordem {item.order_index}</p></div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
