import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://lotto-predictor-two.vercel.app";

export const metadata: Metadata = {
  title: "AI 로또 예측기 - 로또 번호 추천 | 무료 당첨 번호 분석",
  description:
    "AI 기반 로또 6/45 번호 예측 및 추천 서비스. CDM 확률 모델과 백테스트 검증 공식으로 스마트한 번호 선택. 연금복권 720+ 분석, 스마트 랜덤 생성기까지 무료 제공.",
  keywords: [
    "로또",
    "로또 번호 추천",
    "로또 예측",
    "로또 번호 생성기",
    "AI 로또",
    "로또 당첨 번호 분석",
    "로또 6/45",
    "연금복권 720+",
    "로또 확률",
    "로또 랜덤 번호",
    "무료 로또 번호 추천",
  ],
  authors: [{ name: "내로또" }],
  creator: "내로또",
  publisher: "내로또",
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
    url: SITE_URL,
    siteName: "내로또 - AI 로또 예측기",
    title: "AI 로또 예측기 - 로또 번호 추천 | 무료 당첨 번호 분석",
    description:
      "AI 기반 로또 6/45 번호 예측. CDM 확률 모델 + 백테스트 검증 공식 + 스마트 랜덤 생성기. 무료 서비스.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 로또 예측기 - 로또 번호 추천",
    description:
      "AI 기반 로또 6/45 번호 예측 및 추천. CDM 확률 모델과 백테스트 검증 공식으로 스마트한 번호 선택.",
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Google Search Console 인증 후 여기에 추가
    // google: "YOUR_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "내로또 - AI 로또 예측기",
    description:
      "AI 기반 로또 6/45 번호 예측 및 추천 서비스. CDM 확률 모델과 백테스트 검증 공식으로 스마트한 번호 선택.",
    url: SITE_URL,
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
    inLanguage: "ko",
  };

  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {adsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}