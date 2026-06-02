import ComingSoon from './ComingSoon';

function resolveLaunchDate(): string {
  const fromEnv = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  if (fromEnv && !Number.isNaN(Date.parse(fromEnv))) return fromEnv;
  const fallback = new Date();
  fallback.setUTCDate(fallback.getUTCDate() + 45);
  return fallback.toISOString();
}

export default function Page() {
  return <ComingSoon launchIso={resolveLaunchDate()} />;
}
