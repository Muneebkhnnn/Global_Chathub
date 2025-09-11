import React, { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

function Message({ msgDetails, isMobile = false }) {

  const messageRef = useRef(null)

  const { userProfile, selectedUser } = useSelector(state => state.user)
  // sender: true if current user sent the message
  const isSender = userProfile?._id === msgDetails?.senderId

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, []);

  return (
    <>
      <div
        ref={messageRef}
        className={`flex w-full items-end gap-1.5 md:gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>

        {/* Receiver avatar (left) */}
        {!isSender && (
          <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 md:w-8 md:h-8'} rounded-full overflow-hidden bg-gray-600 flex-shrink-0`}>
            <img
              src={selectedUser?.avatar}
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Message bubble */}
        <div className={`max-w-[75%] md:max-w-[70%] flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
          <div className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl shadow ${
            isSender ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          }`}>
            <p className={`break-words ${isMobile ? 'text-sm' : 'text-sm md:text-base'}`}>
              {msgDetails?.message}
            </p>
          </div>
        </div>

        {/* Sender avatar (right) */}
        {isSender && (
          <div className={`${isMobile ? 'w-6 h-6' : 'w-6 h-6 md:w-8 md:h-8'} rounded-full overflow-hidden bg-gray-600 flex-shrink-0`}>
            <img
              src={userProfile?.avatar}
              alt="You"
              className="w-full h-full object-cover"
            />
          </div>
        )}

      </div>
    </>
  )
}

export default Message