import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_4_0_20_3014_7 } from './v4.0.20.3014_7'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_4_0_20_3014_7],
})
