
import { Language, LanguageCode, Translations } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
];

export const AGE_GROUPS = [2, 3, 4, 5, 6, 7];

export const GARDEN_COLORS = [
  { name: 'Petal Pink', value: '#fff5f7' },
  { name: 'Sky Blue', value: '#f0f9ff' },
  { name: 'Mint Leaf', value: '#f0fdf4' },
  { name: 'Lavender', value: '#f5f3ff' },
  { name: 'Sunny Day', value: '#fffbeb' },
  { name: 'Cloud White', value: '#ffffff' },
  { name: 'Apricot', value: '#fff7ed' },
];

export const UI_TRANSLATIONS: Translations = {
  welcome: {
    en: 'Welcome to StoryTime!',
    de: 'Willkommen bei StoryTime!',
    fr: 'Bienvenue chez StoryTime !',
    es: '¡Bienvenido a StoryTime!',
    it: 'Benvenuti a StoryTime!',
    pt: 'Bem-vindo ao StoryTime!',
    nl: 'Welkom bij StoryTime!',
    pl: 'Witamy w StoryTime!',
    ru: 'Добро пожаловать в StoryTime!',
    sv: 'Välkommen till StoryTime!',
    hr: 'Dobrodošli u StoryTime!',
  },
  selectLanguage: {
    en: 'Pick your language',
    de: 'Wähle deine Sprache',
    fr: 'Choisissez votre langue',
    es: 'Elige tu idioma',
    it: 'Scegli la tua lingua',
    pt: 'Escolha o seu idioma',
    nl: 'Kies je taal',
    pl: 'Wierz swój język',
    ru: 'Выберите ваш язык',
    sv: 'Välj ditt språk',
    hr: 'Odaberite svoj jezik',
  },
  libraryTitle: {
    en: 'My Bookshelf',
    de: 'Mein Bücherregal',
    fr: 'Mon étagère',
    es: 'Mi estantería',
    it: 'La mia libreria',
    pt: 'Minha estante',
    nl: 'Mijn Boekenplank',
    pl: 'Moja półka',
    ru: 'Моя книжная полка',
    sv: 'Min bokhylla',
    hr: 'Moja polica',
  },
  createBook: {
    en: 'Create a Book',
    de: 'Buch erstellen',
    fr: 'Créer un livre',
    es: 'Crear un libro',
    it: 'Crea un libro',
    pt: 'Criar um libro',
    nl: 'Maak een boek',
    pl: 'Stwórz książkę',
    ru: 'Создать книгу',
    sv: 'Skapa en bok',
    hr: 'Izradi knjigu',
  },
  back: {
    en: 'Back', de: 'Zurück', fr: 'Retour', es: 'Atrás', it: 'Indietro', pt: 'Voltar', nl: 'Terug', pl: 'Wstecz', ru: 'Назад', sv: 'Tillbaka', hr: 'Natrag'
  },
  next: {
    en: 'Next', de: 'Weiter', fr: 'Suivant', es: 'Siguiente', it: 'Avanti', pt: 'Próximo', nl: 'Volgende', pl: 'Dalej', ru: 'Далее', sv: 'Nästa', hr: 'Sljedeće'
  },
  finish: {
    en: 'Finish', de: 'Fertig', fr: 'Terminer', es: 'Terminar', it: 'Fine', pt: 'Finalizar', nl: 'Klaar', pl: 'Zakończ', ru: 'Завершить', sv: 'Färdig', hr: 'Završi'
  },
  allAges: {
    en: 'All Ages', de: 'Alle Alter', fr: 'Tous les âges', es: 'Todas las edades', it: 'Tutte le età', pt: 'Todas as idades', nl: 'Alle leeftijden', pl: 'Wszystkie wieki', ru: 'Все возраста', sv: 'Alla åldrar', hr: 'Sve dobi'
  },
  yearsOld: {
    en: 'years old', de: 'Jahre alt', fr: 'ans', es: 'años', it: 'anni', pt: 'anos', nl: 'jaar oud', pl: 'lat', ru: 'лет', sv: 'år', hr: 'godina'
  },
  titlePrompt: {
    en: 'Book Title', de: 'Buchtitel', fr: 'Titre du livre', es: 'Título del libro', it: 'Titolo del libro', pt: 'Título do livro', nl: 'Boektitel', pl: 'Tytuł książki', ru: 'Название книги', sv: 'Boktitel', hr: 'Naslov knjige'
  },
  addPage: {
    en: 'Add Page', de: 'Seite hinzufügen', fr: 'Ajouter une page', es: 'Añadir página', it: 'Aggiungi pagina', pt: 'Adicionar página', nl: 'Pagina toevoegen', pl: 'Dodaj stronę', ru: 'Добавить страницу', sv: 'Lägg till sida', hr: 'Dodaj stranicu'
  },
  pageText: {
    en: 'Page story text...', de: 'Geschichtstext...', fr: 'Texte de l\'histoire...', es: 'Texto de la historia...', it: 'Testo della storia...', pt: 'Texto da história...', nl: 'Verhaaltekst...', pl: 'Tekst strony...', ru: 'Текст страницы...', sv: 'Berättelsetext...', hr: 'Tekst priče...'
  },
  selectImage: {
    en: 'Choose Photo', de: 'Foto wählen', fr: 'Choisir une photo', es: 'Elegir foto', it: 'Scegli foto', pt: 'Escolher foto', nl: 'Foto kiezen', pl: 'Wybierz zdjęcie', ru: 'Выбрать фото', sv: 'Välj фото', hr: 'Odaberi sliku'
  },
  publishLocal: {
    en: 'Publish Locally', de: 'Lokal veröffentlichen', fr: 'Publier localement', es: 'Publicar localmente', it: 'Pubblica in locale', pt: 'Publicar localmente', nl: 'Lokaal publiceren', pl: 'Opublikuj lokalnie', ru: 'Опубликовать локально', sv: 'Publicera lokalt', hr: 'Objavi lokalno'
  },
  publishUniversal: {
    en: 'Publish Universally', de: 'Universell veröffentlichen', fr: 'Publier universellement', es: 'Publicar universalmente', it: 'Pubblica universale', pt: 'Publicar universalmente', nl: 'Universeel publiceren', pl: 'Opublikuj uniwersalnie', ru: 'Оpublikovat universalno', sv: 'Publicera universellt', hr: 'Objavi univerzalno'
  },
  sortByRating: {
    en: 'Sort by Rating', de: 'Nach Bewertung sortieren', fr: 'Trier par note', es: 'Ordenar por calificación', it: 'Ordina per valutazione', pt: 'Ordenar por classificação', nl: 'Sorteren op beoordeling', pl: 'Sortuj według oceny', ru: 'Сортировать по рейтингу', sv: 'Sortera efter betyg', hr: 'Sortiraj po ocjeni'
  }
};
