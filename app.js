// التطبيق الرئيسي مع سلة التسوق والبحث التفاعلي ووظيفة الواتساب (بدون العداد)
const App = {
    // المتغيرات العامة
    currentCategory: 'all',
    currentSearchTerm: '',
    products: [],
    categories: [],
    cart: [], // سلة التسوق
    allProducts: [], // جميع المنتجات للبحث السريع
    searchTimeout: null,
    selectedSearchIndex: -1,
    
    // تشغيل التطبيق
    async init() {
        try {
            console.log('🚀 بدء تشغيل Wednesday Store...');
            
            await this.loadData();
            this.setupEventListeners();
            this.loadCartFromStorage(); // تحميل السلة من التخزين المحلي
            this.updateCartDisplay();
            
            console.log('✅ تم تشغيل Wednesday Store بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تشغيل التطبيق:', error);
            this.showAlert('حدث خطأ في تحميل المتجر. يرجى إعادة تحميل الصفحة.', 'error');
        }
    },

    // تحميل البيانات
    async loadData() {
        try {
            this.categories = await DB.getCategories();
            this.products = await DB.getProducts();
            this.allProducts = [...this.products]; // نسخة للبحث السريع
            this.renderCategories();
            this.renderProducts();
            await this.loadFeaturedProducts();
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showAlert('حدث خطأ في تحميل البيانات', 'error');
        }
    },

    // تحميل المنتجات المميزة
    async loadFeaturedProducts() {
        try {
            const featuredProducts = await DB.getProducts({ featured: true });
            this.renderFeaturedProducts(featuredProducts.slice(0, 6));
        } catch (error) {
            console.error('خطأ في تحميل المنتجات المميزة:', error);
        }
    },

    // === وظائف البحث التفاعلي ===

    // البحث الفوري في المنتجات
    performInstantSearch(query) {
        if (!query || query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const searchTerm = query.toLowerCase().trim();
        const results = this.allProducts.filter(product => {
            const nameAr = product.name_ar ? product.name_ar.toLowerCase() : '';
            const nameEn = product.name_en ? product.name_en.toLowerCase() : '';
            const descAr = product.description_ar ? product.description_ar.toLowerCase() : '';
            const descEn = product.description_en ? product.description_en.toLowerCase() : '';
            const categoryName = product.categories ? product.categories.name_ar.toLowerCase() : '';

            return nameAr.includes(searchTerm) || 
                   nameEn.includes(searchTerm) || 
                   descAr.includes(searchTerm) || 
                   descEn.includes(searchTerm) ||
                   categoryName.includes(searchTerm);
        });

        this.showSearchResults(results.slice(0, 8), searchTerm); // أول 8 نتائج
    },

    // عرض نتائج البحث في القائمة المنسدلة
    showSearchResults(products, searchTerm) {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        if (products.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <i class="fas fa-search"></i>
                    <p>لا توجد نتائج للبحث عن "${searchTerm}"</p>
                    <small>جرب كلمات أخرى أو تصفح التصنيفات</small>
                </div>
            `;
        } else {
            searchResults.innerHTML = products.map((product, index) => {
                const highlightedName = this.highlightSearchTerm(product.name_ar, searchTerm);
                const highlightedDesc = this.highlightSearchTerm(
                    product.description_ar.substring(0, 50) + (product.description_ar.length > 50 ? '...' : ''), 
                    searchTerm
                );
                
                return `
                    <div class="search-result-item" data-product-id="${product.id}" data-index="${index}">
                        <img src="${product.image_url}" alt="${product.name_ar}" class="search-result-image" loading="lazy">
                        <div class="search-result-info">
                            <div class="search-result-name">${highlightedName}</div>
                            <div class="search-result-description">${highlightedDesc}</div>
                            <div style="display: flex; align-items: center; gap: 0.4rem; margin-top: 3px;">
                                <span class="search-result-price">${Utils.formatPrice(product.price)}</span>
                                ${product.categories ? `<span class="search-result-category">${product.categories.name_ar}</span>` : ''}
                                ${!product.in_stock ? '<span style="color: #dc3545; font-size: 0.7rem;">نفذ من المخزن</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        searchResults.classList.add('show');
        this.selectedSearchIndex = -1;
    },

    // تمييز النص المطابق في النتائج
    highlightSearchTerm(text, searchTerm) {
        if (!text || !searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    },

    // إخفاء نتائج البحث
    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        if (searchResults) {
            searchResults.classList.remove('show');
            setTimeout(() => {
                if (!searchResults.classList.contains('show')) {
                    searchResults.innerHTML = '';
                }
            }, 300);
        }
        this.selectedSearchIndex = -1;
    },

    // عرض مؤشر التحميل
    showSearchLoading() {
        const searchResults = document.getElementById('searchResults');
        if (!searchResults) return;

        searchResults.innerHTML = `
            <div class="search-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>جاري البحث...</p>
            </div>
        `;
        searchResults.classList.add('show');
    },

    // التنقل بلوحة المفاتيح في نتائج البحث
    handleSearchKeyNavigation(e) {
        const searchResults = document.getElementById('searchResults');
        const items = searchResults ? searchResults.querySelectorAll('.search-result-item') : [];
        
        if (items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSearchIndex = Math.min(this.selectedSearchIndex + 1, items.length - 1);
                this.updateSearchSelection(items);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedSearchIndex = Math.max(this.selectedSearchIndex - 1, -1);
                this.updateSearchSelection(items);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedSearchIndex >= 0 && items[this.selectedSearchIndex]) {
                    const productId = items[this.selectedSearchIndex].dataset.productId;
                    this.selectSearchResult(parseInt(productId));
                }
                break;
                
            case 'Escape':
                this.hideSearchResults();
                document.getElementById('searchInput').blur();
                break;
        }
    },

    // تحديث التحديد في نتائج البحث
    updateSearchSelection(items) {
        items.forEach((item, index) => {
            if (index === this.selectedSearchIndex) {
                item.classList.add('highlighted');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('highlighted');
            }
        });
    },

    // اختيار نتيجة بحث
    selectSearchResult(productId) {
        this.hideSearchResults();
        
        // البحث عن المنتج وعرضه
        const product = this.allProducts.find(p => p.id === productId);
        if (product) {
            // تحديث خانة البحث
            document.getElementById('searchInput').value = product.name_ar;
            
            // تصفية المنتجات لعرض المنتج المحدد
            this.currentSearchTerm = product.name_ar;
            this.filterProducts();
            
            // التمرير للمنتج
            setTimeout(() => {
                const productElement = document.querySelector(`[data-product-id="${productId}"]`);
                if (productElement) {
                    productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    productElement.style.animation = 'pulse 2s ease-in-out';
                    setTimeout(() => {
                        productElement.style.animation = '';
                    }, 2000);
                }
            }, 500);
        }
    },

    // عرض التصنيفات
    renderCategories() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        if (!categoriesGrid) return;

        categoriesGrid.innerHTML = '';

        // إضافة زر "جميع المنتجات"
        const allProductsBtn = this.createCategoryCard('all', '🛍️', 'جميع المنتجات');
        categoriesGrid.appendChild(allProductsBtn);

        // إضافة التصنيفات
        this.categories.forEach(category => {
            const categoryCard = this.createCategoryCard(category.id, category.icon, category.name_ar);
            categoriesGrid.appendChild(categoryCard);
        });

        this.updateActiveCategory();
    },

    // إنشاء كارت تصنيف
    createCategoryCard(id, icon, name) {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.setAttribute('data-category', id);
        categoryCard.innerHTML = `
            <span class="category-icon">${icon}</span>
            <h3>${name}</h3>
        `;
        
        categoryCard.addEventListener('click', () => this.selectCategory(id));
        
        return categoryCard;
    },

    // عرض المنتجات
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const noProductsMessage = document.getElementById('noProductsMessage');
        
        if (!productsGrid) return;

        if (this.products.length === 0) {
            productsGrid.innerHTML = '';
            if (noProductsMessage) {
                noProductsMessage.classList.remove('hidden');
            }
            return;
        }

        if (noProductsMessage) {
            noProductsMessage.classList.add('hidden');
        }

        const fragment = document.createDocumentFragment();
        this.products.forEach(product => {
            const productElement = this.createProductCard(product);
            fragment.appendChild(productElement);
        });
        
        productsGrid.innerHTML = '';
        productsGrid.appendChild(fragment);
    },

    // عرض المنتجات المميزة
    renderFeaturedProducts(featuredProducts) {
        const featuredGrid = document.getElementById('featuredProductsGrid');
        const featuredSection = document.getElementById('featuredProducts');
        
        if (!featuredGrid || !featuredSection) return;
        
        if (featuredProducts.length === 0) {
            featuredSection.style.display = 'none';
            return;
        }

        featuredSection.style.display = 'block';
        
        const fragment = document.createDocumentFragment();
        featuredProducts.forEach(product => {
            const productElement = this.createProductCard(product);
            fragment.appendChild(productElement);
        });
        
        featuredGrid.innerHTML = '';
        featuredGrid.appendChild(fragment);
    },

    // إنشاء كارت المنتج مع الأزرار المحسّنة
    createProductCard(product) {
        const discount = Utils.calculateDiscount(product.original_price, product.price);
        const isOutOfStock = !product.in_stock;
        
        const productCard = document.createElement('div');
        productCard.className = `product-card ${isOutOfStock ? 'out-of-stock' : ''}`;
        productCard.setAttribute('data-product-id', product.id);
        
        productCard.innerHTML = `
            <div class="product-badges">
                ${product.is_featured ? '<span class="badge badge-featured">مميز</span>' : ''}
                ${product.is_wednesday_deal ? '<span class="badge badge-wednesday">عرض الأربعاء</span>' : ''}
                ${isOutOfStock ? '<span class="badge badge-out-of-stock">نفذ من المخزن</span>' : ''}
                ${discount > 0 ? `<span class="badge discount-badge">خصم ${discount}%</span>` : ''}
            </div>
            
            <img src="${product.image_url}" alt="${product.name_ar}" class="product-image" loading="lazy">
            
            <div class="product-info">
                <h3 class="product-name">${product.name_ar}</h3>
                <p class="product-description">${product.description_ar}</p>
                
                <div class="product-price">
                    <span class="current-price">${Utils.formatPrice(product.price)}</span>
                    ${product.original_price ? `<span class="original-price">${Utils.formatPrice(product.original_price)}</span>` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="add-to-cart-btn" ${isOutOfStock ? 'disabled' : ''} data-product-id="${product.id}">
                        <i class="fas fa-cart-plus"></i>
                        <span>${isOutOfStock ? 'نفذ من المخزن' : 'أضف للسلة'}</span>
                    </button>
                    <button class="buy-now-btn" ${isOutOfStock ? 'disabled' : ''} data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                        <span>اطلب الآن</span>
                    </button>
                </div>
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
        const buyNowBtn = productCard.querySelector('.buy-now-btn');
        
        if (addToCartBtn && !isOutOfStock) {
            addToCartBtn.addEventListener('click', () => this.addToCart(product.id));
        }
        
        if (buyNowBtn && !isOutOfStock) {
            buyNowBtn.addEventListener('click', () => this.buyNow(product.id));
        }
        
        return productCard;
    },

    // === وظائف السلة ===

    // إضافة منتج للسلة
    addToCart(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product || !product.in_stock) {
            this.showAlert('المنتج غير متوفر', 'error');
            return;
        }

        // البحث عن المنتج في السلة
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showAlert(`تم زيادة كمية ${product.name_ar} في السلة`, 'success');
        } else {
            this.cart.push({
                id: product.id,
                name: product.name_ar,
                price: product.price,
                image: product.image_url,
                quantity: 1
            });
            this.showAlert(`تم إضافة ${product.name_ar} إلى السلة`, 'success');
        }

        this.updateCartDisplay();
        this.saveCartToStorage();
    },

    // شراء مباشر
    buyNow(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product || !product.in_stock) {
            this.showAlert('المنتج غير متوفر', 'error');
            return;
        }

        // إضافة المنتج للسلة المؤقتة للطلب المباشر
        const tempCart = [{
            id: product.id,
            name: product.name_ar,
            price: product.price,
            image: product.image_url,
            quantity: 1
        }];

        this.openOrderModal(tempCart);
    },

    // إزالة منتج من السلة
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartDisplay();
        this.saveCartToStorage();
        this.showAlert('تم إزالة المنتج من السلة', 'info');
    },

    // تحديث كمية منتج في السلة
    updateCartQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(productId);
        } else {
            this.updateCartDisplay();
            this.saveCartToStorage();
        }
    },

    // إفراغ السلة
    clearCart() {
        if (this.cart.length === 0) return;
        
        if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
            this.cart = [];
            this.updateCartDisplay();
            this.saveCartToStorage();
            this.showAlert('تم إفراغ السلة', 'info');
        }
    },

    // تحديث عرض السلة
    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const emptyCartMessage = document.getElementById('emptyCartMessage');
        const cartSummary = document.getElementById('cartSummary');
        const cartTotalAmount = document.getElementById('cartTotalAmount');

        // تحديث عدد المنتجات في الأيقونة
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

        if (!cartItems) return;

        // عرض محتويات السلة
        if (this.cart.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartSummary) cartSummary.classList.add('hidden');
        } else {
            if (emptyCartMessage) emptyCartMessage.style.display = 'none';
            if (cartSummary) cartSummary.classList.remove('hidden');

            // عرض المنتجات
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="App.updateCartQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="App.updateCartQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="App.removeFromCart(${item.id})" title="إزالة المنتج">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            // تحديث الإجمالي
            const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            if (cartTotalAmount) {
                cartTotalAmount.textContent = Utils.formatPrice(total);
            }
        }
    },

    // حفظ السلة في التخزين المحلي
    saveCartToStorage() {
        localStorage.setItem('wednesdayStoreCart', JSON.stringify(this.cart));
    },

    // تحميل السلة من التخزين المحلي
    loadCartFromStorage() {
        const savedCart = localStorage.getItem('wednesdayStoreCart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
            } catch (error) {
                console.error('خطأ في تحميل السلة:', error);
                this.cart = [];
            }
        }
    },

    // فتح نافذة السلة
    openCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },

    // إغلاق نافذة السلة
    closeCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },

    // إتمام الطلب من السلة
    checkoutCart() {
        if (this.cart.length === 0) {
            this.showAlert('السلة فارغة', 'error');
            return;
        }

        this.closeCartModal();
        this.openOrderModal(this.cart);
    },

    // فتح نافذة الطلب
    openOrderModal(items) {
        const orderModal = document.getElementById('orderModal');
        const orderProductInfo = document.getElementById('orderProductInfo');
        
        if (!orderModal || !orderProductInfo) return;

        // عرض معلومات المنتجات
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        orderProductInfo.innerHTML = `
            <h4 style="margin-bottom: 0.8rem; font-size: 1.1rem;">منتجات الطلب:</h4>
            ${items.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; padding: 0.4rem; background: white; border-radius: 4px;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <img src="${item.image}" alt="${item.name}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;">
                        <span style="font-size: 13px;">${item.name}</span>
                    </div>
                    <div style="text-align: left;">
                        <div style="font-weight: bold; color: #667eea; font-size: 13px;">${Utils.formatPrice(item.price)}</div>
                        <div style="font-size: 11px; color: #666;">الكمية: ${item.quantity}</div>
                    </div>
                </div>
            `).join('')}
            <div style="border-top: 2px solid #667eea; padding-top: 0.8rem; margin-top: 0.8rem; text-align: center;">
                <div style="font-size: 1.1rem; font-weight: bold; color: #667eea;">
                    الإجمالي: ${Utils.formatPrice(total)}
                </div>
            </div>
        `;

        // حفظ العناصر للاستخدام عند الإرسال
        this.currentOrderItems = items;

        orderModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            const firstInput = orderModal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    // إغلاق نافذة الطلب
    closeOrderModal() {
        const orderModal = document.getElementById('orderModal');
        if (orderModal) {
            orderModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.reset();
        }
        
        this.currentOrderItems = null;
    },

    // === وظيفة إرسال الطلب للواتساب ===
    sendOrderToWhatsApp(orderData) {
        const products = orderData.products.map(item => 
            `• ${item.name} - الكمية: ${item.quantity} - السعر: ${Utils.formatPrice(item.price)}`
        ).join('\n');
        
        const message = `🛍️ *طلب جديد من Wednesday Store*

👤 *بيانات العميل:*
الاسم: ${orderData.customer_name}
الهاتف: ${orderData.customer_phone}
العنوان: ${orderData.customer_address}
${orderData.customer_notes ? `الملاحظات: ${orderData.customer_notes}` : ''}

📦 *المنتجات المطلوبة:*
${products}

💰 *إجمالي الطلب:* ${Utils.formatPrice(orderData.total_amount)}

📅 *تاريخ الطلب:* ${new Date().toLocaleString('ar-EG')}

---
تم إرسال هذا الطلب تلقائياً من متجر Wednesday Store`;

        const whatsappNumber = STORE_CONFIG.whatsapp.replace(/\D/g, ''); // إزالة أي أحرف غير رقمية
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        
        // فتح الواتساب في نافذة جديدة
        window.open(whatsappUrl, '_blank');
    },

    // معالجة إرسال الطلب مع الواتساب
    async handleOrderSubmit(e) {
        e.preventDefault();
        
        if (!this.currentOrderItems || this.currentOrderItems.length === 0) {
            this.showAlert('لا توجد منتجات في الطلب', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const orderData = {
            customer_name: formData.get('customerName').trim(),
            customer_phone: formData.get('customerPhone').trim(),
            customer_address: formData.get('customerAddress').trim(),
            customer_notes: formData.get('customerNotes').trim(),
            products: this.currentOrderItems,
            total_amount: this.currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        };

        // التحقق من صحة البيانات
        const validation = this.validateOrderData(orderData);
        if (!validation.isValid) {
            this.showAlert(validation.message, 'error');
            return;
        }

        try {
            const submitBtn = e.target.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitBtn.disabled = true;

            // حفظ الطلب في قاعدة البيانات
            await DB.addOrder(orderData);
            
            // إرسال الطلب للواتساب
            this.sendOrderToWhatsApp(orderData);
            
            this.showAlert('تم إرسال طلبك بنجاح! سيتم فتح الواتساب لإرسال الطلب', 'success');
            
            // إفراغ السلة إذا كان الطلب من السلة
            if (this.cart.length > 0 && this.currentOrderItems.length > 1) {
                this.cart = [];
                this.updateCartDisplay();
                this.saveCartToStorage();
            }
            
            this.closeOrderModal();
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            this.showAlert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى', 'error');
        } finally {
            const submitBtn = e.target.querySelector('.submit-btn');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> تأكيد الطلب';
                submitBtn.disabled = false;
            }
        }
    },

    // التحقق من صحة بيانات الطلب
    validateOrderData(orderData) {
        if (!orderData.customer_name) {
            return { isValid: false, message: 'يرجى إدخال الاسم الكامل' };
        }
        
        if (!orderData.customer_phone) {
            return { isValid: false, message: 'يرجى إدخال رقم الهاتف' };
        }
        
        if (!Utils.validatePhone(orderData.customer_phone)) {
            return { isValid: false, message: 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 01 ويحتوي على 11 رقم)' };
        }
        
        if (!orderData.customer_address) {
            return { isValid: false, message: 'يرجى إدخال العنوان بالتفصيل' };
        }
        
        if (orderData.customer_address.length < 10) {
            return { isValid: false, message: 'يرجى إدخال عنوان مفصل أكثر' };
        }
        
        return { isValid: true };
    },

    // إعداد مستمعي الأحداث مع البحث التفاعلي
    setupEventListeners() {
        // البحث التفاعلي المحسّن
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            // البحث أثناء الكتابة
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // إلغاء البحث السابق
                if (this.searchTimeout) {
                    clearTimeout(this.searchTimeout);
                }
                
                // بحث جديد بعد تأخير قصير
                this.searchTimeout = setTimeout(() => {
                    this.performInstantSearch(query);
                }, 300);
            });

            // التنقل بلوحة المفاتيح
            searchInput.addEventListener('keydown', (e) => {
                const searchResults = document.getElementById('searchResults');
                if (searchResults && searchResults.classList.contains('show')) {
                    this.handleSearchKeyNavigation(e);
                }
            });

            // إخفاء النتائج عند فقدان التركيز
            searchInput.addEventListener('blur', (e) => {
                // تأخير قصير للسماح بالنقر على النتائج
                setTimeout(() => {
                    if (!e.relatedTarget || !e.relatedTarget.closest('.search-results')) {
                        this.hideSearchResults();
                    }
                }, 150);
            });

            // إظهار النتائج عند التركيز إذا كان هناك نص
            searchInput.addEventListener('focus', (e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.performInstantSearch(query);
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const query = searchInput.value.trim();
                if (query) {
                    this.currentSearchTerm = query;
                    this.filterProducts();
                    this.hideSearchResults();
                }
            });
        }

        // النقر على نتائج البحث
        document.addEventListener('click', (e) => {
            const searchResultItem = e.target.closest('.search-result-item');
            if (searchResultItem) {
                const productId = parseInt(searchResultItem.dataset.productId);
                this.selectSearchResult(productId);
                return;
            }

            // إخفاء النتائج عند النقر خارجها
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });

        // أيقونة السلة
        const cartIcon = document.getElementById('cartIcon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.openCartModal());
        }

        // إغلاق نوافذ السلة
        const closeCartModal = document.getElementById('closeCartModal');
        if (closeCartModal) {
            closeCartModal.addEventListener('click', () => this.closeCartModal());
        }

        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) {
                    this.closeCartModal();
                }
            });
        }

        // أزرار السلة
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkoutCart());
        }

        const clearCartBtn = document.getElementById('clearCartBtn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        // نافذة الطلب
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeOrderModal());
        }
        
        const orderModal = document.getElementById('orderModal');
        if (orderModal) {
            orderModal.addEventListener('click', (e) => {
                if (e.target === orderModal) {
                    this.closeOrderModal();
                }
            });
        }

        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        }

        // لوحة التحكم
        this.setupAdminAccess();

        // مفاتيح لوحة المفاتيح العامة
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCartModal();
                this.closeOrderModal();
                this.hideSearchResults();
            }
        });
    },

    // تصفية المنتجات
    async filterProducts() {
        try {
            const filters = {
                categoryId: this.currentCategory !== 'all' ? this.currentCategory : null,
                search: this.currentSearchTerm
            };
            
            this.products = await DB.getProducts(filters);
            this.renderProducts();
        } catch (error) {
            console.error('خطأ في تصفية المنتجات:', error);
        }
    },

    // اختيار تصنيف
    selectCategory(categoryId) {
        if (this.currentCategory === categoryId) return;
        
        this.currentCategory = categoryId;
        this.currentSearchTerm = ''; // مسح البحث عند تغيير التصنيف
        document.getElementById('searchInput').value = '';
        this.hideSearchResults();
        this.updateActiveCategory();
        this.filterProducts();
    },

    // تحديث التصنيف النشط
    updateActiveCategory() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`[data-category="${this.currentCategory}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
    },

    // إعداد الوصول للوحة التحكم
    setupAdminAccess() {
        const adminBtn = document.getElementById('adminAccessBtn');
        const adminModal = document.getElementById('adminLoginModal');
        const closeAdminModal = document.getElementById('closeAdminModal');
        const quickAdminForm = document.getElementById('quickAdminForm');

        if (!adminBtn || !adminModal || !closeAdminModal || !quickAdminForm) return;

        adminBtn.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });

        adminBtn.addEventListener('mouseleave', function() {
            this.style.opacity = '0.3';
        });

        adminBtn.addEventListener('click', function() {
            adminModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                document.getElementById('quickAdminPassword').focus();
            }, 100);
        });

        closeAdminModal.addEventListener('click', function() {
            adminModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            quickAdminForm.reset();
        });

        adminModal.addEventListener('click', function(e) {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                quickAdminForm.reset();
            }
        });

        quickAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('quickAdminPassword').value;
            
            if (typeof STORE_CONFIG === 'undefined') {
                alert('جاري تحميل البيانات، يرجى المحاولة مرة أخرى');
                return;
            }
            
            if (password === STORE_CONFIG.adminPassword) {
                sessionStorage.setItem('adminLoggedIn', 'true');
                App.showAlert('تم تسجيل الدخول بنجاح! جاري التحويل...', 'success');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            } else {
                App.showAlert('كلمة المرور غير صحيحة', 'error');
                const modalContent = adminModal.querySelector('.modal-content');
                modalContent.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    modalContent.style.animation = '';
                }, 500);
            }
        });
    },

    // إظهار رسالة تنبيه
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;

        const alertId = 'alert_' + Date.now();
        const alertElement = document.createElement('div');
        alertElement.id = alertId;
        alertElement.className = `alert alert-${type} fade-in`;
        alertElement.setAttribute('role', 'alert');
        alertElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px;">${message}</span>
                <button onclick="App.closeAlert('${alertId}')" style="background: none; border: none; font-size: 16px; cursor: pointer; color: inherit; min-width: 44px; min-height: 44px;" aria-label="إغلاق">&times;</button>
            </div>
        `;

        alertContainer.appendChild(alertElement);

        setTimeout(() => {
            this.closeAlert(alertId);
        }, type === 'error' ? 6000 : 4000);
    },

    // إغلاق رسالة التنبيه
    closeAlert(alertId) {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            alertElement.style.opacity = '0';
            alertElement.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.parentNode.removeChild(alertElement);
                }
            }, 300);
        }
    },

    // تأخير تنفيذ الدالة
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// تصدير التطبيق للاستخدام العام
window.App = App;

console.log('📱 Wednesday Store App مع سلة التسوق والبحث التفاعلي ووظيفة الواتساب (بدون العداد) تم تحميله بنجاح');
