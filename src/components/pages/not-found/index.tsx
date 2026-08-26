'use client'

import clsx from 'clsx'
import { useRouter } from 'next/navigation'

import { ACTION_SPIN, BoxBot } from '@/components/samples/figure/box-bot'
import { Link } from '@/components/ui/link'
import { paths } from '@/config/paths'

/**
 * NotFound — 404 ページ
 */
const NotFound = () => {
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Not Found
      </h1>
      <p>
        <Link
          className={clsx(
            'text-[12rem] font-black leading-none text-gray-300 hover:text-gray-400',
            // * BoxBot の表示領域を広くしているためこのリンクが下にならないように
            'relative z-10',
          )}
          href={paths.home.getHref()}
        >
          404
        </Link>
      </p>
      <BoxBot
        autoRotate={false}
        clickActionMap={{ body: ACTION_SPIN, head: ACTION_SPIN }}
        hopping
        lightPosition={[0, 1.5, 6]}
        mode="3d"
        onClick={() => router.push(paths.home.getHref())}
        orbit={false}
        rotationY={Math.PI}
        shadowVariant="cast"
        style={{ height: 160, width: 160 }}
      />
    </div>
  )
}

export default NotFound
