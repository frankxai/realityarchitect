import { defineSandbox } from 'eve/sandbox'
import { JustBashSandbox } from 'eve/sandbox/just-bash'
// No tools expose this virtual workspace. Avoid provisioning external sandbox compute.
export const environment = JustBashSandbox.environment({ autoInstall: false })
export default defineSandbox(() => environment.open())
