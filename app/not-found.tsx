import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-200 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <Button asChild className="btn-primary">
        <Link href="/">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
