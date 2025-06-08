import { useMemo } from 'react'
import remarkBreaks from 'remark-breaks'
import { remarkCollapse, remarkHideRelativeImages } from '../remark-plugins'

export const usePlugins = () => {
  const remarkPlugins = useMemo(() => [remarkBreaks, remarkCollapse, remarkHideRelativeImages], [])

  return { remarkPlugins }
}
