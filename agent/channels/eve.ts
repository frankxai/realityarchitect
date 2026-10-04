import { eveChannel } from 'eve/channels/eve'
import { vercelOidc } from 'eve/channels/auth'
// Internal project callers only. User ACLs are enforced by the authenticated application proxy.
export default eveChannel({ auth:vercelOidc(),audience:'private',uploadPolicy:'disabled',cors:false,turnPolicy:'queue' })
