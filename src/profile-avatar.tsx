import {Sprout, Star, TrainFront, UserRound} from 'lucide-react';
import {getDecoration, type Equipped} from './points';

export function ProfileAvatar({nickname, equipped}: {nickname: string; equipped: Equipped}) {
  const tone = getDecoration(equipped.tone);
  const frame = getDecoration(equipped.frame);
  const badge = getDecoration(equipped.badge);
  const initial = Array.from(nickname.trim())[0];
  const style = {
    backgroundColor: tone?.background ?? 'var(--soft)',
    color: tone?.foreground ?? 'var(--brand)',
  };
  const frameClass = frame?.style === 'ring'
    ? ' profile-avatar-ring'
    : frame?.style === 'dashed'
      ? ' profile-avatar-dashed'
      : '';

  const BadgeIcon = badge?.icon === 'sprout'
    ? Sprout
    : badge?.icon === 'star'
      ? Star
      : badge?.icon === 'station'
        ? TrainFront
        : null;

  return <div className={`profile-avatar${frameClass}`} style={style} aria-hidden="true">
    {initial || <UserRound className="profile-avatar-initial-icon" size={30} strokeWidth={1.7} />}
    {BadgeIcon && <span className="profile-avatar-badge"><BadgeIcon size={13} strokeWidth={2.2} /></span>}
  </div>;
}
