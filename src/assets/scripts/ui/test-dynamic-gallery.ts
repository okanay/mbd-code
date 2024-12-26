import { createIcons, icons } from '../deps/lucide-icons.js'

interface Room {
  src: string
  alt: string
}

interface BedroomInfo {
  title: string
  bedrooms: string[]
  price: string
  originalPrice: string
}

interface DataSet {
  images: Room[]
  rows: BedroomInfo[]
}

interface TestData {
  set1: DataSet
  set2: DataSet
  [key: string]: DataSet // İndeks imzası
}

// Test verisi
const testData: TestData = {
  set1: {
    images: [
      {
        src: 'https://images.project-test.info/1.webp',
        alt: "Dubai'de Balayı Tatili 1",
      },
      {
        src: 'https://images.project-test.info/2.webp',
        alt: "Dubai'de Balayı Tatili 2",
      },
      {
        src: 'https://images.project-test.info/3.webp',
        alt: "Dubai'de Balayı Tatili 3",
      },
      {
        src: 'https://images.project-test.info/4.webp',
        alt: "Dubai'de Balayı Tatili 4",
      },
    ],
    rows: [
      {
        title: 'Deluxe 2 Yataklı Daire',
        bedrooms: [
          'Yatak Odası 1: 2 tek kişilik yatak',
          'Yatak Odası 2: 1 ekstra büyük çift kişilik yatak',
        ],
        price: '1300',
        originalPrice: '1500',
      },
      {
        title: 'Premium 2 Yataklı Daire',
        bedrooms: [
          'Yatak Odası 1: 1 çift kişilik yatak',
          'Yatak Odası 2: 2 tek kişilik yatak',
        ],
        price: '1500',
        originalPrice: '1800',
      },
      {
        title: 'Deluxe Plus Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 çift kişilik yatak',
        ],
        price: '1800',
        originalPrice: '2200',
      },
      {
        title: 'Executive Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 2 tek kişilik yatak',
        ],
        price: '2000',
        originalPrice: '2400',
      },
    ],
  },
  set2: {
    images: [
      {
        src: 'https://images.project-test.info/5.webp',
        alt: "Dubai'de Balayı Tatili 5",
      },
      {
        src: 'https://images.project-test.info/6.webp',
        alt: "Dubai'de Balayı Tatili 6",
      },
      {
        src: 'https://images.project-test.info/7.webp',
        alt: "Dubai'de Balayı Tatili 7",
      },
      {
        src: 'https://images.project-test.info/8.webp',
        alt: "Dubai'de Balayı Tatili 8",
      },
    ],
    rows: [
      {
        title: 'Suit Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 çift kişilik yatak',
        ],
        price: '2000',
        originalPrice: '2500',
      },
      {
        title: 'Aile Suiti',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 2 tek kişilik yatak',
          'Yatak Odası 3: 1 çift kişilik yatak',
        ],
        price: '2800',
        originalPrice: '3500',
      },
      {
        title: 'Penthouse Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 queen size yatak',
        ],
        price: '3500',
        originalPrice: '4000',
      },
      {
        title: 'Royal Suite',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 queen size yatak',
          'Yatak Odası 3: 2 tek kişilik yatak',
        ],
        price: '4000',
        originalPrice: '5000',
      },
    ],
  },
}

// Global değişkenler
let currentSet: keyof TestData = 'set1'

function createTableRow(rowData: BedroomInfo): string {
  return `
    <div class="flex flex-1 divide-x divide-gray-200 bg-white hover:bg-gray-100/50">
      <!-- Daire Tipi -->
      <div class="order-1 w-[32.5%] flex-shrink-0 translate-y-[-0.25rem] px-3.5 py-4 sm:order-none">
        <div class="space-y-2">
          <button class="dynamic-gallery-button flex cursor-default items-center gap-2 font-semibold text-primary-600">
            <i data-lucide="image" class="size-4"></i>
            <span>${rowData.title}</span>
          </button>
          <div class="space-y-1 text-sm text-gray-600">
            ${rowData.bedrooms.map(room => `<p>${room}</p>`).join('')}
            <p class="text-gray-500">Ücretsiz bebek karyolası talep üzerine mevcuttur</p>
          </div>
        </div>
      </div>

      <!-- Konuk Sayısı -->
      <div class="order-3 w-[15%] flex-shrink-0 px-4 py-2.5 sm:order-none">
        <div class="flex gap-1">
          ${Array(4).fill('<i data-lucide="user" class="size-5 text-gray-600"></i>').join('')}
        </div>
      </div>

      <!-- Fiyatlar -->
      <div class="order-4 w-[15%] flex-shrink-0 px-3.5 py-2.5 sm:order-none">
        <div class="flex flex-shrink-0 flex-col">
          <span class="text-xs font-semibold text-lime-600">%25 İndirim</span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500 line-through">${rowData.originalPrice} AED</span>
            <span class="text-lg font-semibold text-primary-500">${rowData.price} AED</span>
          </div>
        </div>
      </div>

      <!-- Özellikleriniz -->
      <div class="order-5 w-[29.5%] flex-shrink-0 px-3.5 py-2.5 text-end sm:order-none sm:text-start">
        <div class="flex flex-col items-end space-y-2 sm:items-start">
          <div class="flex items-start gap-2">
            <i data-lucide="check" class="order-2 size-5 flex-shrink-0 text-lime-600 sm:order-none"></i>
            <span class="order-1 text-sm sm:order-none">Dahili park yeri</span>
          </div>
          <div class="flex items-start gap-2">
            <i data-lucide="info" class="order-2 size-5 flex-shrink-0 text-primary-600 sm:order-none"></i>
            <span class="order-1 text-sm sm:order-none">İade edilemez</span>
          </div>
          <div class="flex items-start gap-2">
            <i data-lucide="info" class="order-2 size-5 flex-shrink-0 text-blue-600 sm:order-none"></i>
            <span class="order-1 text-sm sm:order-none">Varıştan önce tesiste ödeme yapın</span>
          </div>
        </div>
      </div>

      <!-- Aksiyon Butonu -->
      <div class="order-2 w-[8%] flex-shrink-0 px-3.5 py-2.5 sm:order-none">
        <div class="flex justify-center">
          <div class="inline-flex items-center">
            <div class="relative flex h-10 w-12 scale-y-[103%] items-center justify-between rounded border border-gray-200">
              <select class="h-full w-full appearance-none bg-transparent pl-2.5 pr-1 focus:outline-none focus:ring-0">
                <option>0</option>
                <option>1</option>
                <option>2</option>
              </select>
              <i data-lucide="chevron-down" class="pointer-events-none absolute right-1.5 top-[50%] size-4 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function updateContent(): void {
  const container = document.getElementById('multi-gallery-images-container')
  if (container) {
    const newSet = testData[currentSet]
    const galleryHTML = newSet.images
      .map(
        img => `
        <ul class="dynamic-gallery">
          <img
            data-src="${img.src}"
            src="/assets/images/gray-placeholder.webp"
            alt="${img.alt}"
            class="dynamic-gallery-item"
          />
        </ul>
      `,
      )
      .join('')

    container.innerHTML = galleryHTML
  }

  // Tablo içeriğini güncelle - Yeni yapıya uygun selector
  const contentContainer = document.querySelector('#otel-price-table .flex-col')
  if (contentContainer) {
    contentContainer.innerHTML = testData[currentSet].rows
      .map(row => createTableRow(row))
      .join('')
  }

  // Lucide ikonlarını yeniden initialize et
  if ((window as any).lucide) {
    ;(window as any).lucide.createIcons()
  }

  // Set'i değiştir
  currentSet = currentSet === 'set1' ? 'set2' : 'set1'

  console.log('Content updated to:', currentSet)

  createIcons({ icons: { ...icons } })
}
// Klavye event listener'ı
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 't') {
    updateContent()
  }
})

if (window.matchMedia('(max-width: 520px)').matches) {
  setTimeout(() => {
    updateContent()
  }, 5000)
}
