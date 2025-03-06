'use client'
import { signIn, useSession } from "next-auth/react"
import { ReactNode, useEffect, useState } from "react"
import { getInitDataFromUrl } from "@/shared/lib/utils"


type AuthAuthProps = {
  loader?: ReactNode
}

export const AutoAuth = ({
  loader = <p>loading...</p>
}: AuthAuthProps) => {
  const [loading, setLoading] = useState(true)
  const { status } = useSession();


  useEffect(() => {
    const trySignIn = async () => {
      let initData = getInitDataFromUrl();

      console.log(initData, "initData");

      try {
        if (initData) {
          // Тут ты можешь вызвать свою функцию авторизации
          await signIn('procat', undefined, initData);
        }
      } finally {
        setLoading(false);
      }
    };
    console.log(status, "status")
    if (status === "unauthenticated") {
      setLoading(true)
      trySignIn()
    } else {
      setLoading(false)
    }
  }, [status])

  if (status === "authenticated") {
    return null;
  }

  return <>
  {/* <p className="text-xl text-red-800">{text}</p> */}
  {loading ? <div className="bg-black w-full h-full z-50 absolute flex flex-col items-center justify-center">
    {loader}
  </div> : null}
  </>
}