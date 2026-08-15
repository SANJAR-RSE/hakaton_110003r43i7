// Tiny className joiner (avoids pulling in clsx/tailwind-merge as a dependency).
export function cn(...args) {
  return args
    .flat()
    .filter(Boolean)
    .join(' ');
}
