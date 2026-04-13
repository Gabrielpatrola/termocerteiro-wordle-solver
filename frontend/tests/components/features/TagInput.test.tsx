import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TagInput } from "@/components/features/TagInput";

function TagInputHarness(): React.JSX.Element {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <TagInput
      label="Wrong letters"
      value={value}
      onChange={setValue}
      getRemoveAriaLabel={(letter) => `Remove ${letter}`}
    />
  );
}

describe("TagInput", () => {
  it("adds lowercase chips, clears the input, and ignores duplicates", async () => {
    const user = userEvent.setup();

    render(<TagInputHarness />);

    const input = screen.getByLabelText("Wrong letters");

    await user.type(input, "A");
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(input).toHaveValue("");

    await user.type(input, "a");
    expect(screen.getAllByText("a")).toHaveLength(1);

    await user.type(input, "1");
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("removes the last chip on backspace and supports explicit chip removal", async () => {
    const user = userEvent.setup();

    render(<TagInputHarness />);

    const input = screen.getByLabelText("Wrong letters");

    await user.type(input, "a");
    await user.type(input, "b");
    expect(screen.getByText("b")).toBeInTheDocument();

    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(screen.queryByText("b")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove a" }));
    expect(screen.queryByText("a")).not.toBeInTheDocument();
    expect(input).toHaveFocus();
  });
});
