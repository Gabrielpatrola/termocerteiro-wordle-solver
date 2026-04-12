import React from "react";
import { useFieldArray, useController, type Control } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { SolverFormValues } from "@/components/features/SolverForm";

interface PositionBlockListProps {
  control: Control<SolverFormValues>;
}

const POSITION_OPTIONS = [0, 1, 2, 3, 4] as const;

export function PositionBlockList({ control }: PositionBlockListProps): React.JSX.Element {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "letras_nao_existentes_na_posicao",
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Letras em posições erradas
      </span>
      <p className="text-xs text-zinc-400">
        Ex: letra "r" tentada na posição 2 mas não está lá
      </p>

      {fields.length > 0 && (
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <PositionBlockRow
              key={field.id}
              index={index}
              control={control}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ posicao: 0, letra: "" })}
        className="w-fit text-xs"
      >
        + Adicionar posição
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal row component
// ---------------------------------------------------------------------------

interface PositionBlockRowProps {
  index: number;
  control: Control<SolverFormValues>;
  onRemove: () => void;
}

function PositionBlockRow({ index, control, onRemove }: PositionBlockRowProps): React.JSX.Element {
  const { field: posField } = useController({
    control,
    name: `letras_nao_existentes_na_posicao.${index}.posicao`,
  });

  const { field: letraField, fieldState } = useController({
    control,
    name: `letras_nao_existentes_na_posicao.${index}.letra`,
  });

  return (
    <div className="flex items-center gap-2">
      <select
        {...posField}
        onChange={(e) => posField.onChange(Number(e.target.value))}
        className={cn(
          "rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-900",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500",
          "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        )}
        aria-label={`Posição bloqueada ${index}`}
      >
        {POSITION_OPTIONS.map((pos) => (
          <option key={pos} value={pos}>
            Posição {pos}
          </option>
        ))}
      </select>

      <input
        {...letraField}
        type="text"
        maxLength={1}
        onChange={(e) => {
          const letter = e.target.value.replace(/[^a-zA-Z]/g, "").slice(-1).toLowerCase();
          letraField.onChange(letter);
        }}
        placeholder="letra"
        className={cn(
          "h-9 w-16 rounded-lg border border-zinc-300 bg-white px-2 text-center text-sm font-bold uppercase",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500",
          "dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
          fieldState.error && "border-red-500"
        )}
        aria-label={`Letra bloqueada ${index}`}
      />

      <button
        type="button"
        onClick={onRemove}
        className="text-zinc-400 hover:text-red-500 transition-colors text-lg leading-none"
        aria-label="Remover linha"
      >
        ×
      </button>
    </div>
  );
}
