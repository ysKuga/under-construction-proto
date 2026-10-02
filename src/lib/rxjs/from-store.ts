import { Observable } from 'rxjs'
import { StoreApi } from 'zustand/vanilla'

/**
 * zustand の vanilla store を、state の変化を流す Observable へ変換する
 *
 * - 購読直後に現在の state を流し、以降は変化のたびに流す
 * - 購読解除で store の購読も解除する
 * - React の再レンダリングを経ずに store の変化を operator で合成する用途向け
 *
 * @param storeApi 変化を流す対象の store
 */
export const fromStore = <State>(
  storeApi: StoreApi<State>,
): Observable<State> =>
  new Observable<State>((subscriber) => {
    subscriber.next(storeApi.getState())

    return storeApi.subscribe((state) => subscriber.next(state))
  })
