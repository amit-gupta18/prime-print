import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Clock, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Merchant, PrintOrder } from '@/types/database';

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMerchants();
    fetchOrders();
  }, []);

  const fetchMerchants = async () => {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching merchants:', error);
    } else {
      setMerchants(data as Merchant[]);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('print_orders')
      .select('*, merchant:merchants(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data as unknown as PrintOrder[]);
    }
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF file',
          variant: 'destructive',
        });
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !selectedMerchant || !user) {
      toast({
        title: 'Missing information',
        description: 'Please select a file and merchant',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('print-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('print-files')
        .getPublicUrl(fileName);

      // Create order
      const { error: orderError } = await supabase.from('print_orders').insert({
        user_id: user.id,
        merchant_id: selectedMerchant,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        copies,
        notes: notes || null,
      });

      if (orderError) throw orderError;

      toast({
        title: 'Order submitted!',
        description: 'Your print job has been sent to the merchant.',
      });

      // Reset form
      setFile(null);
      setSelectedMerchant('');
      setCopies(1);
      setNotes('');
      fetchOrders();
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your order. Please try again.',
        variant: 'destructive',
      });
    }

    setIsUploading(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Submit Order Card */}
        <Card className="border-2 border-foreground shadow-md">
          <CardHeader className="border-b-2 border-foreground">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Print Job
            </CardTitle>
            <CardDescription>Upload a PDF and select a merchant to print it</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchant">Select Merchant</Label>
                <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                  <SelectTrigger className="border-2 border-foreground">
                    <SelectValue placeholder="Choose a print shop" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-foreground">
                    {merchants.map((merchant) => (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.shop_name}
                        {merchant.location && ` - ${merchant.location}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">PDF File</Label>
                <div className="border-2 border-dashed border-foreground p-6 text-center hover:bg-accent transition-colors">
                  <input
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    {file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6" />
                        <span className="font-medium">{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Click to upload PDF</p>
                        <p className="text-sm text-muted-foreground">Max 50MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copies">Number of Copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min={1}
                  max={100}
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                  className="border-2 border-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-2 border-foreground"
                />
              </div>

              <Button
                type="submit"
                className="w-full border-2 shadow-sm hover:shadow-xs hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                disabled={isUploading || !file || !selectedMerchant}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Submit Print Job'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="border-2 border-foreground shadow-md">
          <CardHeader className="border-b-2 border-foreground">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Orders
            </CardTitle>
            <CardDescription>Track your print job status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet. Submit your first print job!
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-foreground p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{order.file_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.merchant?.shop_name} • {order.copies} {order.copies === 1 ? 'copy' : 'copies'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
