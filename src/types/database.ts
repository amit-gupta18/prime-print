export type AppRole = 'user' | 'merchant';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

export interface Merchant {
  id: string;
  user_id: string;
  shop_name: string;
  description: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PrintOrder {
  id: string;
  user_id: string;
  merchant_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  pages: number | null;
  copies: number;
  notes: string | null;
  status: 'pending' | 'printing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  merchant?: Merchant;
}
