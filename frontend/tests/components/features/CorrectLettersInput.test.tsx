import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CorrectLettersInput } from "@/components/features/CorrectLettersInput";

function CorrectLettersHarness(): React.JSX.Element {
  const [value, setValue] = React.useState<["", "", "", "", ""] | [string, string, string, string, string]>([
    "",
    "",
    "",
    "",
    "",
  ]);

  return (
    <CorrectLettersInput
      label="Correct letters"
      value={value}
      onChange={setValue}
      getAriaLabel={(position) => `Correct ${position}`}
    />
  );
}

describe("CorrectLettersInput", () => {
  it("normalizes letters to lowercase, ignores non-letters, and moves focus forward", async () => {
    const user = userEvent.setup();

    render(<CorrectLettersHarness />);

    const first = screen.getByLabelText("Correct 1");
    const second = screen.getByLabelText("Correct 2");

    await user.type(first, "A");
    expect(first).toHaveValue("a");
    expect(second).toHaveFocus();

    await user.type(first, "1");
    expect(first).toHaveValue("a");
  });

  it("moves focus back when backspace is pressed on an empty field", async () => {
    const user = userEvent.setup();

    render(<CorrectLettersHarness />);

    const first = screen.getByLabelText("Correct 1");
    const second = screen.getByLabelText("Correct 2");

    await user.type(first, "a");
    second.focus();
    await user.keyboard("{Backspace}");

    expect(first).toHaveFocus();
  });
});
