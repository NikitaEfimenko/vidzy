
import { auth } from "@/app/config/auth"
import { ReactNode, Suspense } from "react"
import { checkAccess, nullguard, AccessStatus } from "../helpers"
import { instance } from "../api"
import Link from "next/link"


export type TGuardProps = {
  level: string,
  children?: JSX.Element,
  expiredFallback: JSX.Element,
  noAccessFallback: JSX.Element
}

export const Guard = async ({ level, children, expiredFallback, noAccessFallback }: TGuardProps) => {
  const session = await auth()
  if (!session?.user) return <></>

  const res = nullguard(checkAccess(session.user.subscriptions, level), (status) => {
    switch (status) {
      case "expired":
        return expiredFallback
      case "no-access":
        return noAccessFallback
      case "success":
        return <>
          {children}
        </>
      default:
        return <></>
    }
  })
  return <>{res}</>
}

type NavigateToProcatClientProps = {
  status: AccessStatus
}

export const NavigateToProcatClient = ({
  status
}: NavigateToProcatClientProps) => {
  return <Link className="flex items-center gap-2" href={`${process.env.PROCAT_ID_HOST!}/clients/to/${process.env.PROCAT_CLIENT_ID!}`}>
    <span>
      {status}
    </span>
    <button className="py-2 px-4 border border-white" type="submit">
      {status === "no-access" ? "Subscribe" : "Resubscribe"} with Procat
    </button>
  </Link>
}

export const NoAccessFallback = () => {
  return <div className="flex flex-col gap-2">
    <p>not access - you don't have subscriptions</p>
    <NavigateToProcatClient status="no-access" />
  </div>
}

export const fallbackConfig = {
  expiredFallback: <NavigateToProcatClient status="expired" />,
  noAccessFallback: <NoAccessFallback />
}

type SubscriptionLevel = {
  id: string,
  levelName: string,
  description: string,
  price: number | string,
  durationMinutes: number | string
}

export const SubscriptionsLevelList = async () => {
  const session = await auth()
  if (!session?.user) {
    return null
  }
  instance.injectToken(session.token)
  const levelsList: Array<SubscriptionLevel> = await instance.fetchSubscriptionsLevels()
  return <>
    {levelsList.map(el => <div className="p-4 border rounded-lg">
      <div key={el.id} className="flex flex-col gap-2">
        <p className="text-lg">{el.levelName}</p>
        <p className="text-md">{el.description}</p>
        <div className="text-xs">
          <span>{el.price}</span>/<span>{el.durationMinutes}min</span>
        </div>
        <div className="border-t"></div>
        <Suspense fallback={<p>loading...</p>}>
          <Guard level={el.levelName} {...fallbackConfig}>
            <NavigateToProcatClient status="no-access" />
          </Guard>
        </Suspense>
      </div>
    </div>)}
  </>
}

