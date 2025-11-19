import React from 'react';

export interface CoverLetterListItem {
  id: number;
  title: string;
  company?: string | null;
  created_at?: string;
}

interface Props {
  title: string;
  count: number;
  items: CoverLetterListItem[];
  badgeColor: 'yellow' | 'green';
  primaryLabel: string; // 'Abrir' | 'Ver'
  onPrimary: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function CoverLetterListSection({ title, count, items, badgeColor, primaryLabel, onPrimary, onDelete }: Props) {
  const badgeClass = badgeColor === 'yellow'
    ? 'px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full'
    : 'px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full';
  const pillClass = badgeColor === 'yellow'
    ? 'px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded'
    : 'px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded';

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <span className={badgeClass}>{count}</span>
      </div>
      <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-100">
        {items.map((l) => (
          <div key={l.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-gray-900">{l.title}</div>
                  <span className={pillClass}>
                    {badgeColor === 'yellow' ? 'Draft' : 'Completada'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {l.company && <span className="mr-2">{l.company}</span>}
                  {l.created_at && <span>{new Date(l.created_at).toLocaleString()}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onPrimary(l.id); }}
                >
                  {primaryLabel}
                </button>
                {onDelete && (
                  <button
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                    onClick={(e) => { e.stopPropagation(); onDelete(l.id); }}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
