import { ProgressBar } from '../ui/ProgressBar';
import type { Atributo } from '../../types/tree';
import { SubParameter } from './OdsBadge';

interface AttributeBarProps {
  label: string;
  atributo: Atributo;
  showDetails?: boolean;
}

export function AttributeBar({ label, atributo, showDetails = false }: AttributeBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-texto-principal">{label}</span>
        <span className="text-texto-secundario font-medium">{atributo.nota}/5</span>
      </div>
      <ProgressBar value={atributo.nota} />

      {showDetails && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-verde-primario font-medium hover:underline">
            Ver parâmetros e legenda
          </summary>
          <div className="mt-2 pl-3 border-l-2 border-verde-claro">
            <p className="text-texto-secundario mb-2">
              <strong>Significado:</strong> {atributo.legenda}
            </p>
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {atributo.sub.map((s, i) => (
                <li key={i} className="text-texto-secundario text-xs">
                  • <SubParameter text={s} />
                </li>
              ))}
            </ul>
          </div>
        </details>
      )}
    </div>
  );
}
