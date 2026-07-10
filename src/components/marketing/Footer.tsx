export function Footer() {
  return (
    <footer className="border-t border-clinic-border bg-clinic-bg px-6 py-12">
      <div className="mx-auto max-w-6xl text-sm text-clinic-muted">
        © {new Date().getFullYear()} BrightPath Dental
      </div>
    </footer>
  );
}
