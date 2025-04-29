import { Navbar } from "@/components/navbar";

export function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow ">
        {children}
      </main>
      {/* <footer className="w-full flex items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://heroui.com"
          title="heroui.com homepage"
        >
           <span className="text-default-600">Powered by</span> 
           <p className="text-primary">HeroUI</p>
        </Link>
      </footer> */}
    </div>
  );
}

export function DefaultMain({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      {children}
    </section>
  );
}
