import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://lotto45.kr";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#4F46E5",
};

export const metadata: Metadata = {
  title: {
    default: "이번주 로또 번호 추천 - 무료 AI 번호 생성기 | Lotto45",
    template: "%s | Lotto45",
  },
  description:
    "이번주 로또 번호 뭐 살까? AI가 분석한 로또 6/45 추천 번호를 무료로 받아보세요. 연금복권 720+ 분석, 당첨 통계, 세금 계산기까지 한번에!",
  keywords: [
    "로또 번호 추천",
    "이번주 로또 번호",
    "로또 번호 생성기",
    "로또 예측",
    "AI 로또",
    "무료 로또 번호 추천",
    "로또 당첨 번호",
    "로또 6/45",
    "연금복권 720+",
    "로또 확률 분석",
    "로또 랜덤 번호",
    "로또 당첨 번호 분석",
    "로또 번호 뽑기",
  ],
  authors: [{ name: "Lotto45" }],
  creator: "Lotto45",
  publisher: "Lotto45",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://lotto45.kr",
    siteName: "Lotto45",
    title: "이번주 로또 번호 추천 - 무료 AI 번호 생성기 | Lotto45",
    description:
      "이번주 로또 번호 뭐 살까? AI가 분석한 추천 번호를 무료로 받아보세요!",
  },
  twitter: {
    card: "summary",
    title: "이번주 로또 번호 추천 - 무료 AI 번호 생성기 | Lotto45",
    description:
      "이번주 로또 번호 뭐 살까? AI가 분석한 추천 번호를 무료로 받아보세요!",
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "kh1dYGNn7H3p8ehcVwxCiyY4Hto1mdbxHxRDI-N5X4U",
  },
  other: {
    "naver-site-verification": "9512e11063c358b72bb987830fb3109abf977d3b",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lotto45",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Lotto45",
      description:
        "AI 기반 로또 6/45 번호 예측 및 추천 서비스. CDM 확률 모델, Markov Chain, Monte Carlo 시뮬레이션, 앙상블 분석으로 스마트한 번호 선택.",
      url: SITE_URL,
      applicationCategory: "EntertainmentApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
      inLanguage: "ko",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.5",
        ratingCount: "128",
        bestRating: "5",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Lotto45",
      url: SITE_URL,
      description: "AI 확률 분석 기반 로또 번호 추천 서비스",
      sameAs: [],
    },
  ];

  return (
    <html lang="ko">
      <head>
        {jsonLd.map((ld, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
          />
        ))}
        <meta name="naver-site-verification" content="54a8493a83f8b62a214782d74ea99c698ee03823" />
        {/* PWA Apple 메타태그 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Lotto45" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2632103940068646"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-800`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Lotto45",
              url: SITE_URL,
              description: "AI 확률 분석 기반 로또 번호 추천 서비스",
              publisher: {
                "@type": "Organization",
                name: "Lotto45",
              },
            }),
          }}
        />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}