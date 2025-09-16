import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedUser, markAsOpened } from '../../store/slice/user/user.slice.js';

function User({ userDetails, className = '', isMobile = false, onUserSelect }) {
  const { selectedUser, userProfile, hasOpened } = useSelector(state => state.user);
  const { onlineUsers } = useSelector(state => state.socketReducer);
  const dispatch = useDispatch();

  const isUserOnline = onlineUsers?.includes(userDetails?._id);
  const isSelected = selectedUser?._id === userDetails?._id;
  const isMyMessage = userProfile?._id === userDetails?.lastMessageSenderId;
  const showUnreadDot = hasOpened[userDetails?._id] === false;

  const handleUserClick = () => {
    dispatch(setSelectedUser(userDetails));
    dispatch(markAsOpened(userDetails));

    if (onUserSelect) onUserSelect();
  };

  return (
    <div
      onClick={handleUserClick}
      className={`
        ${className} flex gap-2 md:gap-3 items-center p-2 md:p-3 
        rounded-lg cursor-pointer transition-all duration-200
        ${isSelected ? 'bg-gray-700 border-l-4 border-blue-500' : 'hover:bg-gray-800'}
        ${showUnreadDot ? 'bg-gray-800/50' : ''}
      `}
    >
      <div className="relative flex-shrink-0">
        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden bg-gray-600 ${showUnreadDot ? 'ring-2 ring-blue-500/30' : ''}`}>
          <img
            src={userDetails?.avatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {isUserOnline && (
          <div className={`absolute bottom-0 right-0 ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} bg-green-500 border-2 border-gray-800 rounded-full`} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h2 className={`${isMobile ? 'text-sm' : 'text-sm md:text-sm'} ${showUnreadDot ? 'font-semibold text-white' : 'font-medium text-gray-200'} truncate`}>
            {userDetails?.username}
          </h2>
          
          {showUnreadDot && !isSelected && (
            <div className="flex items-center ml-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
        
        <p className={`${isMobile ? 'text-xs' : 'text-xs md:text-xs'} ${showUnreadDot ? 'text-gray-300 font-medium' : 'text-gray-400'} truncate mt-1`}>
          {isMyMessage ? `You: ${userDetails?.lastMessage}` : (userDetails?.lastMessage || 'No messages yet')}
        </p>
      </div>
    </div>
  );
}

export default User;
