interface AvatarProps { name: string; size?: number; }
export const Avatar = ({ name, size = 24 }: AvatarProps) => {
  const initials = name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  const dim = `${size}px`;
  return (
    <div aria-label={name} title={name} className="grid place-items-center rounded-full bg-primary-500 text-white text-xs" style={{ width: dim, height: dim }}>
      {initials}
    </div>
  );
};