import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import TeamBadge from "@/components/TeamBadge";

export const metadata: Metadata = {
  title: "Voetbalapp",
  description: "SCE JO8-1 teambeheer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="min-h-screen bg-[#f5f7f5] text-[#17211b]">

        {/* ==================================================
            VASTE HEADER
            ================================================== */}
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
              w-full
              max-w-6xl
              items-center
              justify-between
              px-4
              py-3
              sm:px-6
            "
          >

            {/* TEAM */}
            <Link
              href="/"
              className="
                flex
                items-center
                transition
                hover:opacity-80
              "
              aria-label="Naar Home"
            >
              <TeamBadge />
            </Link>

            {/* HOME */}
            <Link
              href="/"
              className="
                inline-flex
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
                className="text-base leading-none"
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