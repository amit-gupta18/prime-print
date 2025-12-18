import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { profile, merchant, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b-2 border-foreground bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="h-6 w-6" />
          <span className="text-xl font-bold tracking-tight">PrimePrint</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{profile?.full_name || profile?.email}</p>
            <p className="text-sm text-muted-foreground">
              {profile?.role === 'merchant' ? merchant?.shop_name : 'Student'}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSignOut}
            className="border-2 border-foreground hover:bg-foreground hover:text-background"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
