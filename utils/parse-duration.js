function parseDuration(duration) {
  duration = duration.replace(/\s/g, "");

  const regex = /(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i;
  const parts = regex.exec(duration);

  if (!parts) {
    return 0;
  }

  const days = parseInt(parts[1]) || 0;
  const hours = parseInt(parts[2]) || 0;
  const minutes = parseInt(parts[3]) || 0;
  const seconds = parseInt(parts[4]) || 0;

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

export { parseDuration };
