import type { Metadata } from 'next';
import './globals.css';
import { ScanProvider } from '@/context/ScanContext';
import { Navbar } from '@/components/Navbar';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UNMASK AI — See beyond the message. Verify the identity.',
  description: 'Multimodal scam and impersonation verification platform. Analyze suspicious documents, screenshots, URLs, and QR codes.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <ScanProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white">
                  <Shield className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="font-bold text-slate-900">UNMASK AI</span>
                <span>— Evidence-oriented verification engine</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>FastAPI Ready API Contract</span>
                <span>•</span>
                <span>Privacy First Protocol</span>
                <span>•</span>
                <span>v2.4 Enterprise</span>
              </div>
            </div>
          </footer>
        </ScanProvider>
      </body>
    </html>
  );
}
