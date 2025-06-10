import { useMemo } from 'react'
import remarkBreaks from 'remark-breaks'
import remarkCollapse from '../remark-plugins/remark-collapse'
import remarkHideRelativeImages from '../remark-plugins/remark-hide-relative-images'

export const usePlugins = () => {
  const remarkPlugins = useMemo(() => [remarkBreaks, remarkCollapse, remarkHideRelativeImages], [])

  return { remarkPlugins }
}
