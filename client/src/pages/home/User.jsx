import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedUser } from '../../store/slice/user/user.slice.js'

function User({
    userDetails,
    className = '',
    isMobile = false,
    onUserSelect
}) {


    const { selectedUser, userProfile } = useSelector(state => state.user)
    const { onlineUsers } = useSelector(state => state.socketReducer)

    const isUserOnline = onlineUsers?.includes(userDetails?._id)

    const dispatch = useDispatch()


    const isMyMessage =   userProfile?._id === userDetails?.lastMessageSenderId

    const handleUserClick = () => {
        dispatch(setSelectedUser(userDetails));
        // Call onUserSelect if provided (for mobile to close sidebar)
        if (onUserSelect) {
            onUserSelect();
        }
    }

    //console.log('User component render:')
    console.log('userDetails.username:', userDetails?.username)
    console.log('isMyMessage:', isMyMessage)


    return (
        <div onClick={handleUserClick}
            className={`${className} flex gap-2 md:gap-3 items-center p-2 md:p-3 ${selectedUser?._id === userDetails?._id ? 'bg-gray-700' : ''} 
                       hover:bg-gray-700 rounded-lg cursor-pointer transition-colors`}>
            <div className="relative flex-shrink-0">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-10 h-10 md:w-12 md:h-12'} rounded-full overflow-hidden bg-gray-600`}>
                    <img
                        src={userDetails?.avatar}
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Online indicator */}
                {isUserOnline && (
                    <div className={`absolute bottom-0 right-0 ${isMobile ? 'w-2.5 h-2.5' : 'w-2.5 h-2.5 md:w-3 md:h-3'} 
                                   bg-green-500 border-2 border-gray-800 rounded-full`}></div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <h2 className={`${isMobile ? 'text-sm' : 'text-sm md:text-sm'} font-medium text-gray-200 truncate`}>
                    {userDetails?.username}
                </h2>
                <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-xs'} text-gray-400 truncate mt-3`}>
                    {isMyMessage  
                        ? `You: ${userDetails?.lastMessage}`
                        : (userDetails?.lastMessage || "No messages yet")
                    }
                </p>
            </div>
        </div>
    )
}

export default User

