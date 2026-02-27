import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductCategory } from '../types';
import { db } from '../lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, Timestamp
} from 'firebase/firestore';

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1', title: 'Classic White T-Shirt',
    description: 'Premium cotton t-shirt, comfortable and stylish for everyday wear.',
    price: 12.00, category: 'Clothing', thc_percent: 'S, M, L, XL', cbd_percent: 'White, Black, Gray',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    is_active: true, is_featured: true, stock: 100, created_at: new Date().toISOString(),
  },
  {
    id: '2', title: 'Slim Fit Jeans',
    description: 'Modern slim fit jeans, perfect for casual and semi-formal occasions.',
    price: 28.00, category: 'Clothing', thc_percent: '28, 30, 32, 34', cbd_percent: 'Blue, Black',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    is_active: true, is_featured: true, stock: 80, created_at: new Date().toISOString(),
  },
  {
    id: '3', title: 'Running Sneakers',
    description: 'Lightweight and breathable running shoes with cushioned sole.',
    price: 45.00, category: 'Shoes', thc_percent: '38, 39, 40, 41, 42, 43', cbd_percent: 'White, Black, Blue',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    is_active: true, is_featured: true, stock: 60, created_at: new Date().toISOString(),
  },
  {
    id: '4', title: 'Leather Crossbody Bag',
    description: 'Genuine leather crossbody bag with multiple compartments.',
    price: 35.00, category: 'Bags', thc_percent: 'One Size', cbd_percent: 'Brown, Black, Tan',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    is_active: true, is_featured: true, stock: 40, created_at: new Date().toISOString(),
  },
  {
    id: '5', title: 'Stainless Steel Watch',
    description: 'Elegant stainless steel watch with quartz movement. Water resistant.',
    price: 55.00, category: 'Accessories', thc_percent: 'One Size', cbd_percent: 'Silver, Gold, Black',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    is_active: true, is_featured: true, stock: 30, created_at: new Date().toISOString(),
  },
  {
    id: '6', title: 'Vitamin C Serum',
    description: 'Brightening vitamin C serum for glowing and even skin tone.',
    price: 18.00, category: 'Beauty', thc_percent: '30ml', cbd_percent: 'One Color',
    image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
    is_active: true, is_featured: false, stock: 90, created_at: new Date().toISOString(),
  },
  {
    id: '7', title: 'Wireless Earbuds',
    description: 'Bluetooth 5.0 earbuds with noise cancellation and long battery life.',
    price: 38.00, category: 'Electronics', thc_percent: 'One Size', cbd_percent: 'White, Black',
    image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    is_active: true, is_featured: false, stock: 50, created_at: new Date().toISOString(),
  },
  {
    id: '8', title: 'Floral Summer Dress',
    description: 'Light and breezy floral dress perfect for warm weather.',
    price: 22.00, category: 'Clothing', thc_percent: 'S, M, L', cbd_percent: 'Pink, Blue, Yellow',
    image_url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=400&fit=crop',
    is_active: true, is_featured: true, stock: 45, created_at: new Date().toISOString(),
  },
];

interface ProductContextType {
  products: Product[];
  featuredProducts: Product[];
  getProductsByCategory: (category: ProductCategory) => Product[];
  getProductById: (id: string) => Product | undefined;
  searchProducts: (query: string) => Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;
  isLoading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      if (snap.empty) {
        setProducts(SAMPLE_PRODUCTS);
      } else {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
        setProducts(data);
      }
    } catch (error) {
      console.error('Firebase fetch error:', error);
      setProducts(SAMPLE_PRODUCTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const featuredProducts = products.filter(p => p.is_featured && p.is_active);
  const getProductsByCategory = (category: ProductCategory) => products.filter(p => p.category === category && p.is_active);
  const getProductById = (id: string) => products.find(p => p.id === id);
  const searchProducts = (q: string) => {
    const ql = q.toLowerCase();
    return products.filter(p => p.is_active && (
      p.title.toLowerCase().includes(ql) ||
      p.description.toLowerCase().includes(ql) ||
      p.category.toLowerCase().includes(ql)
    ));
  };

  const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const data = { ...product, created_at: new Date().toISOString() };
      const ref = await addDoc(collection(db, 'products'), data);
      setProducts(prev => [{ id: ref.id, ...data } as Product, ...prev]);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const { id, ...data } = product;
      await updateDoc(doc(db, 'products', id), data);
      setProducts(prev => prev.map(p => p.id === id ? product : p));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return (
    <ProductContext.Provider value={{
      products, featuredProducts, getProductsByCategory, getProductById,
      searchProducts, addProduct, updateProduct, deleteProduct,
      refreshProducts: fetchProducts, isLoading,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
}
