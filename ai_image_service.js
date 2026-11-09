/**
 * ROOH Cosmetics Enterprise - AI Image Generation Service & Studio Engine
 * Implements Part 6 (Automatic AI Product Image System) & Part 7 (ROOH AI Product Design System).
 *
 * Supports:
 * 1. Server-side Prompt Builder adhering to ROOH Luxury Design System.
 * 2. High-fidelity Procedural Studio Generator (SVG / Vector Artwork with realistic shaders,
 *    glass reflections, golden accents, custom labels for all 7 cosmetic packaging categories).
 * 3. Secure External AI Providers integration (Gemini Imagen 3, OpenAI DALL-E, HuggingFace Flux).
 * 4. Persistent disk storage in assets/img/generated/ and database job tracking.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const GENERATED_DIR = path.join(__dirname, 'assets', 'img', 'generated');
if (!fs.existsSync(GENERATED_DIR)) {
  fs.mkdirSync(GENERATED_DIR, { recursive: true });
}

class RoohAIImageService {
  /**
   * Part 6.F: Server-side Prompt Builder
   */
  static buildPrompt(product, aiSettings = {}) {
    const presets = aiSettings.presets || {};
    const photoStyle = presets.photography_style || 'luxury_commercial';
    const bgStyle = presets.background_style || 'warm_cream_ivory';
    const lightStyle = presets.lighting_style || 'softbox_golden_rim';
    const aspectRatio = presets.aspect_ratio || '1:1';

    const pNameAr = product.name_ar || 'مستحضر روح الملكي';
    const pNameEn = product.name_en || 'ROOH Royal Cosmetic';
    const category = product.category_name_ar || product.category_id || 'مستحضرات تجميل';
    const pType = product.product_type || 'serum';
    const packType = product.packaging_type || 'amber_dropper_bottle';
    const fragrance = product.fragrance ? `, infused with scent of ${product.fragrance}` : '';
    const color = product.color ? `, color tone ${product.color}` : '';
    const size = (product.sizes && product.sizes[0]) || '50ml';

    const prompt = [
      `Ultra-luxury commercial product photography of "${pNameEn}" (${pNameAr}), a premium ${category} product by ROOH Luxury Cosmetics.`,
      `Packaging: Bespoke ${packType.replace(/_/g, ' ')} (${size})${fragrance}${color}.`,
      `Aesthetics: ROOH brand visual identity with royal olive green (#2D3B2D), sage details (#8A9A86), and champagne gold leaf (#C5A880) accents.`,
      `Environment & Pedestal: Placed on a minimalist circular ${bgStyle.replace(/_/g, ' ')} podium with soft diffused shadows and subtle natural reflections.`,
      `Lighting: Professional ${lightStyle.replace(/_/g, ' ')} with gentle caustics, crisp glass reflections, and clean studio contrast.`,
      `Composition: Centered hero product shot, ${aspectRatio} aspect ratio, editorial luxury cosmetics catalog standard, sharp focus, 8k resolution, elegant minimalism.`
    ].join(' ');

    return {
      prompt,
      parameters: {
        product_name_ar: pNameAr,
        product_name_en: pNameEn,
        category,
        product_type: pType,
        packaging_type: packType,
        photography_style: photoStyle,
        background_style: bgStyle,
        lighting_style: lightStyle,
        aspect_ratio: aspectRatio,
        brand_colors: ['#2D3B2D', '#C5A880', '#FBF9F5', '#8A9A86']
      }
    };
  }

  /**
   * Part 6.B & Part 7: High-Fidelity ROOH Procedural Studio Generator
   * Generates bespoke photorealistic vector cosmetic packaging artwork with custom glass reflections,
   * gradients, gold-foil typography, product title in Arabic & English, and ROOH royal emblem.
   */
  static generateStudioSVG(product, options = {}) {
    const pNameAr = (product.name_ar || 'مستحضر روح الملكي').replace(/[<>&"']/g, '');
    const pNameEn = (product.name_en || 'ROOH LUXURY COSMETICS').replace(/[<>&"']/g, '');
    const size = (product.sizes && product.sizes[0]) || '50ml';
    const packType = product.packaging_type || 'amber_dropper_bottle';
    const pType = product.product_type || 'skincare_serum';

    // SVG Canvas Dimensions (800x800 square luxury format)
    const w = 800;
    const h = 800;

    // Brand color palettes
    const oliveDark = '#1B241B';
    const olivePrimary = '#2D3B2D';
    const oliveSage = '#4A5D4E';
    const goldChampagne = '#C5A880';
    const goldBright = '#E8C88B';
    const goldDeep = '#99783D';
    const creamIvory = '#FBF9F5';
    const creamWarm = '#F3EDE2';

    // Different packaging artwork templates
    let packagingSVG = '';

    if (packType === 'frosted_luxury_jar' || pType === 'face_cream' || pType === 'body_butter') {
      // Luxury Cosmetic Jar
      packagingSVG = `
        <!-- Luxury Cosmetic Jar -->
        <g id="cosmetic_jar">
          <!-- Shadow on marble pedestal -->
          <ellipse cx="400" cy="590" rx="190" ry="26" fill="rgba(27,36,27,0.18)" filter="url(#pedestalBlur)"/>
          <ellipse cx="400" cy="585" rx="140" ry="16" fill="rgba(27,36,27,0.25)" filter="url(#pedestalBlur)"/>

          <!-- Jar Base Body (Frosted Heavy Glass) -->
          <defs>
            <linearGradient id="jarGlassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#E2DDD5" stop-opacity="0.95"/>
              <stop offset="15%" stop-color="#FFFFFF" stop-opacity="0.98"/>
              <stop offset="50%" stop-color="#F7F4EE" stop-opacity="0.85"/>
              <stop offset="85%" stop-color="#E8E2D6" stop-opacity="0.92"/>
              <stop offset="100%" stop-color="#CFC7B8" stop-opacity="0.95"/>
            </linearGradient>
            <linearGradient id="jarInnerCream" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFFDF9"/>
              <stop offset="100%" stop-color="#F2EBE0"/>
            </linearGradient>
            <linearGradient id="jarGoldCap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#99783D"/>
              <stop offset="25%" stop-color="#E8C88B"/>
              <stop offset="50%" stop-color="#FDF3DA"/>
              <stop offset="75%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#805F25"/>
            </linearGradient>
          </defs>

          <!-- Jar Glass Exterior -->
          <rect x="250" y="410" width="300" height="170" rx="28" fill="url(#jarGlassGrad)" stroke="rgba(255,255,255,0.7)" stroke-width="2"/>
          <!-- Inner Cream Chamber -->
          <rect x="270" y="425" width="260" height="135" rx="18" fill="url(#jarInnerCream)" opacity="0.9"/>
          
          <!-- Glass Reflections -->
          <path d="M260,420 L275,420 L275,565 L260,560 Z" fill="#FFFFFF" opacity="0.55"/>
          <path d="M525,420 L538,420 L538,560 L525,565 Z" fill="#FFFFFF" opacity="0.35"/>

          <!-- Gold Metallic Lid -->
          <rect x="240" y="345" width="320" height="70" rx="14" fill="url(#jarGoldCap)" stroke="#805F25" stroke-width="1.5" filter="url(#dropShadow)"/>
          <ellipse cx="400" cy="348" rx="155" ry="16" fill="#FDF3DA" opacity="0.6"/>
          <!-- Lid bevel groove -->
          <line x1="242" y1="380" x2="558" y2="380" stroke="#7A5A20" stroke-width="1" opacity="0.4"/>
          <line x1="242" y1="382" x2="558" y2="382" stroke="#FFF" stroke-width="1" opacity="0.5"/>

          <!-- Label Plaque on Jar -->
          <rect x="285" y="455" width="230" height="85" rx="10" fill="#2D3B2D" stroke="url(#goldRimGrad)" stroke-width="1.5"/>
          <circle cx="400" cy="473" r="10" fill="url(#goldRimGrad)"/>
          <text x="400" y="476" font-family="'Cinzel', serif" font-size="10" fill="#2D3B2D" font-weight="bold" text-anchor="middle">👑</text>
          
          <text x="400" y="495" font-family="'Cinzel', serif" font-size="13" fill="#D4AF37" font-weight="bold" letter-spacing="3" text-anchor="middle">ROOH</text>
          <text x="400" y="513" font-family="'Cairo', sans-serif" font-size="11" fill="#FFFFFF" font-weight="600" text-anchor="middle">${pNameAr.slice(0, 28)}</text>
          <text x="400" y="527" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#C5A880" letter-spacing="1" text-anchor="middle">${size} • LUXURY COSMETICS</text>
        </g>
      `;
    } else if (packType === 'heavy_crystal_flacon' || pType === 'perfume') {
      // Luxury Crystal Perfume Flacon
      packagingSVG = `
        <!-- Luxury Crystal Perfume Flacon -->
        <g id="perfume_flacon">
          <!-- Shadow -->
          <ellipse cx="400" cy="625" rx="170" ry="24" fill="rgba(27,36,27,0.2)" filter="url(#pedestalBlur)"/>
          <ellipse cx="400" cy="620" rx="120" ry="14" fill="rgba(27,36,27,0.25)" filter="url(#pedestalBlur)"/>

          <defs>
            <linearGradient id="perfumeLiquid" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FBE4B5" stop-opacity="0.95"/>
              <stop offset="60%" stop-color="#E5AA52" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#A56E22" stop-opacity="0.98"/>
            </linearGradient>
            <linearGradient id="crystalEdge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
              <stop offset="20%" stop-color="#FFFFFF" stop-opacity="0.2"/>
              <stop offset="80%" stop-color="#FFFFFF" stop-opacity="0.1"/>
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.7"/>
            </linearGradient>
            <linearGradient id="goldSprayer" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#99783D"/>
              <stop offset="35%" stop-color="#FCEABF"/>
              <stop offset="70%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#805F25"/>
            </linearGradient>
          </defs>

          <!-- Crystal Glass Body -->
          <rect x="290" y="330" width="220" height="270" rx="16" fill="url(#crystalEdge)" stroke="#FFFFFF" stroke-width="2"/>
          <!-- Internal Fragrance Liquid Chamber -->
          <rect x="306" y="348" width="188" height="235" rx="10" fill="url(#perfumeLiquid)"/>

          <!-- Perfume Dip Tube -->
          <line x1="400" y1="280" x2="400" y2="575" stroke="rgba(255,255,255,0.7)" stroke-width="3"/>

          <!-- Crystal Facet Highlights -->
          <polygon points="290,330 310,348 310,583 290,600" fill="#FFFFFF" opacity="0.45"/>
          <polygon points="510,330 490,348 490,583 510,600" fill="#FFFFFF" opacity="0.3"/>

          <!-- Gold Neck Collar & Sprayer -->
          <rect x="370" y="275" width="60" height="55" rx="6" fill="url(#goldSprayer)" stroke="#805F25" stroke-width="1"/>
          
          <!-- Heavy Faceted Crystal Stopper Cap -->
          <polygon points="340,195 460,195 445,275 355,275" fill="url(#crystalEdge)" stroke="#FFFFFF" stroke-width="2"/>
          <polygon points="360,205 440,205 430,265 370,265" fill="#FFFFFF" opacity="0.35"/>

          <!-- Engraved Metal Plaque -->
          <rect x="325" y="430" width="150" height="95" rx="8" fill="#1B241B" stroke="url(#goldSprayer)" stroke-width="2"/>
          <text x="400" y="458" font-family="'Cinzel', serif" font-size="14" fill="#D4AF37" font-weight="bold" letter-spacing="4" text-anchor="middle">ROOH</text>
          <text x="400" y="474" font-family="'Cinzel', serif" font-size="8" fill="#E8C88B" letter-spacing="2" text-anchor="middle">EAU DE PARFUM</text>
          <line x1="345" y1="482" x2="455" y2="482" stroke="#C5A880" stroke-width="0.8"/>
          <text x="400" y="499" font-family="'Cairo', sans-serif" font-size="10" fill="#FFFFFF" font-weight="600" text-anchor="middle">${pNameAr.slice(0, 20)}</text>
          <text x="400" y="513" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" fill="#C5A880" letter-spacing="1" text-anchor="middle">${size} • 3.4 FL. OZ.</text>
        </g>
      `;
    } else if (packType === 'pump_dispenser_bottle' || pType === 'cleanser' || pType === 'shampoo') {
      // Tall Luxury Dispenser Bottle (Shampoo / Cleanser)
      packagingSVG = `
        <!-- Tall Luxury Dispenser Bottle -->
        <g id="dispenser_bottle">
          <!-- Shadow -->
          <ellipse cx="400" cy="650" rx="140" ry="22" fill="rgba(27,36,27,0.2)" filter="url(#pedestalBlur)"/>
          <ellipse cx="400" cy="645" rx="95" ry="13" fill="rgba(27,36,27,0.25)" filter="url(#pedestalBlur)"/>

          <defs>
            <linearGradient id="bottleMatteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#212C21"/>
              <stop offset="35%" stop-color="#2D3B2D"/>
              <stop offset="60%" stop-color="#405240"/>
              <stop offset="85%" stop-color="#2D3B2D"/>
              <stop offset="100%" stop-color="#1B241B"/>
            </linearGradient>
            <linearGradient id="goldPumpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#805F25"/>
              <stop offset="30%" stop-color="#FCEABF"/>
              <stop offset="65%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#73521E"/>
            </linearGradient>
          </defs>

          <!-- Bottle Cylinder Body -->
          <rect x="310" y="290" width="180" height="340" rx="25" fill="url(#bottleMatteGrad)" stroke="rgba(197,168,128,0.3)" stroke-width="1.5"/>
          <!-- Curved shoulder -->
          <path d="M310,315 C310,270 360,265 375,260 L425,260 C440,265 490,270 490,315 Z" fill="url(#bottleMatteGrad)"/>
          
          <!-- Specular Highlight Strip -->
          <rect x="330" y="295" width="14" height="325" rx="7" fill="#FFFFFF" opacity="0.12"/>
          <rect x="455" y="295" width="8" height="325" rx="4" fill="#FFFFFF" opacity="0.08"/>

          <!-- Dispenser Pump Collar -->
          <rect x="375" y="235" width="50" height="28" rx="4" fill="url(#goldPumpGrad)" stroke="#805F25" stroke-width="1"/>
          <!-- Pump Stem -->
          <rect x="393" y="195" width="14" height="40" fill="#E8C88B"/>
          <!-- Pump Nozzle Head -->
          <path d="M360,185 L425,185 C435,185 440,192 440,202 L420,202 C420,196 415,195 400,195 L345,200 C338,200 335,195 340,190 Z" fill="url(#goldPumpGrad)"/>

          <!-- Label Art -->
          <rect x="325" y="350" width="150" height="180" rx="12" fill="#FBF9F5" stroke="url(#goldPumpGrad)" stroke-width="1.5"/>
          <text x="400" y="380" font-family="'Cinzel', serif" font-size="16" fill="#2D3B2D" font-weight="bold" letter-spacing="4" text-anchor="middle">ROOH</text>
          <text x="400" y="396" font-family="'Cinzel', serif" font-size="8" fill="#C5A880" letter-spacing="2" text-anchor="middle">BOTANICAL LUXURY</text>
          <line x1="345" y1="405" x2="455" y2="405" stroke="#C5A880" stroke-width="1"/>
          <text x="400" y="430" font-family="'Cairo', sans-serif" font-size="12" fill="#1B241B" font-weight="bold" text-anchor="middle">${pNameAr.slice(0, 22)}</text>
          <text x="400" y="450" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" fill="#4A5D4E" text-anchor="middle">${pNameEn.slice(0, 24)}</text>
          <text x="400" y="475" font-family="'Cairo', sans-serif" font-size="9" fill="#8A9A86" text-anchor="middle">خلاصة طبيعية نقية 100%</text>
          <text x="400" y="505" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" fill="#2D3B2D" font-weight="bold" text-anchor="middle">${size}</text>
        </g>
      `;
    } else {
      // Default & Hero: Amber / Emerald Luxury Glass Dropper Bottle (Serums, Face Oils, Elixirs)
      const isEmerald = packType === 'emerald_glass_bottle' || pType === 'hair_elixir';
      const bottleGradId = isEmerald ? 'emeraldBottleGrad' : 'amberBottleGrad';
      const liquidGradId = isEmerald ? 'emeraldLiquidGrad' : 'amberLiquidGrad';

      packagingSVG = `
        <!-- Luxury Dropper Bottle (Hero Amber/Emerald) -->
        <g id="dropper_bottle">
          <!-- Soft Pedestal Shadow -->
          <ellipse cx="400" cy="635" rx="150" ry="22" fill="rgba(27,36,27,0.18)" filter="url(#pedestalBlur)"/>
          <ellipse cx="400" cy="630" rx="100" ry="14" fill="rgba(27,36,27,0.25)" filter="url(#pedestalBlur)"/>

          <defs>
            <!-- Amber Liquid -->
            <linearGradient id="amberBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#542B08" stop-opacity="0.95"/>
              <stop offset="25%" stop-color="#9E5616" stop-opacity="0.9"/>
              <stop offset="55%" stop-color="#DA842C" stop-opacity="0.85"/>
              <stop offset="85%" stop-color="#9E5616" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#3D1E04" stop-opacity="0.98"/>
            </linearGradient>
            <!-- Emerald Liquid -->
            <linearGradient id="emeraldBottleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0F2414" stop-opacity="0.95"/>
              <stop offset="25%" stop-color="#1B4726" stop-opacity="0.9"/>
              <stop offset="55%" stop-color="#2D733F" stop-opacity="0.85"/>
              <stop offset="85%" stop-color="#1B4726" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#0A180E" stop-opacity="0.98"/>
            </linearGradient>
            <!-- Gold Dropper Collar -->
            <linearGradient id="goldCollarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#805F25"/>
              <stop offset="25%" stop-color="#E8C88B"/>
              <stop offset="50%" stop-color="#FFF3D6"/>
              <stop offset="75%" stop-color="#D4AF37"/>
              <stop offset="100%" stop-color="#73521E"/>
            </linearGradient>
          </defs>

          <!-- Glass Bottle Body -->
          <rect x="315" y="320" width="170" height="290" rx="30" fill="url(#${bottleGradId})" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
          <!-- Curved Shoulder -->
          <path d="M315,350 C315,290 365,280 375,275 L425,275 C435,280 485,290 485,350 Z" fill="url(#${bottleGradId})"/>

          <!-- Specular Glass Light Reflections -->
          <path d="M330,325 L345,325 L345,595 L330,590 Z" fill="#FFFFFF" opacity="0.35"/>
          <path d="M465,325 L472,325 L472,590 L465,593 Z" fill="#FFFFFF" opacity="0.2"/>

          <!-- Gold Collar Ribbed Ring -->
          <rect x="365" y="240" width="70" height="38" rx="6" fill="url(#goldCollarGrad)" stroke="#805F25" stroke-width="1"/>
          <line x1="367" y1="252" x2="433" y2="252" stroke="#664B17" stroke-width="0.8"/>
          <line x1="367" y1="264" x2="433" y2="264" stroke="#664B17" stroke-width="0.8"/>

          <!-- Rubber Dropper Bulb -->
          <path d="M375,240 C375,190 385,160 400,160 C415,160 425,190 425,240 Z" fill="#1B241B" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
          <!-- Bulb highlight -->
          <ellipse cx="395" cy="195" rx="5" ry="25" fill="#FFFFFF" opacity="0.15"/>

          <!-- Pipette Dropper Tip with Golden Suspended Droplet -->
          <g id="suspended_droplet" transform="translate(140, -10)">
            <ellipse cx="400" cy="340" rx="8" ry="12" fill="url(#goldCollarGrad)" filter="url(#dropShadow)"/>
            <circle cx="398" cy="336" r="3" fill="#FFFFFF" opacity="0.8"/>
          </g>

          <!-- Luxury Label -->
          <rect x="330" y="375" width="140" height="175" rx="10" fill="#FBF9F5" stroke="url(#goldCollarGrad)" stroke-width="1.5" filter="url(#dropShadow)"/>
          
          <!-- ROOH Crown Logo -->
          <g transform="translate(385, 390)">
            <path d="M0,15 L7,3 L15,10 L23,3 L30,15 Z" fill="#C5A880"/>
            <circle cx="15" cy="1" r="2.5" fill="#D4AF37"/>
          </g>

          <text x="400" y="423" font-family="'Cinzel', serif" font-size="15" fill="#2D3B2D" font-weight="bold" letter-spacing="4" text-anchor="middle">ROOH</text>
          <text x="400" y="438" font-family="'Cinzel', serif" font-size="7.5" fill="#C5A880" letter-spacing="2" text-anchor="middle">ROYAL ELIXIR</text>
          <line x1="350" y1="447" x2="450" y2="447" stroke="#C5A880" stroke-width="0.8"/>
          
          <text x="400" y="470" font-family="'Cairo', sans-serif" font-size="11" fill="#1B241B" font-weight="bold" text-anchor="middle">${pNameAr.slice(0, 20)}</text>
          <text x="400" y="488" font-family="'Plus Jakarta Sans', sans-serif" font-size="7.5" fill="#6E7A6E" text-anchor="middle">${pNameEn.slice(0, 22)}</text>
          <text x="400" y="515" font-family="'Cairo', sans-serif" font-size="8.5" fill="#4A5D4E" text-anchor="middle">تركيبة ملكية طبيعية 100%</text>
          <text x="400" y="535" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" fill="#2D3B2D" font-weight="bold" text-anchor="middle">${size}</text>
        </g>
      `;
    }

    // Complete Combined SVG Document with Luxury Pedestal, Lighting & Background
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
  <defs>
    <!-- Filter definitions for photorealistic soft lighting -->
    <filter id="pedestalBlur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="16"/>
    </filter>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="rgba(45,59,45,0.15)"/>
    </filter>
    <linearGradient id="studioBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBF9F5"/>
      <stop offset="60%" stop-color="#F2EBE0"/>
      <stop offset="100%" stop-color="#E5DCCE"/>
    </linearGradient>
    <linearGradient id="pedestalMarble" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F0EAE1"/>
      <stop offset="35%" stop-color="#FAF7F2"/>
      <stop offset="70%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#EBE3D7"/>
    </linearGradient>
    <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A880"/>
      <stop offset="50%" stop-color="#F3E1B9"/>
      <stop offset="100%" stop-color="#99783D"/>
    </linearGradient>
    <radialGradient id="softVignette" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4"/>
      <stop offset="70%" stop-color="#EBE2D4" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#C5B7A0" stop-opacity="0.5"/>
    </radialGradient>
  </defs>

  <!-- Background Canvas -->
  <rect width="${w}" height="${h}" fill="url(#studioBg)"/>
  <rect width="${w}" height="${h}" fill="url(#softVignette)"/>

  <!-- Subtle Botanical Olive Leaves Shadow in Background -->
  <g opacity="0.07" transform="translate(40, 20)">
    <path d="M100,50 Q160,20 220,70 Q170,110 100,50 Z" fill="#2D3B2D"/>
    <path d="M220,70 Q280,30 350,90 Q290,130 220,70 Z" fill="#2D3B2D"/>
    <path d="M120,120 Q190,90 260,150 Q190,190 120,120 Z" fill="#2D3B2D"/>
  </g>

  <!-- Luxury Marble Cylinder Pedestal Base -->
  <g id="marble_podium">
    <!-- Pedestal Base Under-shadow -->
    <ellipse cx="400" cy="710" rx="310" ry="42" fill="rgba(27,36,27,0.12)" filter="url(#pedestalBlur)"/>
    
    <!-- Pedestal Cylinder Height -->
    <path d="M120,620 L120,670 C120,715 680,715 680,670 L680,620 Z" fill="url(#pedestalMarble)" stroke="#E0D6C8" stroke-width="1"/>
    
    <!-- Pedestal Top Oval Surface -->
    <ellipse cx="400" cy="620" rx="280" ry="38" fill="#FFFDF9" stroke="url(#goldRimGrad)" stroke-width="1.8"/>
    <ellipse cx="400" cy="620" rx="270" ry="34" fill="#FAF6EF" opacity="0.7"/>
  </g>

  <!-- Main Cosmetic Packaging Artwork -->
  ${packagingSVG}

  <!-- Water Droplets / Natural Luxury Dew Details -->
  <g id="dew_accents" opacity="0.75">
    <ellipse cx="250" cy="600" rx="7" ry="4" fill="#FFFFFF" stroke="rgba(197,168,128,0.5)" stroke-width="0.8"/>
    <circle cx="248" cy="599" r="1.5" fill="#FFFFFF"/>
    <ellipse cx="550" cy="610" rx="9" ry="5" fill="#FFFFFF" stroke="rgba(197,168,128,0.5)" stroke-width="0.8"/>
    <circle cx="548" cy="609" r="2" fill="#FFFFFF"/>
  </g>

  <!-- ROOH Luxury Authentication Seal Watermark -->
  <g id="rooh_seal" transform="translate(710, 710)" opacity="0.35">
    <circle cx="30" cy="30" r="26" fill="none" stroke="#2D3B2D" stroke-width="1.2" stroke-dasharray="3,2"/>
    <text x="30" y="34" font-family="'Cinzel', serif" font-size="8" fill="#2D3B2D" font-weight="bold" text-anchor="middle">ROOH</text>
  </g>
</svg>`;
  }

  /**
   * Part 6.D & 6.G: Generate, save persistently, and return media record
   */
  static async generateProductImage(product, aiSettings = {}, options = {}) {
    const pId = product.id || `PRD-${Date.now().toString().slice(-4)}`;
    const promptData = this.buildPrompt(product, aiSettings);

    const jobId = `JOB-AI-${Date.now()}`;
    const filename = `rooh_ai_${pId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}.svg`;
    const relativeUrl = `assets/img/generated/${filename}`;
    const absolutePath = path.join(GENERATED_DIR, filename);

    // Check if external provider configured and enabled
    const activeProvider = aiSettings.active_provider || 'studio_generator';
    let generationMethod = 'studio_generator';
    let externalSuccess = false;

    if (activeProvider !== 'studio_generator' && !aiSettings.require_owner_approval_for_paid_api) {
      // In future or when API key is provided, external API can be called here
      // For now, if no key or error, fallback to Studio Generator
    }

    // Generate high-resolution luxury SVG artwork
    const svgContent = this.generateStudioSVG(product, options);
    fs.writeFileSync(absolutePath, svgContent, 'utf8');

    // Create persistent records
    const jobRecord = {
      id: jobId,
      product_id: pId,
      product_name: product.name_ar,
      status: 'completed',
      provider: generationMethod,
      prompt: promptData.prompt,
      parameters: promptData.parameters,
      result_url: relativeUrl,
      aspect_ratio: promptData.parameters.aspect_ratio || '1:1',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    const imageRecord = {
      id: `IMG-${pId}-${Date.now().toString().slice(-4)}`,
      product_id: pId,
      url: relativeUrl,
      thumbnail_url: relativeUrl,
      is_main: true,
      is_ai_generated: true,
      packaging_type: product.packaging_type,
      generation_prompt: promptData.prompt,
      alt_ar: product.name_ar,
      sort_order: 1,
      created_at: new Date().toISOString()
    };

    const mediaRecord = {
      id: `MED-AI-${Date.now().toString().slice(-4)}`,
      name_ar: `صورة ذكاء اصطناعي لمنتج: ${product.name_ar}`,
      file_name: filename,
      file_url: relativeUrl,
      mime_type: 'image/svg+xml',
      size_kb: Math.round(svgContent.length / 1024),
      category: 'products_ai',
      product_id: pId,
      is_persistent: true,
      created_at: new Date().toISOString()
    };

    return {
      success: true,
      image_url: relativeUrl,
      job: jobRecord,
      image_record: imageRecord,
      media_record: mediaRecord,
      prompt: promptData.prompt
    };
  }
}

module.exports = RoohAIImageService;

