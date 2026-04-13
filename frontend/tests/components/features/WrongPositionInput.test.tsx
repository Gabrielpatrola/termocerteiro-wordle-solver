import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  WrongPositionInput,
  type FourAttempts,
} from "@/components/features/WrongPositionInput";

function WrongPositionHarness(): React.JSX.Element {
  const [value, setValue] = React.useState<FourAttempts>([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ]);

  return (
    <WrongPositionInput
      label="Wrong positions"
      value={value}
      onChange={setValue}
      getAriaLabel={(attempt, position) => `Attempt ${attempt} position ${position}`}
    />
  );
}

describe("WrongPositionInput", () => {
  it("normalizes letters to lowercase and moves focus within a row", async () => {
    const user = userEvent.setup();

    render(<WrongPositionHarness />);

    const first = screen.getByLabelText("Attempt 1 position 1");
    const second = screen.getByLabelText("Attempt 1 position 2");

    await user.type(first, "R");

    expect(first).toHaveValue("r");
    expect(second).toHaveFocus();
  });

  it("clears the previous cell and focuses it when backspacing an empty cell", async () => {
    const user = userEvent.setup();

    render(<WrongPositionHarness />);

    const first = screen.getByLabelText("Attempt 1 position 1");
    const second = screen.getByLabelText("Attempt 1 position 2");
    const rowTwoFirst = screen.getByLabelText("Attempt 2 position 1");
    const rowOneLast = screen.getByLabelText("Attempt 1 position 5");

    await user.type(first, "r");
    second.focus();
    await user.keyboard("{Backspace}");

    expect(first).toHaveFocus();
    expect(first).toHaveValue("");

    rowTwoFirst.focus();
    await user.keyboard("{Backspace}");

    expect(rowOneLast).toHaveFocus();
  });
});
