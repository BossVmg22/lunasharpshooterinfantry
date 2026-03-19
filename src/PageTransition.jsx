import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function PageTransition({ children }) {
  const location = useLocation()
  const prevPath = useRef(location.pathname)

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      prevPath.current = location.pathname
    }
  }, [location.pathname])

  return (
    <>
      <style>{`
        .page-enter {
          opacity: 0;
          transform: translateY(8px);
        }
        .page-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 300ms ease-out, transform 300ms ease-out;
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .page-wrapper {
          animation: fadeSlideIn 0.35s ease-out forwards;
        }
      `}</style>
      <div key={location.pathname} className="page-wrapper">
        {children}
      </div>
    </>
  )
}
