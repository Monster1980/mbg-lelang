import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans text-slate-900">
      <main className="flex-grow flex flex-col relative">
        {children}
      </main>
      <Footer />
    </div>
  );
}
