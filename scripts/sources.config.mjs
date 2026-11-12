// `outlet` regroupe les flux d'un même média : pour le recoupement, un média compte pour une seule voix.
export const sources = [
  { name: 'France 24', url: 'https://www.france24.com/fr/rss', category: 'international' },
  { name: 'RFI', url: 'https://www.rfi.fr/fr/rss', category: 'international' },
  { name: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', category: 'international' },
  { name: 'BBC Afrique', url: 'https://feeds.bbci.co.uk/afrique/rss.xml', category: 'international' },
  { name: 'Courrier international', url: 'https://www.courrierinternational.com/feed/all/rss.xml', category: 'international' },
  { name: 'La Tribune', url: 'https://www.latribune.fr/rss/rubriques/actualite.html', category: 'economie' },
  { name: 'Numerama', url: 'https://www.numerama.com/feed/', category: 'tech' },
  { name: 'Futura Sciences', url: 'https://www.futura-sciences.com/rss/actualites.xml', category: 'tech' },
  { name: 'Télérama', url: 'https://www.telerama.fr/rss/une.xml', category: 'culture' },
  { name: 'Beaux Arts', url: 'https://www.beauxarts.com/feed/', category: 'culture' },
  { name: 'Le Monde, Livres', outlet: 'Le Monde', url: 'https://www.lemonde.fr/livres/rss_full.xml', category: 'livres' },
  { name: 'Franceinfo, Monde', outlet: 'Franceinfo', url: 'https://www.franceinfo.fr/monde.rss', category: 'international' },
  { name: 'Franceinfo, Économie', outlet: 'Franceinfo', url: 'https://www.franceinfo.fr/economie.rss', category: 'economie' },
  { name: 'Franceinfo, Sciences', outlet: 'Franceinfo', url: 'https://www.franceinfo.fr/sciences.rss', category: 'tech' },
  { name: 'Franceinfo, Culture', outlet: 'Franceinfo', url: 'https://www.franceinfo.fr/culture.rss', category: 'culture' },
  { name: 'Franceinfo, Sports', outlet: 'Franceinfo', url: 'https://www.franceinfo.fr/sports.rss', category: 'sport' },
];
