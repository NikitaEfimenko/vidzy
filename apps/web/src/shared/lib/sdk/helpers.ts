import { Session } from "next-auth";
import { TSubscription } from "../../../../types/next-auth";

export type AccessStatus = "success" | "expired" | "no-access"

export const checkAccess = (subscriptions: TSubscription[], level: string): AccessStatus => {
  const sub = subscriptions.find(sub => sub.levelName === level)
  if (!sub) return "no-access"
  
  const endDateUtc = new Date(sub.endDate).getTime(); // endDate уже в UTC
  const nowUtc = Date.now(); // Date.now() возвращает время в UTC

  console.log(endDateUtc, new Date(endDateUtc).toISOString(), "is date (UTC)");
  console.log(nowUtc, new Date(nowUtc).toISOString(), "is now (UTC)");

  return (nowUtc < endDateUtc) ? "success" : "expired";
}

export const getSubExpires = (session: Session, level: string): Date => {
  const sub = session.user.subscriptions.find(sub => sub.levelName === level)
  if (!sub) return new Date(Date.now() - 1000 * 5)

  return new Date(sub.endDate)
}

export function nullguard<V>(v: V, render: (v: NonNullable<V>) => React.ReactNode): React.ReactNode {
  if (!v) return null;
  if (Array.isArray(v) && !v.length) return null;
  return render(v);
}
