import { Pessoa } from '../../types';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { getInitials } from '../../utils/personFields';
import { PROFILE_CONTROL_REASON_OPTIONS } from './meusVinculosUtils';
import { ProfileControlRequestReason } from './types';

type ProfileControlRequestDialogProps = {
  open: boolean;
  person: Pessoa | null;
  reason: ProfileControlRequestReason;
  description: string;
  error?: string | null;
  onOpenChange: (open: boolean) => void;
  onReasonChange: (reason: ProfileControlRequestReason) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
};

function PersonAvatar({ person }: { person: Pessoa }) {
  const photo = String(person.foto_principal_url ?? '').trim();

  return (
    <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
      {photo ? (
        <img src={photo} alt={person.nome_completo} className="h-full w-full object-cover" />
      ) : (
        <span className="inline-flex h-full w-full items-center justify-center text-sm font-semibold">
          {getInitials(person.nome_completo)}
        </span>
      )}
    </div>
  );
}

export function ProfileControlRequestDialog({
  open,
  person,
  reason,
  description,
  error,
  onOpenChange,
  onReasonChange,
  onDescriptionChange,
  onSubmit,
}: ProfileControlRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="break-words">Solicitar controle do perfil</DialogTitle>
          <DialogDescription className="break-words">
            Você está pedindo permissão para editar e manter as informações deste perfil familiar.
          </DialogDescription>
        </DialogHeader>

        {person && (
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <PersonAvatar person={person} />
            <div className="min-w-0">
              <p className="text-sm text-gray-600">Perfil selecionado</p>
              <p className="break-words font-semibold text-gray-950">{person.nome_completo}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="control-request-reason">Motivo</Label>
            <select
              id="control-request-reason"
              value={reason}
              onChange={(event) => onReasonChange(event.target.value as ProfileControlRequestReason)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              {PROFILE_CONTROL_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="control-request-description">Explique brevemente sua relação com essa pessoa</Label>
            <Textarea
              id="control-request-description"
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              placeholder="Ex: sou filho, neto, sobrinho, responsável legal ou familiar próximo."
              rows={5}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={onSubmit}>
            Enviar solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
