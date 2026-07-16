export function parseUserAgent(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';

  const ua = userAgent.toLowerCase();

  // OS Detection
  let os = 'Unknown OS';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';

  // Browser Detection
  let browser = 'Unknown Browser';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('opr/') || ua.includes('opera')) browser = 'Opera';
  else if (ua.includes('edg/')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';

  return `${browser} on ${os}`;
}
