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


  const dispatch = useDispatch()
  const { isAuthenticated, userProfile, hasOpened } = useSelector(state => state.user)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileMenuOpen(false) 
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !userProfile?._id) return;
    dispatch(initializeSocket(userProfile?._id));
  }, [isAuthenticated, userProfile?._id, dispatch]);

  useEffect(() => {
    if (!socket || !isAuthenticated) return 

    const handleOnlineUsers = (onlineUsers) => {
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
      const currentOtherUsers = store.getState().user.otherUsers 
      if (type === "sent") {
        const receiverExists = currentOtherUsers.some(
          (user) => user._id === data.recieverId
        );
        if (!receiverExists) {
          dispatch(getOtherUsersThunk({ limit: 10, skip: 0, refresh: true }));

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
        const senderExists = currentOtherUsers.some(
          (user) => user._id === data.senderId
        );
        if (!senderExists) {
          dispatch(getOtherUsersThunk({ limit: 10, skip: 0, refresh: true }));

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
    <div className='flex h-screen relative overflow-hidden bg-gray-900'>
      {isMobile ? (
        <>
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
          <UserSideBar isMobile={false} />
          <MessageContainer isMobile={false} />
        </>
      )}
    </div>
  )
}

export default Home