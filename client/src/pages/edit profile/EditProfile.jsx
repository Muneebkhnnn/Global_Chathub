import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { editProfileThunk } from '../../store/slice/user/user.thunk';
import { useNavigate } from 'react-router-dom';
import { setSelectedUser } from '../../store/slice/user/user.slice';

function EditProfile() {

  const navigate = useNavigate()

  const dispatch = useDispatch()

  const [errors, setErrors] = useState({});

  const { userProfile, buttonLoading } = useSelector(state => state.user)

  const{socket}=useSelector(state=>state.socketReducer)

  const [avatarPreview, setavatarPreview] = useState(null);

  const [formData, setformData] = useState({
    username: '',
    fullName: '',
    avatar: userProfile?.avatar
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }


    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {

    const { name, value, type, files } = e.target; // e.target.files given by react
    console.log(name, value)

    if (type === "file") {
      const file = files[0];
      //console.log(file)
      if (file) {
        setformData(prev => ({
          ...prev,
          [name]: file,
        }));
        setavatarPreview(URL.createObjectURL(file));
      }
    }
    else {
      setformData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const response = await dispatch(editProfileThunk(formData))
    console.log(response)
    if (response.payload?.success) {
      navigate('/')
      const userProfile=response.payload?.data
      socket.emit('profileUpdated',userProfile)
    }
    console.log(response)
  }



  useEffect(() => {
    if (userProfile?.avatar) {
      setavatarPreview(userProfile?.avatar)
    }
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [userProfile], avatarPreview);



  return (
    <>
      <div className='min-h-screen flex items-center justify-center '>
        <div className="max-w-md w-full bg-white shadow-md rounded-xl p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">Edit Profile</h2>

          <form onSubmit={handleSubmit} className="space-y-5 ">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <label
                htmlFor="avatar"
                className="cursor-pointer flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
              >
                <input
                  onChange={handleChange}
                  type="file" id="avatar" name="avatar" className="hidden" />
                <span className="text-sm text-gray-600">Change Avatar</span>
              </label>
              <img
                src={avatarPreview || formData.avatar}
                alt="avatar"
                className="w-20 h-20 mt-3 rounded-full object-cover border"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="username"
                id="username"
                value={formData.username}
                placeholder="Enter Username"
                className={`relative w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.username ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />
              {errors.username && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.username}</span>
                </div>
              )}
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                onChange={handleChange}
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                placeholder="Enter Full Name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${errors.fullName ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
              />
              {errors.fullName && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{errors.fullName}</span>
                </div>)}
            </div>

            {/* Submit */}
            <button
              className="flex justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-1 rounded-lg transition "
              type="submit"
            >
              {buttonLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <div >Update Profile</div>
              </>
            )}
            </button>
          </form>
        </div>
      </div>

    </>
  )
}

export default EditProfile