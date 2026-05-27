import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

// Render-without-crash smoke tests for leaf components that don't need
// router or AppProvider context. Heavier components (AppShell, IntakeWizard,
// TaskSheet, NdaStatusCard, etc.) live in their own dedicated tests where
// the surrounding providers can be mocked properly.

import { TrustBanner } from "../TrustBanner";
import { FontSizeToggle } from "../FontSizeToggle";
import { SignaturePad } from "../SignaturePad";
import { DateField } from "../DateField";
import { VoiceButton } from "../VoiceButton";
import { DrugReport } from "../DrugReport";
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

  it("SignaturePad", () => {
    const { container } = render(
      <SignaturePad onSign={() => {}} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("DateField", () => {
    const { container } = render(
      <DateField value="" onChange={() => {}} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("VoiceButton", () => {
    const { container } = render(
      <VoiceButton onTranscript={() => {}} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("DrugReport", () => {
    const { container } = render(<DrugReport medications={[]} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("CatalogExplorer", () => {
    const { container } = render(<CatalogExplorer />);
    expect(container.firstChild).toBeTruthy();
  });
});