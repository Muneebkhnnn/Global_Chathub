import React, { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendMessageThunk } from '../../store/slice/message/message.thunk'
function SendMessage({ isMobile = false }) {

    const inputRef = useRef()

    const dispatch = useDispatch()
    const { socket } = useSelector(state => state.socketReducer)
    const { selectedUser, buttonLoading, userProfile } = useSelector(state => state.user)

    const handleSendMessage = async() => {
        if(!message.trim()){
            setMessage('')
            return
        } 
        await dispatch(sendMessageThunk({ recieverId: selectedUser?._id, message }))
        setMessage('')
    }

    const [message, setMessage] = useState('');

    const isTypingRef = useRef(false);
    const typingTimeoutRef = useRef(null);

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        if(!message.trim()) return

        if (!isTypingRef.current) {
            socket.emit("typing", { to: selectedUser?._id, from: userProfile?._id });
            isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typingStopped", { to: selectedUser?._id, from: userProfile?._id });
            isTypingRef.current = false;
        }, 500);
    };

    useEffect(() => {
        if (selectedUser && inputRef.current) {
            inputRef.current.focus()
        }
        setMessage('')
    }, [selectedUser]);

    return (
        <>
            <div className={`border-t border-gray-700 ${isMobile ? 'p-3' : 'p-3 md:p-[0.95rem]'} flex-shrink-0`}>
                <div className="flex gap-2 max-w-full">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                        className={`flex-1 bg-gray-700 text-gray-200 placeholder-gray-400 
                                   ${isMobile ? 'px-3 py-2 text-sm' : 'px-3 py-2 md:px-4 md:py-2 text-sm md:text-base'} 
                                   rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none 
                                   resize-none min-w-0`}
                        maxLength={1000}
                    />
                    <button
                        onClick={handleSendMessage}
                        className={`bg-blue-500 hover:bg-blue-600 text-white 
                                   ${isMobile ? 'px-3 py-2' : 'px-3 py-2 md:px-4 md:py-2'} 
                                   rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed 
                                   flex-shrink-0`}
                        disabled={!message.trim()}
                    >
                        {buttonLoading ? (
                            <div className={`animate-spin rounded-full border-b-2 border-white 
                                           ${isMobile ? 'h-4 w-4' : 'h-4 w-4 md:h-5 md:w-5'}`}></div>
                        ) : (
                            <>
                                <span className={`${isMobile ? 'hidden' : 'hidden sm:inline'}`}>Send</span>
                                <span className={`${isMobile ? 'inline' : 'sm:hidden'}`}>→</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </>
    )
}

export default SendMessage