
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { ArrowRight, Github, LogInIcon, Rocket } from 'lucide-react';
import { FaTelegram, FaTelegramPlane } from 'react-icons/fa';
import { auth } from '../config/auth';
import { GlitchText } from './_components/glitch';

import { Badge } from '@/shared/ui/badge';
// import BounceCards from './_components/bounding-cards';
import Link from 'next/link';
import { SignInProcat } from '@/features/sign-in';
import { MdDashboard } from 'react-icons/md';

export default async function HomePage() {
  const session = await auth()

  return <>

    <section className="grid grid-cols-1 mt-12 lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <Badge variant="outline" className="inline-flex items-center gap-2 rounded-full px-4 py-2">
          <Rocket size={16} />
          <span>Introducing Vidzy</span>
          <ArrowRight size={12} />
        </Badge>

        <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
          How to quickly generate a short video? Make it easier.

          <GlitchText
            speed={1}
          >Vidzy</GlitchText>
        </h1>

        <p className="text-xl">
          Your complete All-in-One solution for building SaaS services.
          <br />
          Build awesome apps and ship fast with <span className="text-primary-foreground">Vidzy</span>.
        </p>

        <div className="flex flex-wrap gap-4">
          {!session?.user ? <SignInProcat
            actionSlot={
              <Button size="lg" className="flex items-center gap-2">
                <LogInIcon size={18} />
                Get Started
              </Button>
            }
          /> : <Link href="/visual-renderer">
            <Button size="lg" className="flex items-center gap-2">
              Get Started
            </Button>
          </Link>}
          <a target='_blank' href="https://t.me/saas_prokat_bot">
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
            >
              <FaTelegramPlane size={18} />
              Join our Telegram
            </Button>
          </a>
        </div>
      </div>
      <section className='flex flex-col items-center justify-center'>
        {/* Right Column - Cards */}
        {/* <Threads/> */}
        {/* <BounceCards
          className="custom-bounceCards"
          images={videos}
          containerWidth={500}
          containerHeight={250}
          animationDelay={1}
          animationStagger={0.08}
          easeType="elastic.out(1, 0.5)"
          transformStyles={transformStyles}
          enableHover={false}
        /> */}
        <div className="space-y-6 z-10">
          {/* Discord Card */}
          <Card className="p-6 shadow-2xl shadow-primary items-center">
            <h2 className="text-2xl font-bold mb-2">Join to Vidzy</h2>
            {!session?.user && <p className="text-muted-foreground mb-4">Login via procat to join Vidzy</p>}
            {!session?.user ? <SignInProcat
              actionSlot={
                <Button variant="secondary" className="flex items-center gap-2">
                  <LogInIcon size={18} />
                  Login with Procat
                </Button>
              }
            /> : <Link href="/visual-renderer">
              <Button variant="secondary" className="flex items-center gap-2">
                <MdDashboard size={18} />
                Dashboard
              </Button>
            </Link>}
          </Card>

        </div>
      </section>

    </section >
  </>
}