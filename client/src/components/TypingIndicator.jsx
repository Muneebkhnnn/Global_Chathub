import React from 'react'

function TypingIndicator({ isMobile = false }) {
    const dotSize = isMobile ? 'w-2 h-2' : 'w-2 h-2 md:w-3 md:h-3';
    
    return (
        <div className={`flex items-center space-x-1 ${isMobile ? 'pt-2' : 'pt-2 md:pt-3'}`}>
            <div className={`${dotSize} bg-blue-200 rounded-full animate-bounce`}
                style={{
                    animationDelay: '0s',
                    animationDuration: '1.4s'
                }}>
            </div>

            <div className={`${dotSize} bg-blue-300 rounded-full animate-bounce`}
                style={{
                    animationDelay: '0.2s',
                    animationDuration: '1.4s'
                }}></div>

            <div className={`${dotSize} bg-blue-400 rounded-full animate-bounce`}
                style={{
                    animationDelay: '0.4s',
                    animationDuration: '1.4s'
                }}></div>

            <div className={`${dotSize} bg-blue-600 rounded-full animate-bounce`}
                style={{
                    animationDelay: '0.6s',
                    animationDuration: '1.4s'
                }}></div>
        </div>
    )
}

export default TypingIndicator