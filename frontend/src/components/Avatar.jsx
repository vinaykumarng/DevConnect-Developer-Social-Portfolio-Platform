// Photo if the user has one, otherwise their initials on a blush circle.
export default function Avatar({ user, className = 'size-10 text-sm' }) {
  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.username}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }
  const initials = (user?.username || '?').slice(0, 2).toUpperCase();
  return (
    <div
      className={`${className} grid shrink-0 place-items-center rounded-full bg-tint font-semibold text-plum`}
    >
      {initials}
    </div>
  );
}
