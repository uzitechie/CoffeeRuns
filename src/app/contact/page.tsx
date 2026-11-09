import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8f2e6_0%,_#fff_45%)]">
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image src="/assets/cr-logo.png" alt="Coffee Runs logo" width={36} height={36} />
            <div>
              <p className="text-lg font-semibold leading-none">Coffee Runs</p>
              <p className="text-xs text-muted-foreground">Swedish coffee delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:underline">
              Menu
            </Link>
            <Link href="/about" className="hover:underline">
              About us
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Contact Coffee Runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="text-base text-foreground">Need help with a coffee run?</p>
            <p>
              Contact us for office deliveries, meeting bundles, recurring fika runs or questions about an order.
            </p>
            <p>
              <strong>Email:</strong> hello@coffeeruns.example
            </p>
            <p>
              <strong>Location:</strong> Stockholm, Sweden
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
