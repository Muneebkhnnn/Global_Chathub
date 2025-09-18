import React, { useState, useEffect, useRef } from 'react'
import Message from './Message'
import { FiMenu } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { getMessageThunk } from '../../store/slice/message/message.thunk'
import SendMessage from './SendMessage'
import TypingIndicator from '../../components/TypingIndicator'

function MessageContainer({ isMobile, onMenuClick }) {

  const typingRef = useRef()
  const dispatch = useDispatch()
  const [typingStatus, settypingStatus] = useState(false);
  const { selectedUser } = useSelector(state => state.user)
  const { messages, messagesLoading } = useSelector(state => state.message)
  const { onlineUsers, socket } = useSelector(state => state.socketReducer)

  const isUserOnline = onlineUsers?.includes(selectedUser?._id)

  const { userProfile } = useSelector(state => state.user);

  const filteredMessages = messages?.filter(
    msg =>
      (msg.senderId === userProfile?._id && msg.recieverId === selectedUser?._id) ||
      (msg.senderId === selectedUser?._id && msg.recieverId === userProfile?._id)
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]); 


  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessageThunk({ recieverId: selectedUser?._id }))
    }

  }, [selectedUser, dispatch])

  useEffect(() => {

    if (!socket || !selectedUser?._id) return


    if (typingStatus && typingRef.current) {
      typingRef.current.scrollIntoView({ behavior: "smooth" });
    }

    const handleTyping = (senderId) => {
      if (senderId === selectedUser?._id) {
        settypingStatus(true);
      }
    }

    const typingStopped = (senderId) => {
      if (senderId === selectedUser?._id) {
        settypingStatus(false);
      }
    }

    socket.on("typing", handleTyping)
    socket.on("typingStopped", typingStopped)

    return () => {
      socket.off('typing', handleTyping)
      socket.off('typingStopped', typingStopped)
    };
  }, [socket, selectedUser, typingStatus]);


  return (
    <>
      <div className="relative flex-1 flex flex-col bg-gray-900 text-white min-w-0 h-full">
      {selectedUser ? (
        <>
          {/* ✅ FIXED HEADER - Always visible at top */}
          <div className="border-b border-gray-700 p-3 md:p-3 flex-shrink-0 sticky top-0 bg-gray-900 z-10">
            <div className="flex items-center gap-2 md:gap-3">
              {isMobile && (
                <button
                  onClick={onMenuClick}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mr-1"
                >
                  <FiMenu className="w-5 h-5" />
                </button>
              )}

              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                <img
                  src={selectedUser?.avatar}
                  alt="Chat Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm md:text-base text-gray-200 truncate">{selectedUser?.username}</h2>
                {isUserOnline ?
                  <p className="text-xs md:text-xs text-green-400">Online</p> :
                  <p className="text-xs md:text-xs text-red-400">Offline</p>
                }
              </div>
            </div>
          </div>

          {messagesLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10">
              <div className="flex space-x-2">
                <span className="w-4 h-4 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-4 h-4 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-4 h-4 rounded-full bg-blue-400 animate-bounce"></span>
              </div>
            </div>
          ) : (
            <>
              {/* ✅ SCROLLABLE MESSAGES AREA - Fills space between fixed header and input */}
              <div 
                className={`flex-1 p-3 md:p-4 overflow-y-auto scroll-smooth scrollbar-hide min-h-0 
                           ${isMobile ? 'pb-20' : ''}`}
              >
                <div className="space-y-3 md:space-y-4 max-w-full min-h-full flex flex-col justify-end">
                  {filteredMessages?.map((msgDetails) => (
                    <Message
                      key={msgDetails?._id}
                      msgDetails={msgDetails}
                      isMobile={isMobile}
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>
                {typingStatus && (
                  <div
                    ref={typingRef}>
                    <TypingIndicator isMobile={isMobile} />
                  </div>
                )}
              </div>
              
              {/* ✅ FIXED INPUT AT BOTTOM - Always visible */}
              {!isMobile && (
                <div className="relative">
                  <SendMessage isMobile={isMobile} />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className="border-b border-gray-700 p-3 md:p-5 flex-shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              {isMobile && (
                <button
                  onClick={onMenuClick}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors mr-1"
                  aria-label="Open conversations"
                >
                  <FiMenu className="w-5 h-5" />
                </button>
              )}
              <h2 className="font-semibold text-sm md:text-base text-gray-300 truncate">Select a conversation</h2>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500 p-3">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-xl md:text-2xl">💬</span>
              </div>
              <h3 className="text-base md:text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-sm md:text-sm">Open the menu to start chatting</p>
            </div>
          </div>
        </>
      )
      }
      </div>
      
      {/* ✅ MOBILE FIXED INPUT - Rendered outside main container for true fixed positioning */}
      {isMobile && selectedUser && (
        <SendMessage isMobile={isMobile} />
      )}
    </>
  )
}


export default MessageContainer