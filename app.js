const STORE_CONFIG = Object.freeze({
  storeName: "Francinez Calçados",
  defaultWhatsApp: "5511981264344",
  displayWhatsApp: "(11) 98126-4344",
  storageKeyBag: "francinez_bag_v3"
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHex(hex) {
  const s = String(hex || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : "#A58E74";
}

function sanitizeImageSrc(src) {
  const s = String(src || "").trim().replace(/^\/+/, "");
  if (/^assets\/(products|uploads)\/[a-zA-Z0-9._-]{1,100}\.(png|jpg|jpeg|webp)$/i.test(s)) {
    return s;
  }
  return "assets/products/nb-9060-castor.png";
}

const DEFAULT_PRODUCTS = [
  {
    id: "nb-9060",
    name: "Tênis New Balance 9060",
    brand: "New Balance",
    category: "Tênis",
    tier: "Importado · 1ª Linha",
    description: "Modelo robusto em camurça e tela respirável com solado macio e acabamento de primeira linha.",
    pixPrice: 129.99,
    cardPrice: 159.99,
    installments: "em até 3x de R$ 53,33",
    sizes: [34, 35, 36, 37, 38, 39, 40],
    sizeLabel: "34–40",
    colors: [
      {
        name: "Castor / Areia",
        hex: "#A58E74",
        image: "assets/products/nb-9060-castor.png",
        sizes: [34, 35, 36, 37, 38, 39, 40]
      },
      {
        name: "Branco / Prata / Creme",
        hex: "#EAE6DF",
        image: "assets/products/nb-9060-branco.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Branco / Detalhe Preto",
        hex: "#D5D1C8",
        image: "assets/products/nb-9060-branco.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Preto / Branco",
        hex: "#232220",
        image: "assets/products/nb-9060-castor.png",
        sizes: [34, 35, 36, 37, 38, 39, 40]
      }
    ]
  },
  {
    id: "miumiu-camurca",
    name: "Tênis Miu Miu Camurça Cadarço Duplo",
    brand: "Miu Miu",
    category: "Tênis",
    tier: "Importado · 1ª Linha",
    description: "Acabamento em camurça macia, cadarço duplo bicolor e solado baixo em borracha natural.",
    pixPrice: 109.99,
    cardPrice: 139.99,
    installments: "em até 3x de R$ 46,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Caramelo / Creme",
        hex: "#8F5E3B",
        image: "assets/products/miumiu-camurca.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Areia / Nude",
        hex: "#CBB79F",
        image: "assets/products/miumiu-camurca.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Marrom Café",
        hex: "#4B3628",
        image: "assets/products/miumiu-camurca.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "oakley-stratus",
    name: "Tênis Oakley Stratus",
    brand: "Oakley",
    category: "Tênis",
    tier: "Importado · 1ª Linha",
    description: "Modelo masculino e feminino com estrutura reforçada, detalhes em relevo e solado tratorado.",
    pixPrice: 129.99,
    cardPrice: 159.99,
    installments: "em até 3x de R$ 53,33",
    sizes: [38, 39, 40, 41, 42, 43],
    sizeLabel: "38–43",
    colors: [
      {
        name: "Cinza / Grafite",
        hex: "#8A8D8F",
        image: "assets/products/oakley-stratus.png",
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        name: "Areia / Bege",
        hex: "#C8B99E",
        image: "assets/products/oakley-stratus.png",
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        name: "Branco / Gelo",
        hex: "#E8E6E1",
        image: "assets/products/oakley-stratus.png",
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ]
  },
  {
    id: "nb-983-musgo",
    name: "Tênis New Balance 983",
    brand: "New Balance",
    category: "Tênis",
    tier: "Importado · 1ª Linha",
    description: "Combinação em camurça e tecido respirável com solado bicolor macio para o dia a dia.",
    pixPrice: 119.99,
    cardPrice: 139.99,
    installments: "em até 3x de R$ 46,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Verde Oliva / Off-White",
        hex: "#616A52",
        image: "assets/products/nb-983-musgo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Preto / Caramelo",
        hex: "#272523",
        image: "assets/products/nb-983-musgo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Bege / Caramelo",
        hex: "#C6B094",
        image: "assets/products/nb-983-musgo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Branco / Rosa Suave",
        hex: "#E8D5D2",
        image: "assets/products/nb-983-musgo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "nb-530",
    name: "Tênis New Balance 530",
    brand: "New Balance",
    category: "Tênis",
    tier: "Importado · 1ª Linha",
    description: "Visual retrô esportivo muito leve e arejado, ótimo para caminhada, academia e uso diário.",
    pixPrice: 139.99,
    cardPrice: 159.99,
    installments: "em até 3x de R$ 53,33",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Marrom Café / Bege",
        hex: "#6B4C35",
        image: "assets/products/nb-530-marrom.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Off-White / Caramelo",
        hex: "#DFD5C6",
        image: "assets/products/nb-530-marrom.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Branco / Prata / Preto",
        hex: "#E6E6E4",
        image: "assets/products/nb-530-marrom.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "nike-sb-plataforma",
    name: "Tênis Nike SB Plataforma Camurça",
    brand: "Nike",
    category: "Plataforma",
    tier: "Importado · 1ª Linha",
    description: "Solado plataforma reto com costura aparente, cabedal em camurça e cadarço largo.",
    pixPrice: 149.99,
    cardPrice: 169.99,
    installments: "em até 3x de R$ 56,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Camurça Caramelo / Branco",
        hex: "#9E6B43",
        image: "assets/products/nike-sb-plataforma.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Rosé / Branco",
        hex: "#D9B3B0",
        image: "assets/products/nike-sb-plataforma.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Off-White / Cinza",
        hex: "#DDD9D0",
        image: "assets/products/nike-sb-plataforma.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Preto / Branco",
        hex: "#1E1D1C",
        image: "assets/products/nike-sb-plataforma.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "nike-dunk",
    name: "Tênis Nike Dunk Low",
    brand: "Nike",
    category: "Tênis",
    tier: "2ª Linha",
    description: "Clássico casual de cano baixo com ótimo custo-benefício para o dia a dia.",
    pixPrice: 79.99,
    cardPrice: 99.99,
    installments: "em até 3x de R$ 33,33",
    sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42],
    sizeLabel: "34–42",
    colors: [
      {
        name: "Areia / Branco",
        hex: "#C5B49D",
        image: "assets/products/nike-dunk-bege.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Rosa Suave / Branco",
        hex: "#DFB9B7",
        image: "assets/products/nike-dunk-bege.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Marrom / Branco",
        hex: "#634837",
        image: "assets/products/nike-dunk-bege.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Cinza / Branco",
        hex: "#9B9A96",
        image: "assets/products/nike-dunk-bege.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Preto / Branco",
        hex: "#21201E",
        image: "assets/products/nike-dunk-bege.png",
        sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42]
      }
    ]
  },
  {
    id: "puma-palermo",
    name: "Tênis Puma Palermo Camurça",
    brand: "Puma",
    category: "Tênis",
    tier: "1ª Linha",
    description: "Modelo em camurça macia com faixa lateral contrastante e solado confortável.",
    pixPrice: 99.99,
    cardPrice: null,
    installments: "Consultar taxa da maquininha",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Marrom Café / Branco",
        hex: "#4E3A2F",
        image: "assets/products/puma-palermo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Bege / Rosé Suave",
        hex: "#D5B8AC",
        image: "assets/products/puma-palermo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Branco / Gelo",
        hex: "#EAE7E1",
        image: "assets/products/puma-palermo.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "miumiu-slide",
    name: "Chinelo Slide Miu Miu Crochê",
    brand: "Miu Miu",
    category: "Slides & Sandálias",
    tier: "Importado · 1ª Linha",
    description: "Tira larga em trama natural tipo ráfia/crochê com palmilha anatômica macia.",
    pixPrice: 149.99,
    cardPrice: 169.99,
    installments: "até 3x de R$ 56,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Preto / Palha Natural",
        hex: "#23201E",
        image: "assets/products/miumiu-slide.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Caramelo / Palha Natural",
        hex: "#9C6B49",
        image: "assets/products/miumiu-slide.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Off-White / Palha Natural",
        hex: "#EAE3D5",
        image: "assets/products/miumiu-slide.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "lv-sandalia",
    name: "Sandália Louis Vuitton Monogram",
    brand: "Grifes & Slides",
    category: "Slides & Sandálias",
    tier: "Importado · 1ª Linha",
    description: "Rasteira anatômica com tira estampada e detalhe dourado no dedo.",
    pixPrice: 149.99,
    cardPrice: 169.99,
    installments: "até 3x de R$ 56,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Marrom Monograma / Gold",
        hex: "#5A3D2B",
        image: "assets/products/lv-sandalia.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "gucci-slide",
    name: "Chinelo Slide Gucci Anel Gold",
    brand: "Grifes & Slides",
    category: "Slides & Sandálias",
    tier: "Importado · 1ª Linha",
    description: "Tiras transpassadas em preto com aplicação dourada e solado anatômico confortável.",
    pixPrice: 149.99,
    cardPrice: 169.99,
    installments: "até 3x de R$ 56,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Preto / Ferragem Dourada",
        hex: "#1C1B1A",
        image: "assets/products/gucci-slide.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "adidas-bonega",
    name: "Tênis Adidas Bonega Plataforma",
    brand: "Adidas",
    category: "Plataforma",
    tier: "1ª Linha",
    description: "Cabedal em tom neutro com detalhe dourado no cadarço e solado plataforma macio.",
    pixPrice: 149.99,
    cardPrice: null,
    installments: "Consultar taxa da maquininha",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Off-White / Detalhe Dourado",
        hex: "#EFECE4",
        image: "assets/products/adidas-bonega.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Camurça Castor / Creme",
        hex: "#9D8468",
        image: "assets/products/adidas-bonega.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "vans-hylane",
    name: "Tênis Vans Hylane Solado Gum",
    brand: "Vans",
    category: "Tênis",
    tier: "1ª Linha",
    description: "Lingueta acolchoada, faixa lateral em relevo e solado com biqueira em borracha natural.",
    pixPrice: 149.99,
    cardPrice: null,
    installments: "Consultar taxa da maquininha",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Preto / Branco / Gum",
        hex: "#211F1D",
        image: "assets/products/vans-hylane.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Azul Marinho / Preto",
        hex: "#324354",
        image: "assets/products/vans-hylane.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "vans-knu-skool",
    name: "Tênis Vans Knu Skool",
    brand: "Vans",
    category: "Tênis",
    tier: "Importado · 1ª Linha",
    description: "Versão em camurça preta com cadarço largo branco e acolchoamento extra no colarinho.",
    pixPrice: 179.99,
    cardPrice: 199.99,
    installments: "em até 3x de R$ 66,66",
    sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    sizeLabel: "34–43",
    colors: [
      {
        name: "Preto / Branco",
        hex: "#1B1A19",
        image: "assets/products/vans-knu-skool.png",
        sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]
      }
    ]
  },
  {
    id: "puma-suede",
    name: "Tênis Puma Suede Clássico",
    brand: "Puma",
    category: "Tênis",
    tier: "2ª Linha",
    description: "Camurça macia com cadarço largo e solado baixo costurado para uso diário.",
    pixPrice: 84.99,
    cardPrice: null,
    installments: "Consultar taxa da maquininha",
    sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43],
    sizeLabel: "34–43",
    colors: [
      {
        name: "Preto / Branco",
        hex: "#1E1D1C",
        image: "assets/products/puma-suede.png",
        sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]
      },
      {
        name: "Azul Marinho / Branco",
        hex: "#28364A",
        image: "assets/products/puma-suede.png",
        sizes: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43]
      }
    ]
  },
  {
    id: "nike-af1",
    name: "Tênis Nike Air Force 1 (AF1)",
    brand: "Nike",
    category: "Tênis",
    tier: "2ª Linha",
    description: "Clássico branco total com costura reforçada no solado, placa no cadarço e biqueira perfurada.",
    pixPrice: 79.99,
    cardPrice: 99.99,
    installments: "até 3x de R$ 33,33",
    sizes: [38, 39, 40, 41, 42, 43],
    sizeLabel: "38–43",
    colors: [
      {
        name: "Branco Total",
        hex: "#F7F6F2",
        image: "assets/products/nike-af1-branco.png",
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ]
  },
  {
    id: "nike-borough",
    name: "Tênis Nike SB Court Borough",
    brand: "Nike",
    category: "Tênis",
    tier: "1ª Linha",
    description: "Acabamento de primeira linha com material estruturado, colarinho macio e solado costurado.",
    pixPrice: 149.99,
    cardPrice: 169.99,
    installments: "até 3x de R$ 56,66",
    sizes: [38, 39, 40, 41, 42, 43],
    sizeLabel: "38–43",
    colors: [
      {
        name: "Preto / Swoosh Branco",
        hex: "#1F1E1D",
        image: "assets/products/nike-borough-preto.png",
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        name: "Branco Total",
        hex: "#F4F2ED",
        image: "assets/products/nike-af1-branco.png",
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ]
  },
  {
    id: "nb-comfort",
    name: "Tênis New Balance Comfort Plataforma",
    brand: "New Balance",
    category: "Plataforma",
    tier: "1ª Linha",
    description: "Solado elevado leve com cabedal macio para conforto ao longo do dia.",
    pixPrice: 119.99,
    cardPrice: 169.99,
    installments: "3x de R$ 56,66",
    sizes: [34, 35, 36, 37, 38, 39],
    sizeLabel: "34–39",
    colors: [
      {
        name: "Preto / Solado Branco",
        hex: "#21201E",
        image: "assets/products/nb-comfort-preto.png",
        sizes: [34, 35, 36, 37, 38, 39]
      },
      {
        name: "Branco / Detalhe Preto",
        hex: "#ECE9E2",
        image: "assets/products/nb-comfort-preto.png",
        sizes: [34, 35, 36, 37, 38, 39]
      }
    ]
  },
  {
    id: "puma-ferrari",
    name: "Tênis Puma 180 Scuderia Ferrari",
    brand: "Puma",
    category: "Tênis",
    tier: "1ª Linha",
    description: "Cabedal acolchoado em camurça e sintético com recortes esportivos em vermelho.",
    pixPrice: 129.99,
    cardPrice: 159.99,
    installments: "até 3x de R$ 53,33",
    sizes: [34, 35, 36, 37, 38],
    sizeLabel: "34–38",
    colors: [
      {
        name: "Branco / Vermelho",
        hex: "#9E2A2B",
        image: "assets/products/puma-ferrari.png",
        sizes: [34, 35, 36, 37, 38]
      },
      {
        name: "Preto / Vermelho",
        hex: "#262222",
        image: "assets/products/puma-ferrari.png",
        sizes: [34, 35, 36, 37, 38]
      }
    ]
  },
  {
    id: "puma-bmw",
    name: "Tênis Puma BMW Motorsport",
    brand: "Puma",
    category: "Tênis",
    tier: "1ª Linha",
    description: "Modelo casual masculino em preto fosco com solado branco e emblema clássico.",
    pixPrice: 129.99,
    cardPrice: null,
    installments: "Consultar taxa da maquininha",
    sizes: [38, 39, 40, 41, 42, 43],
    sizeLabel: "38–43",
    colors: [
      {
        name: "Preto / Branco",
        hex: "#1C1B1A",
        image: "assets/products/puma-bmw.png",
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ]
  },
  {
    id: "fila-rt",
    name: "Tênis Fila RT",
    brand: "Fila",
    category: "Tênis",
    tier: "1ª Linha",
    description: "Design esportivo em camurça grafite e tela respirável com solado firme e confortável.",
    pixPrice: 149.99,
    cardPrice: null,
    installments: "Consultar taxa da maquininha",
    sizes: [38, 39, 40, 41, 42, 43],
    sizeLabel: "38–43",
    colors: [
      {
        name: "Preto / Grafite / Branco",
        hex: "#363839",
        image: "assets/products/fila-rt.png",
        sizes: [38, 39, 40, 41, 42, 43]
      },
      {
        name: "Branco / Preto / Vermelho",
        hex: "#E6E3DC",
        image: "assets/products/fila-rt.png",
        sizes: [38, 39, 40, 41, 42, 43]
      }
    ]
  }
];

let PRODUCTS = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));

function applyPublicCatalog(productsList, phone) {
  if (Array.isArray(productsList) && productsList.length > 0) {
    PRODUCTS = productsList.filter((p) => p && !p.hidden);
  }
  if (phone) {
    const cleaned = String(phone).replace(/\D/g, "");
    if (cleaned.length >= 10 && cleaned.length <= 15) {
      state.whatsAppPhone = cleaned;
    }
  }
  PRODUCTS.forEach((product) => {
    if (!state.cardSelections[product.id]) {
      state.cardSelections[product.id] = {
        colorIndex: 0,
        size: (product.sizes && product.sizes[0]) || 36
      };
    }
  });
}

const state = {
  selectedSizeFilter: "all",
  selectedBrandFilter: "all",
  searchQuery: "",
  visibleCount: 5,
  showAllProducts: false,
  mobileCols: 2,
  cardSelections: {},
  bag: [],
  paymentMethod: "pix",
  deliveryMethod: "entrega",
  customerName: "",
  customerAddress: "",
  whatsAppPhone: STORE_CONFIG.defaultWhatsApp
};

function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getProductUrl(productId, colorIndex) {
  const cIdx = typeof colorIndex === "number" ? `&cor=${Number(colorIndex)}` : "";
  return `produto.html?id=${encodeURIComponent(productId)}${cIdx}#${encodeURIComponent(productId)}`;
}

function updatePhoneStatusUI() {
  const targetStatus = document.getElementById("wa-target-status");
  const cleanPhone = (state.whatsAppPhone || "").replace(/\D/g, "");

  if (targetStatus) {
    if (cleanPhone.length >= 10) {
      targetStatus.textContent = `WhatsApp da loja: +${cleanPhone}`;
    } else {
      targetStatus.textContent = "Confira seus pares e envie no WhatsApp";
    }
  }
}

function sanitizeStoredBag(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .slice(0, 40)
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      key: String(item.key || "").slice(0, 140),
      productId: String(item.productId || "").slice(0, 80),
      name: String(item.name || "Calçado").slice(0, 100),
      tier: String(item.tier || "1ª Linha").slice(0, 40),
      colorName: String(item.colorName || "Padrão").slice(0, 60),
      image: sanitizeImageSrc(item.image),
      size: Number.isInteger(Number(item.size)) ? Number(item.size) : 36,
      pixPrice: Math.max(0, Number(item.pixPrice) || 0),
      cardPrice:
        item.cardPrice !== null && item.cardPrice !== undefined && Number(item.cardPrice) > 0
          ? Number(item.cardPrice)
          : null,
      qty: Math.min(20, Math.max(1, parseInt(item.qty, 10) || 1))
    }));
}

function initState() {
  PRODUCTS.forEach((product) => {
    state.cardSelections[product.id] = {
      colorIndex: 0,
      size: product.sizes[0]
    };
  });

  try {
    const savedBag = localStorage.getItem(STORE_CONFIG.storageKeyBag);
    if (savedBag) {
      state.bag = sanitizeStoredBag(JSON.parse(savedBag));
    }
  } catch (e) {
    state.bag = [];
  }
}

async function fetchPublicCatalog() {
  if (!/^https?:$/i.test(window.location.protocol)) return;
  try {
    const resp = await fetch("/api/products", {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" }
    });
    if (!resp.ok) return;
    const data = await resp.json();
    if (data && Array.isArray(data.products)) {
      applyPublicCatalog(data.products, data.whatsAppPhone);
      updatePhoneStatusUI();
      renderSizeRail();
      renderCatalog();
      renderProductPage();
      updateBagUI();
    }
  } catch (_) {
    // Offline fallback uses embedded read-only DEFAULT_PRODUCTS
  }
}

function saveBag() {
  try {
    localStorage.setItem(STORE_CONFIG.storageKeyBag, JSON.stringify(state.bag));
  } catch (e) {
    // Storage unavailable
  }
}

function getFilteredProducts() {
  return PRODUCTS.filter((product) => {
    if (state.selectedSizeFilter !== "all") {
      const sizeNum = Number(state.selectedSizeFilter);
      if (!product.sizes.includes(sizeNum)) {
        return false;
      }
    }

    if (state.selectedBrandFilter !== "all") {
      if (state.selectedBrandFilter === "Slides & Sandálias") {
        if (product.category !== "Slides & Sandálias") return false;
      } else if (state.selectedBrandFilter === "Plataforma") {
        if (product.category !== "Plataforma") return false;
      } else if (state.selectedBrandFilter === "Importado · 1ª Linha") {
        if (product.tier !== "Importado · 1ª Linha") return false;
      } else if (state.selectedBrandFilter === "1ª Linha") {
        if (!product.tier.includes("1ª Linha")) return false;
      } else if (state.selectedBrandFilter === "2ª Linha") {
        if (product.tier !== "2ª Linha") return false;
      } else if (product.brand !== state.selectedBrandFilter) {
        return false;
      }
    }

    if (state.searchQuery.trim() !== "") {
      const q = state.searchQuery.toLowerCase().trim();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchTier = product.tier.toLowerCase().includes(q);
      const matchColor = product.colors.some((c) => c.name.toLowerCase().includes(q));
      if (!matchName && !matchBrand && !matchTier && !matchColor) {
        return false;
      }
    }

    return true;
  });
}

function renderSizeRail() {
  const sizeRail = document.getElementById("size-rail");
  if (!sizeRail) return;

  const uniqueSizes = Array.from(
    new Set(
      PRODUCTS.flatMap((p) => [
        ...(p.sizes || []),
        ...(p.colors ? p.colors.flatMap((c) => c.sizes || []) : [])
      ])
    )
  ).sort((a, b) => a - b);

  const pillsHtml = [
    `<button type="button" class="size-pill size-pill-all" data-size-filter="all" aria-pressed="${
      state.selectedSizeFilter === "all" ? "true" : "false"
    }">Todos</button>`,
    ...uniqueSizes.map(
      (sz) =>
        `<button type="button" class="size-pill" data-size-filter="${escapeHtml(sz)}" aria-pressed="${
          String(state.selectedSizeFilter) === String(sz) ? "true" : "false"
        }">${escapeHtml(sz)}</button>`
    ),
    `<button type="button" class="size-pill size-pill-consult" data-action="consult-custom-size">Outro nº? Chamar</button>`
  ].join("");

  sizeRail.innerHTML = pillsHtml;
}

function updateToolbarHeader(totalCount, shownCount) {
  const headingEl = document.getElementById("active-filter-heading");
  const counterEl = document.getElementById("results-counter");
  const clearBtn = document.getElementById("clear-inline-filters");
  if (!headingEl || !counterEl) return;

  const parts = [];
  if (state.selectedBrandFilter !== "all") {
    parts.push(state.selectedBrandFilter);
  } else {
    parts.push("Calçados Pronta Entrega");
  }
  if (state.selectedSizeFilter !== "all") {
    parts.push(`Tam. ${state.selectedSizeFilter}`);
  }

  headingEl.textContent = parts.join(" · ");
  if (shownCount < totalCount) {
    counterEl.textContent = `Mostrando ${shownCount} de ${totalCount} modelos`;
  } else {
    counterEl.textContent = `${totalCount} ${totalCount === 1 ? "modelo" : "modelos"}`;
  }

  if (clearBtn) {
    const hasFilter =
      state.selectedSizeFilter !== "all" ||
      state.selectedBrandFilter !== "all" ||
      state.searchQuery.trim() !== "";
    clearBtn.hidden = !hasFilter;
  }
}

function buildProductCardHtml(product) {
  const sel = state.cardSelections[product.id] || {
    colorIndex: 0,
    size: product.sizes[0]
  };

  if (state.selectedSizeFilter !== "all") {
    const filterSizeNum = Number(state.selectedSizeFilter);
    const currentColorObj = product.colors[sel.colorIndex] || product.colors[0];
    const currentColorSizes = currentColorObj.sizes || product.sizes;
    if (!currentColorSizes.includes(filterSizeNum)) {
      const validColorIdx = product.colors.findIndex((c) =>
        (c.sizes || product.sizes).includes(filterSizeNum)
      );
      if (validColorIdx >= 0) {
        sel.colorIndex = validColorIdx;
      }
    }
    sel.size = filterSizeNum;
  }

  const activeColor = product.colors[sel.colorIndex] || product.colors[0];
  const availableSizes = activeColor.sizes || product.sizes;
  const activeSize = availableSizes.includes(sel.size) ? sel.size : availableSizes[0];
  state.cardSelections[product.id] = {
    colorIndex: sel.colorIndex,
    size: activeSize
  };

  const productHref = getProductUrl(product.id, sel.colorIndex);

  const swatchesHtml = product.colors
    .map(
      (color, idx) => `
      <button
        type="button"
        class="color-swatch-btn"
        role="radio"
        aria-checked="${idx === sel.colorIndex ? "true" : "false"}"
        aria-label="Cor ${escapeHtml(color.name)}"
        title="${escapeHtml(color.name)}"
        data-action="select-color"
        data-product-id="${escapeHtml(product.id)}"
        data-color-index="${idx}"
      >
        <svg class="swatch-svg" viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" fill="${sanitizeHex(color.hex)}"/></svg>
      </button>
    `
    )
    .join("");

  const cardSubPriceHtml =
    product.cardPrice !== null
      ? `ou ${escapeHtml(formatBRL(product.cardPrice))} em até 3x`
      : `Cartão: consultar taxa`;

  return `
    <article class="product-card" data-product-card="${escapeHtml(product.id)}">
      <a href="${escapeHtml(productHref)}" class="studio-plinth" aria-label="Ver página do ${escapeHtml(product.name)}">
        <div class="plinth-top-bar">
          <span class="badge-tier">${escapeHtml(product.tier)}</span>
        </div>
        <img
          src="${escapeHtml(sanitizeImageSrc(activeColor.image))}"
          alt="${escapeHtml(product.name)} na cor ${escapeHtml(activeColor.name)}"
          class="studio-img"
          loading="lazy"
        />
      </a>

      <div class="card-body">
        <div class="swatch-row">
          <div class="swatch-dots" role="radiogroup" aria-label="Cores de ${escapeHtml(product.name)}">
            ${swatchesHtml}
          </div>
          <span class="active-color-label">Tam. ${escapeHtml(product.sizeLabel)}</span>
        </div>

        <a href="${escapeHtml(productHref)}" class="card-title-link">
          <h3 class="card-title">${escapeHtml(product.name)}</h3>
        </a>

        <div class="price-block">
          <div class="price-pix-row">
            <span class="price-pix-value">${escapeHtml(formatBRL(product.pixPrice))}</span>
            <span class="pix-tag">no Pix</span>
          </div>
          <div class="price-card-row">${cardSubPriceHtml}</div>
        </div>

        <div class="card-actions">
          <a href="${escapeHtml(productHref)}" class="add-bag-btn card-view-btn">
            <span>VER OPÇÕES & TAMANHOS</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderCatalog() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  const emptyState = document.getElementById("empty-state");
  const loadMoreWrap = document.getElementById("load-more-wrap");
  const toggleMoreBtn = document.getElementById("toggle-more-btn");
  const filtered = getFilteredProducts();

  const hasActiveSearchOrFilter =
    state.selectedSizeFilter !== "all" ||
    state.selectedBrandFilter !== "all" ||
    state.searchQuery.trim() !== "";

  const shouldSlice = !state.showAllProducts && !hasActiveSearchOrFilter;
  const displayed = shouldSlice ? filtered.slice(0, state.visibleCount) : filtered;

  updateToolbarHeader(filtered.length, displayed.length);

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    if (loadMoreWrap) loadMoreWrap.hidden = true;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  grid.innerHTML = displayed.map((product) => buildProductCardHtml(product)).join("");

  if (loadMoreWrap && toggleMoreBtn) {
    if (filtered.length > state.visibleCount && !hasActiveSearchOrFilter) {
      loadMoreWrap.hidden = false;
      const remaining = filtered.length - state.visibleCount;
      toggleMoreBtn.textContent = state.showAllProducts
        ? "MOSTRAR APENAS OS 5 PRINCIPAIS"
        : `VER MAIS CALÇADOS (+${remaining} MODELOS)`;
    } else {
      loadMoreWrap.hidden = true;
    }
  }
}

/* ==========================================================================
   Dedicated Product Page (produto.html — Nike / Netshoes / Centauro Style)
   ========================================================================== */

function getActiveProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const idFromQuery = params.get("id");
  const idFromHash = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
  const targetId = idFromQuery || idFromHash || PRODUCTS[0].id;
  const product = PRODUCTS.find((p) => p.id === targetId) || PRODUCTS[0];

  const corParam = params.get("cor");
  if (corParam !== null && !Number.isNaN(Number(corParam))) {
    const cIdx = Number(corParam);
    if (product.colors[cIdx]) {
      state.cardSelections[product.id].colorIndex = cIdx;
    }
  }
  return product;
}

function renderProductPage() {
  const root = document.getElementById("product-page-root");
  if (!root) return;

  const product = getActiveProductFromUrl();
  document.title = `${product.name} — Francinez Calçados`;

  const sel = state.cardSelections[product.id] || {
    colorIndex: 0,
    size: product.sizes[0]
  };
  const activeColor = product.colors[sel.colorIndex] || product.colors[0];
  const availableSizes = activeColor.sizes || product.sizes;
  const activeSize = availableSizes.includes(sel.size) ? sel.size : availableSizes[0];
  state.cardSelections[product.id] = {
    colorIndex: sel.colorIndex,
    size: activeSize
  };

  const colorThumbsHtml = product.colors
    .map(
      (color, idx) => `
      <button
        type="button"
        class="pdp-color-option"
        role="radio"
        aria-checked="${idx === sel.colorIndex ? "true" : "false"}"
        data-pdp-action="select-color"
        data-product-id="${escapeHtml(product.id)}"
        data-color-index="${idx}"
      >
        <svg class="swatch-svg" viewBox="0 0 16 16" aria-hidden="true"><rect width="16" height="16" fill="${sanitizeHex(color.hex)}"/></svg>
        <span>${escapeHtml(color.name)}</span>
      </button>
    `
    )
    .join("");

  const sizeButtonsHtml = availableSizes
    .map(
      (sz) => `
      <button
        type="button"
        class="pdp-size-btn"
        role="radio"
        aria-checked="${sz === activeSize ? "true" : "false"}"
        data-pdp-action="select-size"
        data-product-id="${escapeHtml(product.id)}"
        data-size="${escapeHtml(sz)}"
      >
        ${escapeHtml(sz)}
      </button>
    `
    )
    .join("");

  const cardPriceText =
    product.cardPrice !== null ? formatBRL(product.cardPrice) : "Consultar taxa";

  root.innerHTML = `
    <div class="pdp-breadcrumb-bar">
      <div class="pdp-breadcrumb-inner">
        <a href="index.html#colecao" class="pdp-back-link">← Voltar para o catálogo</a>
        <div class="pdp-breadcrumbs" aria-label="Navegação estrutural">
          <a href="index.html">Início</a>
          <span>/</span>
          <a href="index.html#colecao">${escapeHtml(product.category)}</a>
          <span>/</span>
          <strong>${escapeHtml(product.name)}</strong>
        </div>
      </div>
    </div>

    <div class="pdp-container">
      <div class="pdp-grid">
        <!-- Left Column: High-Res Studio Gallery -->
        <div class="pdp-gallery">
          <div class="pdp-main-plinth">
            <div class="plinth-top-bar">
              <span class="badge-tier">${escapeHtml(product.tier)}</span>
            </div>
            <img
              src="${escapeHtml(sanitizeImageSrc(activeColor.image))}"
              alt="${escapeHtml(product.name)} na cor ${escapeHtml(activeColor.name)}"
              class="pdp-main-img"
              id="pdp-main-img"
            />
          </div>

          <div class="pdp-gallery-note">
            <span>Foto padronizada do modelo · Cor selecionada: <strong>${escapeHtml(activeColor.name)}</strong></span>
          </div>
        </div>

        <!-- Right Column: Nike / Netshoes / Centauro Buy Box -->
        <div class="pdp-info">
          <div class="pdp-header-block">
            <div class="pdp-meta-line">${escapeHtml(product.brand)} · ${escapeHtml(product.tier)} · Pronta Entrega</div>
            <h1 class="pdp-title">${escapeHtml(product.name)}</h1>
            <p class="pdp-desc">${escapeHtml(product.description)}</p>
          </div>

          <div class="pdp-price-panel">
            <div class="pdp-price-col">
              <span class="pdp-price-label">VALOR À VISTA NO PIX</span>
              <div class="pdp-price-main tabular">${escapeHtml(formatBRL(product.pixPrice))}</div>
              <span class="pdp-price-sub">Desconto aplicado no Pix</span>
            </div>
            <div class="pdp-price-col pdp-price-col-card">
              <span class="pdp-price-label">NO CARTÃO</span>
              <div class="pdp-price-card tabular">${escapeHtml(cardPriceText)}</div>
              <span class="pdp-price-sub">${escapeHtml(product.installments)}</span>
            </div>
          </div>

          <div class="pdp-selector-section">
            <div class="pdp-selector-header">
              <span>ESCOLHA A COR</span>
              <strong>${escapeHtml(activeColor.name)}</strong>
            </div>
            <div class="pdp-color-list" role="radiogroup" aria-label="Cores disponíveis">
              ${colorThumbsHtml}
            </div>
          </div>

          <div class="pdp-selector-section">
            <div class="pdp-selector-header">
              <span>ESCOLHA A NUMERAÇÃO</span>
              <strong>Tamanho ${escapeHtml(activeSize)}</strong>
            </div>
            <div class="pdp-sizes-grid" role="radiogroup" aria-label="Numerações disponíveis">
              ${sizeButtonsHtml}
            </div>
            <button
              type="button"
              class="pdp-consult-size-link"
              data-pdp-action="consult-size"
              data-product-id="${escapeHtml(product.id)}"
            >
              Não encontrou sua numeração? Consultar no WhatsApp
            </button>
          </div>

          <div class="pdp-actions">
            <button
              type="button"
              class="pdp-btn-bag"
              data-pdp-action="add-to-bag"
              data-product-id="${escapeHtml(product.id)}"
            >
              ADICIONAR À SACOLA (TAM. ${escapeHtml(activeSize)})
            </button>
            <button
              type="button"
              class="pdp-btn-wa"
              data-pdp-action="buy-whatsapp"
              data-product-id="${escapeHtml(product.id)}"
            >
              COMPRAR AGORA PELO WHATSAPP
            </button>
          </div>

          <div class="pdp-specs-box">
            <h2 class="pdp-specs-title">INFORMAÇÕES DO CALÇADO</h2>
            <ul class="pdp-specs-list">
              <li><strong>Classificação:</strong> ${escapeHtml(product.tier)}</li>
              <li><strong>Marca / Modelo:</strong> ${escapeHtml(product.brand)} — ${escapeHtml(product.name)}</li>
              <li><strong>Grade de numeração:</strong> ${escapeHtml(product.sizeLabel)}</li>
              <li><strong>Formas de pagamento:</strong> Pix à vista com desconto ou Cartão</li>
              <li><strong>Entrega:</strong> Pronta entrega — receba em casa ou combine retirada pelo WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  renderRelatedProducts(product.id);
}

function renderRelatedProducts(currentProductId) {
  const relatedGrid = document.getElementById("related-products-grid");
  if (!relatedGrid) return;

  const others = PRODUCTS.filter((p) => p.id !== currentProductId).slice(0, 5);
  relatedGrid.innerHTML = others.map((p) => buildProductCardHtml(p)).join("");
}

function addToBag(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  const sel = state.cardSelections[productId] || { colorIndex: 0, size: product.sizes[0] };
  const colorObj = product.colors[sel.colorIndex] || product.colors[0];
  const size = sel.size;

  const key = `${product.id}__${colorObj.name}__${size}`;
  const existing = state.bag.find((item) => item.key === key);

  if (existing) {
    existing.qty += 1;
  } else {
    state.bag.push({
      key,
      productId: product.id,
      name: product.name,
      tier: product.tier,
      colorName: colorObj.name,
      image: colorObj.image,
      size,
      pixPrice: product.pixPrice,
      cardPrice: product.cardPrice,
      qty: 1
    });
  }

  saveBag();
  updateBagUI();
}

function updateItemQty(key, delta) {
  const idx = state.bag.findIndex((item) => item.key === key);
  if (idx === -1) return;

  state.bag[idx].qty += delta;
  if (state.bag[idx].qty <= 0) {
    state.bag.splice(idx, 1);
  }
  saveBag();
  updateBagUI();
}

function removeItem(key) {
  state.bag = state.bag.filter((item) => item.key !== key);
  saveBag();
  updateBagUI();
}

function getBagTotals() {
  let totalItems = 0;
  let totalPix = 0;
  let totalCard = 0;
  let hasConsultCard = false;

  state.bag.forEach((item) => {
    totalItems += item.qty;
    totalPix += item.pixPrice * item.qty;
    if (item.cardPrice !== null && item.cardPrice !== undefined) {
      totalCard += item.cardPrice * item.qty;
    } else {
      totalCard += item.pixPrice * item.qty;
      hasConsultCard = true;
    }
  });

  return { totalItems, totalPix, totalCard, hasConsultCard };
}

function buildWhatsAppMessage(items, isQuickSingle = false) {
  const lines = [];
  lines.push("Olá, Francinez Calçados! Gostaria de fazer o seguinte pedido pelo catálogo:");
  lines.push("");

  let sumPix = 0;
  let sumCard = 0;
  let hasConsultCard = false;

  items.forEach((item, idx) => {
    const subPix = item.pixPrice * item.qty;
    const hasCard = item.cardPrice !== null && item.cardPrice !== undefined;
    const subCard = (hasCard ? item.cardPrice : item.pixPrice) * item.qty;
    if (!hasCard) hasConsultCard = true;

    sumPix += subPix;
    sumCard += subCard;

    lines.push(`${idx + 1}. ${item.name} (${item.qty}x)`);
    lines.push(`   Cor: ${item.colorName} | Numeração: ${item.size}`);
    if (hasCard) {
      lines.push(`   Valor: ${formatBRL(subPix)} no Pix (ou ${formatBRL(subCard)} no Cartão)`);
    } else {
      lines.push(`   Valor: ${formatBRL(subPix)} no Pix (Cartão: consultar taxa da maquininha)`);
    }
    lines.push("");
  });

  if (!isQuickSingle) {
    const payLabel =
      state.paymentMethod === "pix"
        ? "Pix (com desconto à vista)"
        : "Cartão de Crédito (parcelado)";
    const activeTotal =
      state.paymentMethod === "pix"
        ? formatBRL(sumPix)
        : hasConsultCard
        ? `${formatBRL(sumCard)} + taxa da maquininha`
        : formatBRL(sumCard);
    const deliveryLabel =
      state.deliveryMethod === "entrega"
        ? "Receber em casa (Entrega)"
        : "Combinar retirada pelo WhatsApp";

    lines.push(`Forma de pagamento escolhida: ${payLabel}`);
    lines.push(`Total do pedido: ${activeTotal}`);
    lines.push(`Modalidade: ${deliveryLabel}`);

    if (state.customerName.trim()) {
      lines.push(`Cliente: ${state.customerName.trim()}`);
    }
    if (state.deliveryMethod === "entrega" && state.customerAddress.trim()) {
      lines.push(`Endereço / Bairro: ${state.customerAddress.trim()}`);
    }
  } else {
    const cardSummary = hasConsultCard
      ? `${formatBRL(sumCard)} + taxa da maquininha`
      : formatBRL(sumCard);
    lines.push(`Total no Pix: ${formatBRL(sumPix)} | No Cartão: ${cardSummary}`);
  }

  lines.push("");
  lines.push("Pode confirmar se tem disponível?");
  return lines.join("\n");
}

function updateBagUI() {
  const { totalItems, totalPix, totalCard, hasConsultCard } = getBagTotals();

  const headerBadge = document.getElementById("header-bag-count");
  const drawerItemsCount = document.getElementById("drawer-items-count");
  const floatingBar = document.getElementById("floating-bag-bar");
  const floatingCount = document.getElementById("floating-bag-count");
  const floatingTotal = document.getElementById("floating-bag-total");
  const floatingSummary = document.getElementById("floating-bag-summary");
  const bagItemsContainer = document.getElementById("bag-items-list");
  const bagEmptyNotice = document.getElementById("bag-empty-notice");
  const previewBox = document.getElementById("wa-message-preview");
  const totalMainEl = document.getElementById("drawer-total-main");
  const totalAltEl = document.getElementById("drawer-total-alt");
  const checkoutBtn = document.getElementById("checkout-wa-btn");

  if (headerBadge) headerBadge.textContent = String(totalItems);
  if (drawerItemsCount) {
    drawerItemsCount.textContent = `${totalItems} ${totalItems === 1 ? "par" : "pares"}`;
  }

  if (floatingBar) {
    if (totalItems > 0) {
      floatingBar.classList.add("visible");
      const currentTotal = state.paymentMethod === "pix" ? totalPix : totalCard;
      floatingCount.textContent = String(totalItems);
      floatingTotal.textContent = `${formatBRL(currentTotal)} (${state.paymentMethod === "pix" ? "Pix" : "Cartão"})`;
      floatingSummary.textContent = `${totalItems} ${totalItems === 1 ? "par na sacola" : "pares na sacola"} · Toque para finalizar`;
    } else {
      floatingBar.classList.remove("visible");
    }
  }

  if (!bagItemsContainer) return;

  if (state.bag.length === 0) {
    bagItemsContainer.innerHTML = "";
    bagEmptyNotice.hidden = false;
    previewBox.textContent = "Adicione um calçado à sacola para ver a mensagem pronta do WhatsApp.";
    totalMainEl.textContent = "R$ 0,00";
    totalAltEl.textContent = "Selecione seus pares no catálogo";
    checkoutBtn.disabled = true;
    return;
  }

  bagEmptyNotice.hidden = true;
  checkoutBtn.disabled = false;

  bagItemsContainer.innerHTML = state.bag
    .map((item) => {
      const hasCard = item.cardPrice !== null && item.cardPrice !== undefined;
      const itemPriceLabel =
        state.paymentMethod === "pix"
          ? `${formatBRL(item.pixPrice * item.qty)} no Pix`
          : hasCard
          ? `${formatBRL(item.cardPrice * item.qty)} no Cartão`
          : `${formatBRL(item.pixPrice * item.qty)} + taxa`;

      return `
        <li class="bag-item">
          <img
            src="${escapeHtml(sanitizeImageSrc(item.image))}"
            alt="${escapeHtml(item.name)}"
            class="bag-item-thumb"
          />
          <div>
            <div class="bag-item-title">${escapeHtml(item.name)}</div>
            <div class="bag-item-meta">${escapeHtml(item.colorName)} · Tam. ${escapeHtml(item.size)}</div>
            <div class="bag-item-price">${escapeHtml(itemPriceLabel)}</div>
          </div>
          <div class="bag-item-controls">
            <div class="qty-stepper" aria-label="Quantidade">
              <button type="button" class="qty-btn" data-action="bag-dec" data-key="${escapeHtml(item.key)}" aria-label="Diminuir quantidade">-</button>
              <span class="qty-value">${escapeHtml(item.qty)}</span>
              <button type="button" class="qty-btn" data-action="bag-inc" data-key="${escapeHtml(item.key)}" aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="remove-item-btn" data-action="bag-remove" data-key="${escapeHtml(item.key)}">Remover</button>
          </div>
        </li>
      `;
    })
    .join("");

  if (state.paymentMethod === "pix") {
    totalMainEl.textContent = `${formatBRL(totalPix)} no Pix`;
    if (hasConsultCard) {
      totalAltEl.textContent = `No Cartão: ${formatBRL(totalCard)} + taxa da maquininha`;
    } else {
      totalAltEl.textContent = `Ou ${formatBRL(totalCard)} em até 3x no Cartão`;
    }
  } else {
    totalMainEl.textContent = hasConsultCard
      ? `${formatBRL(totalCard)} + taxa`
      : `${formatBRL(totalCard)} no Cartão`;
    totalAltEl.textContent = `Ou ${formatBRL(totalPix)} à vista com desconto no Pix`;
  }

  previewBox.textContent = buildWhatsAppMessage(state.bag, false);
}

function openBagDrawer() {
  const drawer = document.getElementById("bag-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  if (!drawer || !backdrop) return;
  document.body.classList.add("drawer-open");
  drawer.classList.add("open");
  backdrop.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeBagDrawer() {
  const drawer = document.getElementById("bag-drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  if (!drawer || !backdrop) return;
  document.body.classList.remove("drawer-open");
  drawer.classList.remove("open");
  backdrop.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

function sendToWhatsApp(messageText) {
  const cleanPhone = (state.whatsAppPhone || "").replace(/\D/g, "");
  const encoded = encodeURIComponent(messageText);
  const url = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function resetAllFilters() {
  state.selectedSizeFilter = "all";
  state.selectedBrandFilter = "all";
  state.searchQuery = "";
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("search-clear-btn");
  if (searchInput) searchInput.value = "";
  if (clearSearchBtn) clearSearchBtn.hidden = true;

  document.querySelectorAll("#size-rail [data-size-filter]").forEach((el, idx) => {
    el.setAttribute("aria-pressed", idx === 0 ? "true" : "false");
  });
  document.querySelectorAll("#brand-pills [data-brand-filter]").forEach((el, idx) => {
    el.setAttribute("aria-pressed", idx === 0 ? "true" : "false");
  });

  renderCatalog();
}

function setupEventListeners() {
  const consultDefaultMsg =
    "Olá, Francinez Calçados! Vim pelo catálogo do site e gostaria de tirar uma dúvida sobre os modelos disponíveis.";

  const sizeRailEl = document.getElementById("size-rail");
  if (sizeRailEl) {
    sizeRailEl.addEventListener("click", (e) => {
      const consultBtn = e.target.closest('[data-action="consult-custom-size"]');
      if (consultBtn) {
        sendToWhatsApp(consultDefaultMsg);
        return;
      }

      const btn = e.target.closest("[data-size-filter]");
      if (!btn) return;

      const val = btn.getAttribute("data-size-filter");
      state.selectedSizeFilter = val;

      document.querySelectorAll("#size-rail [data-size-filter]").forEach((el) => {
        el.setAttribute("aria-pressed", el === btn ? "true" : "false");
      });

      if (val !== "all") {
        const sizeNum = Number(val);
        PRODUCTS.forEach((p) => {
          if (p.sizes.includes(sizeNum)) {
            const sel = state.cardSelections[p.id];
            const currentColor = p.colors[sel.colorIndex] || p.colors[0];
            if (!(currentColor.sizes || p.sizes).includes(sizeNum)) {
              const validIdx = p.colors.findIndex((c) => (c.sizes || p.sizes).includes(sizeNum));
              if (validIdx >= 0) sel.colorIndex = validIdx;
            }
            sel.size = sizeNum;
          }
        });
      }

      renderCatalog();
    });
  }

  const brandPillsEl = document.getElementById("brand-pills");
  if (brandPillsEl) {
    brandPillsEl.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-brand-filter]");
      if (!btn) return;

      state.selectedBrandFilter = btn.getAttribute("data-brand-filter");
      document.querySelectorAll("#brand-pills [data-brand-filter]").forEach((el) => {
        el.setAttribute("aria-pressed", el === btn ? "true" : "false");
      });

      renderCatalog();
    });
  }

  // "Ver mais calçados" button
  const toggleMoreBtn = document.getElementById("toggle-more-btn");
  if (toggleMoreBtn) {
    toggleMoreBtn.addEventListener("click", () => {
      state.showAllProducts = !state.showAllProducts;
      renderCatalog();
    });
  }

  // WhatsApp direct contact buttons
  ["hero-consult-btn", "consult-size-banner-btn", "empty-consult-btn"].forEach((btnId) => {
    const el = document.getElementById(btnId);
    if (el) {
      el.addEventListener("click", () => sendToWhatsApp(consultDefaultMsg));
    }
  });

  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("search-clear-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const productGrid = document.getElementById("product-grid");
      if (!productGrid) {
        return;
      }
      state.searchQuery = e.target.value;
      if (clearSearchBtn) clearSearchBtn.hidden = state.searchQuery.trim() === "";
      renderCatalog();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !document.getElementById("product-grid")) {
        window.location.href = `index.html#colecao`;
      }
    });
  }

  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener("click", () => {
      state.searchQuery = "";
      searchInput.value = "";
      clearSearchBtn.hidden = true;
      renderCatalog();
    });
  }

  const resetFiltersBtn = document.getElementById("reset-filters-btn");
  if (resetFiltersBtn) resetFiltersBtn.addEventListener("click", resetAllFilters);

  const clearInlineBtn = document.getElementById("clear-inline-filters");
  if (clearInlineBtn) clearInlineBtn.addEventListener("click", resetAllFilters);

  // Mobile Grid Density Switcher
  const viewBtn2 = document.getElementById("view-grid-2");
  const viewBtn1 = document.getElementById("view-grid-1");
  const gridEl = document.getElementById("product-grid");

  if (viewBtn2 && viewBtn1 && gridEl) {
    viewBtn2.addEventListener("click", () => {
      gridEl.classList.remove("mobile-cols-1");
      viewBtn2.setAttribute("aria-pressed", "true");
      viewBtn1.setAttribute("aria-pressed", "false");
    });

    viewBtn1.addEventListener("click", () => {
      gridEl.classList.add("mobile-cols-1");
      viewBtn1.setAttribute("aria-pressed", "true");
      viewBtn2.setAttribute("aria-pressed", "false");
    });
  }

  // Handle color swatch clicks inside product cards (both index.html and related grid on produto.html)
  ["product-grid", "related-products-grid"].forEach((gridId) => {
    const gEl = document.getElementById(gridId);
    if (!gEl) return;
    gEl.addEventListener("click", (e) => {
      const actionEl = e.target.closest('[data-action="select-color"]');
      if (!actionEl) return;
      e.preventDefault();
      const productId = actionEl.getAttribute("data-product-id");
      const colorIndex = Number(actionEl.getAttribute("data-color-index"));
      state.cardSelections[productId].colorIndex = colorIndex;
      if (gridId === "product-grid") {
        renderCatalog();
      } else {
        const currentProduct = getActiveProductFromUrl();
        renderRelatedProducts(currentProduct.id);
      }
    });
  });

  // Dedicated Product Page (produto.html) Interactive Controls
  const pdpRoot = document.getElementById("product-page-root");
  if (pdpRoot) {
    pdpRoot.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-pdp-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-pdp-action");
      const productId = btn.getAttribute("data-product-id");
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return;

      if (action === "select-color") {
        const cIdx = Number(btn.getAttribute("data-color-index"));
        state.cardSelections[productId].colorIndex = cIdx;
        renderProductPage();
      } else if (action === "select-size") {
        const sz = Number(btn.getAttribute("data-size"));
        state.cardSelections[productId].size = sz;
        renderProductPage();
      } else if (action === "consult-size") {
        const sel = state.cardSelections[productId];
        const colorObj = product.colors[sel.colorIndex] || product.colors[0];
        sendToWhatsApp(
          `Olá, Francinez Calçados! Vim pela página do ${product.name} (${colorObj.name}) e gostaria de consultar se tem outra numeração.`
        );
      } else if (action === "add-to-bag") {
        addToBag(productId);
        openBagDrawer();
      } else if (action === "buy-whatsapp") {
        const sel = state.cardSelections[productId];
        const colorObj = product.colors[sel.colorIndex] || product.colors[0];
        sendToWhatsApp(
          buildWhatsAppMessage(
            [
              {
                name: product.name,
                colorName: colorObj.name,
                size: sel.size,
                pixPrice: product.pixPrice,
                cardPrice: product.cardPrice,
                qty: 1
              }
            ],
            true
          )
        );
      }
    });

    window.addEventListener("hashchange", () => {
      renderProductPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const openBagBtn = document.getElementById("open-bag-btn");
  if (openBagBtn) openBagBtn.addEventListener("click", openBagDrawer);

  const floatingBagBar = document.getElementById("floating-bag-bar");
  if (floatingBagBar) floatingBagBar.addEventListener("click", openBagDrawer);

  const closeBagBtn = document.getElementById("close-bag-btn");
  if (closeBagBtn) closeBagBtn.addEventListener("click", closeBagDrawer);

  const drawerBackdrop = document.getElementById("drawer-backdrop");
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeBagDrawer);

  const bagItemsList = document.getElementById("bag-items-list");
  if (bagItemsList) {
    bagItemsList.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const key = btn.getAttribute("data-key");

      if (action === "bag-inc") updateItemQty(key, 1);
      if (action === "bag-dec") updateItemQty(key, -1);
      if (action === "bag-remove") removeItem(key);
    });
  }

  const paymentOptions = document.getElementById("payment-options");
  if (paymentOptions) {
    paymentOptions.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-payment]");
      if (!btn) return;
      state.paymentMethod = btn.getAttribute("data-payment");
      document.querySelectorAll("#payment-options [data-payment]").forEach((el) => {
        el.setAttribute("aria-checked", el === btn ? "true" : "false");
      });
      updateBagUI();
    });
  }

  const deliveryOptions = document.getElementById("delivery-options");
  if (deliveryOptions) {
    deliveryOptions.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-delivery]");
      if (!btn) return;
      state.deliveryMethod = btn.getAttribute("data-delivery");
      document.querySelectorAll("#delivery-options [data-delivery]").forEach((el) => {
        el.setAttribute("aria-checked", el === btn ? "true" : "false");
      });
      const addrField = document.getElementById("customer-address");
      if (addrField) addrField.hidden = state.deliveryMethod !== "entrega";
      updateBagUI();
    });
  }

  const customerNameInput = document.getElementById("customer-name");
  if (customerNameInput) {
    customerNameInput.addEventListener("input", (e) => {
      state.customerName = e.target.value;
      updateBagUI();
    });
  }

  const customerAddrInput = document.getElementById("customer-address");
  if (customerAddrInput) {
    customerAddrInput.addEventListener("input", (e) => {
      state.customerAddress = e.target.value;
      updateBagUI();
    });
  }

  const checkoutWaBtn = document.getElementById("checkout-wa-btn");
  if (checkoutWaBtn) {
    checkoutWaBtn.addEventListener("click", () => {
      if (state.bag.length === 0) return;
      const msg = buildWhatsAppMessage(state.bag, false);
      sendToWhatsApp(msg);
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeBagDrawer();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initState();
  updatePhoneStatusUI();
  renderSizeRail();
  renderCatalog();
  renderProductPage();
  updateBagUI();
  setupEventListeners();
  fetchPublicCatalog();
});
