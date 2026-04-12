import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { CorrectLettersInput } from "@/components/features/CorrectLettersInput";
import { TagInput } from "@/components/features/TagInput";
import { PositionBlockList } from "@/components/features/PositionBlockList";
import { fetchPalpites } from "@/services/solver";
import type { GameType, PalpitesRequest, PalpitesResponse } from "@/types/solver";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const letraSchema = z
  .string()
  .max(1)
  .regex(/^[a-zA-Z]?$/, "Deve ser uma letra");

export const solverSchema = z.object({
  letras_corretas: z.tuple([
    letraSchema,
    letraSchema,
    letraSchema,
    letraSchema,
    letraSchema,
  ]),
  letras_existentes: z.array(z.string().length(1).regex(/^[a-z]$/)),
  letras_nao_existentes: z.array(z.string().length(1).regex(/^[a-z]$/)),
  letras_nao_existentes_na_posicao: z.array(
    z.object({
      posicao: z.number().min(0).max(4),
      letra: z.string().length(1).regex(/^[a-z]$/, "Deve ser uma letra"),
    })
  ),
  n_palpites: z.number().min(1).max(50),
});

export type SolverFormValues = z.infer<typeof solverSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SolverFormProps {
  game: GameType;
  onResults: (data: PalpitesResponse) => void;
}

export function SolverForm({ game, onResults }: SolverFormProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SolverFormValues>({
    resolver: zodResolver(solverSchema),
    defaultValues: {
      letras_corretas: ["", "", "", "", ""],
      letras_existentes: [],
      letras_nao_existentes: [],
      letras_nao_existentes_na_posicao: [],
      n_palpites: 10,
    },
  });

  const mutation = useMutation<PalpitesResponse, Error, PalpitesRequest>({
    mutationFn: fetchPalpites,
    onSuccess: (data) => onResults(data),
  });

  function onSubmit(values: SolverFormValues): void {
    const posicoes: Record<string, string> = {};
    for (const { posicao, letra } of values.letras_nao_existentes_na_posicao) {
      if (letra) {
        posicoes[String(posicao)] = letra;
      }
    }

    mutation.mutate({
      game,
      letras_corretas: values.letras_corretas,
      letras_existentes: values.letras_existentes,
      letras_nao_existentes: values.letras_nao_existentes,
      letras_nao_existentes_na_posicao: posicoes,
      n_palpites: values.n_palpites,
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Letras corretas */}
      <Controller
        control={control}
        name="letras_corretas"
        render={({ field }) => (
          <CorrectLettersInput
            value={field.value}
            onChange={field.onChange}
            error={errors.letras_corretas?.message}
          />
        )}
      />

      {/* Letras existentes (posição errada) */}
      <Controller
        control={control}
        name="letras_existentes"
        render={({ field }) => (
          <TagInput
            label="Letras existentes (posição errada)"
            value={field.value}
            onChange={field.onChange}
            tagColor="yellow"
            error={errors.letras_existentes?.message}
          />
        )}
      />

      {/* Letras erradas */}
      <Controller
        control={control}
        name="letras_nao_existentes"
        render={({ field }) => (
          <TagInput
            label="Letras erradas (não existem)"
            value={field.value}
            onChange={field.onChange}
            tagColor="red"
            error={errors.letras_nao_existentes?.message}
          />
        )}
      />

      {/* Posições bloqueadas */}
      <PositionBlockList control={control} />

      {/* Error feedback */}
      {mutation.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {mutation.error.message}
        </div>
      )}

      <Button
        type="submit"
        isLoading={mutation.isPending}
        className="w-full py-3 text-base"
      >
        {mutation.isPending ? "Buscando palpites…" : "Buscar Palpites"}
      </Button>
    </form>
  );
}
