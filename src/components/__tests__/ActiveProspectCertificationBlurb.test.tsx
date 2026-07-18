import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ACTIVEPROSPECT_LOGO_ALT,
  ACTIVEPROSPECT_LOGO_SRC,
  ActiveProspectCertificationBlurb,
} from "@/components/ActiveProspectCertificationBlurb";
import { ACTIVEPROSPECT_TRUSTEDFORM_URL } from "@/lib/trustedform-client";

describe("ActiveProspectCertificationBlurb", () => {
  it("renders certification copy, logo, and ActiveProspect links", () => {
    render(<ActiveProspectCertificationBlurb />);

    expect(screen.getByTestId("activeprospect-certification-blurb")).toBeInTheDocument();
    expect(screen.getByText(/All leads are certified by/i)).toBeInTheDocument();

    const logo = screen.getByRole("img", { name: ACTIVEPROSPECT_LOGO_ALT });
    expect(logo).toHaveAttribute("src", ACTIVEPROSPECT_LOGO_SRC);

    const links = screen.getAllByRole("link", { name: /ActiveProspect/i });
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links) {
      expect(link).toHaveAttribute("href", ACTIVEPROSPECT_TRUSTEDFORM_URL);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders without Card wrapper when embedded", () => {
    const { container } = render(
      <ActiveProspectCertificationBlurb embedded className="test-embedded" />,
    );

    expect(container.querySelector(".test-embedded")).toBeInTheDocument();
    expect(container.querySelector('[data-slot="card"]')).not.toBeInTheDocument();
  });
});
