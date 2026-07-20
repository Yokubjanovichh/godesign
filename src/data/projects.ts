import type { ImageMetadata } from 'astro';

export interface Project {
  slug: string;
  title: string;
  area: number; // м²
  location: string;
  category: 'Квартира' | 'Дом' | 'Коммерческий' | 'Усадьба';
  description: string;
  featured: boolean;
}

/**
 * Метаданные проектов. Фотографии берутся автоматически из
 * src/assets/projects/<slug>/ (см. getProjectImages).
 */
export const projects: Project[] = [
  {
    slug: 'prime-park',
    title: 'Prime Park',
    area: 90,
    location: 'Москва',
    category: 'Квартира',
    description:
      'Тёплый минимализм с графикой чёрного и латуни. Пространство, где вечерний свет и тактильные материалы создают ощущение покоя.',
    featured: true,
  },
  {
    slug: 'bakeevo',
    title: 'Загородный дом Бакеево',
    area: 350,
    location: 'Московская область',
    category: 'Дом',
    description:
      'Большой семейный дом, где каждая зона продумана под сценарии жизни. Природные материалы, многослойный свет, простор.',
    featured: true,
  },
  {
    slug: 'tsaritsyno',
    title: 'Вишнёвый код',
    area: 87,
    location: 'ЖК Царицыно, Москва',
    category: 'Квартира',
    description:
      'Квартира с характером: спокойная база и точные акценты. Свет и цвет ведут по пространству, как по истории.',
    featured: true,
  },
  {
    slug: 'yantarny-gorod',
    title: 'ЖК Янтарный город',
    area: 120,
    location: 'Москва',
    category: 'Квартира',
    description:
      'Современная семейная квартира. Функциональные планировочные решения и мягкая, тёплая палитра.',
    featured: true,
  },
  {
    slug: 'edem',
    title: 'Коттеджный посёлок Эдем',
    area: 400,
    location: 'Московская область',
    category: 'Дом',
    description:
      'Загородный дом в природном контексте. Крупные окна, естественные фактуры, связь интерьера с ландшафтом.',
    featured: true,
  },
  {
    slug: 'pushchino',
    title: 'Усадьба Пущино-на-Оке',
    area: 714,
    location: 'Московская область',
    category: 'Усадьба',
    description:
      'Масштабный проект усадьбы. Архитектурная целостность, авторская мебель и продуманный свет на всех уровнях.',
    featured: true,
  },
  {
    slug: 'kislovsky',
    title: 'М. Кисловский переулок',
    area: 146,
    location: 'Москва',
    category: 'Квартира',
    description:
      'Квартира в историческом центре. Классическая основа, переосмысленная в современном ключе.',
    featured: false,
  },
  {
    slug: 'vostochnoe-biryulevo',
    title: 'Ютако 80',
    area: 33,
    location: 'Москва, Восточное Бирюлёво',
    category: 'Квартира',
    description:
      'Компактное пространство, где каждый сантиметр работает. Продуманная эргономика без потери эстетики.',
    featured: false,
  },
  {
    slug: 'semeyny-klub',
    title: 'Загородный семейный клуб',
    area: 450,
    location: 'Московская область',
    category: 'Коммерческий',
    description:
      'Общественное пространство для семейного отдыха. Гостеприимная атмосфера и продуманные сценарии использования.',
    featured: false,
  },
  {
    slug: 'stantsiya',
    title: 'Гастроцентр «Станция»',
    area: 21,
    location: 'Москва',
    category: 'Коммерческий',
    description:
      'Гастрономический центр с характером. Компактный коммерческий интерьер, работающий на впечатление.',
    featured: false,
  },
];

// --- Автоматическая привязка фотографий из папок проектов ---
const allImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/projects/**/*.webp',
  { eager: true }
);

/** Все фото проекта в порядке из папок Ольги (01.webp, 02.webp, …). */
export function getProjectImages(slug: string): ImageMetadata[] {
  return Object.entries(allImages)
    .filter(([path]) => path.includes(`/projects/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, mod]) => mod.default);
}

/** Обложка проекта — первое фото (01.webp). */
export function getCover(slug: string): ImageMetadata {
  return getProjectImages(slug)[0];
}

/** Портреты Ольги (для «Об авторе»). */
export function getOlgaPhotos(): ImageMetadata[] {
  return Object.entries(allImages)
    .filter(([path]) => path.includes('/projects/olga/'))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, mod]) => mod.default);
}

export const featuredProjects = projects.filter((p) => p.featured);
