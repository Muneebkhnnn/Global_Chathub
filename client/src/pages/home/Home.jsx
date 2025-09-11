import React, { useEffect, useState } from 'react'
import UserSideBar from './UserSideBar'
import MessageContainer from './MessageContainer'
import { useSelector, useDispatch } from 'react-redux'
import { initializeSocket, setOnlineUsers } from '../../store/slice/socket/socket.slice'
import { setNewMessage } from '../../store/slice/message/message.slice'
import toast from 'react-hot-toast'

function Home() {

  const { socket, onlineUsers } = useSelector(state => state.socketReducer)
  console.log(onlineUsers)

  const dispatch = useDispatch()
  const { isAuthenticated, userProfile } = useSelector(state => state.user)

  // 🔧 Mobile state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 🔧 Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileMenuOpen(false) // Close mobile menu on desktop
      }
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !userProfile?._id ) return; // ✅ Don't initialize if socket exists
    dispatch(initializeSocket(userProfile?._id));
  }, [isAuthenticated, userProfile?._id, dispatch]);

  useEffect(() => {
    if (!socket || !isAuthenticated) return // agr socket instance hi nhi bna h state m to return ajao
    
    const handleOnlineUsers = (onlineUsers) => {
      console.log("🔄 Received online users update:", onlineUsers);
      dispatch(setOnlineUsers(onlineUsers))
    }

    const handleNewMessage = (newMessage) => {
      dispatch(setNewMessage(newMessage))
    }

    const handleConnect = () => {
      socket.emit("user:loggedIn", userProfile?.username);
    }

    // Set up event listeners
    socket.on('onlineUsers', handleOnlineUsers)
    socket.on('newMessage', handleNewMessage)
    socket.on("connect", handleConnect)

    let joinBuffer = [];
    let timerId;

    const handleNewUserJoined = (username) => {
      joinBuffer.push(username);

      clearTimeout(timerId)

      timerId = setTimeout(() => {
        if (joinBuffer.length > 0) {
          const names = joinBuffer.join(", ");
          toast(`${names} joined`, { icon: "🚀" });
          joinBuffer = [];
        }
      }, 2000); // will group all within 2 sec window
    };

    socket.on('newUserJoined', handleNewUserJoined)

    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('newMessage', handleNewMessage);
      socket.off("connect", handleConnect);
      socket.off("newUserJoined", handleNewUserJoined);
      clearTimeout(timerId); // ensure no timer fire after unmount
    };
  }, [socket, isAuthenticated, userProfile?.username, dispatch]);



  return (
    <div className='flex h-screen relative overflow-hidden'>
      {/* 🔧 Responsive Layout */}
      {isMobile ? (
        <>
          {/* Mobile: Sidebar as overlay + Full-width message container */}
          <UserSideBar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)}
            isMobile={true}
          />
          
          <MessageContainer 
            isMobile={true}
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
        </>
      ) : (
        <>
          {/* Desktop: Side-by-side layout */}
          <UserSideBar isMobile={false} />
          <MessageContainer isMobile={false} />
        </>
      )}
    </div>
  )
}

export default Home