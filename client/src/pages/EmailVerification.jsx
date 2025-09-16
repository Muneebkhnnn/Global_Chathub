import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { verifyUserthunk } from '../store/slice/user/user.thunk'
import { Link } from 'react-router-dom'


function EmailVerification() {

    const navigate = useNavigate()
    const { verificationToken } = useParams()
    const dispatch = useDispatch()
    const { isVerified, screenLoading, verificationError } = useSelector(state => state.user)

    useEffect(() => {
        let timer;
        if (verificationToken) {
            (async () => {
                const response = await dispatch(verifyUserthunk({ verificationToken }));
                if (response.type.endsWith('fulfilled')) {
                    timer = setTimeout(() => navigate('/Login'), 3000);
                } else {
                }
            })();
        } else {
            navigate('/SignUp');
        }
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [verificationToken, dispatch, navigate]);

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

    <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            {isVerified ? (
                <div>
                    <div className="text-green-500 text-6xl mb-4">✅</div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Verification Completed Successfully!
                    </h2>
                    <p className="text-gray-400 mb-4">Redirecting to login...</p>
                    <Link
                        to="/Login"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        Click here to Login immediately
                    </Link>
                </div>
            ) : verificationError ? (
                <div>
                    <div className="text-red-500 text-6xl mb-4">❌</div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                        Verification Failed
                    </h2>
                    <p className="text-red-400 mb-4">{verificationError}</p>
                    <Link
                        to="/SignUp"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Back to Sign Up
                    </Link>
                </div>
            ) : null}
        </div>
    </div>
);

}

export default EmailVerification