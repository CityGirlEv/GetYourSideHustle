export function CMSFooter() {
  return (
    <footer className="mt-12 border-t border-border bg-secondary/40 px-6 py-6 text-xs text-muted-foreground">
      <p className="max-w-4xl mx-auto leading-relaxed">
        <strong className="text-foreground">CMS Disclaimer:</strong> This site does not offer every plan
        available in your area. Any information provided is limited to those plans this site does offer
        in your area which are <em>Medigap Plan G, Medicare Advantage HMO/PPO, and Standalone Part D</em> plans. Please contact{" "}
        <a className="underline" href="https://www.medicare.gov">Medicare.gov</a> or 1-800-MEDICARE
        to get information on all of your options.
      </p>
    </footer>
  );
}
