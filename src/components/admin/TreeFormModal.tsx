import { useEffect, useState } from 'react';
import { useForm, Controller, type UseFormRegister } from 'react-hook-form';
import { Save, Loader2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { FormSection } from './FormSection';
import { RatingInput } from './RatingInput';
import { ImageUpload } from './ImageUpload';
import { useCreateTree, useUpdateTree, useUploadTreeImage } from '../../hooks/useAdminTrees';
import type { Arvore } from '../../types/tree';

type TreeFormData = Omit<Arvore, 'id'>;

interface TreeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree?: Arvore | null;
}

const defaultValues: TreeFormData = {
  nome_popular: '',
  nome_cientifico: '',
  foto: null,
  origem: 'Nativa BR',
  decidua_perenifolia: 'Perenifólia',
  epoca_floracao: null,
  epoca_frutificacao: null,
  altura_adulta_max_m: null,
  porte_altura_classe: null,
  diametro_copa_adulto_max_m: null,
  copa_classe: null,
  dap_adulto_max_cm: null,
  altura_primeira_bifurcacao_m: null,
  forma_copa: null,
  faixa_serv_min_m_recomendada: null,
  berco_area_min_m2_recomendada: null,
  volume_solo_min_m3_recomendado: null,
  compat_fiacao: null,
  potencial_dano_calcada_1a5: null,
  tolerancia_sol_pleno: null,
  tolerancia_meia_sombra: null,
  tolerancia_sombra: null,
  tolerancia_seca_1a5: null,
  tolerancia_encharcamento_1a5: null,
  tolerancia_poluicao_atmosferica_1a5: null,
  tolerancia_compactacao_solo_1a5: null,
  tolerancia_ventos_fortes_1a5: null,
  potencial_sujeira_1a5: null,
  presenca_espinhos: null,
  presenca_subst_irritantes: null,
  atracao_fauna_1a5: null,
  tolerancia_poda_1a5: null,
  potencial_sombra_1a5: null,
  contribuicao_biodiversidade_1a5: null,
};

export function TreeFormModal({ isOpen, onClose, tree }: TreeFormModalProps) {
  const isEditing = !!tree;
  const createTree = useCreateTree();
  const updateTree = useUpdateTree();
  const uploadImage = useUploadTreeImage();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<TreeFormData>({
    defaultValues,
  });

  useEffect(() => {
    if (isOpen) {
      if (tree) {
        const { id: _, ...treeData } = tree;
        reset(treeData);
      } else {
        reset(defaultValues);
      }
      setImageFile(null);
    }
  }, [isOpen, tree, reset]);

  const saving = createTree.isPending || updateTree.isPending || uploadImage.isPending;

  const onSubmit = async (data: TreeFormData) => {
    let fotoUrl = data.foto;

    if (imageFile) {
      try {
        fotoUrl = await uploadImage.mutateAsync(imageFile);
      } catch {
        return; // toast already shown by hook
      }
    }

    const treeData = { ...data, foto: fotoUrl };

    if (isEditing && tree) {
      updateTree.mutate({ id: tree.id, ...treeData }, { onSuccess: onClose });
    } else {
      createTree.mutate(treeData, { onSuccess: onClose });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">
          {isEditing ? `Editar: ${tree?.nome_popular}` : 'Cadastrar Nova Árvore'}
        </h2>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Seção 1: Dados Básicos */}
          <FormSection title="Dados Básicos" defaultOpen>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Popular *</label>
              <input
                maxLength={150}
                {...register('nome_popular', { required: 'Nome popular é obrigatório', maxLength: { value: 150, message: 'Máximo de 150 caracteres' } })}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
              {errors.nome_popular && <span className="text-xs text-destructive mt-1">{errors.nome_popular.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nome Científico *</label>
              <input
                maxLength={150}
                {...register('nome_cientifico', { required: 'Nome científico é obrigatório', maxLength: { value: 150, message: 'Máximo de 150 caracteres' } })}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
              {errors.nome_cientifico && <span className="text-xs text-destructive mt-1">{errors.nome_cientifico.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Origem</label>
              <select
                {...register('origem')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              >
                <option value="Nativa BR">Nativa BR</option>
                <option value="Exótica">Exótica</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Folhagem</label>
              <select
                {...register('decidua_perenifolia')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              >
                <option value="Perenifólia">Perenifólia</option>
                <option value="Decídua">Decídua</option>
                <option value="Semidecídua">Semidecídua</option>
              </select>
            </div>

            <Controller
              control={control}
              name="foto"
              render={({ field }) => (
                <ImageUpload
                  currentUrl={field.value}
                  previewFile={imageFile}
                  onFileSelect={(file) => {
                    setImageFile(file);
                    if (!file) field.onChange(null);
                  }}
                />
              )}
            />
          </FormSection>

          {/* Seção 2: Morfologia */}
          <FormSection title="Morfologia" defaultOpen={false}>
            <NumberField label="Altura Máxima (m)" register={register} name="altura_adulta_max_m" />

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Porte</label>
              <select
                {...register('porte_altura_classe')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              >
                <option value="">—</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            <NumberField label="Diâmetro Copa (m)" register={register} name="diametro_copa_adulto_max_m" />

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Classe Copa</label>
              <select
                {...register('copa_classe')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              >
                <option value="">—</option>
                <option value="Pequena">Pequena</option>
                <option value="Média">Média</option>
                <option value="Grande">Grande</option>
              </select>
            </div>

            <NumberField label="DAP Máximo (cm)" register={register} name="dap_adulto_max_cm" />

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Alt. 1ª Bifurcação</label>
              <input
                {...register('altura_primeira_bifurcacao_m')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Forma da Copa</label>
              <input
                maxLength={100}
                {...register('forma_copa')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
          </FormSection>

          {/* Seção 3: Tolerâncias Ecológicas */}
          <FormSection title="Tolerâncias Ecológicas" defaultOpen={false}>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Luminosidade</label>
              <div className="flex flex-wrap gap-4">
                <CheckboxField label="Sol Pleno" register={register} name="tolerancia_sol_pleno" />
                <CheckboxField label="Meia Sombra" register={register} name="tolerancia_meia_sombra" />
                <CheckboxField label="Sombra" register={register} name="tolerancia_sombra" />
              </div>
            </div>

            <Controller control={control} name="tolerancia_seca_1a5" render={({ field }) => (
              <RatingInput label="Tolerância à Seca" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="tolerancia_encharcamento_1a5" render={({ field }) => (
              <RatingInput label="Tolerância ao Encharcamento" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="tolerancia_poluicao_atmosferica_1a5" render={({ field }) => (
              <RatingInput label="Tolerância à Poluição" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="tolerancia_compactacao_solo_1a5" render={({ field }) => (
              <RatingInput label="Tolerância à Compactação" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="tolerancia_ventos_fortes_1a5" render={({ field }) => (
              <RatingInput label="Tolerância a Ventos Fortes" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="tolerancia_poda_1a5" render={({ field }) => (
              <RatingInput label="Tolerância à Poda" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="atracao_fauna_1a5" render={({ field }) => (
              <RatingInput label="Atração da Fauna" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="potencial_sombra_1a5" render={({ field }) => (
              <RatingInput label="Potencial de Sombra" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="contribuicao_biodiversidade_1a5" render={({ field }) => (
              <RatingInput label="Contribuição à Biodiversidade" value={field.value} onChange={field.onChange} />
            )} />
          </FormSection>

          {/* Seção 4: Fenologia */}
          <FormSection title="Fenologia" defaultOpen={false}>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Época de Floração</label>
              <input
                maxLength={100}
                {...register('epoca_floracao')}
                placeholder="Ex: Set-Nov"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Época de Frutificação</label>
              <input
                maxLength={100}
                {...register('epoca_frutificacao')}
                placeholder="Ex: Jan-Mar"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              />
            </div>
          </FormSection>

          {/* Seção 5: Urbanismo & Riscos */}
          <FormSection title="Urbanismo & Riscos" defaultOpen={false}>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Compatibilidade Fiação</label>
              <select
                {...register('compat_fiacao')}
                className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
              >
                <option value="">—</option>
                <option value="C">Compatível</option>
                <option value="A">Compatível com cuidados</option>
                <option value="N">Incompatível</option>
              </select>
            </div>

            <Controller control={control} name="potencial_dano_calcada_1a5" render={({ field }) => (
              <RatingInput label="Potencial Dano à Calçada" value={field.value} onChange={field.onChange} />
            )} />
            <Controller control={control} name="potencial_sujeira_1a5" render={({ field }) => (
              <RatingInput label="Potencial de Sujeira" value={field.value} onChange={field.onChange} />
            )} />

            <NumberField label="Faixa de Serviço Mín. (m)" register={register} name="faixa_serv_min_m_recomendada" />
            <NumberField label="Área Berço Mín. (m²)" register={register} name="berco_area_min_m2_recomendada" />
            <NumberField label="Volume Solo Mín. (m³)" register={register} name="volume_solo_min_m3_recomendado" />

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Riscos</label>
              <div className="flex flex-wrap gap-4">
                <CheckboxField label="Presença de Espinhos" register={register} name="presenca_espinhos" />
                <CheckboxField label="Substâncias Irritantes" register={register} name="presenca_subst_irritantes" />
              </div>
            </div>
          </FormSection>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors cursor-pointer bg-transparent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Helper components to reduce repetition
function NumberField({ label, register, name }: { label: string; register: UseFormRegister<TreeFormData>; name: keyof TreeFormData }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <input
        type="number"
        step="any"
        {...register(name, { valueAsNumber: true, setValueAs: (v: string) => v === '' ? null : Number(v) })}
        className="w-full px-3 py-2 rounded-lg border border-border text-sm text-foreground bg-card focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

function CheckboxField({ label, register, name }: { label: string; register: UseFormRegister<TreeFormData>; name: keyof TreeFormData }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        {...register(name)}
        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
      />
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}
