import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

import { curiositySectionCardClassName, isPet, type CuriosidadesDataProps } from './curiosidadesUtils';

type CuriosidadesPhotoSliderProps = Pick<CuriosidadesDataProps, 'pessoas' | 'loading'> & {
  className?: string;
};

export function CuriosidadesPhotoSlider({
  pessoas,
  loading,
  className = '',
}: CuriosidadesPhotoSliderProps) {
  const photos = useMemo(
    () => pessoas
      .filter((pessoa) => !isPet(pessoa) && pessoa.foto_principal_url?.trim())
      .map((pessoa) => ({
        id: pessoa.id,
        src: String(pessoa.foto_principal_url),
        caption: pessoa.nome_completo || 'Registro da família',
      }))
      .slice(0, 12),
    [pessoas]
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= photos.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, photos.length]);

  const currentPhoto = photos[currentIndex] ?? null;

  const goPrevious = () => {
    if (photos.length <= 1) return;
    setCurrentIndex((current) => (current - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (photos.length <= 1) return;
    setCurrentIndex((current) => (current + 1) % photos.length);
  };

  return (
    <section className={`${curiositySectionCardClassName} flex min-h-56 flex-col p-0 ${className}`}>
      {loading ? (
        <div className="h-full min-h-56 animate-pulse rounded-2xl bg-gray-100" />
      ) : currentPhoto ? (
        <div className="relative min-h-56 flex-1 overflow-hidden rounded-2xl">
          <img
            src={currentPhoto.src}
            alt={currentPhoto.caption}
            className="h-full min-h-56 w-full object-cover"
          />

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-transparent px-4 pb-4 pt-16">
            <p className="pr-24 text-sm font-bold leading-5 text-white drop-shadow">
              {currentPhoto.caption}
            </p>
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={goPrevious}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-blue-700 shadow-sm transition hover:bg-blue-50"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-blue-700 shadow-sm transition hover:bg-blue-50"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-56 flex-1 items-center justify-center rounded-2xl bg-blue-50 p-5 text-center">
          <div>
            <ImageIcon className="mx-auto h-8 w-8 text-blue-700" />
            <p className="mt-3 text-sm font-semibold text-blue-900">
              Adicione fotos aos perfis para exibir memórias neste espaço.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
