import { BoxBot } from '@/components/samples/figure/box-bot'

const HomePage = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Under Construction Proto
      </h1>
      <BoxBot mode="3d" />
    </div>
  )
}

export default HomePage
