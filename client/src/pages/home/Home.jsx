import React, { useEffect, useState } from 'react'
import UserSideBar from './UserSideBar'
import MessageContainer from './MessageContainer'
import { useSelector, useDispatch } from 'react-redux'
import { initializeSocket, setOnlineUsers } from '../../store/slice/socket/socket.slice'
import { setNewMessage } from '../../store/slice/message/message.slice'
import toast from 'react-hot-toast'
import { updateOtherUsers, updateUserProfile } from '../../store/slice/user/user.slice'
import { getOtherUsersThunk } from '../../store/slice/user/user.thunk'
import { setHasOpened } from '../../store/slice/user/user.slice'
import { store } from '../../store/store'

function Home() {

  const { socket, onlineUsers } = useSelector(state => state.socketReducer)
  console.log(onlineUsers)

  const dispatch = useDispatch()
  const { isAuthenticated, userProfile, otherUsers, hasOpened } = useSelector(state => state.user)

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
    if (!isAuthenticated || !userProfile?._id) return; // ✅ Don't initialize if socket exists
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

    const handleProfileUpdate = (updatedData) => {
      dispatch(updateUserProfile(updatedData))
    }

    const handleConnect = () => {
      socket.on('profileUpdated', handleProfileUpdate)
      socket.emit("user:loggedIn", userProfile?.username);
    }


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
      }, 2000);
    };

    socket.on('newUserJoined', handleNewUserJoined)

    const handleNewUserMessage = (data, type) => {
      const currentOtherUsers = store.getState().user.otherUsers // pulls latest data frm redux store
      console.log(currentOtherUsers)
//prblm
      if (type === "sent") {
        // ✅ I sent a message → receiver should exist
        const receiverExists = currentOtherUsers.some(
          (user) => user._id === data.recieverId
        );
        console.log('receiver exist',receiverExists)
        // isme kbhi aynge hi nhi q k agr sender h hum to reciever to zahir si btt h hga hi otherusers m 
        if (!receiverExists) {
          console.log("[sent] New conversation detected, refreshing user list");
          dispatch(getOtherUsersThunk({ limit: 10, skip: 0, refresh: true }));

          // Mark receiver as unopened until I open the chat
          if (!(data.recieverId in hasOpened)) {
            dispatch(
              setHasOpened({
                ...hasOpened,
                [data.recieverId]: false,
              })
            );
          }
        } else {
          dispatch(updateOtherUsers(data));
        }
      } else {
        // isme aa skte h q k mre acc m naya user nhi hskta h agr mne phle login krlya ho or wo baad m signUP hua ho
        // ✅ I received a message → sender should exist
        const senderExists = currentOtherUsers.some(
          (user) => user._id === data.senderId
        );
        console.log('sender exist',senderExists)
        if (!senderExists) {
          console.log("[received] New conversation detected, refreshing user list");
          dispatch(getOtherUsersThunk({ limit: 10, skip: 0, refresh: true }));

          // Mark sender as unopened until I open the chat
          if (!(data.senderId in hasOpened)) {
            dispatch(
              setHasOpened({
                ...hasOpened,
                [data.senderId]: false,
              })
            );
          }
        } else {
          dispatch(updateOtherUsers(data));
        }
      }
    };


    socket.on('messageSent', (data) => handleNewUserMessage(data, "sent"));
    socket.on('messageReceived', (data) => handleNewUserMessage(data, "received"));


    return () => {
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('newMessage', handleNewMessage);
      socket.off("connect", handleConnect);
      socket.off("newUserJoined", handleNewUserJoined);
      socket.off("messageSent");
      socket.off("messageReceived");
      socket.off("profileUpdated", handleProfileUpdate);
      clearTimeout(timerId);
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