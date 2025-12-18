import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Printer, FileText, Clock, CheckCircle, Loader2, Download, XCircle, Package } from 'lucide-react';
import { PrintOrder, Profile } from '@/types/database';

interface OrderWithUser extends PrintOrder {
  profile?: Profile;
}

export default function MerchantDashboard() {
  const { merchant } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (merchant) {
      fetchOrders();
    }
  }, [merchant]);

  const fetchOrders = async () => {
    if (!merchant) return;

    const { data, error } = await supabase
      .from('print_orders')
      .select('*, profile:profiles!print_orders_user_id_fkey(*)')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data as unknown as OrderWithUser[]);
    }
    setIsLoading(false);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingId(orderId);

    const { error } = await supabase
      .from('print_orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Update failed',
        description: 'Could not update order status',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Status updated',
        description: `Order marked as ${status}`,
      });
      fetchOrders();
    }

    setUpdatingId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="border-2 border-foreground"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'printing':
        return <Badge className="bg-chart-4 text-foreground border-2 border-foreground"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Printing</Badge>;
      case 'completed':
        return <Badge className="bg-chart-2 text-background border-2 border-foreground"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="border-2 border-foreground"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const printingOrders = orders.filter((o) => o.status === 'printing');
  const completedOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled');

  const OrderCard = ({ order }: { order: OrderWithUser }) => (
    <div className="border-2 border-foreground p-4 hover:bg-accent transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{order.file_name}</p>
          <p className="text-sm text-muted-foreground">
            From: {order.profile?.full_name || order.profile?.email || 'Unknown'}
          </p>
          <p className="text-sm text-muted-foreground">
            {order.copies} {order.copies === 1 ? 'copy' : 'copies'}
            {order.file_size && ` • ${(order.file_size / 1024 / 1024).toFixed(2)} MB`}
          </p>
          {order.notes && (
            <p className="text-sm mt-1 italic">"{order.notes}"</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        {getStatusBadge(order.status)}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-2 border-foreground"
          asChild
        >
          <a href={order.file_url} target="_blank" rel="noopener noreferrer">
            <Download className="h-3 w-3 mr-1" />
            Download
          </a>
        </Button>

        {order.status === 'pending' && (
          <>
            <Button
              size="sm"
              className="border-2 shadow-xs hover:shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
              onClick={() => updateStatus(order.id, 'printing')}
              disabled={updatingId === order.id}
            >
              {updatingId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Printer className="h-3 w-3 mr-1" />}
              Start Printing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => updateStatus(order.id, 'cancelled')}
              disabled={updatingId === order.id}
            >
              Cancel
            </Button>
          </>
        )}

        {order.status === 'printing' && (
          <Button
            size="sm"
            className="border-2 bg-chart-2 hover:bg-chart-2/80 shadow-xs hover:shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            onClick={() => updateStatus(order.id, 'completed')}
            disabled={updatingId === order.id}
          >
            {updatingId === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
            Mark Complete
          </Button>
        )}
      </div>
    </div>
  );

  if (!merchant) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Merchant profile not found. Please complete your setup.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-2 border-foreground shadow-xs">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingOrders.length}</p>
              </div>
              <Clock className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-foreground shadow-xs">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Printing</p>
                <p className="text-3xl font-bold">{printingOrders.length}</p>
              </div>
              <Printer className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-foreground shadow-xs">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedOrders.length}</p>
              </div>
              <Package className="h-8 w-8 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Active Orders */}
        <Card className="border-2 border-foreground shadow-md">
          <CardHeader className="border-b-2 border-foreground">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Active Orders
            </CardTitle>
            <CardDescription>Orders waiting to be printed</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : [...pendingOrders, ...printingOrders].length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active orders. Waiting for print jobs!
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {[...pendingOrders, ...printingOrders].map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card className="border-2 border-foreground shadow-md">
          <CardHeader className="border-b-2 border-foreground">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Completed Orders
            </CardTitle>
            <CardDescription>Recent order history</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed orders yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {completedOrders.slice(0, 20).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
