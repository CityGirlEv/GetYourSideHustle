import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

// Render-without-crash smoke tests for leaf components that don't need
// router or AppProvider context. Heavier components (AppShell, IntakeWizard,
// TaskSheet, NdaStatusCard, etc.) live in their own dedicated tests where
// the surrounding providers can be mocked properly.

import { TrustBanner } from "../TrustBanner";
import { FontSizeToggle } from "../FontSizeToggle";
import { DateField } from "../DateField";
import { CatalogExplorer } from "../CatalogExplorer";

describe("component smoke renders", () => {
  it("TrustBanner", () => {
    const { container } = render(<TrustBanner />);
    expect(container.firstChild).toBeTruthy();
  });

  it("FontSizeToggle", () => {
    const { container } = render(<FontSizeToggle />);
    expect(container.firstChild).toBeTruthy();
  });

  it("DateField", () => {
    const { container } = render(
      <DateField value="" onChange={() => {}} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("CatalogExplorer", () => {
    const { container } = render(<CatalogExplorer />);
    expect(container.firstChild).toBeTruthy();
  });
});