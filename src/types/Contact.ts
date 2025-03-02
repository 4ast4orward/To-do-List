export interface Contact {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
} 