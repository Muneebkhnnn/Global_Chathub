import React, { useEffect } from 'react'
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { getprofileThunk } from './store/slice/user/user.thunk';
import { useSelector } from 'react-redux';
import { setHasOpened } from './store/slice/user/user.slice';


function App() {

  const { screenLoading, hasOpened, userProfile } = useSelector(state => state.user)

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      console.log(' in async of app.jsx')
      await dispatch(getprofileThunk());
      console.log(' exiting async of app.jsx')
    })();
  }, [dispatch]);

  // ✅ Separate effect to load hasOpened AFTER userProfile is available
  useEffect(() => {
    if (userProfile?._id) {
      console.log('Loading hasOpened for user:', userProfile._id);
      const savedHasOpened = JSON.parse(
        localStorage.getItem(`hasOpened_${userProfile._id}`) || '{}'
      );
      dispatch(setHasOpened(savedHasOpened));
    }
  }, [userProfile?._id, dispatch]);

  useEffect(() => {
    if (userProfile?._id) {
      console.log('setting in locl storge')
      localStorage.setItem(`hasOpened_${userProfile?._id}`, JSON.stringify(hasOpened))
    }
  }, [hasOpened, userProfile?._id]);

  if (screenLoading)
    return (

      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-100 z-50">
        <div className="flex space-x-2">
          <span className="w-4 h-4 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-4 h-4 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-4 h-4 rounded-full bg-indigo-600 animate-bounce"></span>
        </div>
      </div>

    )

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  )
}

export default App