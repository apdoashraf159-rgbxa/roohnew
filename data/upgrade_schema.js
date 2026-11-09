/**
 * ROOH Enterprise Ecosystem - Database Schema Upgrade & Relational Integrity Enforcer
 * Implements Part 27 Relational Schema Requirements for Enterprise Operations.
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'rooh_db.json');
const SEED_FILE = path.join(__dirname, 'seed.js');

function upgradeDatabase() {
  console.log('Starting ROOH Schema Upgrade...');
  let db = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error('Failed reading existing DB, initializing empty:', e);
    }
  }

  // 1. ROLES & PERMISSIONS
  db.roles = db.roles || [
    {
      id: 'ROLE-OWNER',
      name: 'Owner & General Manager',
      name_ar: 'المالك والمدير العام',
      permissions: ['all'],
      description: 'صلاحيات كاملة وغير مقيدة على كافة أقسام المنظومة'
    },
    {
      id: 'ROLE-STORE-MGR',
      name: 'Store Manager',
      name_ar: 'مدير المتجر والمنتجات',
      permissions: ['products', 'orders', 'categories', 'reviews', 'discounts'],
      description: 'إدارة كتالوج المنتجات والأقسام والطلبات والتخفيضات'
    },
    {
      id: 'ROLE-INVENTORY-MGR',
      name: 'Warehouse & Inventory Manager',
      name_ar: 'مدير المستودعات والمخزون',
      permissions: ['inventory', 'suppliers', 'purchases', 'warehouses'],
      description: 'إدارة المخازن، حركات التوريد، والجرد الدوري'
    },
    {
      id: 'ROLE-ACCOUNTANT',
      name: 'Chief Accountant',
      name_ar: 'المحاسب المالي الرئيسي',
      permissions: ['vault', 'accounting', 'expenses', 'salaries', 'reports'],
      description: 'إدارة الخزنة، قيود اليومية، الرواتب، والتقارير المالية'
    },
    {
      id: 'ROLE-DELIVERY-AGENT',
      name: 'Delivery Logistics Officer',
      name_ar: 'مسؤول الشحن واللوجستيات',
      permissions: ['shipping', 'delivery', 'orders_view'],
      description: 'توزيع وتوصيل الشحنات للمحافظات وتحديث الحالات'
    },
    {
      id: 'ROLE-CUSTOMER-SUPPORT',
      name: 'Customer Care Representative',
      name_ar: 'خدمة العملاء والدعم الفني',
      permissions: ['customers', 'complaints', 'reviews', 'orders_view'],
      description: 'الرد على استفسارات وشكاوى العملاء ومتابعة الطلبات'
    }
  ];

  db.permissions = db.permissions || [
    { id: 'perm_products', name_ar: 'إدارة المنتجات والأسعار', module: 'catalog' },
    { id: 'perm_ai_studio', name_ar: 'استوديو الذكاء الاصطناعي وتوليد الصور', module: 'ai' },
    { id: 'perm_orders', name_ar: 'إدارة وتجهيز الطلبات', module: 'sales' },
    { id: 'perm_vault', name_ar: 'إدارة الخزنة والتدفق النقدي', module: 'finance' },
    { id: 'perm_accounting', name_ar: 'شجرة الحسابات والقيود المحاسبية', module: 'finance' },
    { id: 'perm_inventory', name_ar: 'مراقبة المخزون وتوريدات المستودعات', module: 'inventory' },
    { id: 'perm_shipping', name_ar: 'إدارة الشحن والمحافظات', module: 'shipping' },
    { id: 'perm_customers', name_ar: 'إدارة بيانات العملاء والتواصل', module: 'crm' },
    { id: 'perm_website_builder', name_ar: 'محرر تصميم وهوية المتجر', module: 'cms' },
    { id: 'perm_settings', name_ar: 'إعدادات النظام والربط التقني', module: 'system' }
  ];

  // 2. BRANCHES & WAREHOUSES
  db.branches = db.branches || [
    {
      id: 'BRN-001',
      name_ar: 'فرع ومقر الإدارة الرئيسي - القاهرة',
      name_en: 'Cairo Headquarters & Flagship Boutique',
      city: 'القاهرة',
      address: 'التجمع الخامس، شارع التسعين الشمالي، مجمع روح للأعمال',
      phone: '01227208589',
      manager_name: 'عبدالرحمن',
      is_active: true
    },
    {
      id: 'BRN-002',
      name_ar: 'نقطة توزيع الإسكندرية والساحل',
      name_en: 'Alexandria Logistics Hub',
      city: 'الإسكندرية',
      address: 'سموحة، طريق 14 مايو، الإسكندرية',
      phone: '01227208589',
      manager_name: 'أحمد محمود',
      is_active: true
    }
  ];

  db.warehouses = db.warehouses || [
    {
      id: 'WH-001',
      name_ar: 'المستودع المركزي الرئيسي (القاهرة)',
      code: 'WH-CAIRO-MAIN',
      location: 'المنطقة الصناعية، التجمع الخامس، القاهرة',
      capacity_units: 50000,
      current_units: 3200,
      is_default: true,
      manager: 'سارة إبراهيم'
    },
    {
      id: 'WH-002',
      name_ar: 'مستودع الوجه البحري (الإسكندرية)',
      code: 'WH-ALEX-DIST',
      location: 'برج العرب، المنطقة اللوجستية، الإسكندرية',
      capacity_units: 20000,
      current_units: 1450,
      is_default: false,
      manager: 'محمود رفعت'
    }
  ];

  // 3. PRODUCT ATTRIBUTES ENHANCEMENT
  db.products = (db.products || []).map((p, idx) => {
    // Determine type and packaging based on category/name
    let pType = 'skincare_serum';
    let packType = 'amber_dropper_bottle';
    let fragrance = 'الورد الجوري الطبيعي والخوخ المخملي';
    let color = 'ذهبي نقي شفاف';

    if (p.category_id === 'perfumes' || p.name_ar.includes('عطر')) {
      pType = 'perfume';
      packType = 'heavy_crystal_flacon';
      fragrance = 'العنبر الملكي، العود المعتق، والفانيليا السوداء';
      color = 'عنبري دافئ';
    } else if (p.category_id === 'haircare' || p.name_ar.includes('شعر')) {
      pType = 'hair_elixir';
      packType = 'emerald_glass_bottle';
      fragrance = 'إكليل الجبل وزهور اللافندر';
      color = 'أخضر زمردي زيتي شفاف';
    } else if (p.category_id === 'bodycare' || p.name_ar.includes('جسم') || p.name_ar.includes('زبدة')) {
      pType = 'body_butter';
      packType = 'frosted_luxury_jar';
      fragrance = 'فانيليا مدغشقر وجوز الهند الملكي';
      color = 'عاجي كريمي مخملي';
    } else if (p.category_id === 'makeup' || p.name_ar.includes('تنت') || p.name_ar.includes('شفاه')) {
      pType = 'makeup_tint';
      packType = 'sleek_applicator_tube';
      fragrance = 'توت العليق الطبيعي';
      color = 'ياقوتي كرزي دافئ';
    } else if (p.category_id === 'menscare' || p.name_ar.includes('لحية') || p.name_ar.includes('رجل')) {
      pType = 'mens_grooming';
      packType = 'matte_black_dropper';
      fragrance = 'خشب الأرز، الهيل، والبرغموت الإيطالي';
      color = 'عسلي ذهبي شفاف';
    } else if (p.name_ar.includes('كريم') || p.name_ar.includes('ترطيب')) {
      pType = 'face_cream';
      packType = 'frosted_luxury_jar';
      fragrance = 'زهور البرتقال والبابونج المهدئ';
      color = 'أبيض ناصع حريري';
    } else if (p.name_ar.includes('شامبو') || p.name_ar.includes('غسول')) {
      pType = 'cleanser';
      packType = 'pump_dispenser_bottle';
      fragrance = 'الشاي الأخضر والنعناع البارد';
      color = 'شفاف بلوري نقي';
    }

    return {
      id: p.id || `ROOH-PRD-${String(idx + 1).padStart(3, '0')}`,
      name_ar: p.name_ar,
      name_en: p.name_en || '',
      category_id: p.category_id,
      category_name_ar: p.category_name_ar || '',
      product_type: p.product_type || pType,
      packaging_type: p.packaging_type || packType,
      fragrance: p.fragrance || fragrance,
      color: p.color || color,
      brand: 'روح لمستحضرات التجميل الملكية (ROOH Luxury Cosmetics)',
      sku: p.sku || `SKU-ROOH-${idx + 101}`,
      barcode: p.barcode || `6223000${100000 + idx}`,
      price: Number(p.price) || 299,
      original_price: Number(p.original_price) || Number(p.price) * 1.25,
      cost_price: Number(p.cost_price) || Math.round(Number(p.price) * 0.35),
      stock: Number(p.stock) !== undefined ? Number(p.stock) : 45,
      min_stock: Number(p.min_stock) || 10,
      image: p.image,
      images: p.images && p.images.length ? p.images : [p.image],
      description_ar: p.description_ar || 'مستحضر تجميلي طبيعي فاخر بتركيبة ملكية غنية بالخلاصات العضوية.',
      usage_ar: p.usage_ar || 'توضع قطرات بسيطة على بشرة أو شعر نظيف مع التدليك اللطيف صباحاً ومساءً.',
      ingredients_ar: p.ingredients_ar || 'مكونات طبيعية نقية 100%، مستخلصات نباتية معصورة على البارد وخالية من البارابين.',
      specifications: p.specifications || 'خالٍ من الكبريتات، غير مجرب على الحيوانات، مسجل بوزارة الصحة وهيئة الدواء المصرية.',
      sizes: p.sizes && p.sizes.length ? p.sizes : ['50ml', '100ml'],
      colors: p.colors || [],
      is_bestseller: p.is_bestseller !== undefined ? p.is_bestseller : true,
      is_new: p.is_new !== undefined ? p.is_new : false,
      status: p.status || 'Active',
      rating: p.rating || 5,
      reviews_count: p.reviews_count || 12,
      created_at: p.created_at || new Date().toISOString()
    };
  });

  // 4. PRODUCT VARIANTS TABLE
  db.product_variants = db.product_variants || [];
  if (db.product_variants.length === 0) {
    db.products.forEach(p => {
      const sizes = p.sizes || ['50ml', '100ml'];
      sizes.forEach((s, sIdx) => {
        const priceOffset = sIdx === 0 ? 0 : Math.round(p.price * 0.6);
        db.product_variants.push({
          id: `VAR-${p.id}-${sIdx + 1}`,
          product_id: p.id,
          sku: `${p.sku}-${s}`,
          variant_name_ar: `عبوة حجم ${s}`,
          variant_name_en: `Size ${s}`,
          size: s,
          price: p.price + priceOffset,
          cost_price: p.cost_price + Math.round(priceOffset * 0.35),
          stock: Math.round(p.stock / (sizes.length || 1)),
          is_active: true
        });
      });
    });
  }

  // 5. PRODUCT IMAGES TABLE
  db.product_images = db.product_images || [];
  if (db.product_images.length === 0) {
    db.products.forEach(p => {
      db.product_images.push({
        id: `IMG-${p.id}-01`,
        product_id: p.id,
        url: p.image,
        thumbnail_url: p.image,
        is_main: true,
        is_ai_generated: false,
        packaging_type: p.packaging_type,
        alt_ar: p.name_ar,
        sort_order: 1,
        created_at: new Date().toISOString()
      });
    });
  }

  // 6. AI IMAGE GENERATION JOBS TABLE
  db.ai_image_generation_jobs = db.ai_image_generation_jobs || [
    {
      id: 'JOB-AI-DEMO-01',
      product_id: 'ROOH-SK-001',
      product_name: 'سيروم النضارة الملكي بالفيتامين C والورد الجوري',
      status: 'completed',
      provider: 'studio_generator',
      prompt: 'Luxury ROOH amber glass dropper bottle cosmetic photography, warm ivory background, golden foil accents',
      result_url: db.products[0]?.image || 'assets/img/placeholder.png',
      aspect_ratio: '1:1',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3590000).toISOString()
    }
  ];

  // 7. MEDIA ASSETS TABLE
  db.media_assets = db.media_assets || [
    {
      id: 'MED-001',
      name_ar: 'صورة الشعار الملكي لشركة روح',
      file_name: 'rooh_emblem.svg',
      file_url: 'assets/img/rooh-logo.svg',
      mime_type: 'image/svg+xml',
      size_kb: 14,
      category: 'branding',
      is_persistent: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'MED-002',
      name_ar: 'بنر العناية الملكية بالبشرة',
      file_name: 'hero_cosmetics.webp',
      file_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=80',
      mime_type: 'image/webp',
      size_kb: 180,
      category: 'banners',
      is_persistent: true,
      created_at: new Date().toISOString()
    }
  ];

  // 8. AI SETTINGS TABLE (Part 6.5 & Part 7)
  db.ai_settings = db.ai_settings || {
    active_provider: 'studio_generator', // 'studio_generator' | 'gemini_imagen' | 'openai_dalle' | 'huggingface_flux'
    automatic_generation_on_new_product: true,
    require_owner_approval_for_paid_api: true,
    gemini_api_key: '',
    openai_api_key: '',
    huggingface_api_key: '',
    monthly_budget_usd: 50,
    monthly_used_usd: 0,
    generation_count_total: 14,
    presets: {
      photography_style: 'luxury_commercial', // 'luxury_commercial' | 'minimalist_studio' | 'botanical_organic' | 'marble_pedestal'
      background_style: 'warm_cream_ivory',  // 'warm_cream_ivory' | 'sage_gradient' | 'italian_marble' | 'silk_drapes'
      lighting_style: 'softbox_golden_rim',  // 'softbox_golden_rim' | 'commercial_bright' | 'dramatic_evening' | 'natural_diffused'
      aspect_ratio: '1:1',                  // '1:1' | '4:5' | '16:9'
      brand_color_primary: '#2D3B2D',       // ROOH Olive Green
      brand_color_accent: '#C5A880',        // ROOH Champagne Gold
      brand_color_background: '#FBF9F5'     // ROOH Cream Ivory
    },
    category_presets: {
      skincare: { packaging: 'amber_dropper_bottle', lighting: 'dewy_caustics' },
      haircare: { packaging: 'emerald_glass_bottle', lighting: 'golden_botanical' },
      bodycare: { packaging: 'frosted_luxury_jar', lighting: 'velvet_soft' },
      perfumes: { packaging: 'heavy_crystal_flacon', lighting: 'faceted_sparkle' },
      makeup: { packaging: 'sleek_applicator_tube', lighting: 'clean_high_key' },
      menscare: { packaging: 'matte_black_dropper', lighting: 'contrast_studio' }
    }
  };

  // 9. PAYMENT SETTINGS TABLE
  db.payment_settings = db.payment_settings || {
    instapay: {
      enabled: true,
      address: 'rooh@instapay',
      phone: '01227208589',
      receiver_name: 'عبدالرحمن - شركة روح لمستحضرات التجميل',
      instructions_ar: 'يتم التحويل عبر تطبيق إنستاباي لعنوان الدفع rooh@instapay أو الرقم 01227208589 وكتابة رقم الهاتف في خانة البيان.'
    },
    vodafone_cash: {
      enabled: true,
      wallet_numbers: ['01227208589'],
      receiver_name: 'إدارة متجر روح',
      supported_wallets: ['فودافون كاش', 'أورنج كاش', 'اتصالات كاش', 'WE Pay'],
      instructions_ar: 'التحويل لمحفظة فودافون كاش على رقم 01227208589 وتأكيد المعاملة برقم الإشعار.'
    },
    bank_card: {
      enabled: true,
      supported_cards: ['Visa', 'Mastercard', 'Meeza (ميزة)'],
      sandbox_mode: false,
      instructions_ar: 'دفع مشفر وآمن بالبطاقات الائتمانية وبطاقات ميزة الوطنية.'
    },
    cash_on_delivery: {
      enabled: true,
      extra_fee: 0,
      instructions_ar: 'الدفع عند الاستلام نقداً لمندوب الشحن بعد معاينة سلامة الشحنة.'
    }
  };

  // 10. SHIPPING SETTINGS & GOVERNORATES (27 Egyptian Governorates)
  db.shipping_settings = db.shipping_settings || {
    free_shipping_threshold: 750,
    cairo_giza_base_fee: 45,
    alexandria_delta_base_fee: 55,
    canal_zones_base_fee: 65,
    upper_egypt_base_fee: 75,
    frontier_zones_base_fee: 95,
    delivery_company: 'أسطول شحن روح الداخلي + إكسبريس مصر',
    estimated_delivery_cairo_hours: '24 إلى 48 ساعة',
    estimated_delivery_provinces_days: '2 إلى 3 أيام عمل'
  };

  // Ensure all 27 governorates exist with correct zone and pricing
  const standardGovernorates = [
    { id: 'GOV-CAI', name_ar: 'القاهرة', name_en: 'Cairo', zone: 'Zone 1 - Capital', fee: 45, days: '24-48 ساعة' },
    { id: 'GOV-GIZ', name_ar: 'الجيزة', name_en: 'Giza', zone: 'Zone 1 - Capital', fee: 45, days: '24-48 ساعة' },
    { id: 'GOV-QAL', name_ar: 'القليوبية', name_en: 'Qalyubia', zone: 'Zone 1 - Greater Cairo', fee: 50, days: '24-48 ساعة' },
    { id: 'GOV-ALX', name_ar: 'الإسكندرية', name_en: 'Alexandria', zone: 'Zone 2 - Coastal', fee: 55, days: '48 ساعة' },
    { id: 'GOV-BEH', name_ar: 'البحيرة', name_en: 'Beheira', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-MAT', name_ar: 'مطروح', name_en: 'Matrouh', zone: 'Zone 4 - Frontier', fee: 85, days: '3-4 أيام' },
    { id: 'GOV-DAM', name_ar: 'دمياط', name_en: 'Damietta', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-DKH', name_ar: 'الدقهلية (المنصورة)', name_en: 'Dakahlia', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-KFS', name_ar: 'كفر الشيخ', name_en: 'Kafr El Sheikh', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-GHB', name_ar: 'الغربية (طنطا)', name_en: 'Gharbia', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-MNF', name_ar: 'المنوفية', name_en: 'Menofia', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-SHR', name_ar: 'الشرقية (الزقازيق)', name_en: 'Sharqia', zone: 'Zone 2 - Delta', fee: 55, days: '2-3 أيام' },
    { id: 'GOV-ISL', name_ar: 'الإسماعيلية', name_en: 'Ismailia', zone: 'Zone 3 - Canal', fee: 65, days: '2-3 أيام' },
    { id: 'GOV-PTS', name_ar: 'بورسعيد', name_en: 'Port Said', zone: 'Zone 3 - Canal', fee: 65, days: '2-3 أيام' },
    { id: 'GOV-SUZ', name_ar: 'السويس', name_en: 'Suez', zone: 'Zone 3 - Canal', fee: 65, days: '2-3 أيام' },
    { id: 'GOV-BNS', name_ar: 'بني سويف', name_en: 'Beni Suef', zone: 'Zone 4 - North Upper', fee: 70, days: '2-3 أيام' },
    { id: 'GOV-FYM', name_ar: 'الفيوم', name_en: 'Fayoum', zone: 'Zone 4 - North Upper', fee: 70, days: '2-3 أيام' },
    { id: 'GOV-MNY', name_ar: 'المنيا', name_en: 'Minya', zone: 'Zone 4 - North Upper', fee: 75, days: '2-4 أيام' },
    { id: 'GOV-ASY', name_ar: 'أسيوط', name_en: 'Asyut', zone: 'Zone 4 - Middle Upper', fee: 75, days: '2-4 أيام' },
    { id: 'GOV-SOH', name_ar: 'سوهاج', name_en: 'Sohag', zone: 'Zone 4 - Middle Upper', fee: 80, days: '3-4 أيام' },
    { id: 'GOV-QNA', name_ar: 'قنا', name_en: 'Qena', zone: 'Zone 5 - South Upper', fee: 80, days: '3-4 أيام' },
    { id: 'GOV-LXU', name_ar: 'الأقصر', name_en: 'Luxor', zone: 'Zone 5 - South Upper', fee: 85, days: '3-4 أيام' },
    { id: 'GOV-ASW', name_ar: 'أسوان', name_en: 'Aswan', zone: 'Zone 5 - South Upper', fee: 85, days: '3-4 أيام' },
    { id: 'GOV-RED', name_ar: 'البحر الأحمر (الغردقة)', name_en: 'Red Sea', zone: 'Zone 5 - Coastal Red Sea', fee: 85, days: '3-4 أيام' },
    { id: 'GOV-NVL', name_ar: 'الوادي الجديد', name_en: 'New Valley', zone: 'Zone 6 - Frontier', fee: 95, days: '4-5 أيام' },
    { id: 'GOV-SIN', name_ar: 'شمال سيناء', name_en: 'North Sinai', zone: 'Zone 6 - Frontier', fee: 95, days: '4-5 أيام' },
    { id: 'GOV-SIS', name_ar: 'جنوب سيناء (شرم الشيخ)', name_en: 'South Sinai', zone: 'Zone 6 - Frontier', fee: 95, days: '3-4 أيام' }
  ];

  db.governorates = standardGovernorates;
  db.shipping_zones = standardGovernorates;

  // 11. DELIVERY AGENTS & DELIVERY ORDERS
  db.delivery_agents = db.delivery_agents || [
    {
      id: 'DEL-AGT-01',
      name: 'محمود رفعت',
      phone: '01012345678',
      vehicle_type: 'سيارة فان مبردة للجماليات',
      assigned_zones: ['القاهرة', 'الجيزة'],
      active_deliveries: 2,
      is_available: true
    },
    {
      id: 'DEL-AGT-02',
      name: 'كريم الدسوقي',
      phone: '01123456789',
      vehicle_type: 'دراجة نارية إكسبريس',
      assigned_zones: ['الإسكندرية', 'البحيرة'],
      active_deliveries: 1,
      is_available: true
    }
  ];

  db.delivery_orders = db.delivery_orders || [];

  // 12. PAYMENTS & REFUNDS
  db.payments = db.payments || [];
  db.refunds = db.refunds || [];

  // 13. SALARY RECORDS & COMMISSIONS
  db.salary_records = db.salary_records || [
    {
      id: 'SAL-2026-11-01',
      employee_id: 'EMP-001',
      employee_name: 'أحمد محمود',
      month: '2026-11',
      base_salary: 8500,
      bonuses: 1200,
      deductions: 0,
      net_salary: 9700,
      status: 'Paid',
      payment_date: '2026-11-01'
    },
    {
      id: 'SAL-2026-11-02',
      employee_id: 'EMP-002',
      employee_name: 'سارة إبراهيم',
      month: '2026-11',
      base_salary: 7500,
      bonuses: 800,
      deductions: 0,
      net_salary: 8300,
      status: 'Paid',
      payment_date: '2026-11-01'
    }
  ];

  db.commissions = db.commissions || [];
  db.salary_payments = db.salary_payments || [];

  // 14. APPROVAL REQUESTS & ACTIONS
  db.approval_requests = db.approval_requests || [
    {
      id: 'APV-001',
      requester_id: 'USR-002',
      requester_name: 'أحمد محمود',
      type: 'purchase_order',
      title: 'طلب شراء عبوات زجاجية معتمة 50 مل من مصنع البلور الملكي',
      amount: 15400,
      status: 'Approved',
      approved_by: 'المدير العام',
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  db.approval_actions = db.approval_actions || [];

  // 15. CONVERSATIONS & MESSAGES
  db.conversations = db.conversations || [];
  db.messages = db.messages || [];

  // 16. WEBSITE PAGES & STORE PAGES & CONTENT VERSIONS
  db.website_pages = db.website_pages || [
    { id: 'page_home', slug: '/', title_ar: 'الرئيسية - متجر روح الملكي', published: true, updated_at: new Date().toISOString() },
    { id: 'page_store', slug: '/store', title_ar: 'كتالوج المنتجات الملكية', published: true, updated_at: new Date().toISOString() },
    { id: 'page_lab', slug: '/lab', title_ar: 'مختبر ابتكار روح (اصنعي منتجكِ)', published: true, updated_at: new Date().toISOString() },
    { id: 'page_about', slug: '/about', title_ar: 'عن روح وفلسفتنا الجمالية', published: true, updated_at: new Date().toISOString() },
    { id: 'page_track', slug: '/track', title_ar: 'تتبع حالة الشحنات والطلبات', published: true, updated_at: new Date().toISOString() }
  ];
  db.store_pages = db.website_pages;
  db.content_versions = db.content_versions || [
    { version: 'v2.1.0', published_by: 'المدير العام', date: new Date().toISOString(), notes: 'تفعيل منظومة الذكاء الاصطناعي وتكامل الدفع والشحن' }
  ];

  // 17. DESIGN TOKENS & THEMES
  db.design_tokens = db.design_tokens || {
    colors: {
      primary: '#2D3B2D',
      secondary: '#4A5D4E',
      accent: '#C5A880',
      gold: '#D4AF37',
      cream: '#FBF9F5',
      background: '#F4EFE6',
      text_dark: '#1B241B',
      text_muted: '#6E7A6E',
      border: '#E3DDD3'
    },
    typography: {
      font_serif: "'Cinzel', 'Amiri', 'Playfair Display', serif",
      font_sans: "'Plus Jakarta Sans', 'Cairo', sans-serif"
    },
    radii: {
      sm: '6px',
      md: '10px',
      lg: '16px',
      pill: '9999px'
    },
    shadows: {
      subtle: '0 4px 20px rgba(45,59,45,0.06)',
      card: '0 8px 30px rgba(45,59,45,0.1)',
      gold_glow: '0 0 25px rgba(197,168,128,0.25)'
    }
  };

  db.themes = db.themes || [
    { id: 'theme_royal_olive', name_ar: 'الهوية الملكية الكلاسيكية (الزيتوني والذهب الشامبين)', is_active: true }
  ];

  // 18. PURCHASE ORDERS & SUPPLIERS
  db.purchase_orders = db.purchases || [];

  // Write updated DB
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  console.log('✓ Successfully wrote upgraded rooh_db.json with all Part 27 entities!');

  // Sync to seed.js
  const seedContent = '/**\n * ROOH Enterprise Ecosystem - Synchronized Seed Data\n */\nwindow.ROOH_SEED_DATA = ' + JSON.stringify(db, null, 2) + ';\n';
  fs.writeFileSync(SEED_FILE, seedContent, 'utf8');
  console.log('✓ Successfully synchronized data/seed.js!');
}

upgradeDatabase();

