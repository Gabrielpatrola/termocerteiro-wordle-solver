import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultCard } from "@/components/features/ResultCard";

describe("ResultCard", () => {
  it("renders rank, word, formatted score, and the correct color class for each score tier", () => {
    const { container, rerender } = render(
      <ul>
        <ResultCard item={{ palavra: "crane", score: 88.5 }} rank={1} />
      </ul>
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("crane")).toBeInTheDocument();
    expect(screen.getByText("88.5")).toHaveClass("bg-emerald-500");
    expect(container.querySelector('[style="width: 88.5%;"]')).toHaveClass("bg-emerald-500");

    rerender(
      <ul>
        <ResultCard item={{ palavra: "stare", score: 65 }} rank={2} />
      </ul>
    );
    expect(screen.getByText("65.0")).toHaveClass("bg-yellow-400");
    expect(container.querySelector('[style="width: 65%;"]')).toHaveClass("bg-yellow-400");

    rerender(
      <ul>
        <ResultCard item={{ palavra: "cigar", score: 45 }} rank={3} />
      </ul>
    );
    expect(screen.getByText("45.0")).toHaveClass("bg-orange-400");
    expect(container.querySelector('[style="width: 45%;"]')).toHaveClass("bg-orange-400");

    rerender(
      <ul>
        <ResultCard item={{ palavra: "mummy", score: 20 }} rank={4} />
      </ul>
    );
    expect(screen.getByText("20.0")).toHaveClass("bg-red-400");
    expect(container.querySelector('[style="width: 20%;"]')).toHaveClass("bg-red-400");
  });
});
