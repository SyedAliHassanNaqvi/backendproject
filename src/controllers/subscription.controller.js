import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    const subscriberId = req.user._id
    const subscription = await Subscription
        .findOne({subscriber: subscriberId, channel: channelId})
    if(subscription){
        await Subscription.findByIdAndDelete(subscription._id)
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully"))
    }
    await Subscription.create({subscriber: subscriberId, channel: channelId})
    return res.status(201).json(new ApiResponse(201, {}, "Subscribed successfully"))
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    const subscribers = await Subscription
        .find({channel: channelId})
        .populate("subscriber", "username avatar")
    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    
    const channels = await Subscription
        .find({subscriber: subscriberId})
        .populate("channel", "username") //.populate("channel", "username")
        //Mongoose fetches the full User document from the users collection and replaces channel with the actual user details
    return res.status(200).json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}