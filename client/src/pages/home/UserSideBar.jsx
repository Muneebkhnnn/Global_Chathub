import React, { useState, useEffect, useRef } from 'react'
import User from './User'
import { FiSearch, FiLogOut, FiX } from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUserThunk } from '../../store/slice/user/user.thunk'
import { useNavigate } from 'react-router-dom'
import { getOtherUsersThunk } from '../../store/slice/user/user.thunk'
import { closeSocket } from '../../store/slice/socket/socket.slice'

function UserSideBar({ isOpen, onClose, isMobile }) {

  const [searchValue, setSearchValue] = useState('');
  const [filteredUsers, setfilteredUsers] = useState([]);
  const { otherUsers, userProfile, screenLoading, otherUsersLoading, limit, skip, hasMore, selectedUser } = useSelector(state => state.user)

  const Navigate = useNavigate()
  const dispatch = useDispatch()

  const scrollRef = useRef(null);

  const handleLogout = async () => {
    dispatch(closeSocket(userProfile?._id));

    await dispatch(logoutUserThunk());

    Navigate('/Login');
  }

  useEffect(() => {

    if (otherUsers?.length === 0 && skip === 0) {
      (async () => {
        await dispatch(getOtherUsersThunk(
          {
            limit: limit,
            skip: skip
          }));
      })();

    }

  }, []);

  const handleProfileEdit = () => {
    Navigate('/edit-profile')
  }

  useEffect(() => {
    setfilteredUsers(searchValue ? otherUsers?.filter(user =>
      user.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.username.toLowerCase().includes(searchValue.toLowerCase())
    ) : otherUsers);
  }, [searchValue, otherUsers]);

  const handleMoreUsers = async () => {
    if (otherUsersLoading) return;
    if (!hasMore) return;
    await dispatch(getOtherUsersThunk({ limit, skip }));

  }

  useEffect(() => {
    if (!scrollRef.current) return;

    const handleScroll = (e) => {
      const target = e.target;
      if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5) {
        handleMoreUsers();
      }
    };

    let currentRef = scrollRef.current
    currentRef.addEventListener('scroll', handleScroll)

    return () => {
      currentRef.removeEventListener('scroll', handleScroll)
    }
  }, [hasMore, skip, otherUsersLoading])

  if (screenLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-50">
        <div className="flex space-x-2">
          <span className="w-4 h-4 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-4 h-4 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-4 h-4 rounded-full bg-blue-400 animate-bounce"></span>
        </div>
      </div>

    )

  return (
    <div className={`
      ${isMobile
        ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
           ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : 'w-80 lg:w-80 md:w-72 sm:w-64 relative'
      } 
      bg-gray-800 border-r border-gray-700 flex flex-col h-full min-w-0 flex-shrink-0
    `}>
      <div className="p-3 md:p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs md:text-sm">GC</span>
            </div>
            <h1 className="text-base md:text-lg font-semibold text-gray-200 truncate">CHATHUB</h1>
          </div>

          {isMobile && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-3 md:p-4 border-b border-gray-700 flex-shrink-0">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full bg-gray-700 text-gray-200 placeholder-gray-400 pl-10 pr-4 py-2 md:py-2.5 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm md:text-base"
          />
        </div>
      </div>

      {otherUsersLoading && otherUsers.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
          <div className="p-1 md:p-2">
            {filteredUsers?.map((userDetails, idx) => (
              <User
                userDetails={userDetails}
                key={userDetails?._id || `user-fallback-${idx}`}
                className="p-3 md:p-4 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                isMobile={isMobile}
                onUserSelect={isMobile ? onClose : undefined}
              />
            ))}
            {/* Loading indicator*/}
            {otherUsersLoading && otherUsers.length > 0 && (
              <div className="flex justify-center py-3 md:py-4">
                <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom user profile */}
      <div className="border-t border-gray-700 p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
              <img
                onClick={handleProfileEdit}
                src={userProfile?.avatar}
                alt="Your Avatar"
                className="w-full h-full object-cover cursor-pointer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm md:text-sm font-medium text-gray-200 truncate">{userProfile?.fullName}</p>
              <p className="text-xs md:text-xs text-gray-400 truncate">@{userProfile?.username}</p>
            </div>
          </div>
          <button
            className="p-1.5 md:p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            onClick={() => {
              handleLogout()
            }}
          >
            <FiLogOut className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserSideBar