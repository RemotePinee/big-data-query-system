import mitt from 'mitt'

type Events = {
  'platform-config-updated': { queryItemId: number }
  'query-items-refresh': void
}

export const eventBus = mitt<Events>()