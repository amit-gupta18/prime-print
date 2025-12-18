import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, Upload, Store, FileText, ArrowRight } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">PrimePrint</span>
          </div>
          <Link to="/auth">
            <Button className="border-2 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            College Print Scheduling
            <br />
            <span className="text-muted-foreground">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Submit your PDFs online, pick them up from campus stationery. No more waiting in line.
          </p>
          <Link to="/auth">
            <Button size="lg" className="border-2 shadow-md hover:shadow-sm hover:translate-x-[3px] hover:translate-y-[3px] transition-all text-lg px-8 py-6">
              Start Printing
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="border-2 border-foreground p-6 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <Upload className="h-10 w-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">Upload PDFs</h3>
            <p className="text-muted-foreground">
              Submit your documents from anywhere. We accept PDFs up to 50MB.
            </p>
          </div>
          <div className="border-2 border-foreground p-6 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <Store className="h-10 w-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">Choose Your Shop</h3>
            <p className="text-muted-foreground">
              Select from multiple campus stationery shops based on location.
            </p>
          </div>
          <div className="border-2 border-foreground p-6 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <FileText className="h-10 w-10 mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Status</h3>
            <p className="text-muted-foreground">
              Get notified when your prints are ready for pickup.
            </p>
          </div>
        </div>

        {/* CTA for merchants */}
        <div className="mt-20 border-2 border-foreground p-8 text-center shadow-md">
          <h2 className="text-2xl font-bold mb-4">Run a Campus Print Shop?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Join PrimePrint to receive print orders digitally. Manage your queue, reduce wait times, and grow your business.
          </p>
          <Link to="/auth">
            <Button variant="outline" className="border-2 border-foreground hover:bg-foreground hover:text-background">
              Register as Merchant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-foreground mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© 2024 PrimePrint. Built for college students.</p>
        </div>
      </footer>
    </div>
  );
}
