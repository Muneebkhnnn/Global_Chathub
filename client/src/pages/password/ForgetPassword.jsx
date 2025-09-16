import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast';
import { forgetPasswordThunk } from '../../store/slice/user/user.thunk';

function ForgetPassword() {

    const [success, setsuccess] = useState(false);
    const [message, setMessage] = useState(''); 
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { buttonLoading } = useSelector((state) => state.user);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        const response = await dispatch(forgetPasswordThunk({ email }));

        if (response.type.endsWith('fulfilled')) {
            setMessage(response.payload?.message || "Reset link sent to your email!");
            setsuccess(true);
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Forget Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your email address to receive a  password reset link
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={buttonLoading}
                            />
                        </div>
                    </div>

                    {success && (
                        <div className="bg-green-900/50 border border-gray-50 text-green-200 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-white/100">{message}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={buttonLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {buttonLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Sending...
                                </div>
                            ) : (
                                'Send'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ForgetPassword