import NavbarPublic from '@/components/layout/NavbarPublic'
import Footer from '@/components/layout/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarPublic />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
