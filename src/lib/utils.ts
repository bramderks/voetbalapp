export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getStatusText(status: string | null) {
  switch (status) {
    case 'registered':
      return 'Geregistreerd';
    case 'not_registered':
      return 'Niet geregistreerd';
    default:
      return 'Geregistreerd';
  }
}
