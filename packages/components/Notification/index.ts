import Notification from "./methods";
import {withInstallFunction} from '@toy-element/utils'

export const ErNotification = withInstallFunction(Notification, '$notify')

export * from './types'
