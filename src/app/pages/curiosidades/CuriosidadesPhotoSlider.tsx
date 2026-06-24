import { useEffect, useMemo, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

import { curiositySectionCardClassName, isPet, type CuriosidadesDataProps } from './curiosidadesUtils';

type CuriosidadesPhotoSliderProps = Pick<CuriosidadesDataProps, 'pessoas' | 'loading'> & {
  className?: string;
};

const PHOTOS_PER_PAGE = 3;

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
      .slice(0, 18),
    [pessoas]
  );

  const [pageIndex, setPageIndex] = useState(0);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>('');

  const totalPages = Math.max(1, Math.ceil(photos.length / PHOTOS_PER_PAGE));
  const safePageIndex = Math.min(pageIndex, totalPages - 1);
  const visiblePhotos = photos.slice(safePageIndex * PHOTOS_PER_PAGE, safePageIndex * PHOTOS_PER_PAGE + PHOTOS_PER_PAGE);
  const selectedPhoto = photos.find((photo) => photo.id === selectedPhotoId) ?? visiblePhotos[0] ?? photos[0] ?? null;
  const placeholderCount = Math.max(0, PHOTOS_PER_PAGE - visiblePhotos.length);

  useEffect(() => {
    if (pageIndex !== safePageIndex) {
      setPageIndex(safePageIndex);
    }
  }, [pageIndex, safePageIndex]);

  useEffect(() => {
    if (!selectedPhotoId && photos[0]) {
      setSelectedPhotoId(photos[0].id);
      return;
    }

    if (selectedPhotoId && !photos.some((photo) => photo.id === selectedPhotoId)) {
      setSelectedPhotoId(photos[0]?.id ?? '');
    }
  }, [photos, selectedPhotoId]);

  const selectedIndex = Math.max(0, photos.findIndex((photo) => photo.id === selectedPhoto?.id));

  const goPrevious = () => {
    if (photos.length <= 1) return;

    const nextIndex = (selectedIndex - 1 + photos.length) % photos.length;
    setSelectedPhotoId(photos[nextIndex]?.id ?? '');
    setPageIndex(Math.floor(nextIndex / PHOTOS_PER_PAGE));
  };

  const goNext = () => {
    if (photos.length <= 1) return;

    const nextIndex = (selectedIndex + 1) % photos.length;
    setSelectedPhotoId(photos[nextIndex]?.id ?? '');
    setPageIndex(Math.floor(nextIndex / PHOTOS_PER_PAGE));
  };

  return (
    <section className={`${curiositySectionCardClassName} curiosidades-photo-slider-card flex min-h-56 flex-col ${className}`}>
      {loading ? (
        <div className="h-full min-h-56 animate-pulse rounded-2xl bg-gray-100" />
      ) : photos.length > 0 ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <div className="hidden flex-1 grid-cols-3 gap-2 md:grid">
            {visiblePhotos.map((photo) => {
              const active = selectedPhoto?.id === photo.id;

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhotoId(photo.id)}
                  className={[
                    'group relative min-h-24 overflow-hidden rounded-xl border bg-gray-100 text-left shadow-sm transition',
                    active ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-blue-200',
                  ].join(' ')}
                  aria-label={`Ver foto de ${photo.caption}`}
                >
                  <img src={photo.src} alt={photo.caption} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                </button>
              );
            })}

            {Array.from({ length: placeholderCount }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-blue-100 bg-blue-50 text-blue-700"
                aria-hidden="true"
              >
                <Camera className="h-5 w-5" />
              </div>
            ))}
          </div>

          {selectedPhoto && (
            <div className="relative min-h-[17rem] overflow-hidden rounded-xl border border-blue-100 bg-gray-100 md:hidden">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                className="h-full min-h-[17rem] w-full object-cover"
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-blue-700 shadow-lg transition hover:bg-blue-50"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-blue-700 shadow-lg transition hover:bg-blue-50"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          )}

          <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
            <p className="min-w-0 truncate text-sm font-bold text-blue-950">
              {selectedPhoto?.caption ?? 'Fotos da família'}
            </p>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <button
                type="button"
                onClick={goPrevious}
                disabled={photos.length <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-40"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={photos.length <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:opacity-40"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
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
