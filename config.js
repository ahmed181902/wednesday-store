// إعدادات قاعدة البيانات Supabase
const SUPABASE_URL = 'https://yoqjqzgiestygfytmyof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvcWpxemdpZXN0eWdmeXRteW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MDcwNzAsImV4cCI6MjA2NzI4MzA3MH0._prSZXqr6CThqTQZlWDuIe-mXzCX2DSF0GfEiWU0e54';

// إنشاء عميل Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// إعدادات المتجر الأساسية
const STORE_CONFIG = {
    name: 'Wednesday Store',
    description: 'اكسسوارات الموبايل والجيمنج والكابلات',
    phone: '01013154821',
    whatsapp: '01013154821',
    social: {
        facebook: 'https://www.facebook.com/profile.php?id=61578187973897',
        instagram: 'https://www.instagram.com/wednesdaystore2025/',
        whatsapp: '01013154821'
    },
    adminPassword: 'Abc123',
    currency: 'جنيه',
    paymentMethod: 'الدفع عند الاستلام'
};

// مدير قاعدة البيانات
class DatabaseManager {
    constructor() {
        this.supabase = supabaseClient;
    }

    // === إدارة التصنيفات ===
    async getCategories() {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب التصنيفات:', error);
            return [];
        }
    }

    async addCategory(categoryData) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .insert([{
                    name_ar: categoryData.name_ar,
                    name_en: categoryData.name_en,
                    icon: categoryData.icon || '📂',
                    sort_order: categoryData.sort_order || 1,
                    is_active: true
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('خطأ في إضافة التصنيف:', error);
            throw error;
        }
    }

    async updateCategory(id, categoryData) {
        try {
            const { data, error } = await this.supabase
                .from('categories')
                .update({
                    name_ar: categoryData.name_ar,
                    name_en: categoryData.name_en,
                    icon: categoryData.icon,
                    sort_order: categoryData.sort_order,
                    is_active: categoryData.is_active
                })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('خطأ في تحديث التصنيف:', error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            const { error } = await this.supabase
                .from('categories')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف التصنيف:', error);
            throw error;
        }
    }

    // === إدارة المنتجات ===
    async getProducts(filters = {}) {
        try {
            let query = this.supabase
                .from('products')
                .select(`
                    *,
                    categories (
                        id,
                        name_ar,
                        name_en,
                        icon
                    )
                `);

            if (filters.categoryId) {
                query = query.eq('category_id', filters.categoryId);
            }

            if (filters.wednesdayDeals) {
                query = query.eq('is_wednesday_deal', true);
            }

            if (filters.featured) {
                query = query.eq('is_featured', true);
            }

            if (filters.search) {
                query = query.or(`name_ar.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,description_ar.ilike.%${filters.search}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب المنتجات:', error);
            return [];
        }
    }

    async getProductById(id) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .select(`
                    *,
                    categories (
                        id,
                        name_ar,
                        name_en
                    )
                `)
                .eq('id', id)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('خطأ في جلب المنتج:', error);
            return null;
        }
    }

    async addProduct(productData) {
        try {
            const { data, error } = await this.supabase
                .from('products')
                .insert([{
                    name_ar: productData.name_ar,
                    name_en: productData.name_en,
                    description_ar: productData.description_ar,
                    description_en: productData.description_en,
                    price: parseFloat(productData.price),
                    original_price: parseFloat(productData.original_price) || null,
                    category_id: productData.category_id,
                    image_url: productData.image_url,
                    is_featured: productData.is_featured || false,
                    in_stock: productData.in_stock !== false,
                    is_wednesday_deal: productData.is_wednesday_deal || false
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('خطأ في إضافة المنتج:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            const updateData = {
                name_ar: productData.name_ar,
                name_en: productData.name_en,
                description_ar: productData.description_ar,
                description_en: productData.description_en,
                price: parseFloat(productData.price),
                original_price: parseFloat(productData.original_price) || null,
                category_id: productData.category_id,
                is_featured: productData.is_featured,
                in_stock: productData.in_stock,
                is_wednesday_deal: productData.is_wednesday_deal
            };

            if (productData.image_url) {
                updateData.image_url = productData.image_url;
            }

            const { data, error } = await this.supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('خطأ في تحديث المنتج:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const { error } = await this.supabase
                .from('products')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف المنتج:', error);
            throw error;
        }
    }

    // === إدارة الطلبات ===
    async addOrder(orderData) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .insert([{
                    customer_name: orderData.customer_name,
                    customer_phone: orderData.customer_phone,
                    customer_address: orderData.customer_address,
                    customer_notes: orderData.customer_notes || null,
                    products: orderData.products,
                    total_amount: parseFloat(orderData.total_amount),
                    status: 'pending'
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('خطأ في إضافة الطلب:', error);
            throw error;
        }
    }

    async getOrders() {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('خطأ في جلب الطلبات:', error);
            return [];
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const { data, error } = await this.supabase
                .from('orders')
                .update({ status: status })
                .eq('id', id)
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('خطأ في تحديث حالة الطلب:', error);
            throw error;
        }
    }

    // === دالة حذف الطلب الجديدة ===
    async deleteOrder(id) {
        try {
            const { error } = await this.supabase
                .from('orders')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('خطأ في حذف الطلب:', error);
            throw error;
        }
    }

    // === رفع الصور ===
    async uploadImage(file, folder = 'products') {
        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
            
            const { data, error } = await this.supabase.storage
                .from('images')
                .upload(fileName, file);
            
            if (error) throw error;
            
            const { data: publicUrlData } = this.supabase.storage
                .from('images')
                .getPublicUrl(fileName);
            
            return publicUrlData.publicUrl;
        } catch (error) {
            console.error('خطأ في رفع الصورة:', error);
            throw error;
        }
    }
}

// الدوال المساعدة
const Utils = {
    formatPrice(price) {
        return `${parseFloat(price).toFixed(2)} ${STORE_CONFIG.currency}`;
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('ar-EG');
    },

    validatePhone(phone) {
        const re = /^01[0-9]{9}$/;
        return re.test(phone.replace(/\s/g, ''));
    },

    sanitizeText(text) {
        return text.replace(/[<>]/g, '').trim();
    },

    calculateDiscount(originalPrice, currentPrice) {
        if (!originalPrice || originalPrice <= currentPrice) return 0;
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }
};

// إنشاء مثيل مدير قاعدة البيانات
const DB = new DatabaseManager();

// تصدير المتغيرات العامة
window.STORE_CONFIG = STORE_CONFIG;
window.DB = DB;
window.Utils = Utils;
