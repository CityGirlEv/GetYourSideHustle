export function CMSFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-secondary/40 px-6 py-6 text-xs text-muted-foreground">
      <p className="max-w-4xl mx-auto leading-relaxed">
        <strong className="text-foreground">Notice:</strong> This tool compares sample Medicare plan scenarios for educational purposes only.
        It is not a complete listing of plans available in your area. For a complete listing, contact{" "}
        <a className="underline" href="https://www.medicare.gov">Medicare.gov</a> or 1-800-MEDICARE.
      </p>
    </footer>
  );
}
