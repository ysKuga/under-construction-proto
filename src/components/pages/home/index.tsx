import { BoxBot } from '@/components/samples/figure/box-bot'

/**
 * Home — トップページ
 */
const Home = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 bg-white">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
        Under Construction Proto
      </h1>
      {/* canvasHeight: 最大ズームイン時に頭が Canvas 上端で見切れないよう縦の可動域を足す。
          fov 側で補正するため bot の見かけの大きさは不変(#108) */}
      <BoxBot canvasHeight={640} mode="3d" />
    </div>
  )
}

export default Home
