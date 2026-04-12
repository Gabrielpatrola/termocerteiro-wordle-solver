import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { CorrectLettersInput } from "@/components/features/CorrectLettersInput";
import { TagInput } from "@/components/features/TagInput";
import { WrongPositionInput, type FourAttempts } from "@/components/features/WrongPositionInput";
import { fetchPalpites } from "@/services/solver";
import { getCopy } from "@/utils/copy";
import type { Language } from "@/types/i18n";
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
  letras_nao_existentes: z.array(z.string().length(1).regex(/^[a-z]$/)),
  letras_nao_existentes_na_posicao: z.tuple([
    z.tuple([letraSchema, letraSchema, letraSchema, letraSchema, letraSchema]),
    z.tuple([letraSchema, letraSchema, letraSchema, letraSchema, letraSchema]),
    z.tuple([letraSchema, letraSchema, letraSchema, letraSchema, letraSchema]),
    z.tuple([letraSchema, letraSchema, letraSchema, letraSchema, letraSchema]),
  ]),
  n_palpites: z.number().min(1).max(50),
});

export type SolverFormValues = z.infer<typeof solverSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SolverFormProps {
  game: GameType;
  language: Language;
  onResults: (data: PalpitesResponse) => void;
}

export function SolverForm({ game, language, onResults }: SolverFormProps): React.JSX.Element {
  const copy = getCopy(language);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SolverFormValues>({
    resolver: zodResolver(solverSchema),
    defaultValues: {
      letras_corretas: ["", "", "", "", ""],
      letras_nao_existentes: [],
      letras_nao_existentes_na_posicao: [
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
        ["", "", "", "", ""],
      ],
      n_palpites: 10,
    },
  });

  const mutation = useMutation<PalpitesResponse, Error, PalpitesRequest>({
    mutationFn: fetchPalpites,
    onSuccess: (data) => onResults(data),
  });

  function onSubmit(values: SolverFormValues): void {
    // Flatten 4×5 grid to Record<position, letters>, skipping empty cells and deduplicating
    const posicoes: Record<string, string> = {};
    (values.letras_nao_existentes_na_posicao as FourAttempts).forEach((row) => {
      row.forEach((letter, col) => {
        if (letter) {
          const existing = posicoes[String(col)] ?? "";
          if (!existing.includes(letter)) posicoes[String(col)] = existing + letter;
        }
      });
    });

    // Derive letras_existentes from the grid: every letter entered is known to exist in the word
    const letras_existentes = [
      ...new Set(
        (values.letras_nao_existentes_na_posicao as FourAttempts)
          .flat()
          .filter(Boolean)
      ),
    ];

    mutation.mutate({
      game,
      letras_corretas: values.letras_corretas,
      letras_existentes,
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
            label={copy.solverForm.correctLettersLabel}
            getAriaLabel={copy.solverForm.correctLetterAria}
            error={errors.letras_corretas?.message}
          />
        )}
      />

      {/* Letras em posições erradas */}
      <Controller
        control={control}
        name="letras_nao_existentes_na_posicao"
        render={({ field }) => (
          <WrongPositionInput
            value={field.value}
            onChange={field.onChange}
            label={copy.solverForm.wrongPositionLabel}
            getAriaLabel={copy.solverForm.wrongPositionAria}
            error={errors.letras_nao_existentes_na_posicao?.message}
          />
        )}
      />

      {/* Letras erradas */}
      <Controller
        control={control}
        name="letras_nao_existentes"
        render={({ field }) => (
          <TagInput
            label={copy.solverForm.wrongLettersLabel}
            value={field.value}
            onChange={field.onChange}
            tagColor="red"
            placeholder={copy.solverForm.tagPlaceholder}
            helperText={copy.solverForm.tagHelper}
            getRemoveAriaLabel={copy.solverForm.removeLetterAria}
            error={errors.letras_nao_existentes?.message}
          />
        )}
      />

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
        {mutation.isPending ? copy.solverForm.submitLoading : copy.solverForm.submitIdle}
      </Button>
    </form>
  );
}
