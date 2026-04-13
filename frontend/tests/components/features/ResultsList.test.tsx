import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResultsList } from "@/components/features/ResultsList";

describe("ResultsList", () => {
  it("renders the empty state when there are no guesses", () => {
    render(<ResultsList language="en" palpites={[]} total={0} />);

    expect(screen.getByText("No words matched these filters.")).toBeInTheDocument();
    expect(screen.getByText("Try removing a few constraints.")).toBeInTheDocument();
  });

  it("renders ranked results and the remaining-word count", () => {
    render(
      <ResultsList
        language="en"
        total={2}
        palpites={[
          { palavra: "crane", score: 88.5 },
          { palavra: "stare", score: 82.1 },
        ]}
      />
    );

    expect(screen.getByText("Best guesses")).toBeInTheDocument();
    expect(screen.getByText("2 words remaining")).toBeInTheDocument();
    expect(screen.getByText("crane")).toBeInTheDocument();
    expect(screen.getByText("stare")).toBeInTheDocument();
    expect(screen.getByText("88.5")).toBeInTheDocument();
    expect(screen.getByText("82.1")).toBeInTheDocument();
  });
});
