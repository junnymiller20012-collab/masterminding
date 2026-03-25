export type Lang = "en" | "es";

export const translations = {
  en: {
    // Nav labels
    navDashboard: "Dashboard",
    navCourses: "Courses",
    navStudents: "Students",
    navGrowth: "Growth",
    navAffiliates: "Affiliates",
    navExplore: "Explore",
    navMyLearning: "My Learning",
    navSettings: "Settings",
    // Dark/Light mode
    darkMode: "Dark mode",
    lightMode: "Light mode",
    // Language toggle
    switchToSpanish: "Español",
    switchToEnglish: "English",
    // Dashboard page
    totalEnrollments: "Total enrollments",
    totalRevenue: "Total revenue",
    publishedCourses: "Published courses",
    recentEnrollments: "Recent enrollments",
    // Courses page
    myCourses: "My Courses",
    newCourse: "New Course",
    noCourses: "No courses yet",
    noCoursesDesc: "Create your first course to get started.",
    createCourse: "Create your first course",
    draft: "Draft",
    published: "Published",
    archived: "Archived",
    editCourse: "Edit",
    viewAnalytics: "Analytics",
    // Explore page
    browseCourses: "Browse Courses",
    discoverCourses: "Discover courses from expert mentors",
    searchPlaceholder: "Search courses...",
    newestFirst: "Newest first",
    mostPopular: "Most popular",
    priceLow: "Price: low to high",
    priceHigh: "Price: high to low",
    noCoursesFound: "No courses found",
    tryDifferentSearch: "Try a different search term",
    checkBackSoon: "Check back soon — new courses are added regularly",
    signIn: "Sign in",
    getStarted: "Get started",
    free: "Free",
    // Language filter
    allLanguages: "All",
    english: "English",
    spanish: "Spanish",
    filterByLanguage: "Language",
    // Course form
    courseLanguage: "Course Language",
    courseLanguageHint: "The language your course content is taught in.",
    // My Learning page
    myLearning: "My Learning",
    myLearningDesc: "Courses you've enrolled in",
    noEnrollments: "No courses yet",
    noEnrollmentsDesc: "Explore courses and enroll to start learning.",
    continueLearning: "Continue",
    completed: "completed",
    startLearning: "Start Learning",
    // Common
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    students: "students",
  },
  es: {
    // Nav labels
    navDashboard: "Panel",
    navCourses: "Cursos",
    navStudents: "Estudiantes",
    navGrowth: "Crecimiento",
    navAffiliates: "Afiliados",
    navExplore: "Explorar",
    navMyLearning: "Mi Aprendizaje",
    navSettings: "Configuración",
    // Dark/Light mode
    darkMode: "Modo oscuro",
    lightMode: "Modo claro",
    // Language toggle
    switchToSpanish: "Español",
    switchToEnglish: "English",
    // Dashboard page
    totalEnrollments: "Total de inscripciones",
    totalRevenue: "Ingresos totales",
    publishedCourses: "Cursos publicados",
    recentEnrollments: "Inscripciones recientes",
    // Courses page
    myCourses: "Mis Cursos",
    newCourse: "Nuevo Curso",
    noCourses: "Sin cursos aún",
    noCoursesDesc: "Crea tu primer curso para comenzar.",
    createCourse: "Crea tu primer curso",
    draft: "Borrador",
    published: "Publicado",
    archived: "Archivado",
    editCourse: "Editar",
    viewAnalytics: "Analíticas",
    // Explore page
    browseCourses: "Explorar Cursos",
    discoverCourses: "Descubre cursos de mentores expertos",
    searchPlaceholder: "Buscar cursos...",
    newestFirst: "Más recientes",
    mostPopular: "Más populares",
    priceLow: "Precio: menor a mayor",
    priceHigh: "Precio: mayor a menor",
    noCoursesFound: "No se encontraron cursos",
    tryDifferentSearch: "Intenta con otro término de búsqueda",
    checkBackSoon: "Vuelve pronto — se agregan nuevos cursos regularmente",
    signIn: "Iniciar sesión",
    getStarted: "Comenzar",
    free: "Gratis",
    // Language filter
    allLanguages: "Todos",
    english: "Inglés",
    spanish: "Español",
    filterByLanguage: "Idioma",
    // Course form
    courseLanguage: "Idioma del Curso",
    courseLanguageHint: "El idioma en que se imparte el contenido del curso.",
    // My Learning page
    myLearning: "Mi Aprendizaje",
    myLearningDesc: "Cursos en los que te has inscrito",
    noEnrollments: "Sin cursos aún",
    noEnrollmentsDesc: "Explora cursos e inscríbete para comenzar a aprender.",
    continueLearning: "Continuar",
    completed: "completado",
    startLearning: "Empezar",
    // Common
    save: "Guardar",
    cancel: "Cancelar",
    loading: "Cargando...",
    students: "estudiantes",
  },
} as const;

export type Translations = typeof translations["en"];
