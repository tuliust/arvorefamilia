import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

type ForumReplyFormProps = {
  placeholder?: string;
  submitLabel?: string;
  enviando?: boolean;
  onSubmit: (conteudo: string) => void | Promise<void>;
};

export function ForumReplyForm({
  placeholder = 'Escreva sua resposta',
  submitLabel = 'Publicar resposta',
  enviando = false,
  onSubmit,
}: ForumReplyFormProps) {
  const [conteudo, setConteudo] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const texto = conteudo.trim();
    if (!texto) return;
    await onSubmit(texto);
    setConteudo('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={conteudo}
        onChange={(event) => setConteudo(event.target.value)}
        placeholder={placeholder}
        className="min-h-32"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={enviando || !conteudo.trim()}>
          <Send className="mr-2 h-4 w-4" />
          {enviando ? 'Enviando...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
