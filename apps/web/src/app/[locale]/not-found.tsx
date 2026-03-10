import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-accent mb-4">404</h1>
        <p className="text-xl text-text-secondary mb-8">Page not found</p>
        <Link href="/" className="text-accent hover:text-accent-hover underline">
          Go home
        </Link>
      </div>
    </div>
  );
}
