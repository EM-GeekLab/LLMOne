import { useRouter } from 'next/navigation'

export function useNavigate() {
  const { push, replace } = useRouter()
  return process.env.NODE_ENV === 'production' ? replace : push
}
