import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/app/store'

// The same useDispatch / useSelector from react-redux, pre-typed with this app's types,
// so components get autocomplete and don't repeat `(state: RootState) => ...` everywhere.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
