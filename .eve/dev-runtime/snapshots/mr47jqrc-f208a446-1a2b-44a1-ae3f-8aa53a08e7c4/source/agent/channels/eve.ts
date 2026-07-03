import { eveChannel } from 'eve/channels/eve'
import { none } from 'eve/channels/auth'

/**
 * Public channel — The Architect is the site's front-door demo, so anyone can talk to it.
 * The harness's shell/file/web tools are disabled in agent/tools/, so the exposed surface
 * is the interview + the two typed funnel tools only.
 */
export default eveChannel({ auth: [none()] })
