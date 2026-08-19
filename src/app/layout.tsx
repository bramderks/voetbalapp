import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

export const metadata: Metadata = {
  title: "Voetbalapp",
  description: "Teambeheer voor voetbalteams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-[#f5f7f5] text-[#17211b]">
        <header
          className="
            sticky
            top-0
            z-50
            border-b
            border-[#e1e7e2]
            bg-white/95
            backdrop-blur
          "
        >
          <div
            className="
              mx-auto
              flex
              min-h-[76px]
              w-full
              max-w-[1100px]
              items-center
              justify-between
              gap-4
              px-4
              sm:px-6
            "
          >
            {/* ==================================================
                TEAMLOGO
                ================================================== */}

            <Link
              href="/"
              aria-label="Naar Home"
              className="
                min-w-0
                transition
                hover:opacity-80
              "
            >
              <TeamBadge />
            </Link>

            {/* ==================================================
                HOME
                ================================================== */}

            <Link
              href="/"
              aria-label="Naar Home"
              className="
                inline-flex
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-[#16803c]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#116631]
                active:translate-y-px
              "
            >
              <span
                aria-hidden="true"
                className="text-lg leading-none"
              >
                ⌂
              </span>

              <span>Home</span>
            </Link>
          </div>
        </header>

        {/* ==================================================
            PAGINA-INHOUD
            ================================================== */}

        {children}
      </body>
    </html>
  );
}