import { BoxBot } from '@/components/samples/figure/box-bot'
import { Link } from '@/components/ui/link'
import { paths } from '@/config/paths'

/**
 * NotFound — 404 ページ
 */
const NotFound = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Not Found
      </h1>
      <Link href={paths.home.getHref()}>
        <BoxBot
          autoRotate={false}
          interactive={false}
          mode="3d"
          orbit={false}
          rotationY={Math.PI}
        />
      </Link>
    </div>
  )
}

export default NotFound
