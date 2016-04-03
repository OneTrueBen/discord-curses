import {Map, List} from "immutable";
import {combineReducers} from "redux";
import {ActionType, Action} from "./actions";
import {State, LoginState} from "./state"
import {Server, ServerId, Channel, ChannelId, Message} from "./discord"
import {store} from "../main"
import * as utils from "./utils"

function servers(state: Map<number, Server> = Map<number, Server>(), action: Action): Map<number, Server> {
    switch (action.type) {
        case ActionType.ADD_SERVER:
            let server: Server = action.payload.server
            return state.set(server.id, server)
        default:
            return state
    }
}

function channels(state: Map<number, Channel> = Map<number, Channel>(), action: Action): Map<Number, Channel> {
    switch (action.type) {
        case ActionType.ADD_CHANNEL:
            let channel: Channel = action.payload.channel
            return state.set(channel.id, channel)
        default:
            return state
    }
}

function serversChannelsRelation(state: Map<ServerId, List<ChannelId>> = Map<ServerId, List<ChannelId>>(), action: Action): Map<ServerId, List<ChannelId>> {
    switch (action.type) {
        case ActionType.ADD_SERVER:
            return state.set(action.payload.server.id, List<ChannelId>())
        case ActionType.ADD_CHANNEL:
            let channel: Channel = action.payload.channel
            return state.set(channel.serverId, state.get(channel.serverId).push(channel.id))
        default:
            return state
    }
}

function log(state: List<string> = List<string>(), action: Action): List<string> {
    switch (action.type) {
        case ActionType.CHANGE_CHANNEL:
            // Clear log
            return List<string>()
        case ActionType.LOG_LINE:
            return state.push(action.payload.log)
        case ActionType.CHAT_MESSAGE:
            // Calculate log string and append
            let message: Message = action.payload.message
            let currentChannelId = store.getState().currentChannelId

            if (message.channel == currentChannelId) {
                var usernamePad = utils.pad("               ", message.username)
                return state.push(usernamePad + "│" + message.content)
            } else {
                return state
            }
        default:
            return state
    }
}

function currentChannelId(state: ChannelId = -1, action: Action): ChannelId {
    switch (action.type) {
        case ActionType.CHANGE_CHANNEL:
            return action.payload.channelId
        default:
            return state
    }
}

function collapsedServers(state: List<ServerId> = List<ServerId>(), action: Action): List<ServerId> {
    switch (action.type) {
        case ActionType.TOGGLE_SERVER_COLLAPSE:
            let serverId = action.payload.serverId
            if (state.includes(serverId)) {
                return state.filterNot(it => it == serverId) as List<ServerId>
            } else {
                return state.push(serverId)
            }
        default:
            return state
    }
}

function screenHeight(state: number = 0, action: Action): number {
    switch (action.type) {
        case ActionType.RESIZE_SCREEN:
            return action.payload.height
        default:
            return state
    }
}

function screenWidth(state: number = 0, action: Action): number {
    switch (action.type) {
        case ActionType.RESIZE_SCREEN:
            return action.payload.width
        default:
            return state
    }
}

function corked(state: boolean = false, action: Action): boolean {
    switch (action.type) {
        case ActionType.CORK:
            return true
        case ActionType.UNCORK:
            return false
        default:
            return state
    }
}

function channelListFocused(state: boolean = true, action: Action): boolean {
    switch (action.type) {
        case ActionType.CHANGE_CHANNEL:
            return false
        case ActionType.FOCUS_CHANNEL_LIST:
            return true
        default:
            return state
    }
}

function loadingChannelLogs(state: boolean = false, action: Action): boolean {
    switch (action.type) {
        case ActionType.CHANGE_CHANNEL:
            return true
        case ActionType.FINISH_LOG_LOADING:
            return false
        default:
            return state
    }
}

function loginState(state: LoginState = null, action: Action): LoginState {
    switch (action.type) {
        case ActionType.START_LOGIN:
            return LoginState.LOGGING_IN
        case ActionType.LOGGED_IN:
            if (action.error) {
                return LoginState.LOGIN_ERROR
            } else {
                return LoginState.LOGGED_IN
            }
        default:
            return state
    }
}

function loginError(state: string = "", action: Action): string {
    switch(action.type) {
        case ActionType.LOGGED_IN:
            if (action.error) {
                return action.payload
            } else {
                return ""
            }
        default:
            return state
    }
}

export const reducers = combineReducers<State>({
    servers,
    channels,
    serversChannelsRelation,
    log,
    currentChannelId,
    collapsedServers,
    screenHeight,
    screenWidth,
    corked,
    channelListFocused,
    loadingChannelLogs,
    loginState,
    loginError
})