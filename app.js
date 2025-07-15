// تطبيق Wednesday Store المُصحح
const App = {
    // المتغيرات العامة
    currentCategory: 'all',
    currentSearchTerm: '',
    products: [],
    categories: [],
    cart: [],
    allProducts: [],
    
    // حالة الفلاتر
    filters: {
        category: 'all',
        featured: false,
        wednesday: false,
        inStock: true,
        minPrice: null,
        maxPrice: null,
        search: ''
    },
    
    // حالة الـ Sidebar
    sidebarOpen: false,
    
    // المنتج المحدد حالياً
    selectedProduct: null,
    
    // تحسين الأداء
    searchTimeout: null,
    alertTimeout: null,
    
    // عناصر DOM
    elements: {
        // Sidebar
        sidebar: null,
        sidebarToggle: null,
        sidebarClose: null,
        
        // الفلاتر
        categoriesList: null,
        featuredFilter: null,
        wednesdayFilter: null,
        inStockFilter: null,
        minPriceInput: null,
        maxPriceInput: null,
        applyPriceBtn: null,
        resetFiltersBtn: null,
        
        // المنتجات
        productsGrid: null,
        productsCount: null,
        sectionTitle: null,
        noProducts: null,
        productsLoader: null,
        
        // البحث
        searchInput: null,
        searchResults: null,
        clearSearchBtn: null,
        searchBtn: null,
        
        // السلة
        cartIcon: null,
        cartCount: null,
        cartModal: null,
        cartItems: null,
        cartSummary: null,
        
        // نافذة تفاصيل المنتج
        productDetailsModal: null,
        
        // النوافذ المنبثقة
        modalOverlay: null
    },
    
    // تشغيل التطبيق
    async init() {
        try {
            console.log('🚀 بدء تشغيل Wednesday Store...');
            
            // ربط عناصر DOM
            this.bindElements();
            
            // إعداد مستمعي الأحداث
            this.setupEventListeners();
            
            // تحميل البيانات
            await this.loadData();
            
            // تحميل السلة من التخزين المحلي
            this.loadCartFromStorage();
            
            // تحديث عرض السلة
            this.updateCartDisplay();
            
            // تحديث الروابط الاجتماعية
            this.updateSocialLinks();
            
            console.log('✅ تم تشغيل Wednesday Store بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تشغيل التطبيق:', error);
            this.showAlert('حدث خطأ في تحميل التطبيق. يرجى إعادة تحميل الصفحة.', 'error');
        }
    },
    
    // ربط عناصر DOM
    bindElements() {
        // Sidebar
        this.elements.sidebar = document.getElementById('sidebar');
        this.elements.sidebarToggle = document.getElementById('sidebarToggle');
        this.elements.sidebarClose = document.getElementById('sidebarClose');
        
        // الفلاتر
        this.elements.categoriesList = document.getElementById('categoriesList');
        this.elements.featuredFilter = document.getElementById('featuredFilter');
        this.elements.wednesdayFilter = document.getElementById('wednesdayFilter');
        this.elements.inStockFilter = document.getElementById('inStockFilter');
        this.elements.minPriceInput = document.getElementById('minPrice');
        this.elements.maxPriceInput = document.getElementById('maxPrice');
        this.elements.applyPriceBtn = document.getElementById('applyPriceFilter');
        this.elements.resetFiltersBtn = document.getElementById('resetFilters');
        
        // المنتجات
        this.elements.productsGrid = document.getElementById('productsGrid');
        this.elements.productsCount = document.getElementById('productsCount');
        this.elements.sectionTitle = document.getElementById('sectionTitle');
        this.elements.noProducts = document.getElementById('noProducts');
        this.elements.productsLoader = document.getElementById('productsLoader');
        
        // البحث
        this.elements.searchInput = document.getElementById('searchInput');
        this.elements.searchResults = document.getElementById('searchResults');
        this.elements.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.elements.searchBtn = document.getElementById('searchBtn');
        
        // السلة
        this.elements.cartIcon = document.getElementById('cartIcon');
        this.elements.cartCount = document.getElementById('cartCount');
        this.elements.cartModal = document.getElementById('cartModal');
        this.elements.cartItems = document.getElementById('cartItems');
        this.elements.cartSummary = document.getElementById('cartSummary');
        
        // نافذة تفاصيل المنتج
        this.elements.productDetailsModal = document.getElementById('productDetailsModal');
        
        // النوافذ المنبثقة
        this.elements.modalOverlay = document.getElementById('modalOverlay');
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // Sidebar
        if (this.elements.sidebarToggle) {
            this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (this.elements.sidebarClose) {
            this.elements.sidebarClose.addEventListener('click', () => this.closeSidebar());
        }
        
        // الفلاتر
        if (this.elements.featuredFilter) {
            this.elements.featuredFilter.addEventListener('change', () => this.updateFilters());
        }
        
        if (this.elements.wednesdayFilter) {
            this.elements.wednesdayFilter.addEventListener('change', () => this.updateFilters());
        }
        
        if (this.elements.inStockFilter) {
            this.elements.inStockFilter.addEventListener('change', () => this.updateFilters());
        }
        
        if (this.elements.applyPriceBtn) {
            this.elements.applyPriceBtn.addEventListener('click', () => this.applyPriceFilter());
        }
        
        if (this.elements.resetFiltersBtn) {
            this.elements.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // البحث المُصحح
        this.setupSearchFixed();
        
        // السلة
        if (this.elements.cartIcon) {
            this.elements.cartIcon.addEventListener('click', () => this.openCartModal());
        }
        
        // إغلاق النوافذ المنبثقة
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', () => this.closeAllModals());
        }
        
        // نافذة تفاصيل المنتج
        const closeProductDetails = document.getElementById('closeProductDetails');
        if (closeProductDetails) {
            closeProductDetails.addEventListener('click', () => this.closeProductDetails());
        }
        
        // أحداث عامة
        this.setupGlobalEvents();
        
        // دخول الإدارة
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => this.openAdminLogin());
        }
    },
    
    // إعداد البحث المُصحح
    setupSearchFixed() {
        if (!this.elements.searchInput) return;
        
        console.log('🔍 إعداد البحث المُصحح...');
        
        // البحث التفاعلي
        this.elements.searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            this.handleSearchInput(value);
        });
        
        // التنقل بلوحة المفاتيح
        this.elements.searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeyNavigation(e);
        });
        
        // إظهار النتائج عند التركيز
        this.elements.searchInput.addEventListener('focus', () => {
            if (this.elements.searchInput.value.trim().length >= 2) {
                this.showSearchResults();
            }
        });
        
        // زر مسح البحث
        if (this.elements.clearSearchBtn) {
            this.elements.clearSearchBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
        
        // زر البحث
        if (this.elements.searchBtn) {
            this.elements.searchBtn.addEventListener('click', () => {
                this.performSearch(this.elements.searchInput.value);
            });
        }
        
        console.log('✅ تم إعداد البحث بنجاح');
    },
    
    // معالجة إدخال البحث
    handleSearchInput(value) {
        console.log('🔍 معالجة البحث:', value);
        
        // إظهار/إخفاء زر المسح
        this.toggleClearButton(value.length > 0);
        
        // تنفيذ البحث
        this.performSearch(value);
    },
    
    // تبديل زر المسح
    toggleClearButton(show) {
        if (this.elements.clearSearchBtn) {
            if (show) {
                this.elements.clearSearchBtn.classList.add('show');
            } else {
                this.elements.clearSearchBtn.classList.remove('show');
            }
        }
    },
    
    // مسح البحث
    clearSearch() {
        console.log('🗑️ مسح البحث');
        
        // مسح حقل البحث
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
        }
        
        // إخفاء زر المسح
        this.toggleClearButton(false);
        
        // إخفاء نتائج البحث
        this.hideSearchResults();
        
        // إعادة تعيين فلتر البحث
        this.filters.search = '';
        
        // تطبيق الفلاتر لإظهار جميع المنتجات
        this.applyFilters();
        
        // التركيز على حقل البحث
        if (this.elements.searchInput) {
            this.elements.searchInput.focus();
        }
        
        // رسالة تأكيد
        this.showAlert('تم مسح البحث', 'info');
    },
    
    // تنفيذ البحث
    performSearch(searchTerm) {
        // إلغاء البحث السابق
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        this.searchTimeout = setTimeout(() => {
            console.log('⏱️ تنفيذ البحث:', searchTerm);
            
            this.filters.search = searchTerm;
            
            if (this.filters.search.length === 0) {
                this.hideSearchResults();
                this.applyFilters();
                return;
            }
            
            if (this.filters.search.length < 2) {
                this.hideSearchResults();
                return;
            }
            
            // تطبيق الفلاتر مع البحث
            this.applyFilters();
            
            // عرض نتائج البحث المنسدلة
            this.showInstantSearchResults(this.filters.search);
            
        }, 300);
    },
    
    // عرض نتائج البحث الفورية
    showInstantSearchResults(searchTerm) {
        if (!this.elements.searchResults) return;
        
        console.log('📋 عرض نتائج البحث:', searchTerm);
        
        const searchResults = this.allProducts.filter(product => 
            product.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.categories && product.categories.name_ar.toLowerCase().includes(searchTerm.toLowerCase()))
        ).slice(0, 5);
        
        if (searchResults.length === 0) {
            this.hideSearchResults();
            return;
        }
        
        const resultsHTML = searchResults.map(product => `
            <div class="search-result-item" data-product-id="${product.id}">
                <img src="${product.image_url}" alt="${product.name_ar}" class="search-result-image" loading="lazy">
                <div class="search-result-info">
                    <div class="search-result-name">${this.highlightSearchTerm(product.name_ar, searchTerm)}</div>
                    <div class="search-result-price">${Utils.formatPrice(product.price)}</div>
                </div>
            </div>
        `).join('');
        
        this.elements.searchResults.innerHTML = resultsHTML;
        this.showSearchResults();
        
        // إضافة مستمعي الأحداث لنتائج البحث
        this.attachSearchEvents();
    },
    
    // ربط أحداث نتائج البحث
    attachSearchEvents() {
        if (!this.elements.searchResults) return;
        
        // إزالة المستمعين السابقين
        const newSearchResults = this.elements.searchResults.cloneNode(true);
        this.elements.searchResults.parentNode.replaceChild(newSearchResults, this.elements.searchResults);
        this.elements.searchResults = newSearchResults;
        
        // إضافة مستمع جديد
        this.elements.searchResults.addEventListener('click', (e) => {
            const resultItem = e.target.closest('.search-result-item');
            if (resultItem) {
                const productId = parseInt(resultItem.dataset.productId);
                this.handleSearchResultClick(productId);
            }
        });
    },
    
    // معالجة النقر على نتيجة البحث
    handleSearchResultClick(productId) {
        console.log('👆 نقر على نتيجة البحث:', productId);
        
        const product = this.allProducts.find(p => p.id === productId);
        if (!product) return;
        
        // تطبيق فلتر للمنتج المحدد
        this.filters.search = product.name_ar;
        this.elements.searchInput.value = product.name_ar;
        this.applyFilters();
        
        // إخفاء النتائج
        this.hideSearchResults();
        
        // التمرير إلى المنتج
        this.scrollToProduct(productId);
    },
    
    // التمرير إلى المنتج
    scrollToProduct(productId) {
        setTimeout(() => {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                productCard.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                
                // تأثير بصري
                productCard.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.5)';
                productCard.style.transform = 'scale(1.02)';
                
                setTimeout(() => {
                    productCard.style.boxShadow = '';
                    productCard.style.transform = '';
                }, 2000);
            }
        }, 100);
    },
    
    // تمييز نص البحث
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    },
    
    // معالجة التنقل بلوحة المفاتيح
    handleSearchKeyNavigation(e) {
        const results = this.elements.searchResults?.querySelectorAll('.search-result-item');
        if (!results || results.length === 0) return;
        
        const currentSelected = this.elements.searchResults.querySelector('.search-result-item.selected');
        let selectedIndex = currentSelected ? Array.from(results).indexOf(currentSelected) : -1;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % results.length;
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
                break;
            case 'Enter':
                e.preventDefault();
                if (currentSelected) {
                    const productId = parseInt(currentSelected.dataset.productId);
                    this.handleSearchResultClick(productId);
                }
                return;
            case 'Escape':
                this.hideSearchResults();
                this.elements.searchInput.blur();
                return;
            default:
                return;
        }
        
        // تحديث التحديد
        results.forEach(item => item.classList.remove('selected'));
        if (results[selectedIndex]) {
            results[selectedIndex].classList.add('selected');
        }
    },
    
    // إظهار نتائج البحث
    showSearchResults() {
        if (this.elements.searchResults) {
            this.elements.searchResults.style.display = 'block';
        }
    },
    
    // إخفاء نتائج البحث
    hideSearchResults() {
        if (this.elements.searchResults) {
            this.elements.searchResults.style.display = 'none';
        }
    },
    
    // تحميل البيانات مع إصلاح اللودر
    async loadData() {
        try {
            console.log('📊 بدء تحميل البيانات...');
            this.showLoader(true);
            
            // تحميل التصنيفات والمنتجات
            const [categoriesData, productsData] = await Promise.all([
                DB.getCategories(),
                DB.getProducts()
            ]);
            
            console.log('📋 تم تحميل البيانات:', {
                categories: categoriesData?.length || 0,
                products: productsData?.length || 0
            });
            
            this.categories = categoriesData || [];
            this.products = productsData || [];
            this.allProducts = [...(productsData || [])];
            
            // عرض التصنيفات
            this.displayCategories();
            
            // عرض المنتجات
            this.displayProducts();
            
            // إخفاء اللودر
            this.showLoader(false);
            
            console.log('✅ تم تحميل البيانات بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات:', error);
            this.showLoader(false);
            this.showAlert('حدث خطأ في تحميل البيانات', 'error');
        }
    },
    
    // إظهار/إخفاء اللودر مع إصلاح
    showLoader(show = true) {
        console.log('🔄 تحديث اللودر:', show);
        
        if (this.elements.productsLoader) {
            if (show) {
                this.elements.productsLoader.style.display = 'block';
                console.log('👁️ عرض اللودر');
            } else {
                this.elements.productsLoader.style.display = 'none';
                console.log('🚫 إخفاء اللودر');
            }
        } else {
            console.warn('⚠️ عنصر اللودر غير موجود');
        }
    },
    
    // === وظائف الـ Sidebar ===
    
    toggleSidebar() {
        if (this.sidebarOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    },
    
    openSidebar() {
        this.sidebarOpen = true;
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.add('open');
        }
        
        // إضافة overlay للموبايل
        if (window.innerWidth <= 768) {
            document.body.classList.add('sidebar-open');
        }
    },
    
    closeSidebar() {
        this.sidebarOpen = false;
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.remove('open');
        }
        document.body.classList.remove('sidebar-open');
    },
    
    // === وظائف التصنيفات ===
    
    displayCategories() {
        if (!this.elements.categoriesList) return;
        
        console.log('📂 عرض التصنيفات...');
        
        const categoriesHTML = this.categories.map(category => `
            <div class="category-item" data-category="${category.id}">
                <i class="${category.icon || 'fas fa-tag'}"></i>
                <span>${category.name_ar}</span>
            </div>
        `).join('');
        
        // إضافة "جميع المنتجات" في البداية
        this.elements.categoriesList.innerHTML = `
            <div class="category-item active" data-category="all">
                <i class="fas fa-th"></i>
                <span>جميع المنتجات</span>
            </div>
            ${categoriesHTML}
        `;
        
        // إضافة مستمعي الأحداث للتصنيفات
        this.elements.categoriesList.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                const categoryId = categoryItem.dataset.category;
                this.selectCategory(categoryId);
            }
        });
        
        console.log('✅ تم عرض التصنيفات');
    },
    
    selectCategory(categoryId) {
        console.log('📁 اختيار التصنيف:', categoryId);
        
        // تحديث الفلتر
        this.filters.category = categoryId;
        
        // تحديث الواجهة
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-category="${categoryId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // تحديث عنوان القسم
        this.updateSectionTitle();
        
        // تطبيق الفلاتر
        this.applyFilters();
        
        // إغلاق الـ Sidebar في الموبايل
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    },
    
    // === وظائف الفلترة ===
    
    updateFilters() {
        console.log('🔧 تحديث الفلاتر...');
        
        // تحديث حالة الفلاتر
        this.filters.featured = this.elements.featuredFilter?.checked || false;
        this.filters.wednesday = this.elements.wednesdayFilter?.checked || false;
        this.filters.inStock = this.elements.inStockFilter?.checked || false;
        
        // تطبيق الفلاتر
        this.applyFilters();
    },
    
    applyPriceFilter() {
        const minPrice = parseFloat(this.elements.minPriceInput?.value) || null;
        const maxPrice = parseFloat(this.elements.maxPriceInput?.value) || null;
        
        // التحقق من صحة النطاق
        if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
            this.showAlert('الحد الأدنى للسعر يجب أن يكون أقل من الحد الأقصى', 'error');
            return;
        }
        
        this.filters.minPrice = minPrice;
        this.filters.maxPrice = maxPrice;
        
        // تطبيق الفلاتر
        this.applyFilters();
        
        this.showAlert('تم تطبيق فلتر السعر بنجاح', 'success');
    },
    
    resetFilters() {
        console.log('🔄 إعادة تعيين الفلاتر...');
        
        // إعادة تعيين الفلاتر
        this.filters = {
            category: 'all',
            featured: false,
            wednesday: false,
            inStock: true,
            minPrice: null,
            maxPrice: null,
            search: ''
        };
        
        // إعادة تعيين واجهة الفلاتر
        if (this.elements.featuredFilter) this.elements.featuredFilter.checked = false;
        if (this.elements.wednesdayFilter) this.elements.wednesdayFilter.checked = false;
        if (this.elements.inStockFilter) this.elements.inStockFilter.checked = true;
        if (this.elements.minPriceInput) this.elements.minPriceInput.value = '';
        if (this.elements.maxPriceInput) this.elements.maxPriceInput.value = '';
        if (this.elements.searchInput) this.elements.searchInput.value = '';
        
        // إخفاء زر مسح البحث
        this.toggleClearButton(false);
        
        // إعادة تعيين التصنيف
        this.selectCategory('all');
        
        // إخفاء نتائج البحث
        this.hideSearchResults();
        
        this.showAlert('تم إعادة تعيين جميع الفلاتر', 'info');
    },
    
    applyFilters() {
        console.log('🔍 تطبيق الفلاتر...', this.filters);
        
        let filteredProducts = [...this.allProducts];
        
        // فلتر التصنيف
        if (this.filters.category !== 'all') {
            filteredProducts = filteredProducts.filter(product => 
                product.category_id == this.filters.category
            );
        }
        
        // فلتر المنتجات المميزة
        if (this.filters.featured) {
            filteredProducts = filteredProducts.filter(product => product.is_featured);
        }
        
        // فلتر عروض الأربعاء
        if (this.filters.wednesday) {
            filteredProducts = filteredProducts.filter(product => product.is_wednesday_deal);
        }
        
        // فلتر المنتجات المتوفرة
        if (this.filters.inStock) {
            filteredProducts = filteredProducts.filter(product => product.in_stock);
        }
        
        // فلتر السعر
        if (this.filters.minPrice !== null) {
            filteredProducts = filteredProducts.filter(product => 
                product.price >= this.filters.minPrice
            );
        }
        
        if (this.filters.maxPrice !== null) {
            filteredProducts = filteredProducts.filter(product => 
                product.price <= this.filters.maxPrice
            );
        }
        
        // فلتر البحث
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(product => 
                product.name_ar.toLowerCase().includes(searchTerm) ||
                product.description_ar.toLowerCase().includes(searchTerm) ||
                (product.categories && product.categories.name_ar.toLowerCase().includes(searchTerm))
            );
        }
        
        console.log('📊 نتائج الفلترة:', {
            original: this.allProducts.length,
            filtered: filteredProducts.length
        });
        
        // تحديث المنتجات المعروضة
        this.products = filteredProducts;
        this.displayProducts();
    },
    
    // تحديث عنوان القسم
    updateSectionTitle() {
        if (!this.elements.sectionTitle) return;
        
        let title = 'جميع المنتجات';
        
        if (this.filters.category !== 'all') {
            const category = this.categories.find(cat => cat.id == this.filters.category);
            if (category) {
                title = category.name_ar;
            }
        }
        
        // إضافة معلومات الفلاتر النشطة
        const activeFilters = [];
        if (this.filters.featured) activeFilters.push('مميز');
        if (this.filters.wednesday) activeFilters.push('عروض الأربعاء');
        if (this.filters.search) activeFilters.push(`البحث: ${this.filters.search}`);
        
        if (activeFilters.length > 0) {
            title += ` (${activeFilters.join(', ')})`;
        }
        
        this.elements.sectionTitle.textContent = title;
    },
    // === وظائف عرض المنتجات ===
    
    displayProducts() {
        if (!this.elements.productsGrid) return;
        
        console.log('📦 عرض المنتجات:', this.products.length);
        
        // تحديث عداد المنتجات
        if (this.elements.productsCount) {
            this.elements.productsCount.textContent = this.products.length;
        }
        
        // تحديث عنوان القسم
        this.updateSectionTitle();
        
        if (this.products.length === 0) {
            this.showNoProducts();
            return;
        }
        
        this.hideNoProducts();
        
        const productsHTML = this.products.map(product => this.createProductCard(product)).join('');
        this.elements.productsGrid.innerHTML = productsHTML;
        
        // إضافة مستمعي الأحداث للمنتجات
        this.attachProductEventListeners();
        
        console.log('✅ تم عرض المنتجات بنجاح');
    },
    
    createProductCard(product) {
        const currentPrice = parseFloat(product.price);
        const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
        const discount = originalPrice ? Utils.calculateDiscount(originalPrice, currentPrice) : 0;
        
        // إنشاء الشارات
        let badges = '';
        if (product.is_featured) {
            badges += '<span class="badge badge-featured"><i class="fas fa-star"></i> مميز</span>';
        }
        if (product.is_wednesday_deal) {
            badges += '<span class="badge badge-wednesday"><i class="fas fa-fire"></i> عرض الأربعاء</span>';
        }
        if (!product.in_stock) {
            badges += '<span class="badge badge-out-of-stock"><i class="fas fa-times"></i> نفد المخزون</span>';
        }
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.image_url}" alt="${product.name_ar}" class="product-image" loading="lazy">
                    ${badges ? `<div class="product-badges">${badges}</div>` : ''}
                    <div class="product-overlay">
                        <button class="quick-view-btn" onclick="App.showProductDetails(${product.id})">
                            <i class="fas fa-eye"></i>
                            عرض التفاصيل
                        </button>
                    </div>
                </div>
                
                <div class="product-info">
                    <h3 class="product-name">${product.name_ar}</h3>
                    <p class="product-description">${product.description_ar}</p>
                    
                    <div class="product-price">
                        <span class="current-price">${Utils.formatPrice(currentPrice)}</span>
                        ${originalPrice ? `<span class="original-price">${Utils.formatPrice(originalPrice)}</span>` : ''}
                        ${discount > 0 ? `<span class="discount-badge">-${discount}%</span>` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" onclick="App.addToCart(${product.id})" 
                                ${!product.in_stock ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            ${product.in_stock ? 'إضافة للسلة' : 'نفد المخزون'}
                        </button>
                        <button class="buy-now-btn" onclick="App.buyNow(${product.id})" 
                                ${!product.in_stock ? 'disabled' : ''}>
                            <i class="fas fa-bolt"></i>
                            اشتري الآن
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    attachProductEventListeners() {
        // إضافة مستمع للنقر على بطاقة المنتج لعرض التفاصيل
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // تجاهل النقر على الأزرار
                if (e.target.closest('button')) return;
                
                const productId = parseInt(card.dataset.productId);
                this.showProductDetails(productId);
            });
        });
    },
    
    showNoProducts() {
        if (this.elements.noProducts) {
            this.elements.noProducts.style.display = 'block';
        }
        if (this.elements.productsGrid) {
            this.elements.productsGrid.style.display = 'none';
        }
    },
    
    hideNoProducts() {
        if (this.elements.noProducts) {
            this.elements.noProducts.style.display = 'none';
        }
        if (this.elements.productsGrid) {
            this.elements.productsGrid.style.display = 'grid';
        }
    },
    
    // === وظائف تفاصيل المنتج ===
    
    showProductDetails(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product) {
            this.showAlert('لم يتم العثور على المنتج', 'error');
            return;
        }
        
        this.selectedProduct = product;
        this.populateProductDetails(product);
        this.openModal('productDetailsModal');
    },
    
    populateProductDetails(product) {
        const currentPrice = parseFloat(product.price);
        const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
        const discount = originalPrice ? Utils.calculateDiscount(originalPrice, currentPrice) : 0;
        
        // تحديث الصورة
        const detailsImage = document.getElementById('productDetailsImage');
        if (detailsImage) {
            detailsImage.src = product.image_url;
            detailsImage.alt = product.name_ar;
        }
        
        // تحديث الاسم
        const detailsName = document.getElementById('productDetailsName');
        if (detailsName) {
            detailsName.textContent = product.name_ar;
        }
        
        // تحديث الوصف
        const detailsDescription = document.getElementById('productDetailsDescription');
        if (detailsDescription) {
            detailsDescription.textContent = product.description_ar;
        }
        
        // تحديث السعر
        const currentPriceElement = document.getElementById('productDetailsCurrentPrice');
        if (currentPriceElement) {
            currentPriceElement.textContent = Utils.formatPrice(currentPrice);
        }
        
        const originalPriceElement = document.getElementById('productDetailsOriginalPrice');
        if (originalPriceElement) {
            if (originalPrice) {
                originalPriceElement.textContent = Utils.formatPrice(originalPrice);
                originalPriceElement.style.display = 'inline';
            } else {
                originalPriceElement.style.display = 'none';
            }
        }
        
        const discountElement = document.getElementById('productDetailsDiscount');
        if (discountElement) {
            if (discount > 0) {
                discountElement.textContent = `-${discount}%`;
                discountElement.style.display = 'inline';
            } else {
                discountElement.style.display = 'none';
            }
        }
        
        // تحديث التصنيف
        const categoryElement = document.getElementById('productDetailsCategory');
        if (categoryElement && product.categories) {
            categoryElement.textContent = product.categories.name_ar;
        }
        
        // تحديث حالة المخزون
        const stockElement = document.getElementById('productDetailsStock');
        if (stockElement) {
            if (product.in_stock) {
                stockElement.innerHTML = '<span class="in-stock"><i class="fas fa-check-circle"></i> متوفر</span>';
            } else {
                stockElement.innerHTML = '<span class="out-of-stock"><i class="fas fa-times-circle"></i> نفد المخزون</span>';
            }
        }
        
        // تحديث الشارات
        const badgesContainer = document.getElementById('productBadgesDetails');
        if (badgesContainer) {
            let badges = '';
            if (product.is_featured) {
                badges += '<span class="badge badge-featured"><i class="fas fa-star"></i> مميز</span>';
            }
            if (product.is_wednesday_deal) {
                badges += '<span class="badge badge-wednesday"><i class="fas fa-fire"></i> عرض الأربعاء</span>';
            }
            badgesContainer.innerHTML = badges;
        }
        
        // تحديث الأزرار
        const addToCartBtn = document.getElementById('addToCartFromDetails');
        const buyNowBtn = document.getElementById('buyNowFromDetails');
        
        if (addToCartBtn) {
            addToCartBtn.disabled = !product.in_stock;
            addToCartBtn.innerHTML = product.in_stock ? 
                '<i class="fas fa-cart-plus"></i> إضافة للسلة' : 
                '<i class="fas fa-times"></i> نفد المخزون';
            
            addToCartBtn.onclick = () => {
                if (product.in_stock) {
                    this.addToCart(product.id);
                    this.closeProductDetails();
                }
            };
        }
        
        if (buyNowBtn) {
            buyNowBtn.disabled = !product.in_stock;
            buyNowBtn.innerHTML = product.in_stock ? 
                '<i class="fas fa-bolt"></i> اشتري الآن' : 
                '<i class="fas fa-times"></i> نفد المخزون';
            
            buyNowBtn.onclick = () => {
                if (product.in_stock) {
                    this.buyNow(product.id);
                    this.closeProductDetails();
                }
            };
        }
    },
    
    closeProductDetails() {
        this.closeModal('productDetailsModal');
        this.selectedProduct = null;
    },
    
    // === وظائف السلة ===
    
    addToCart(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product) {
            this.showAlert('لم يتم العثور على المنتج', 'error');
            return;
        }
        
        if (!product.in_stock) {
            this.showAlert('هذا المنتج غير متوفر حالياً', 'error');
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
    
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.showAlert(`تم إزالة ${item.name} من السلة`, 'info');
            this.updateCartDisplay();
            this.saveCartToStorage();
        }
    },
    
    updateCartQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.updateCartDisplay();
                this.saveCartToStorage();
            }
        }
    },
    
    clearCart() {
        if (this.cart.length === 0) {
            this.showAlert('السلة فارغة بالفعل', 'info');
            return;
        }
        
        if (confirm('هل أنت متأكد من إفراغ السلة؟')) {
            this.cart = [];
            this.updateCartDisplay();
            this.saveCartToStorage();
            this.showAlert('تم إفراغ السلة بنجاح', 'info');
        }
    },
    
    updateCartDisplay() {
        // تحديث عداد السلة
        if (this.elements.cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            this.elements.cartCount.textContent = totalItems;
            this.elements.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        // تحديث محتوى السلة
        this.updateCartModal();
    },
    
    updateCartModal() {
        if (!this.elements.cartItems || !this.elements.cartSummary) return;
        
        if (this.cart.length === 0) {
            this.elements.cartItems.innerHTML = '';
            this.elements.cartSummary.style.display = 'none';
            document.getElementById('emptyCartMessage').style.display = 'block';
            return;
        }
        
        document.getElementById('emptyCartMessage').style.display = 'none';
        this.elements.cartSummary.style.display = 'block';
        
        // عرض منتجات السلة
        const cartItemsHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-price">${Utils.formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="App.updateCartQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="App.updateCartQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <button class="remove-item-btn" onclick="App.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        this.elements.cartItems.innerHTML = cartItemsHTML;
        
        // تحديث ملخص السلة
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        document.getElementById('cartItemsCount').textContent = totalItems;
        document.getElementById('cartTotal').textContent = Utils.formatPrice(totalPrice);
    },
    
    saveCartToStorage() {
        try {
            localStorage.setItem('wednesdaystore_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
        }
    },
    
    loadCartFromStorage() {
        try {
            const savedCart = localStorage.getItem('wednesdaystore_cart');
            if (savedCart) {
                this.cart = JSON.parse(savedCart);
            }
        } catch (error) {
            console.error('خطأ في تحميل السلة:', error);
            this.cart = [];
        }
    },
    
    // === وظائف الطلبات ===
    
    buyNow(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (!product) {
            this.showAlert('لم يتم العثور على المنتج', 'error');
            return;
        }
        
        if (!product.in_stock) {
            this.showAlert('هذا المنتج غير متوفر حالياً', 'error');
            return;
        }
        
        // إنشاء طلب مؤقت للمنتج الواحد
        const tempOrder = [{
            id: product.id,
            name: product.name_ar,
            price: product.price,
            image: product.image_url,
            quantity: 1
        }];
        
        this.openOrderModal(tempOrder);
    },
    
    openOrderModal(orderItems = null) {
        const itemsToOrder = orderItems || this.cart;
        
        if (itemsToOrder.length === 0) {
            this.showAlert('لا توجد منتجات للطلب', 'error');
            return;
        }
        
        this.populateOrderSummary(itemsToOrder);
        this.openModal('orderModal');
    },
    
    populateOrderSummary(items) {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;
        
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        
        const summaryHTML = `
            <div class="order-items">
                ${items.map(item => `
                    <div class="order-item">
                        <img src="${item.image}" alt="${item.name}" class="order-item-image">
                        <div class="order-item-info">
                            <span class="order-item-name">${item.name}</span>
                            <span class="order-item-details">${item.quantity} × ${Utils.formatPrice(item.price)}</span>
                        </div>
                        <span class="order-item-total">${Utils.formatPrice(item.price * item.quantity)}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <div class="total-row">
                    <span>عدد المنتجات:</span>
                    <span>${totalItems}</span>
                </div>
                <div class="total-row grand-total">
                    <span>المجموع الكلي:</span>
                    <span>${Utils.formatPrice(totalPrice)}</span>
                </div>
            </div>
        `;
        
        orderSummary.innerHTML = summaryHTML;
        
        // حفظ بيانات الطلب مؤقتاً
        this.currentOrderItems = items;
    },
    
    // === وظائف النوافذ المنبثقة ===
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            this.elements.modalOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    },
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            this.elements.modalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    },
    
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        
        this.elements.modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    },
    
    openCartModal() {
        this.updateCartModal();
        this.openModal('cartModal');
    },
    
    openAdminLogin() {
        this.openModal('adminLoginModal');
        
        // إعداد نموذج الدخول
        const adminForm = document.getElementById('quickAdminForm');
        if (adminForm) {
            adminForm.onsubmit = (e) => {
                e.preventDefault();
                const password = document.getElementById('quickAdminPassword').value;
                
                if (password === STORE_CONFIG.adminPassword) {
                    sessionStorage.setItem('adminLoggedIn', 'true');
                    window.location.href = 'admin.html';
                } else {
                    this.showAlert('كلمة المرور غير صحيحة', 'error');
                }
            };
        }
    },
    
    // === وظائف الأحداث العامة ===
    
    setupGlobalEvents() {
        // إغلاق البحث عند النقر خارجه
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });
        
        // إغلاق الـ Sidebar عند النقر خارجه (للموبايل)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && this.sidebarOpen) {
                if (!e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle')) {
                    this.closeSidebar();
                }
            }
        });
        
        // تحديث حالة الـ Sidebar عند تغيير حجم الشاشة
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.sidebarOpen = true;
                if (this.elements.sidebar) {
                    this.elements.sidebar.classList.add('open');
                }
            } else {
                this.closeSidebar();
            }
        });
    },
    
    // === نظام التنبيهات المُحسن (منع التضاعف) ===
    
    showAlert(message, type = 'info') {
        console.log('🔔 عرض تنبيه:', message, type);
        
        const alertContainer = document.getElementById('alertContainer');
        if (!alertContainer) return;
        
        // منع التضاعف - التحقق من وجود رسالة مشابهة
        const existingAlert = alertContainer.querySelector(`[data-message="${message}"]`);
        if (existingAlert) {
            console.log('⚠️ رسالة مشابهة موجودة، تم تجاهلها');
            return;
        }
        
        const alertId = 'alert_' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} fade-in" data-message="${message}">
                <div class="alert-content">
                    <i class="fas fa-${this.getAlertIcon(type)}"></i>
                    <span>${message}</span>
                    <button class="alert-close" onclick="App.closeAlert('${alertId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        alertContainer.insertAdjacentHTML('beforeend', alertHTML);
        
        // إزالة التنبيه تلقائياً بعد 3 ثواني (تقليل الوقت)
        setTimeout(() => {
            this.closeAlert(alertId);
        }, 3000);
        
        // تنظيف الرسائل القديمة (الاحتفاظ بآخر 3 رسائل فقط)
        const alerts = alertContainer.querySelectorAll('.alert');
        if (alerts.length > 3) {
            alerts[0].remove();
        }
    },
    
    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },
    
    closeAlert(alertId) {
        const alert = document.getElementById(alertId);
        if (alert) {
            console.log('🗑️ إغلاق تنبيه:', alertId);
            
            alert.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }
    },
    
    // === وظائف مساعدة ===
    
    updateSocialLinks() {
        const socialConfig = STORE_CONFIG.social;
        
        // تحديث روابط الهيدر
        const facebookLink = document.getElementById('facebookLink');
        const instagramLink = document.getElementById('instagramLink');
        const whatsappLink = document.getElementById('whatsappLink');
        
        if (facebookLink) facebookLink.href = socialConfig.facebook;
        if (instagramLink) instagramLink.href = socialConfig.instagram;
        if (whatsappLink) whatsappLink.href = `https://wa.me/${socialConfig.whatsapp}`;
        
        // تحديث روابط الفوتر
        const footerFacebookLink = document.getElementById('footerFacebookLink');
        const footerInstagramLink = document.getElementById('footerInstagramLink');
        const footerWhatsappLink = document.getElementById('footerWhatsappLink');
        
        if (footerFacebookLink) footerFacebookLink.href = socialConfig.facebook;
        if (footerInstagramLink) footerInstagramLink.href = socialConfig.instagram;
        if (footerWhatsappLink) footerWhatsappLink.href = `https://wa.me/${socialConfig.whatsapp}`;
    },
    
    // === إعداد مستمعي الأحداث للنوافذ المنبثقة ===
    
    setupModalEventListeners() {
        // نافذة السلة
        const closeCart = document.getElementById('closeCart');
        const continueShopping = document.getElementById('continueShopping');
        const clearCart = document.getElementById('clearCart');
        const checkoutBtn = document.getElementById('checkoutBtn');
        
        if (closeCart) closeCart.addEventListener('click', () => this.closeModal('cartModal'));
        if (continueShopping) continueShopping.addEventListener('click', () => this.closeModal('cartModal'));
        if (clearCart) clearCart.addEventListener('click', () => this.clearCart());
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => {
            this.closeModal('cartModal');
            this.openOrderModal();
        });
        
        // نافذة الطلب
        const closeOrder = document.getElementById('closeOrder');
        const cancelOrder = document.getElementById('cancelOrder');
        const orderForm = document.getElementById('orderForm');
        
        if (closeOrder) closeOrder.addEventListener('click', () => this.closeModal('orderModal'));
        if (cancelOrder) cancelOrder.addEventListener('click', () => this.closeModal('orderModal'));
        if (orderForm) orderForm.addEventListener('submit', (e) => this.handleOrderSubmit(e));
        
        // نافذة الدخول للإدارة
        const closeAdminLogin = document.getElementById('closeAdminLogin');
        if (closeAdminLogin) closeAdminLogin.addEventListener('click', () => this.closeModal('adminLoginModal'));
        
        // زر إعادة تعيين البحث
        const resetSearch = document.getElementById('resetSearch');
        if (resetSearch) resetSearch.addEventListener('click', () => this.resetFilters());
    },
    
    // === وظائف الطلبات (مبسطة) ===
    
    async handleOrderSubmit(e) {
        e.preventDefault();
        
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
        if (!this.validateOrderData(orderData)) {
            return;
        }
        
        try {
            // إظهار لودر
            const submitBtn = document.getElementById('submitOrder');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            submitBtn.disabled = true;
            
            // حفظ الطلب (محاكاة)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // إرسال الطلب للواتساب
            this.sendOrderToWhatsApp(orderData);
            
            // إفراغ السلة إذا كان الطلب من السلة
            if (this.currentOrderItems === this.cart) {
                this.cart = [];
                this.updateCartDisplay();
                this.saveCartToStorage();
            }
            
            // إغلاق النافذة
            this.closeModal('orderModal');
            
            // إعادة تعيين النموذج
            e.target.reset();
            
            // رسالة نجاح
            this.showAlert('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.', 'success');
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            this.showAlert('حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            // إعادة تعيين الزر
            const submitBtn = document.getElementById('submitOrder');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    },
    
    validateOrderData(orderData) {
        if (!orderData.customer_name) {
            this.showAlert('يرجى إدخال الاسم الكامل', 'error');
            return false;
        }
        
        if (!orderData.customer_phone) {
            this.showAlert('يرجى إدخال رقم الهاتف', 'error');
            return false;
        }
        
        if (!orderData.customer_address) {
            this.showAlert('يرجى إدخال العنوان بالتفصيل', 'error');
            return false;
        }
        
        if (!orderData.products || orderData.products.length === 0) {
            this.showAlert('لا توجد منتجات في الطلب', 'error');
            return false;
        }
        
        return true;
    },
    
    sendOrderToWhatsApp(orderData) {
        const whatsappNumber = STORE_CONFIG.whatsapp;
        
        let message = `🛍️ *طلب جديد من ${STORE_CONFIG.name}*\n\n`;
        message += `👤 *بيانات العميل:*\n`;
        message += `الاسم: ${orderData.customer_name}\n`;
        message += `الهاتف: ${orderData.customer_phone}\n`;
        message += `العنوان: ${orderData.customer_address}\n`;
        
        if (orderData.customer_notes) {
            message += `ملاحظات: ${orderData.customer_notes}\n`;
        }
        
        message += `\n📦 *تفاصيل الطلب:*\n`;
        
        orderData.products.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   الكمية: ${item.quantity}\n`;
            message += `   السعر: ${Utils.formatPrice(item.price)}\n`;
            message += `   الإجمالي: ${Utils.formatPrice(item.price * item.quantity)}\n\n`;
        });
        
        message += `💰 *المجموع الكلي: ${Utils.formatPrice(orderData.total_amount)}*\n\n`;
        message += `📋 طريقة الدفع: ${STORE_CONFIG.paymentMethod}\n`;
        message += `📅 تاريخ الطلب: ${new Date().toLocaleDateString('ar-EG')}`;
        
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
};

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 بدء تشغيل التطبيق...');
    
    // إعداد مستمعي الأحداث للنوافذ المنبثقة
    App.setupModalEventListeners();
    
    // تشغيل التطبيق
    App.init();
});

// تصدير التطبيق للاستخدام العام
window.App = App;
