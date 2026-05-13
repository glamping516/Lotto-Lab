import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lotto Signal Lab",
  description:
    "로또6/45 역대 당첨번호 통계 분석, 이상징후 탐지, 번호 조합 추출을 위한 개인 프로젝트"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
