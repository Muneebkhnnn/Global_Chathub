import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, screenLoading } = useSelector(state => state.user)

    const navigate = useNavigate();

    useEffect(() => {
        if (!screenLoading && !isAuthenticated) { 
            navigate('/login')
        }
        
    }, [isAuthenticated, screenLoading]);

    return children
}
export default ProtectedRoute